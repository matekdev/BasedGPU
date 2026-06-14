import { mat4, type Mat4 } from "wgpu-matrix";
import { CameraComponent } from "../components/CameraComponent";
import { MeshComponent, meshVertexFloatCount } from "../components/MeshComponent";
import { TransformComponent } from "../components/TransformComponent";
import type { Scene } from "../scene/Scene";
import { GpuBuffer } from "./GpuBuffer";
import { GpuMaterial } from "./GpuMaterial";
import { GpuMesh } from "./GpuMesh";
import { Renderer } from "./Renderer";
import { GpuTexture } from "./GpuTexture";
import shaderSource from "../shaders/shader.wgsl?raw";

const vertexStride = meshVertexFloatCount * Float32Array.BYTES_PER_ELEMENT;
const objectUniformByteSize = 16 * Float32Array.BYTES_PER_ELEMENT;

export class SceneRenderer {
  private renderer?: Renderer;
  private pipeline?: GPURenderPipeline;
  private objectUniformBuffer?: GpuBuffer;
  private objectBindGroup?: GPUBindGroup;
  private objectUniformStride = 0;
  private objectUniformCapacity = 0;
  private fallbackTexture?: GpuTexture;
  private fallbackSampler?: GPUSampler;
  private readonly meshResources = new WeakMap<MeshComponent, GpuMesh>();
  private readonly materialResources = new WeakMap<MeshComponent, GpuMaterial>();

  constructor(private readonly canvas: HTMLCanvasElement) {}

  async initialize(): Promise<void> {
    const renderer = await Renderer.create(this.canvas);
    const { device, format } = renderer;

    this.renderer = renderer;
    this.objectUniformStride = this.alignTo(
      objectUniformByteSize,
      device.limits.minUniformBufferOffsetAlignment,
    );
    this.createObjectUniformResources(1);

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform", hasDynamicOffset: true },
        },
      ],
    });
    const materialBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: "filtering" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: "float" },
        },
      ],
    });

    const shaderModule = device.createShaderModule({ code: shaderSource });
    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout, materialBindGroupLayout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: vertexStride,
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x3" },
              {
                shaderLocation: 1,
                offset: 3 * Float32Array.BYTES_PER_ELEMENT,
                format: "float32x3",
              },
              {
                shaderLocation: 2,
                offset: 6 * Float32Array.BYTES_PER_ELEMENT,
                format: "float32x4",
              },
              {
                shaderLocation: 3,
                offset: 10 * Float32Array.BYTES_PER_ELEMENT,
                format: "float32x2",
              },
              {
                shaderLocation: 4,
                offset: 12 * Float32Array.BYTES_PER_ELEMENT,
                format: "float32x4",
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
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: true,
        depthCompare: "less",
      },
    });

    this.objectBindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.requireObjectUniformBuffer().gpu,
            size: objectUniformByteSize,
          },
        },
      ],
    });
    this.fallbackTexture = GpuTexture.solidColor(device, [1, 1, 1, 1]);
    this.fallbackSampler = device.createSampler({
      addressModeU: "repeat",
      addressModeV: "repeat",
      magFilter: "linear",
      minFilter: "linear",
      mipmapFilter: "nearest",
      lodMaxClamp: 0,
    });
  }

  render(scene: Scene): void {
    if (!this.renderer || !this.pipeline || !this.objectBindGroup) {
      return;
    }

    const { renderer } = this;
    const viewProjection = this.getViewProjection(scene);
    const renderables = scene.findEntities(MeshComponent, TransformComponent);
    this.ensureObjectUniformCapacity(renderables.length);
    const { encoder, view, depthView } = renderer.beginFrame();

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [renderer.makeClearColorAttachment(view)],
      depthStencilAttachment: renderer.makeDepthAttachment(depthView),
    });

    renderPass.setPipeline(this.pipeline);

    for (const [index, entity] of renderables.entries()) {
      const mesh = entity.require(MeshComponent);
      const transform = entity.require(TransformComponent);
      const modelViewProjection = mat4.multiply(viewProjection, transform.matrix);
      const objectUniformOffset = index * this.objectUniformStride;

      const resource = this.getGpuMesh(mesh);
      const material = this.getGpuMaterial(mesh);
      this.requireObjectUniformBuffer().write(modelViewProjection, objectUniformOffset);
      renderPass.setVertexBuffer(0, resource.vertexBuffer.gpu);
      renderPass.setBindGroup(0, this.objectBindGroup, [objectUniformOffset]);
      renderPass.setBindGroup(1, material.bindGroup);

      if (!resource.indexBuffer || !resource.indexFormat) {
        renderPass.draw(resource.vertexCount);
        continue;
      }

      renderPass.setIndexBuffer(resource.indexBuffer.gpu, resource.indexFormat);
      renderPass.drawIndexed(resource.indexCount);
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

  private getGpuMaterial(mesh: MeshComponent): GpuMaterial {
    const existing = this.materialResources.get(mesh);
    if (existing) return existing;

    if (!this.renderer || !this.pipeline || !this.fallbackTexture || !this.fallbackSampler) {
      throw new Error("Material resources are not initialized.");
    }

    const gpuMaterial = new GpuMaterial(
      this.renderer.device,
      mesh,
      this.pipeline.getBindGroupLayout(1),
      this.fallbackTexture,
      this.fallbackSampler,
    );
    this.materialResources.set(mesh, gpuMaterial);
    return gpuMaterial;
  }

  private createObjectUniformResources(capacity: number): void {
    if (!this.renderer) throw new Error("Renderer is not initialized.");

    this.objectUniformBuffer?.destroy();
    this.objectUniformCapacity = capacity;
    this.objectUniformBuffer = GpuBuffer.uniform(
      this.renderer.device,
      this.objectUniformStride * capacity,
    );
  }

  private ensureObjectUniformCapacity(objectCount: number): void {
    if (objectCount <= this.objectUniformCapacity) return;

    this.createObjectUniformResources(objectCount);
    this.objectBindGroup = this.renderer?.device.createBindGroup({
      layout: this.pipeline!.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.requireObjectUniformBuffer().gpu,
            size: objectUniformByteSize,
          },
        },
      ],
    });
  }

  private requireObjectUniformBuffer(): GpuBuffer {
    if (!this.objectUniformBuffer) throw new Error("Object uniform buffer is not initialized.");
    return this.objectUniformBuffer;
  }

  private alignTo(value: number, alignment: number): number {
    return Math.ceil(value / alignment) * alignment;
  }
}
