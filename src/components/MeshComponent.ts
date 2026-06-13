import type { Component } from "./Component";

export type MeshIndexArray = Uint16Array | Uint32Array;

export class MeshComponent implements Component {
  static readonly componentType = "mesh";

  readonly componentType = MeshComponent.componentType;
  readonly vertexCount: number;

  constructor(
    readonly vertices: Float32Array,
    readonly indices?: MeshIndexArray,
  ) {
    this.vertexCount = vertices.length / 6;
  }

  static triangle(): MeshComponent {
    return new MeshComponent(
      new Float32Array([
        0, 0.55, 0, 0.95, 0.45, 0.24,
        -0.55, -0.4, 0, 0.36, 0.72, 0.45,
        0.55, -0.4, 0, 0.45, 0.62, 0.9,
      ]),
      new Uint16Array([0, 1, 2]),
    );
  }
}
