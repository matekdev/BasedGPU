import { WebGpuRenderer } from "../rendering/WebGpuRenderer";
import type { Scene } from "../scene/Scene";

export class Application {
  private readonly renderer: WebGpuRenderer;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly scene: Scene,
  ) {
    this.renderer = new WebGpuRenderer(canvas);
  }

  async start(): Promise<void> {
    await this.renderer.initialize();
    requestAnimationFrame(this.tick);
  }

  private readonly tick = (_: number): void => {
    this.renderer.render(this.scene);
    requestAnimationFrame(this.tick);
  };
}
