import { parse } from "@loaders.gl/core";
import {
  GLTFLoader,
  postProcessGLTF,
  type GLTFMeshPrimitivePostprocessed,
  type GLTFNodePostprocessed,
  type GLTFPostprocessed,
} from "@loaders.gl/gltf";
import { mat4, type Mat4 } from "wgpu-matrix";
import { MeshComponent, type MeshImage, type MeshSamplerSettings, type MeshTexture } from "../components/MeshComponent";
import { TransformComponent } from "../components/TransformComponent";
import { composeMatrix, copyMat4 } from "../math/transforms";
import { engineConsole } from "../runtime/EngineConsole";
import { Entity } from "../scene/Entity";

const defaultNormal = [0, 0, 1] as const;
const defaultTangent = [1, 0, 0, 1] as const;
const defaultUv = [0, 0] as const;
const white = [1, 1, 1, 1] as const;

type GltfSampler = {
  wrapS?: number;
  wrapT?: number;
  magFilter?: number;
  minFilter?: number;
};

export async function loadGltfEntities(url: string): Promise<Entity[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
  }

  const data = await parse(response, GLTFLoader, {
    gltf: {
      loadBuffers: true,
      loadImages: true,
      decompressMeshes: true,
    },
    image: {
      type: "data",
    },
  });
  const document = postProcessGLTF(data);
  const entities: Entity[] = [];
  const scene = getDefaultScene(document);
  const textureCache = new Map<string, Promise<MeshTexture | undefined>>();

  for (const node of scene?.nodes ?? []) {
    await appendNodeEntities(node, mat4.identity(), entities, textureCache);
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

async function appendNodeEntities(
  node: GLTFNodePostprocessed,
  parentMatrix: Mat4,
  entities: Entity[],
  textureCache: Map<string, Promise<MeshTexture | undefined>>,
): Promise<void> {
  const worldMatrix = mat4.multiply(parentMatrix, getNodeMatrix(node));

  if (node.mesh) {
    for (const [primitiveIndex, primitive] of node.mesh.primitives.entries()) {
      const mesh = await createPrimitiveMesh(primitive, textureCache);

      if (!mesh) {
        continue;
      }

      const entity = new Entity(`${node.name ?? node.mesh?.name ?? "Mesh"}_${primitiveIndex}`);
      const transform = new TransformComponent();
      transform.setMatrix(worldMatrix);
      entity.add(transform);
      entity.add(mesh);
      entities.push(entity);
    }
  }

  for (const child of node.children ?? []) {
    await appendNodeEntities(child, worldMatrix, entities, textureCache);
  }
}

function getNodeMatrix(node: GLTFNodePostprocessed): Mat4 {
  if (node.matrix?.length === 16) {
    return copyMat4(node.matrix);
  }

  const translation = toVec3(node.translation, [0, 0, 0]);
  const rotation = toQuat(node.rotation, [0, 0, 0, 1]);
  const scale = toVec3(node.scale, [1, 1, 1]);
  return composeMatrix(translation, rotation, scale);
}

async function createPrimitiveMesh(
  primitive: GLTFMeshPrimitivePostprocessed,
  textureCache: Map<string, Promise<MeshTexture | undefined>>,
): Promise<MeshComponent | undefined> {
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
  const normals = primitive.attributes.NORMAL?.value;
  const tangents = primitive.attributes.TANGENT?.value;
  const uvs = primitive.attributes.TEXCOORD_0?.value;
  const colors = primitive.attributes.COLOR_0?.value;
  const colorComponentCount = getAttributeComponentCount(primitive.attributes.COLOR_0?.type, 4);
  const materialColor = primitive.material?.pbrMetallicRoughness?.baseColorFactor ?? white;
  const baseColorTexture = await loadBaseColorTexture(primitive, textureCache);
  const vertices = new Float32Array(vertexCount * 16);

  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
    const positionOffset = vertexIndex * 3;
    const tangentOffset = vertexIndex * 4;
    const uvOffset = vertexIndex * 2;
    const vertexOffset = vertexIndex * 16;
    vertices[vertexOffset] = Number(positions[positionOffset]);
    vertices[vertexOffset + 1] = Number(positions[positionOffset + 1]);
    vertices[vertexOffset + 2] = Number(positions[positionOffset + 2]);
    vertices[vertexOffset + 3] = Number(normals?.[positionOffset] ?? defaultNormal[0]);
    vertices[vertexOffset + 4] = Number(normals?.[positionOffset + 1] ?? defaultNormal[1]);
    vertices[vertexOffset + 5] = Number(normals?.[positionOffset + 2] ?? defaultNormal[2]);
    vertices[vertexOffset + 6] = Number(tangents?.[tangentOffset] ?? defaultTangent[0]);
    vertices[vertexOffset + 7] = Number(tangents?.[tangentOffset + 1] ?? defaultTangent[1]);
    vertices[vertexOffset + 8] = Number(tangents?.[tangentOffset + 2] ?? defaultTangent[2]);
    vertices[vertexOffset + 9] = Number(tangents?.[tangentOffset + 3] ?? defaultTangent[3]);
    vertices[vertexOffset + 10] = Number(uvs?.[uvOffset] ?? defaultUv[0]);
    vertices[vertexOffset + 11] = Number(uvs?.[uvOffset + 1] ?? defaultUv[1]);
    vertices[vertexOffset + 12] = getAttributeValue(colors, vertexIndex, colorComponentCount, 0, 1) * materialColor[0];
    vertices[vertexOffset + 13] = getAttributeValue(colors, vertexIndex, colorComponentCount, 1, 1) * materialColor[1];
    vertices[vertexOffset + 14] = getAttributeValue(colors, vertexIndex, colorComponentCount, 2, 1) * materialColor[2];
    vertices[vertexOffset + 15] = getAttributeValue(colors, vertexIndex, colorComponentCount, 3, 1) * (materialColor[3] ?? 1);
  }

  const indexValues = primitive.indices?.value;

  if (!indexValues) {
    return new MeshComponent(vertices, undefined, { baseColorTexture });
  }

  if (indexValues instanceof Uint32Array) {
    return new MeshComponent(vertices, new Uint32Array(indexValues), { baseColorTexture });
  }

  return new MeshComponent(vertices, new Uint16Array(indexValues), { baseColorTexture });
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

function getAttributeComponentCount(type: string | undefined, fallback: number): number {
  switch (type) {
    case "VEC2":
      return 2;
    case "VEC3":
      return 3;
    case "VEC4":
      return 4;
    default:
      return fallback;
  }
}

function getAttributeValue(
  values: ArrayLike<number> | undefined,
  vertexIndex: number,
  componentCount: number,
  componentIndex: number,
  fallback: number,
): number {
  if (!values || componentIndex >= componentCount) {
    return fallback;
  }

  return Number(values[(vertexIndex * componentCount) + componentIndex]);
}

async function loadBaseColorTexture(
  primitive: GLTFMeshPrimitivePostprocessed,
  textureCache: Map<string, Promise<MeshTexture | undefined>>,
): Promise<MeshTexture | undefined> {
  const texture = primitive.material?.pbrMetallicRoughness?.baseColorTexture?.texture;
  const source = texture?.source;

  if (!texture || !source) {
    return undefined;
  }

  const cachedTexture = textureCache.get(texture.id);

  if (cachedTexture) {
    return cachedTexture;
  }

  const texturePromise = createMeshTexture(texture.sampler, source);
  textureCache.set(texture.id, texturePromise);
  return texturePromise;
}

async function createMeshTexture(
  sampler: GltfSampler | undefined,
  source: unknown,
): Promise<MeshTexture | undefined> {
  const image = await toMeshImage(source);

  if (!image) {
    engineConsole.warn("Skipping unsupported base color texture source", "GltfLoader");
    return undefined;
  }

  return {
    image,
    sampler: createSamplerSettings(sampler),
  };
}

async function toMeshImage(source: unknown): Promise<MeshImage | undefined> {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const imageSource = source as {
    image?: MeshImage;
    bufferView?: {
      data: Uint8Array;
    };
    mimeType?: string;
  };

  if (isMeshImage(imageSource.image)) {
    return imageSource.image;
  }

  const data = imageSource.bufferView?.data;

  if (!data) {
    return undefined;
  }

  const blob = new Blob([data.slice().buffer], {
    type: imageSource.mimeType ?? "image/png",
  });
  const image = await loadImageElement(blob);

  try {
    return readImagePixels(image);
  } finally {
    URL.revokeObjectURL(image.src);
  }
}

function isMeshImage(image: unknown): image is MeshImage {
  if (!image || typeof image !== "object") {
    return false;
  }

  const candidate = image as MeshImage;
  return ArrayBuffer.isView(candidate.data)
    && candidate.data.BYTES_PER_ELEMENT === 1
    && Number.isFinite(candidate.width)
    && Number.isFinite(candidate.height);
}

function readImagePixels(image: HTMLImageElement): MeshImage {
  const canvas = document.createElement("canvas");
  canvas.width = Number(image.width);
  canvas.height = Number(image.height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create a canvas context.");
  }

  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  return {
    data: pixels.data,
    width: pixels.width,
    height: pixels.height,
  };
}

function createSamplerSettings(sampler: GltfSampler | undefined): MeshSamplerSettings {
  return {
    addressModeU: getAddressMode(sampler?.wrapS),
    addressModeV: getAddressMode(sampler?.wrapT),
    magFilter: getMagFilter(sampler?.magFilter),
    minFilter: getMinFilter(sampler?.minFilter),
    mipmapFilter: "nearest",
    lodMaxClamp: 0,
  };
}

function getAddressMode(wrapMode: number | undefined): GPUAddressMode {
  switch (wrapMode) {
    case 33071:
      return "clamp-to-edge";
    case 33648:
      return "mirror-repeat";
    default:
      return "repeat";
  }
}

function getMagFilter(filter: number | undefined): GPUFilterMode {
  return filter === 9728 ? "nearest" : "linear";
}

function getMinFilter(filter: number | undefined): GPUFilterMode {
  switch (filter) {
    case 9728:
    case 9984:
    case 9986:
      return "nearest";
    default:
      return "linear";
  }
}

function loadImageElement(blob: Blob): Promise<HTMLImageElement> {
  const image = new Image();
  const url = URL.createObjectURL(blob);
  image.src = url;

  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode embedded glTF image."));
    };
  });
}
