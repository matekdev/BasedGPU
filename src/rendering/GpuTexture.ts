import type { MeshImage } from "../components/MeshComponent";

export class GpuTexture {
  readonly texture: GPUTexture;
  readonly view: GPUTextureView;
  readonly format: GPUTextureFormat;

  private constructor(texture: GPUTexture, format: GPUTextureFormat) {
    this.texture = texture;
    this.view = texture.createView();
    this.format = format;
  }

  static color(
    device: GPUDevice,
    width: number,
    height: number,
    format: GPUTextureFormat = "rgba8unorm",
  ): GpuTexture {
    const texture = device.createTexture({
      size: { width, height },
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    return new GpuTexture(texture, format);
  }

  static depth(device: GPUDevice, width: number, height: number): GpuTexture {
    const format: GPUTextureFormat = "depth24plus";
    const texture = device.createTexture({
      size: { width, height },
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    return new GpuTexture(texture, format);
  }

  static sampled(
    device: GPUDevice,
    width: number,
    height: number,
    format: GPUTextureFormat = "rgba8unorm",
  ): GpuTexture {
    const texture = device.createTexture({
      size: { width, height },
      format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    return new GpuTexture(texture, format);
  }

  static fromImage(
    device: GPUDevice,
    image: MeshImage,
    format: GPUTextureFormat = "rgba8unorm",
  ): GpuTexture {
    const texture = GpuTexture.sampled(device, image.width, image.height, format);
    const data = new Uint8Array(image.data);
    device.queue.writeTexture(
      { texture: texture.texture },
      data,
      { bytesPerRow: image.width * 4 },
      { width: image.width, height: image.height },
    );
    return texture;
  }

  static solidColor(
    device: GPUDevice,
    color: readonly [number, number, number, number],
    format: GPUTextureFormat = "rgba8unorm",
  ): GpuTexture {
    const texture = GpuTexture.sampled(device, 1, 1, format);
    device.queue.writeTexture(
      { texture: texture.texture },
      new Uint8Array([
        Math.round(color[0] * 255),
        Math.round(color[1] * 255),
        Math.round(color[2] * 255),
        Math.round(color[3] * 255),
      ]),
      { bytesPerRow: 4 },
      { width: 1, height: 1 },
    );
    return texture;
  }

  destroy(): void {
    this.texture.destroy();
  }
}
