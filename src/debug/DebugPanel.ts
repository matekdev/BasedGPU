import { Pane } from "tweakpane";
import type { TransformComponent } from "../components/TransformComponent";
import type { DebugSettings } from "./DebugSettings";

export class DebugPanel {
  private readonly pane: Pane;

  constructor(settings: DebugSettings, triangleTransform: TransformComponent) {
    this.pane = new Pane({ title: "BasedGPU" });

    this.pane.addBinding(settings, "paused");
    this.pane.addBinding(settings, "spinSpeed", {
      min: -5,
      max: 5,
      step: 0.1,
    });

    this.pane
      .addBinding(settings, "triangleScale", {
        min: 0.1,
        max: 2,
        step: 0.05,
      })
      .on("change", (event) => {
        triangleTransform.scale[0] = event.value;
        triangleTransform.scale[1] = event.value;
      });
  }

  dispose(): void {
    this.pane.dispose();
  }
}
