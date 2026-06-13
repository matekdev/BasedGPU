import { Pane } from "tweakpane";

export type DebugPaneFrameStats = {
  fps: number;
  frameTimeMs: number;
};

type DebugPaneOptions = {
  parent: HTMLElement;
};

type BindingContainer = {
  addBinding: (object: object, key: string, options?: object) => void;
};

type PaneApi = Pane & BindingContainer & {
  addFolder: (options: { title: string }) => BindingContainer;
  refresh: () => void;
};

export class DebugPane {
  private readonly stats: DebugPaneFrameStats = {
    fps: 0,
    frameTimeMs: 0,
  };
  private readonly pane: PaneApi;

  constructor({ parent }: DebugPaneOptions) {
    const container = document.createElement("div");
    container.className = "debug-pane";
    parent.append(container);

    this.pane = new Pane({
      title: "Renderer",
      container,
    }) as PaneApi;

    const statsFolder = this.pane.addFolder({ title: "Stats" });
    statsFolder.addBinding(this.stats, "fps", { readonly: true, label: "FPS" });
    statsFolder.addBinding(this.stats, "frameTimeMs", {
      readonly: true,
      label: "Frame ms",
    });
  }

  update(frameStats: DebugPaneFrameStats): void {
    Object.assign(this.stats, frameStats);
    this.pane.refresh();
  }

  dispose(): void {
    this.pane.dispose();
  }
}
