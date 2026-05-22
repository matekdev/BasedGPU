<script lang="ts">
  import Box from "@lucide/svelte/icons/box";
  import Layers from "@lucide/svelte/icons/layers";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { Entity } from "../../scene/Entity";

  let {
    entities = [],
    selectedEntity = $bindable(),
  }: { entities: Entity[]; selectedEntity?: Entity } = $props();

  function selectEntity(entity: Entity) {
    selectedEntity = entity;
  }

  const visibleEntities = $derived(
    entities.filter((entity) => entity.name.toLowerCase() !== "camera"),
  );
</script>

<aside class="fixed top-3 bottom-60 left-3 z-10 w-64 overflow-hidden rounded-xl border bg-background/95 shadow-2xl backdrop-blur">
  <div class="flex h-10 items-center justify-between gap-3 border-b px-3">
    <div class="flex min-w-0 items-center gap-2">
      <Layers class="size-4 text-muted-foreground" />
      <span class="text-sm font-medium">Hierarchy</span>
    </div>
    <Badge variant="secondary" class="h-5 px-1.5 text-[0.68rem]">{visibleEntities.length}</Badge>
  </div>

  <div class="grid gap-1 p-2 text-xs">
    {#each visibleEntities as entity (entity.name)}
      <button
        class="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left hover:bg-muted"
        class:bg-muted={selectedEntity === entity}
        onclick={() => selectEntity(entity)}
      >
        <Box class="size-3.5 shrink-0 text-muted-foreground" />
        <span class="truncate">{entity.name}</span>
      </button>
    {/each}
  </div>
</aside>
