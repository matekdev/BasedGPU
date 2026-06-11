## Portfolio Target

Aim for a project you can describe like this on a resume:

> Built a browser-based WebGPU renderer in TypeScript featuring glTF scene loading, physically based shading, image-based lighting, shadow mapping, GPU resource management, render graph style pass organization, debug visualizations, and performance profiling.

That sentence is the target. Every milestone below should move the project closer to being defensible in an interview.

## Recommended Roadmap

### 1. Stabilize The Renderer Foundation

Before adding visual features, make the renderer easier to extend.

Build:

- A `Renderer` abstraction that owns the device, queue, surface format, and frame lifecycle
- A `GpuBuffer` helper for vertex, index, uniform, and storage buffers
- A `GpuTexture` helper for color, depth, and sampled textures
- A clear split between scene data and GPU resources
- Depth buffering
- Indexed mesh rendering
- Per-object uniform data
- Resize handling that recreates size-dependent resources

Learn:

- WebGPU bind groups and bind group layouts
- Pipeline layout compatibility
- GPU buffer usage flags
- Alignment rules for uniform buffers
- Why modern APIs make resource state explicit

Portfolio value:

- Shows you can build on WebGPU directly instead of treating it like WebGL
- Gives you architecture to discuss before the visuals become complicated

Definition of done:

- Multiple meshes render correctly
- Each mesh has its own transform
- Depth testing works
- Renderer code is split into focused files
- No feature-specific hacks are needed to add a second object

### 2. Add Real Mesh And Texture Loading

The project should render real assets, not hardcoded geometry.

Build:

- glTF 2.0 loading
- Vertex attributes for position, normal, tangent, UV, and color
- Index buffers
- Texture loading
- Sampler creation
- Material data parsed from glTF
- A simple asset cache

Recommended library:

- Use `@gltf-transform/core` or `three` only as an asset parser if useful, but keep rendering code yours

Learn:

- glTF coordinate conventions
- Tangent space
- Texture formats
- sRGB versus linear color
- Asset lifetime and caching

Portfolio value:

- Real asset loading makes the renderer feel concrete
- Interviewers can ask about file formats, GPU upload, and material translation

Definition of done:

- You can drop a glTF model into an assets folder and render it
- Materials preserve base color textures
- The renderer supports indexed and non-indexed meshes
- Asset loading errors are visible in the browser console

### 3. Implement A Real Lighting Model

Move from vertex color to physically based shading.

Build:

- Normal-based lighting
- Directional light
- Point lights
- Blinn-Phong as a stepping stone if needed
- Metallic-roughness PBR
- Normal mapping
- Ambient term
- Gamma-correct output

Learn:

- Linear color workflow
- BRDF basics
- Fresnel, normal distribution, and geometry terms
- Why PBR is more asset-friendly than Phong
- WGSL struct layout and shader organization

Portfolio value:

- PBR is a recognizable benchmark for graphics work
- Shows progression beyond the LearnOpenGL basics

Definition of done:

- A textured glTF model looks plausible under different light directions
- Roughness and metallic values visibly affect the result
- Normal maps work and can be toggled for comparison

### 4. Add Shadow Mapping

Shadows are a strong signal because they touch cameras, passes, depth textures, sampling, bias, and debugging.

Build:

- Directional light shadow map
- Depth-only render pass
- Shadow comparison sampling
- Bias controls
- Debug view for the shadow map
- Percentage closer filtering
- Cascaded shadow maps as an optional advanced step

Learn:

- Rendering from the light's point of view
- Depth precision
- Shadow acne and peter-panning
- Texture comparison samplers
- Multi-pass rendering in WebGPU

Portfolio value:

- Gives you a feature with real tradeoffs to explain
- Debug visualizations show engineering maturity

Definition of done:

- Static meshes cast and receive shadows
- Shadow map can be viewed on screen or through a debug mode
- Bias settings are documented
- Common artifacts are reduced and explained in the README

### 5. Build Debugging And Inspection Tools

A serious renderer needs visibility into its own state.

Build:

- FPS and frame time display
- GPU adapter/device information
- Toggleable render modes: final, normals, albedo, depth, roughness, metallic, shadow map
- Camera position display
- Entity/object selection by ID color picking or ray casting
- Runtime settings panel

Use plain DOM controls if you want to keep the project UI-light. A minimal debug overlay is still useful and does not need a full app framework.

Learn:

- Debug render passes
- GPU timing limitations in browsers
- Practical renderer introspection
- Separating engine debugging from product UI

Portfolio value:

- Makes demos easier to present
- Shows you can debug graphics problems systematically

Definition of done:

- You can diagnose a broken material or shadow without editing code
- Render modes are visible in screenshots or video
- The debug overlay can be hidden for clean captures

### 6. Organize Rendering Into Passes

Once you have depth, lighting, assets, and shadows, the renderer should stop being one large render function.

Build:

- Render pass classes or functions
- Shared frame context
- Resource creation separated from command encoding
- A simple render graph or pass scheduler
- Named GPU debug labels
- Per-frame transient resources where useful

Learn:

- Command encoder flow
- Render pass dependencies
- Size-dependent render targets
- Pipeline and bind group reuse
- How larger engines structure frame rendering

Portfolio value:

- Architecture becomes a feature
- You can explain how the renderer scales as more effects are added

Definition of done:

- Shadow pass, main pass, and debug pass are separate
- Adding a new pass does not require rewriting the main renderer
- GPU objects have useful labels for browser debugging tools

### 7. Add Advanced Rendering Features

Pick a focused set. Do not add every effect halfway.

Good options:

- Image-based lighting
- HDR rendering and tone mapping
- Bloom
- Screen-space ambient occlusion
- Deferred rendering
- Clustered or tiled forward lighting
- Instancing
- Skeletal animation
- GPU particles
- Compute-based culling
- Environment reflections

Recommended priority:

1. Image-based lighting
2. HDR and tone mapping
3. Instancing
4. Compute culling or clustered lighting

Learn:

- Cubemaps and prefiltered environment maps
- Render-to-texture workflows
- Storage buffers
- Compute shaders
- CPU versus GPU bottlenecks

Portfolio value:

- Advanced features differentiate this from a tutorial renderer
- Compute work is especially valuable because WebGPU exposes it cleanly

Definition of done:

- Each feature has a small write-up explaining the approach
- Each feature has a debug mode or measurable result
- Screenshots show before and after

### 8. Add Performance Work

Graphics portfolio projects are much stronger when they include measurement.

Build:

- CPU frame timing
- Draw call count
- Triangle count
- Pipeline count
- Buffer and texture memory estimates
- Basic benchmark scene
- Instancing benchmark
- Culling benchmark

Learn:

- CPU submission overhead
- Draw call batching
- GPU memory pressure
- Browser profiling tools
- WebGPU validation overhead

Portfolio value:

- Turns the project from "I added effects" into "I understand renderer performance"
- Gives you numbers to put in a resume or project write-up

Definition of done:

- README includes benchmark numbers
- You can compare naive and optimized paths
- A release build is measurably different from a development build

### 9. Polish The Demo Scene

The final portfolio presentation needs a controlled scene that shows off the renderer.

Build:

- One curated scene with several material types
- At least one large object, one small detailed object, and one reflective/rough object
- Strong lighting composition
- Camera bookmarks
- Screenshot and video capture workflow
- Hosted demo page

Learn:

- Presentation matters
- A good renderer can look weak with poor assets and lighting
- Repeatable scenes make regressions obvious

Portfolio value:

- Recruiters and interviewers can understand the project quickly
- Screenshots make the resume link worth clicking

Definition of done:

- The project has a hosted demo
- README has screenshots
- Controls are documented
- The default scene loads without manual setup

## Suggested Learning Order

If you want the most efficient path from your current OpenGL/DX11 background:

1. WebGPU setup, bind groups, buffers, textures, and pipeline layout
2. Depth, indexed meshes, and per-object uniforms
3. glTF loading
4. Linear color and texture sampling
5. PBR shading
6. Shadow mapping
7. Debug views
8. Render pass organization
9. IBL, HDR, and tone mapping
10. Compute shaders for culling or particles

This order keeps the project usable at every step. Avoid jumping to advanced effects before the asset and material path is solid.

## What To Document As You Build

Keep the README current with:

- Current feature list
- Screenshots or short videos
- Architecture diagram
- Controls
- Known limitations
- Performance numbers
- A short technical write-up for each major rendering feature

Strong write-ups should answer:

- What problem does this feature solve?
- What GPU resources does it use?
- What are the main artifacts or limitations?
- What would you improve next?

## Resume Bullet Ideas

Use bullets like these once the features are actually implemented:

- Built a WebGPU renderer in TypeScript with glTF loading, PBR materials, shadow mapping, and debug render views.
- Implemented GPU resource management for buffers, textures, samplers, bind groups, and render pipelines.
- Added multi-pass rendering with separate shadow, main lighting, and debug visualization passes.
- Improved scene rendering performance with instancing, resource caching, and benchmark-driven optimization.
- Developed renderer diagnostics including frame timing, draw call counts, GPU adapter details, and material debug modes.

## Good Project Constraints

Use these constraints to keep the project impressive and finishable:

- Keep rendering code yours
- Use libraries for parsing assets when it saves time
- Prefer one polished scene over many unfinished experiments
- Add debug views for every major rendering feature
- Record performance numbers before and after optimizations
- Keep commits small and feature-focused

## Near-Term Next Steps

Start with these tasks:

1. Add depth buffering.
2. Add index buffer support to `MeshComponent`.
3. Split renderer initialization, resource creation, and per-frame command encoding.
4. Add a cube mesh and render multiple entities.
5. Add normals to the vertex format.
6. Implement simple directional lighting.
7. Add a minimal debug overlay for frame time and camera position.

After those are done, move into glTF loading and PBR.
