import { mat4, type Mat4, type Vec3, vec3 } from "wgpu-matrix";
import { degreesToRadians } from "../math/angles";
import type { Component } from "./Component";

export class TransformComponent implements Component {
  static readonly componentType = "transform";

  readonly componentType = TransformComponent.componentType;
  readonly position = vec3.create(0, 0, 0);
  readonly rotation = vec3.create(0, 0, 0);
  readonly scale = vec3.create(1, 1, 1);
  private matrixOverride?: Mat4;

  getForwardDirection(): Vec3 {
    const pitch = degreesToRadians(this.rotation[0]);
    const yaw = degreesToRadians(this.rotation[1]);
    const pitchCosine = Math.cos(pitch);

    return vec3.create(
      Math.sin(yaw) * pitchCosine,
      Math.sin(pitch),
      -Math.cos(yaw) * pitchCosine,
    );
  }

  getRightDirection(): Vec3 {
    const yaw = degreesToRadians(this.rotation[1]);
    return vec3.create(Math.cos(yaw), 0, Math.sin(yaw));
  }

  get matrix(): Mat4 {
    if (this.matrixOverride) {
      return new Float32Array(this.matrixOverride) as Mat4;
    }

    const transform = mat4.translation(this.position);
    mat4.rotateX(transform, degreesToRadians(this.rotation[0]), transform);
    mat4.rotateY(transform, degreesToRadians(this.rotation[1]), transform);
    mat4.rotateZ(transform, degreesToRadians(this.rotation[2]), transform);
    mat4.scale(transform, this.scale as Vec3, transform);
    return transform;
  }

  setMatrix(matrix: Mat4): void {
    this.matrixOverride = new Float32Array(matrix) as Mat4;
  }
}
