import { parse } from "@loaders.gl/core";
import {
  GLTFLoader,
  postProcessGLTF,
  type GLTFMeshPrimitivePostprocessed,
  type GLTFNodePostprocessed,
  type GLTFPostprocessed,
} from "@loaders.gl/gltf";
import { mat4, type Mat4 } from "wgpu-matrix";
import { MeshComponent } from "../components/MeshComponent";
import { TransformComponent } from "../components/TransformComponent";
import { engineConsole } from "../runtime/EngineConsole";
import { Entity } from "../scene/Entity";

const white = [1, 1, 1] as const;

export async function loadGltfEntities(url: string): Promise<Entity[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
  }

  const data = await parse(response, GLTFLoader, {
    gltf: {
      loadBuffers: true,
      loadImages: false,
      decompressMeshes: true,
    },
  });
  const document = postProcessGLTF(data);
  const entities: Entity[] = [];
  const scene = getDefaultScene(document);

  for (const node of scene?.nodes ?? []) {
    appendNodeEntities(node, mat4.identity(), entities);
  }

  engineConsole.info("Loaded glTF scene", "GltfLoader", {
    url,
    entityCount: entities.length,
  });
  return entities;
}

function getDefaultScene(document: GLTFPostprocessed) {
  if (!document.scenes?.length) {
    return undefined;
  }

  if (typeof document.scene === "object" && document.scene) {
    return document.scene;
  }

  return document.scenes[0];
}

function appendNodeEntities(
  node: GLTFNodePostprocessed,
  parentMatrix: Mat4,
  entities: Entity[],
): void {
  const worldMatrix = mat4.multiply(parentMatrix, getNodeMatrix(node));

  if (node.mesh) {
    node.mesh.primitives.forEach((primitive, primitiveIndex) => {
      const mesh = createPrimitiveMesh(primitive);

      if (!mesh) {
        return;
      }

      const entity = new Entity(`${node.name ?? node.mesh?.name ?? "Mesh"}_${primitiveIndex}`);
      const transform = new TransformComponent();
      transform.setMatrix(worldMatrix);
      entity.add(transform);
      entity.add(mesh);
      entities.push(entity);
    });
  }

  for (const child of node.children ?? []) {
    appendNodeEntities(child, worldMatrix, entities);
  }
}

function getNodeMatrix(node: GLTFNodePostprocessed): Mat4 {
  if (node.matrix?.length === 16) {
    return new Float32Array(node.matrix) as Mat4;
  }

  const translation = toVec3(node.translation, [0, 0, 0]);
  const rotation = toQuat(node.rotation, [0, 0, 0, 1]);
  const scale = toVec3(node.scale, [1, 1, 1]);
  let matrix = createTranslationMatrix(translation);
  matrix = mat4.multiply(matrix, createQuaternionMatrix(rotation));
  matrix = mat4.multiply(matrix, createScaleMatrix(scale));
  return matrix;
}

function createPrimitiveMesh(primitive: GLTFMeshPrimitivePostprocessed): MeshComponent | undefined {
  if (primitive.mode !== undefined && primitive.mode !== 4) {
    engineConsole.warn("Skipping unsupported primitive mode", "GltfLoader", {
      mode: primitive.mode,
    });
    return undefined;
  }

  const positions = primitive.attributes.POSITION?.value;

  if (!positions || positions.length % 3 !== 0) {
    engineConsole.warn("Skipping primitive without POSITION attribute", "GltfLoader");
    return undefined;
  }

  const vertexCount = positions.length / 3;
  const colors = primitive.attributes.COLOR_0?.value;
  const materialColor = primitive.material?.pbrMetallicRoughness?.baseColorFactor?.slice(0, 3) ?? white;
  const vertices = new Float32Array(vertexCount * 6);

  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
    const positionOffset = vertexIndex * 3;
    const vertexOffset = vertexIndex * 6;
    vertices[vertexOffset] = Number(positions[positionOffset]);
    vertices[vertexOffset + 1] = Number(positions[positionOffset + 1]);
    vertices[vertexOffset + 2] = Number(positions[positionOffset + 2]);
    vertices[vertexOffset + 3] = Number(colors?.[positionOffset] ?? materialColor[0]);
    vertices[vertexOffset + 4] = Number(colors?.[positionOffset + 1] ?? materialColor[1]);
    vertices[vertexOffset + 5] = Number(colors?.[positionOffset + 2] ?? materialColor[2]);
  }

  const indexValues = primitive.indices?.value;

  if (!indexValues) {
    return new MeshComponent(vertices);
  }

  if (indexValues instanceof Uint32Array) {
    return new MeshComponent(vertices, new Uint32Array(indexValues));
  }

  return new MeshComponent(vertices, new Uint16Array(indexValues));
}

function toVec3(
  value: number[] | undefined,
  fallback: readonly [number, number, number],
): readonly [number, number, number] {
  if (!value || value.length < 3) {
    return fallback;
  }

  return [value[0], value[1], value[2]];
}

function toQuat(
  value: number[] | undefined,
  fallback: readonly [number, number, number, number],
): readonly [number, number, number, number] {
  if (!value || value.length < 4) {
    return fallback;
  }

  return [value[0], value[1], value[2], value[3]];
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

function createQuaternionMatrix(rotation: readonly [number, number, number, number]): Mat4 {
  const [x, y, z, w] = rotation;
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;

  return new Float32Array([
    1 - 2 * (yy + zz),
    2 * (xy + wz),
    2 * (xz - wy),
    0,
    2 * (xy - wz),
    1 - 2 * (xx + zz),
    2 * (yz + wx),
    0,
    2 * (xz + wy),
    2 * (yz - wx),
    1 - 2 * (xx + yy),
    0,
    0,
    0,
    0,
    1,
  ]) as Mat4;
}
