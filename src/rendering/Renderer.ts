import { engineConsole } from "../runtime/EngineConsole";
import { GpuTexture } from "./GpuTexture";

const clearColor: GPUColor = { r: 0.08, g: 0.1, b: 0.13, a: 1 };

export class Renderer {
  readonly device: GPUDevice;
  readonly format: GPUTextureFormat;
  private readonly context: GPUCanvasContext;
  private depthTexture?: GpuTexture;

  private constructor(
    device: GPUDevice,
    context: GPUCanvasContext,
    format: GPUTextureFormat,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.device = device;
    this.context = context;
    this.format = format;
  }

  static async create(canvas: HTMLCanvasElement): Promise<Renderer> {
    if (!navigator.gpu) {
      engineConsole.error("WebGPU is not available in this browser", "Renderer");
      throw new Error("WebGPU is not available in this browser.");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      engineConsole.error("No WebGPU adapter was found", "Renderer");
      throw new Error("No WebGPU adapter was found.");
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");
    if (!context) {
      engineConsole.error("Could not create a WebGPU canvas context", "Renderer");
      throw new Error("Could not create a WebGPU canvas context.");
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: "opaque" });
    engineConsole.info("WebGPU renderer initialized", "Renderer", { format });

    return new Renderer(device, context, format, canvas);
  }

  beginFrame(): { encoder: GPUCommandEncoder; view: GPUTextureView; depthView: GPUTextureView } {
    this.resizeCanvas();
    const encoder = this.device.createCommandEncoder();
    const view = this.context.getCurrentTexture().createView();
    return { encoder, view, depthView: this.depthTexture!.view };
  }

  endFrame(encoder: GPUCommandEncoder): void {
    this.device.queue.submit([encoder.finish()]);
  }

  get aspectRatio(): number {
    return this.canvas.width / this.canvas.height;
  }

  private resizeCanvas(): void {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * devicePixelRatio));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * devicePixelRatio));

    if (this.canvas.width === width && this.canvas.height === height && this.depthTexture) {
      return;
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.depthTexture?.destroy();
    this.depthTexture = GpuTexture.depth(this.device, width, height);
  }

  makeClearColorAttachment(view: GPUTextureView): GPURenderPassColorAttachment {
    return {
      view,
      clearValue: clearColor,
      loadOp: "clear",
      storeOp: "store",
    };
  }

  makeDepthAttachment(view: GPUTextureView): GPURenderPassDepthStencilAttachment {
    return {
      view,
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    };
  }
}
