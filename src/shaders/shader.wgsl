struct VertexInput {
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) tangent: vec4f,
  @location(3) uv: vec2f,
  @location(4) color: vec4f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) uv: vec2f,
  @location(2) normal: vec3f,
};

struct ObjectUniform {
  modelViewProjection: mat4x4f,
  normalMatrix: mat4x4f,
};

struct SceneUniform {
  lightDirection: vec4f,
  lightColor: vec4f,
};

@group(0) @binding(0) var<uniform> objectUniform: ObjectUniform;
@group(1) @binding(0) var<uniform> sceneUniform: SceneUniform;
@group(2) @binding(0) var baseColorSampler: sampler;
@group(2) @binding(1) var baseColorTexture: texture_2d<f32>;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = objectUniform.modelViewProjection * vec4f(input.position, 1.0);
  output.color = input.color;
  output.uv = input.uv;
  output.normal = normalize((objectUniform.normalMatrix * vec4f(input.normal, 0.0)).xyz);
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let baseColor = textureSample(baseColorTexture, baseColorSampler, input.uv) * input.color;
  let lightDirection = normalize(sceneUniform.lightDirection.xyz);
  let diffuse = max(dot(normalize(input.normal), lightDirection), 0.0);
  let lightColor = sceneUniform.lightColor.rgb * sceneUniform.lightColor.a;
  return vec4f(baseColor.rgb * lightColor * diffuse, baseColor.a);
}
