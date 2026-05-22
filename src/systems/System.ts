import type { Scene } from "../scene/Scene";

export interface System {
  update(scene: Scene, deltaTime: number): void;
}
