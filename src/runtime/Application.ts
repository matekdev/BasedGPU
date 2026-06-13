import { SceneRenderer } from "../rendering/SceneRenderer";
import { CameraController } from "./CameraController";
import { engineConsole } from "./EngineConsole";
import type { Scene } from "../scene/Scene";
import { DebugPane } from "../ui/DebugPane";

export class Application {
  private readonly renderer: SceneRenderer;
  private readonly cameraController: CameraController;
  private readonly debugPane: DebugPane;
  private previousTimestamp = 0;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly scene: Scene,
  ) {
    this.renderer = new SceneRenderer(canvas);
    this.cameraController = new CameraController(canvas, scene);
    this.debugPane = new DebugPane({
      parent: canvas.parentElement ?? document.body,
    });
  }

  async start(): Promise<void> {
    engineConsole.info("Starting runtime", "Application");
    await this.renderer.initialize();
    requestAnimationFrame(this.tick);
    engineConsole.info("Runtime started", "Application");
  }

  private readonly tick = (timestamp: number): void => {
    const deltaSeconds = this.previousTimestamp === 0
      ? 0
      : (timestamp - this.previousTimestamp) / 1000;
    this.previousTimestamp = timestamp;

    this.cameraController.update(deltaSeconds);
    this.renderer.render(this.scene);
    const frameTimeMs = deltaSeconds > 0 ? deltaSeconds * 1000 : 0;
    const fps = deltaSeconds > 0 ? 1 / deltaSeconds : 0;

    this.debugPane.update({
      fps: Number(fps.toFixed(1)),
      frameTimeMs: Number(frameTimeMs.toFixed(2)),
    });
    requestAnimationFrame(this.tick);
  };
}
