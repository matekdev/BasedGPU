import type { MeshComponent } from "../components/MeshComponent";
import { GpuBuffer } from "./GpuBuffer";

export class GpuMesh {
  readonly vertexBuffer: GpuBuffer;
  readonly indexBuffer?: GpuBuffer;
  readonly indexCount: number;
  readonly vertexCount: number;
  readonly indexFormat?: GPUIndexFormat;

  constructor(device: GPUDevice, mesh: MeshComponent) {
    this.vertexBuffer = GpuBuffer.vertex(device, mesh.vertices);
    this.vertexCount = mesh.vertexCount;
    this.indexCount = mesh.indices?.length ?? 0;

    if (!mesh.indices) {
      return;
    }

    this.indexBuffer = GpuBuffer.index(device, mesh.indices);
    this.indexFormat = mesh.indices instanceof Uint16Array ? "uint16" : "uint32";
  }

  destroy(): void {
    this.vertexBuffer.destroy();
    this.indexBuffer?.destroy();
  }
}
