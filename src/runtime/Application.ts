import { WebGpuRenderer } from "../rendering/WebGpuRenderer";
import type { Scene } from "../scene/Scene";

export class Application {
  private readonly renderer: WebGpuRenderer;
  private lastFrameTime = 0;

  constructor(canvas: HTMLCanvasElement, private readonly scene: Scene) {
    this.renderer = new WebGpuRenderer(canvas);
  }

  async start(): Promise<void> {
    await this.renderer.initialize();
    requestAnimationFrame(this.tick);
  }

  private readonly tick = (time: number): void => {
    const deltaTime = this.lastFrameTime ? (time - this.lastFrameTime) / 1000 : 0;
    this.lastFrameTime = time;

    this.scene.update(deltaTime);
    this.renderer.render(this.scene);
    requestAnimationFrame(this.tick);
  };
}
