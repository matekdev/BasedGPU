import { TransformComponent } from "../components/TransformComponent";
import type { DebugSettings } from "../debug/DebugSettings";
import type { Scene } from "../scene/Scene";
import type { System } from "./System";

export class SpinSystem implements System {
  constructor(private readonly settings: Pick<DebugSettings, "paused" | "spinSpeed">) {}

  update(scene: Scene, deltaTime: number): void {
    if (this.settings.paused) {
      return;
    }

    for (const entity of scene.findEntities("transform")) {
      const transform = entity.get<TransformComponent>("transform");

      if (!transform) {
        continue;
      }

      transform.rotation[2] += deltaTime * this.settings.spinSpeed;
    }
  }
}
