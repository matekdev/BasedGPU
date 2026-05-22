import { mat4, type Mat4, type Vec3, vec3 } from "wgpu-matrix";
import type { Component } from "./Component";

export class TransformComponent implements Component {
  static readonly componentType = "transform";

  readonly componentType = TransformComponent.componentType;
  readonly position = vec3.create(0, 0, 0);
  readonly rotation = vec3.create(0, 0, 0);
  readonly scale = vec3.create(1, 1, 1);

  get matrix(): Mat4 {
    const transform = mat4.translation(this.position);
    mat4.rotateX(transform, this.rotation[0], transform);
    mat4.rotateY(transform, this.rotation[1], transform);
    mat4.rotateZ(transform, this.rotation[2], transform);
    mat4.scale(transform, this.scale as Vec3, transform);
    return transform;
  }
}
