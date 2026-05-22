import { MeshComponent } from "../components/MeshComponent";
import { TransformComponent } from "../components/TransformComponent";
import type { Scene } from "../scene/Scene";
import shaderSource from "./shader.wgsl?raw";

const vertexStride = 5 * Float32Array.BYTES_PER_ELEMENT;

type MeshResource = {
  vertexBuffer: GPUBuffer;
  vertexCount: number;
};

export class WebGpuRenderer {
  private device?: GPUDevice;
  private context?: GPUCanvasContext;
  private pipeline?: GPURenderPipeline;
  private uniformBuffer?: GPUBuffer;
  private uniformBindGroup?: GPUBindGroup;
  private readonly meshResources = new WeakMap<MeshComponent, MeshResource>();

  constructor(private readonly canvas: HTMLCanvasElement) {}

  async initialize(): Promise<void> {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not available in this browser.");
    }

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      throw new Error("No WebGPU adapter was found.");
    }

    const device = await adapter.requestDevice();
    const context = this.canvas.getContext("webgpu");

    if (!context) {
      throw new Error("Could not create a WebGPU canvas context.");
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: "opaque" });

    this.device = device;
    this.context = context;
    this.uniformBuffer = device.createBuffer({
      size: 16 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

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
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
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
    if (
      !this.device ||
      !this.context ||
      !this.pipeline ||
      !this.uniformBuffer ||
      !this.uniformBindGroup
    ) {
      return;
    }

    this.resizeCanvas();

    const encoder = this.device.createCommandEncoder();
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);

    for (const entity of scene.findEntities("mesh", "transform")) {
      const mesh = entity.get<MeshComponent>("mesh");
      const transform = entity.get<TransformComponent>("transform");

      if (!mesh || !transform) {
        continue;
      }

      const resource = this.getMeshResource(mesh);
      this.device.queue.writeBuffer(
        this.uniformBuffer,
        0,
        asGpuBufferSource(transform.matrix),
      );
      renderPass.setVertexBuffer(0, resource.vertexBuffer);
      renderPass.draw(resource.vertexCount);
    }

    renderPass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  private getMeshResource(mesh: MeshComponent): MeshResource {
    const existingResource = this.meshResources.get(mesh);

    if (existingResource) {
      return existingResource;
    }

    if (!this.device) {
      throw new Error("Renderer is not initialized.");
    }

    const vertexBuffer = this.device.createBuffer({
      size: mesh.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(
      vertexBuffer,
      0,
      asGpuBufferSource(mesh.vertices),
    );

    const resource = {
      vertexBuffer,
      vertexCount: mesh.vertices.length / 5,
    };

    this.meshResources.set(mesh, resource);
    return resource;
  }

  private resizeCanvas(): void {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(
      1,
      Math.floor(this.canvas.clientWidth * devicePixelRatio),
    );
    const height = Math.max(
      1,
      Math.floor(this.canvas.clientHeight * devicePixelRatio),
    );

    if (this.canvas.width === width && this.canvas.height === height) {
      return;
    }

    this.canvas.width = width;
    this.canvas.height = height;
  }
}

function asGpuBufferSource(data: Float32Array): GPUAllowSharedBufferSource {
  return data as unknown as GPUAllowSharedBufferSource;
}
