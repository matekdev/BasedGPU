import { mat4, type Mat4, vec3 } from "wgpu-matrix";
import type { Component } from "./Component";
import type { TransformComponent } from "./TransformComponent";

const worldUp = vec3.create(0, 1, 0);

export class CameraComponent implements Component {
  static readonly componentType = "camera";

  readonly componentType = CameraComponent.componentType;

  constructor(
    readonly fieldOfViewY = Math.PI / 3,
    readonly near = 0.1,
    readonly far = 100,
  ) {}

  getViewProjection(transform: TransformComponent, aspectRatio: number): Mat4 {
    const forward = transform.getForwardDirection();
    const target = vec3.create(
      transform.position[0] + forward[0],
      transform.position[1] + forward[1],
      transform.position[2] + forward[2],
    );
    const view = mat4.lookAt(transform.position, target, worldUp);
    const projection = mat4.perspective(
      this.fieldOfViewY,
      aspectRatio,
      this.near,
      this.far,
    );

    return mat4.multiply(projection, view);
  }
}
