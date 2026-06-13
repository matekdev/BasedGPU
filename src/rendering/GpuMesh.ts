import type { MeshComponent } from "../components/MeshComponent";
import { GpuBuffer } from "./GpuBuffer";

export class GpuMesh {
  readonly vertexBuffer: GpuBuffer;
  readonly indexBuffer: GpuBuffer;
  readonly indexCount: number;

  constructor(device: GPUDevice, mesh: MeshComponent) {
    this.vertexBuffer = GpuBuffer.vertex(device, mesh.vertices);
    this.indexBuffer = GpuBuffer.index(device, mesh.indices);
    this.indexCount = mesh.indices.length;
  }

  destroy(): void {
    this.vertexBuffer.destroy();
    this.indexBuffer.destroy();
  }
}
