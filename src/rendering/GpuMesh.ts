import type { MeshComponent } from "../components/MeshComponent";
import { GpuBuffer } from "./GpuBuffer";

const floatsPerVertex = 5;

export class GpuMesh {
  readonly vertexBuffer: GpuBuffer;
  readonly vertexCount: number;

  constructor(device: GPUDevice, mesh: MeshComponent) {
    this.vertexBuffer = GpuBuffer.vertex(device, mesh.vertices);
    this.vertexCount = mesh.vertices.length / floatsPerVertex;
  }

  destroy(): void {
    this.vertexBuffer.destroy();
  }
}
