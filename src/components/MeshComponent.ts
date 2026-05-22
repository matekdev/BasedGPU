import type { Component } from "./Component";

export class MeshComponent implements Component {
  static readonly componentType = "mesh";

  readonly componentType = MeshComponent.componentType;

  constructor(readonly vertices: Float32Array) {}

  static triangle(): MeshComponent {
    return new MeshComponent(
      new Float32Array([
        0, 0.55, 0.95, 0.45, 0.24,
        -0.55, -0.4, 0.36, 0.72, 0.45,
        0.55, -0.4, 0.45, 0.62, 0.9,
      ]),
    );
  }
}
