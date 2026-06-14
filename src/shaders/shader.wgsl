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
};

struct ObjectUniform {
  modelViewProjection: mat4x4f,
};

@group(0) @binding(0) var<uniform> objectUniform: ObjectUniform;
@group(1) @binding(0) var baseColorSampler: sampler;
@group(1) @binding(1) var baseColorTexture: texture_2d<f32>;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = objectUniform.modelViewProjection * vec4f(input.position, 1.0);
  output.color = input.color;
  output.uv = input.uv;
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  return textureSample(baseColorTexture, baseColorSampler, input.uv);
}
