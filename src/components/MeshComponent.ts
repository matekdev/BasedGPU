import type { Component } from "./Component";

export type MeshIndexArray = Uint16Array | Uint32Array;
export const meshVertexFloatCount = 16;

export class MeshComponent implements Component {
  static readonly componentType = "mesh";

  readonly componentType = MeshComponent.componentType;
  readonly vertexCount: number;

  constructor(
    readonly vertices: Float32Array,
    readonly indices?: MeshIndexArray,
  ) {
    this.vertexCount = vertices.length / meshVertexFloatCount;
  }
}
