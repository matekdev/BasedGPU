export class GpuBuffer {
  readonly gpu: GPUBuffer;

  private constructor(
    private readonly device: GPUDevice,
    gpu: GPUBuffer,
  ) {
    this.gpu = gpu;
  }

  static vertex(device: GPUDevice, data: Float32Array): GpuBuffer {
    const gpuBuffer = new GpuBuffer(
      device,
      device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      }),
    );
    gpuBuffer.write(data);
    return gpuBuffer;
  }

  static index(device: GPUDevice, data: Uint16Array | Uint32Array): GpuBuffer {
    const gpuBuffer = new GpuBuffer(
      device,
      device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      }),
    );
    gpuBuffer.write(data);
    return gpuBuffer;
  }

  static uniform(device: GPUDevice, size: number): GpuBuffer {
    return new GpuBuffer(
      device,
      device.createBuffer({
        size,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
    );
  }

  static storage(device: GPUDevice, size: number): GpuBuffer {
    return new GpuBuffer(
      device,
      device.createBuffer({
        size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
    );
  }

  write(data: ArrayBufferView, offset = 0): void {
    this.device.queue.writeBuffer(
      this.gpu,
      offset,
      data as unknown as GPUAllowSharedBufferSource,
    );
  }

  destroy(): void {
    this.gpu.destroy();
  }
}
