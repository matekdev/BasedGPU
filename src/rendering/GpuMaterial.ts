import type { MeshComponent } from "../components/MeshComponent";
import { GpuTexture } from "./GpuTexture";

export class GpuMaterial {
  readonly bindGroup: GPUBindGroup;
  readonly texture?: GpuTexture;
  readonly sampler?: GPUSampler;

  constructor(
    device: GPUDevice,
    mesh: MeshComponent,
    layout: GPUBindGroupLayout,
    fallbackTexture: GpuTexture,
    fallbackSampler: GPUSampler,
  ) {
    const baseColorTexture = mesh.material.baseColorTexture;

    if (baseColorTexture) {
      this.texture = GpuTexture.fromImage(device, baseColorTexture.image);
      this.sampler = device.createSampler(baseColorTexture.sampler);
    }

    this.bindGroup = device.createBindGroup({
      layout,
      entries: [
        {
          binding: 0,
          resource: this.sampler ?? fallbackSampler,
        },
        {
          binding: 1,
          resource: (this.texture ?? fallbackTexture).view,
        },
      ],
    });
  }

  destroy(): void {
    this.texture?.destroy();
  }
}
