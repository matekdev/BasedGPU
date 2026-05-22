import { WebGpuRenderer } from "../rendering/WebGpuRenderer";
import { CameraController } from "./CameraController";
import type { Scene } from "../scene/Scene";

export class Application {
  private readonly renderer: WebGpuRenderer;
  private readonly flyCameraController: CameraController;
  private previousTimestamp = 0;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly scene: Scene,
  ) {
    this.renderer = new WebGpuRenderer(canvas);
    this.flyCameraController = new CameraController(canvas, scene);
  }

  async start(): Promise<void> {
    await this.renderer.initialize();
    requestAnimationFrame(this.tick);
  }

  private readonly tick = (timestamp: number): void => {
    const deltaSeconds = (timestamp - this.previousTimestamp) / 1000;
    this.previousTimestamp = timestamp;

    this.flyCameraController.update(deltaSeconds);
    this.renderer.render(this.scene);
    requestAnimationFrame(this.tick);
  };
}
