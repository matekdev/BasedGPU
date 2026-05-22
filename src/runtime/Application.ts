import { WebGpuRenderer } from "../rendering/WebGpuRenderer";
import { CameraController } from "./CameraController";
import { engineConsole } from "./EngineConsole";
import type { Scene } from "../scene/Scene";

export class Application {
  private readonly renderer: WebGpuRenderer;
  private readonly cameraController: CameraController;
  private previousTimestamp = 0;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly scene: Scene,
  ) {
    this.renderer = new WebGpuRenderer(canvas);
    this.cameraController = new CameraController(canvas, scene);
  }

  async start(): Promise<void> {
    engineConsole.info("Starting runtime", "Application");
    await this.renderer.initialize();
    requestAnimationFrame(this.tick);
    engineConsole.info("Runtime started", "Application");
  }

  private readonly tick = (timestamp: number): void => {
    const deltaSeconds = (timestamp - this.previousTimestamp) / 1000;
    this.previousTimestamp = timestamp;

    this.cameraController.update(deltaSeconds);
    this.renderer.render(this.scene);
    requestAnimationFrame(this.tick);
  };
}
