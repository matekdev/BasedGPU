## Portfolio Target

Aim for a project you can describe like this on a resume:

> Built a browser-based WebGPU renderer in TypeScript featuring glTF scene loading, physically based shading, image-based lighting, shadow mapping, GPU resource management, render graph style pass organization, debug visualizations, and performance profiling.

That sentence is the target. Every milestone below should move the project closer to being defensible in an interview.

## Recommended Roadmap

### 1. Stabilize The Renderer Foundation

Before adding visual features, make the renderer easier to extend.

Build:

- [x] Create a `Renderer` abstraction that owns the device, queue, surface format, and frame lifecycle
- [x] Add a `GpuBuffer` helper for vertex, index, uniform, and storage buffers
- [x] Add a `GpuTexture` helper for color, depth, and sampled textures
- [x] Split scene data from GPU resources
- [ ] Add depth buffering
- [ ] Add indexed mesh rendering
- [ ] Add per-object uniform data
- [ ] Handle resize by recreating size-dependent resources

Learn:

- [ ] Understand WebGPU bind groups and bind group layouts
- [ ] Understand pipeline layout compatibility
- [ ] Understand GPU buffer usage flags
- [ ] Understand alignment rules for uniform buffers
- [ ] Understand why modern APIs make resource state explicit

Portfolio value:

- [ ] Be able to explain how this shows direct WebGPU usage instead of a WebGL-style approach
- [ ] Be able to explain the renderer architecture before the visuals become complicated

Definition of done:

- [ ] Multiple meshes render correctly
- [ ] Each mesh has its own transform
- [ ] Depth testing works
- [ ] Renderer code is split into focused files
- [ ] No feature-specific hacks are needed to add a second object

### 2. Add Real Mesh And Texture Loading

The project should render real assets, not hardcoded geometry.

Build:

- [ ] Add glTF 2.0 loading
- [ ] Support vertex attributes for position, normal, tangent, UV, and color
- [ ] Add index buffers
- [ ] Add texture loading
- [ ] Add sampler creation
- [ ] Parse material data from glTF
- [ ] Add a simple asset cache

Recommended library:

- [ ] Evaluate `@gltf-transform/core` or `three` as an asset parser only, while keeping rendering code yours

Learn:

- [ ] Understand glTF coordinate conventions
- [ ] Understand tangent space
- [ ] Understand texture formats
- [ ] Understand sRGB versus linear color
- [ ] Understand asset lifetime and caching

Portfolio value:

- [ ] Be able to explain file formats, GPU upload, and material translation in interviews
- [ ] Make the renderer feel concrete by loading real assets

Definition of done:

- [ ] A glTF model can be dropped into an assets folder and rendered
- [ ] Materials preserve base color textures
- [ ] The renderer supports indexed and non-indexed meshes
- [ ] Asset loading errors are visible in the browser console

### 3. Implement A Real Lighting Model

Move from vertex color to physically based shading.

Build:

- [ ] Add normal-based lighting
- [ ] Add a directional light
- [ ] Add point lights
- [ ] Add Blinn-Phong as a stepping stone if needed
- [ ] Add metallic-roughness PBR
- [ ] Add normal mapping
- [ ] Add an ambient term
- [ ] Add gamma-correct output

Learn:

- [ ] Understand linear color workflow
- [ ] Understand BRDF basics
- [ ] Understand Fresnel, normal distribution, and geometry terms
- [ ] Understand why PBR is more asset-friendly than Phong
- [ ] Understand WGSL struct layout and shader organization

Portfolio value:

- [ ] Reach a recognizable graphics benchmark with PBR
- [ ] Show progression beyond the LearnOpenGL basics

Definition of done:

- [ ] A textured glTF model looks plausible under different light directions
- [ ] Roughness and metallic values visibly affect the result
- [ ] Normal maps work and can be toggled for comparison

### 4. Add Shadow Mapping

Shadows are a strong signal because they touch cameras, passes, depth textures, sampling, bias, and debugging.

Build:

- [ ] Add a directional light shadow map
- [ ] Add a depth-only render pass
- [ ] Add shadow comparison sampling
- [ ] Add bias controls
- [ ] Add a debug view for the shadow map
- [ ] Add percentage closer filtering
- [ ] Explore cascaded shadow maps as an optional advanced step

Learn:

- [ ] Understand rendering from the light's point of view
- [ ] Understand depth precision
- [ ] Understand shadow acne and peter-panning
- [ ] Understand texture comparison samplers
- [ ] Understand multi-pass rendering in WebGPU

Portfolio value:

- [ ] Be able to explain shadow tradeoffs clearly
- [ ] Use debug visualizations to show engineering maturity

Definition of done:

- [ ] Static meshes cast and receive shadows
- [ ] The shadow map can be viewed on screen or through a debug mode
- [ ] Bias settings are documented
- [ ] Common artifacts are reduced and explained in the README

### 5. Build Debugging And Inspection Tools

A serious renderer needs visibility into its own state.

Build:

- [ ] Add FPS and frame time display
- [ ] Show GPU adapter and device information
- [ ] Add toggleable render modes for final, normals, albedo, depth, roughness, metallic, and shadow map
- [ ] Show camera position
- [ ] Add entity or object selection by ID color picking or ray casting
- [ ] Add a runtime settings panel

Use plain DOM controls if you want to keep the project UI-light. A minimal debug overlay is still useful and does not need a full app framework.

Learn:

- [ ] Understand debug render passes
- [ ] Understand GPU timing limitations in browsers
- [ ] Practice practical renderer introspection
- [ ] Understand how to separate engine debugging from product UI

Portfolio value:

- [ ] Make demos easier to present
- [ ] Show you can debug graphics problems systematically

Definition of done:

- [ ] A broken material or shadow can be diagnosed without editing code
- [ ] Render modes are visible in screenshots or video
- [ ] The debug overlay can be hidden for clean captures

### 6. Organize Rendering Into Passes

Once you have depth, lighting, assets, and shadows, the renderer should stop being one large render function.

Build:

- [ ] Add render pass classes or functions
- [ ] Add a shared frame context
- [ ] Separate resource creation from command encoding
- [ ] Add a simple render graph or pass scheduler
- [ ] Add named GPU debug labels
- [ ] Add per-frame transient resources where useful

Learn:

- [ ] Understand command encoder flow
- [ ] Understand render pass dependencies
- [ ] Understand size-dependent render targets
- [ ] Understand pipeline and bind group reuse
- [ ] Understand how larger engines structure frame rendering

Portfolio value:

- [ ] Make architecture a feature worth discussing
- [ ] Be able to explain how the renderer scales as more effects are added

Definition of done:

- [ ] Shadow pass, main pass, and debug pass are separate
- [ ] Adding a new pass does not require rewriting the main renderer
- [ ] GPU objects have useful labels for browser debugging tools

### 7. Add Advanced Rendering Features

Pick a focused set. Do not add every effect halfway.

Good options:

- [ ] Image-based lighting
- [ ] HDR rendering and tone mapping
- [ ] Bloom
- [ ] Screen-space ambient occlusion
- [ ] Deferred rendering
- [ ] Clustered or tiled forward lighting
- [ ] Instancing
- [ ] Skeletal animation
- [ ] GPU particles
- [ ] Compute-based culling
- [ ] Environment reflections

Recommended priority:

- [ ] Image-based lighting
- [ ] HDR and tone mapping
- [ ] Instancing
- [ ] Compute culling or clustered lighting

Learn:

- [ ] Understand cubemaps and prefiltered environment maps
- [ ] Understand render-to-texture workflows
- [ ] Understand storage buffers
- [ ] Understand compute shaders
- [ ] Understand CPU versus GPU bottlenecks

Portfolio value:

- [ ] Differentiate the project from a tutorial renderer
- [ ] Use compute work to show strength in modern GPU programming

Definition of done:

- [ ] Each feature has a small write-up explaining the approach
- [ ] Each feature has a debug mode or measurable result
- [ ] Screenshots show before and after

### 8. Add Performance Work

Graphics portfolio projects are much stronger when they include measurement.

Build:

- [ ] Add CPU frame timing
- [ ] Add draw call count
- [ ] Add triangle count
- [ ] Add pipeline count
- [ ] Add buffer and texture memory estimates
- [ ] Add a basic benchmark scene
- [ ] Add an instancing benchmark
- [ ] Add a culling benchmark

Learn:

- [ ] Understand CPU submission overhead
- [ ] Understand draw call batching
- [ ] Understand GPU memory pressure
- [ ] Understand browser profiling tools
- [ ] Understand WebGPU validation overhead

Portfolio value:

- [ ] Be able to show renderer performance understanding, not just visual effects
- [ ] Produce numbers worth putting in a resume or project write-up

Definition of done:

- [ ] README includes benchmark numbers
- [ ] Naive and optimized paths can be compared
- [ ] A release build is measurably different from a development build

### 9. Polish The Demo Scene

The final portfolio presentation needs a controlled scene that shows off the renderer.

Build:

- [ ] Create one curated scene with several material types
- [ ] Include at least one large object, one small detailed object, and one reflective or rough object
- [ ] Create strong lighting composition
- [ ] Add camera bookmarks
- [ ] Add a screenshot and video capture workflow
- [ ] Add a hosted demo page

Learn:

- [ ] Internalize that presentation matters
- [ ] Understand that a good renderer can look weak with poor assets and lighting
- [ ] Use repeatable scenes to make regressions obvious

Portfolio value:

- [ ] Make the project easy for recruiters and interviewers to understand quickly
- [ ] Make the resume link worth clicking with strong screenshots

Definition of done:

- [ ] The project has a hosted demo
- [ ] README has screenshots
- [ ] Controls are documented
- [ ] The default scene loads without manual setup

## Suggested Learning Order

If you want the most efficient path from your current OpenGL/DX11 background:

- [ ] WebGPU setup, bind groups, buffers, textures, and pipeline layout
- [ ] Depth, indexed meshes, and per-object uniforms
- [ ] glTF loading
- [ ] Linear color and texture sampling
- [ ] PBR shading
- [ ] Shadow mapping
- [ ] Debug views
- [ ] Render pass organization
- [ ] IBL, HDR, and tone mapping
- [ ] Compute shaders for culling or particles

This order keeps the project usable at every step. Avoid jumping to advanced effects before the asset and material path is solid.

## What To Document As You Build

Keep the README current with:

- [ ] Current feature list
- [ ] Screenshots or short videos
- [ ] Architecture diagram
- [ ] Controls
- [ ] Known limitations
- [ ] Performance numbers
- [ ] A short technical write-up for each major rendering feature

Strong write-ups should answer:

- [ ] What problem does this feature solve?
- [ ] What GPU resources does it use?
- [ ] What are the main artifacts or limitations?
- [ ] What would you improve next?

## Resume Bullet Ideas

Use bullets like these once the features are actually implemented:

- [ ] Built a WebGPU renderer in TypeScript with glTF loading, PBR materials, shadow mapping, and debug render views.
- [ ] Implemented GPU resource management for buffers, textures, samplers, bind groups, and render pipelines.
- [ ] Added multi-pass rendering with separate shadow, main lighting, and debug visualization passes.
- [ ] Improved scene rendering performance with instancing, resource caching, and benchmark-driven optimization.
- [ ] Developed renderer diagnostics including frame timing, draw call counts, GPU adapter details, and material debug modes.

## Good Project Constraints

Use these constraints to keep the project impressive and finishable:

- [ ] Keep rendering code yours
- [ ] Use libraries for parsing assets when it saves time
- [ ] Prefer one polished scene over many unfinished experiments
- [ ] Add debug views for every major rendering feature
- [ ] Record performance numbers before and after optimizations
- [ ] Keep commits small and feature-focused

## Near-Term Next Steps

Start with these tasks:

- [ ] Add depth buffering
- [ ] Add index buffer support to `MeshComponent`
- [ ] Split renderer initialization, resource creation, and per-frame command encoding
- [ ] Add a cube mesh and render multiple entities
- [ ] Add normals to the vertex format
- [ ] Implement simple directional lighting
- [ ] Add a minimal debug overlay for frame time and camera position

After those are done, move into glTF loading and PBR.
