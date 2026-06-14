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

export function createNormalMatrix(modelMatrix: Mat4): Mat4 {
  const a00 = modelMatrix[0];
  const a01 = modelMatrix[4];
  const a02 = modelMatrix[8];
  const a10 = modelMatrix[1];
  const a11 = modelMatrix[5];
  const a12 = modelMatrix[9];
  const a20 = modelMatrix[2];
  const a21 = modelMatrix[6];
  const a22 = modelMatrix[10];
  const c00 = (a11 * a22) - (a12 * a21);
  const c01 = (a12 * a20) - (a10 * a22);
  const c02 = (a10 * a21) - (a11 * a20);
  const c10 = (a02 * a21) - (a01 * a22);
  const c11 = (a00 * a22) - (a02 * a20);
  const c12 = (a01 * a20) - (a00 * a21);
  const c20 = (a01 * a12) - (a02 * a11);
  const c21 = (a02 * a10) - (a00 * a12);
  const c22 = (a00 * a11) - (a01 * a10);
  const determinant = (a00 * c00) + (a01 * c01) + (a02 * c02);

  if (Math.abs(determinant) < 1e-8) {
    return mat4.identity();
  }

  const inverseDeterminant = 1 / determinant;
  return new Float32Array([
    c00 * inverseDeterminant,
    c10 * inverseDeterminant,
    c20 * inverseDeterminant,
    0,
    c01 * inverseDeterminant,
    c11 * inverseDeterminant,
    c21 * inverseDeterminant,
    0,
    c02 * inverseDeterminant,
    c12 * inverseDeterminant,
    c22 * inverseDeterminant,
    0,
    0,
    0,
    0,
    1,
  ]) as Mat4;
}

export function normalizeDirection(direction: Float32Array): Float32Array {
  const length = Math.hypot(direction[0], direction[1], direction[2]);

  if (length === 0) {
    return new Float32Array([0, 1, 0, 0]);
  }

  return new Float32Array([
    direction[0] / length,
    direction[1] / length,
    direction[2] / length,
    0,
  ]);
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
