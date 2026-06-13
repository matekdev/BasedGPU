import { mat4, type Mat4 } from "wgpu-matrix";
import { CameraComponent } from "../components/CameraComponent";
import { MeshComponent } from "../components/MeshComponent";
import { TransformComponent } from "../components/TransformComponent";
import type { Scene } from "../scene/Scene";
import { GpuBuffer } from "./GpuBuffer";
import { GpuMesh } from "./GpuMesh";
import { Renderer } from "./Renderer";
import shaderSource from "../shaders/shader.wgsl?raw";

const vertexStride = 5 * Float32Array.BYTES_PER_ELEMENT;

export class SceneRenderer {
  private renderer?: Renderer;
  private pipeline?: GPURenderPipeline;
  private uniformBuffer?: GpuBuffer;
  private uniformBindGroup?: GPUBindGroup;
  private readonly meshResources = new WeakMap<MeshComponent, GpuMesh>();

  constructor(private readonly canvas: HTMLCanvasElement) {}

  async initialize(): Promise<void> {
    const renderer = await Renderer.create(this.canvas);
    const { device, format } = renderer;

    this.renderer = renderer;
    this.uniformBuffer = GpuBuffer.uniform(device, 16 * Float32Array.BYTES_PER_ELEMENT);

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
      ],
    });

    this.uniformBindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer.gpu } }],
    });

    const shaderModule = device.createShaderModule({ code: shaderSource });
    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: vertexStride,
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x2" },
              {
                shaderLocation: 1,
                offset: 2 * Float32Array.BYTES_PER_ELEMENT,
                format: "float32x3",
              },
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{ format }],
      },
      primitive: { topology: "triangle-list" },
    });
  }

  render(scene: Scene): void {
    if (!this.renderer || !this.pipeline || !this.uniformBuffer || !this.uniformBindGroup) {
      return;
    }

    const { renderer } = this;
    const viewProjection = this.getViewProjection(scene);
    const { encoder, view } = renderer.beginFrame();

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [renderer.makeClearColorAttachment(view)],
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);

    for (const entity of scene.findEntities(MeshComponent, TransformComponent)) {
      const mesh = entity.require(MeshComponent);
      const transform = entity.require(TransformComponent);
      const modelViewProjection = mat4.multiply(viewProjection, transform.matrix);

      const resource = this.getGpuMesh(mesh);
      this.uniformBuffer.write(modelViewProjection);
      renderPass.setVertexBuffer(0, resource.vertexBuffer.gpu);
      renderPass.draw(resource.vertexCount);
    }

    renderPass.end();
    renderer.endFrame(encoder);
  }

  private getViewProjection(scene: Scene): Mat4 {
    if (!this.renderer) return mat4.identity();

    const cameraEntity = scene.findEntities(CameraComponent, TransformComponent)[0];
    if (!cameraEntity) return mat4.identity();

    const camera = cameraEntity.require(CameraComponent);
    const transform = cameraEntity.require(TransformComponent);
    return camera.getViewProjection(transform, this.renderer.aspectRatio);
  }

  private getGpuMesh(mesh: MeshComponent): GpuMesh {
    const existing = this.meshResources.get(mesh);
    if (existing) return existing;

    if (!this.renderer) throw new Error("Renderer is not initialized.");

    const gpuMesh = new GpuMesh(this.renderer.device, mesh);
    this.meshResources.set(mesh, gpuMesh);
    return gpuMesh;
  }
}
