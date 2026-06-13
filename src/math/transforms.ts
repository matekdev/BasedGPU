import { mat4, quat, type Mat4 } from "wgpu-matrix";

export function composeMatrix(
  translation: readonly [number, number, number],
  rotation: readonly [number, number, number, number],
  scale: readonly [number, number, number],
): Mat4 {
  let matrix = createTranslationMatrix(translation);
  matrix = mat4.multiply(matrix, mat4.fromQuat(quat.clone(rotation)));
  matrix = mat4.multiply(matrix, createScaleMatrix(scale));
  return matrix;
}

export function copyMat4(values: readonly number[]): Mat4 {
  return new Float32Array(values) as Mat4;
}

function createTranslationMatrix(translation: readonly [number, number, number]): Mat4 {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    translation[0], translation[1], translation[2], 1,
  ]) as Mat4;
}

function createScaleMatrix(scale: readonly [number, number, number]): Mat4 {
  return new Float32Array([
    scale[0], 0, 0, 0,
    0, scale[1], 0, 0,
    0, 0, scale[2], 0,
    0, 0, 0, 1,
  ]) as Mat4;
}
