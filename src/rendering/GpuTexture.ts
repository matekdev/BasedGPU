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

  destroy(): void {
    this.texture.destroy();
  }
}
