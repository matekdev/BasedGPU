<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ComponentIcon from "@lucide/svelte/icons/component";
  import SlidersHorizontal from "@lucide/svelte/icons/sliders-horizontal";
  import { slide } from "svelte/transition";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import {
    isInspectableComponent,
    type Component,
    type ComponentInspectorField,
  } from "../../components/Component";
  import type { Entity } from "../../scene/Entity";

  let { entity }: { entity?: Entity } = $props();
  let inspectorRevision = $state(0);
  let expandedComponents = $state<Record<string, boolean>>({});

  const components = $derived(entity?.getAll() ?? []);
  const refreshInspector = () => {
    inspectorRevision += 1;
  };

  function formatComponentName(component: Component) {
    return component.componentType
      .replace(/(^\w|-\w)/g, (match) => match.replace("-", " ").toUpperCase());
  }

  function isComponentExpanded(component: Component) {
    return expandedComponents[component.componentType] ?? true;
  }

  function toggleComponent(component: Component) {
    expandedComponents = {
      ...expandedComponents,
      [component.componentType]: !isComponentExpanded(component),
    };
  }

  function updateAxisValue(
    field: ComponentInspectorField,
    axisIndex: number,
    event: Event,
  ) {
    const input = event.currentTarget;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const value = Number(input.value);

    if (!Number.isFinite(value)) {
      return;
    }

    field.axes[axisIndex].setValue(value);
    refreshInspector();
  }

  function startAxisDrag(
    field: ComponentInspectorField,
    axisIndex: number,
    event: PointerEvent,
  ) {
    event.preventDefault();
    event.currentTarget instanceof HTMLElement &&
      event.currentTarget.setPointerCapture(event.pointerId);

    const initialX = event.clientX;
    const initialValue = field.axes[axisIndex].getValue();
    const step = field.step ?? 0.1;

    function drag(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - initialX;
      const value = initialValue + delta * step;
      field.axes[axisIndex].setValue(roundValue(value));
      refreshInspector();
    }

    function stopDrag() {
      window.removeEventListener("pointermove", drag);
      window.removeEventListener("pointerup", stopDrag);
    }

    window.addEventListener("pointermove", drag);
    window.addEventListener("pointerup", stopDrag);
  }

  function roundValue(value: number) {
    return Math.round(value * 1000) / 1000;
  }

  function getAxisClass(axisLabel: string) {
    if (axisLabel === "X") {
      return "border-red-500/25 bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-400";
    }

    if (axisLabel === "Y") {
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400";
    }

    return "border-sky-500/25 bg-sky-500/10 text-sky-600 hover:bg-sky-500/15 dark:text-sky-400";
  }
</script>

<aside class="fixed top-3 right-3 bottom-60 z-10 w-72 overflow-hidden rounded-xl border bg-background/95 shadow-2xl backdrop-blur">
  <div class="flex h-10 items-center justify-between gap-3 border-b px-3">
    <div class="flex min-w-0 items-center gap-2">
      <SlidersHorizontal class="size-4 text-muted-foreground" />
      <span class="text-sm font-medium">Inspector</span>
    </div>
    <Badge variant="secondary" class="h-5 px-1.5 text-[0.68rem]">{components.length}</Badge>
  </div>

  {#if entity}
    <div class="grid gap-3 p-3 text-xs">
      {#each components as component (component.componentType)}
        {@const isEditable = isInspectableComponent(component)}
        <section class="overflow-hidden rounded-lg border bg-muted/20">
          <div class="flex h-9 items-center gap-2 border-b px-3">
            {#if isEditable}
              <button
                class="rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
                type="button"
                aria-label={isComponentExpanded(component) ? "Collapse component" : "Expand component"}
                onclick={() => toggleComponent(component)}
              >
                {#if isComponentExpanded(component)}
                  <ChevronDown class="size-3.5" />
                {:else}
                  <ChevronRight class="size-3.5" />
                {/if}
              </button>
            {:else}
              <ComponentIcon class="size-3.5 text-muted-foreground" />
            {/if}
            <span class="font-medium">{formatComponentName(component)}</span>
          </div>

          {#if isEditable && isComponentExpanded(component)}
            <div class="grid gap-3 p-3" transition:slide={{ duration: 160 }}>
              {#each component.getInspectorFields() as field (field.label)}
                <div class="grid gap-1.5">
                  <div class="text-muted-foreground">{field.label}</div>
                  <div class="grid grid-cols-3 gap-2">
                    {#each field.axes as axis, axisIndex (axis.label)}
                      <label class="grid grid-cols-[1.5rem_1fr] items-center gap-1">
                        <button
                          class={`cursor-ew-resize select-none rounded-sm border px-1 py-1 text-center text-[0.68rem] outline-none focus-visible:ring-1 focus-visible:ring-ring ${getAxisClass(axis.label)}`}
                          type="button"
                          aria-label={`Drag ${field.label} ${axis.label}`}
                          onpointerdown={(event) => startAxisDrag(field, axisIndex, event)}
                        >
                          {axis.label}
                        </button>
                        <input
                          class="engine-number-input h-7 min-w-0 rounded-md border bg-background px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          type="number"
                          step={field.step ?? 0.1}
                          value={(inspectorRevision, axis.getValue())}
                          oninput={(event) => updateAxisValue(field, axisIndex, event)}
                        />
                      </label>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </section>
      {/each}
    </div>
  {/if}
</aside>
