<script lang="ts">
  import { onMount } from "svelte";
  import { ModeWatcher } from "mode-watcher";
  import "./styles.css";
  import EntityHierarchy from "$lib/components/EntityHierarchy.svelte";
  import EngineConsole from "$lib/components/EngineConsole.svelte";
  import { MeshComponent } from "./components/MeshComponent";
  import { TransformComponent } from "./components/TransformComponent";
  import { Application } from "./runtime/Application";
  import { Entity } from "./scene/Entity";
  import { Scene } from "./scene/Scene";

  let canvasElement: HTMLCanvasElement;
  let scene = $state<Scene>();
  let entities = $state<Entity[]>([]);

  onMount(() => {
    scene = new Scene();
    const triangle = new Entity("Triangle");

    triangle.add(new TransformComponent());
    triangle.add(MeshComponent.triangle());
    scene.add(triangle);
    entities = scene.getEntities();

    const application = new Application(canvasElement, scene);
    application.start();
  });
</script>

<ModeWatcher />
<canvas bind:this={canvasElement} class="viewport"></canvas>
<EntityHierarchy {entities} />
<EngineConsole />
