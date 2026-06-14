import type { Component } from "./Component";

export type MeshIndexArray = Uint16Array | Uint32Array;
export const meshVertexFloatCount = 16;
export type MeshSamplerSettings = {
  addressModeU: GPUAddressMode;
  addressModeV: GPUAddressMode;
  magFilter: GPUFilterMode;
  minFilter: GPUFilterMode;
  mipmapFilter: GPUFilterMode;
  lodMaxClamp: number;
};

export type MeshImage = {
  data: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
};

export type MeshTexture = {
  image: MeshImage;
  sampler: MeshSamplerSettings;
};

export type MeshMaterial = {
  baseColorTexture?: MeshTexture;
};

export class MeshComponent implements Component {
  static readonly componentType = "mesh";

  readonly componentType = MeshComponent.componentType;
  readonly vertexCount: number;

  constructor(
    readonly vertices: Float32Array,
    readonly indices?: MeshIndexArray,
    readonly material: MeshMaterial = {},
  ) {
    this.vertexCount = vertices.length / meshVertexFloatCount;
  }
}
