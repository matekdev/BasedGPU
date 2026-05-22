<script lang="ts">
  import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import Info from "@lucide/svelte/icons/info";
  import Terminal from "@lucide/svelte/icons/terminal";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import XCircle from "@lucide/svelte/icons/x-circle";
  import { onDestroy, tick } from "svelte";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    engineConsole,
    type EngineLogEntry,
    type EngineLogLevel,
  } from "../../runtime/EngineConsole";

  let entries = $state<EngineLogEntry[]>([]);
  let isCollapsed = $state(false);
  let entryListElement = $state<HTMLDivElement>();

  const unsubscribe = engineConsole.subscribe((nextEntries) => {
    entries = nextEntries;
    scrollToLatestEntry();
  });

  onDestroy(unsubscribe);

  async function scrollToLatestEntry() {
    await tick();

    if (!entryListElement) {
      return;
    }

    entryListElement.scrollTop = entryListElement.scrollHeight;
  }

  function getEntryColor(level: EngineLogLevel) {
    if (level === "error") {
      return "text-red-500";
    }

    if (level === "warn") {
      return "text-amber-500";
    }

    return "text-blue-500";
  }

  function getEntryIcon(level: EngineLogLevel) {
    if (level === "error") {
      return XCircle;
    }

    if (level === "warn") {
      return AlertTriangle;
    }

    return Info;
  }

  function formatEntryTime(timestamp: Date) {
    return timestamp.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
</script>

<section
  class="fixed right-0 bottom-0 left-0 z-10 border-t bg-background/95 shadow-2xl backdrop-blur"
>
  <div class="flex h-10 items-center justify-between gap-3 border-b px-3">
    <div class="flex min-w-0 items-center gap-2">
      <Terminal class="size-4 text-muted-foreground" />
      <span class="text-sm font-medium">Console</span>
      <Badge variant="secondary" class="h-5 px-1.5 text-[0.68rem]"
        >{entries.length}</Badge
      >
    </div>

    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Clear console"
        onclick={engineConsole.clear}
      >
        <Trash2 class="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={isCollapsed ? "Expand console" : "Collapse console"}
        onclick={() => (isCollapsed = !isCollapsed)}
      >
        {#if isCollapsed}
          <ChevronUp class="size-3.5" />
        {:else}
          <ChevronDown class="size-3.5" />
        {/if}
      </Button>
    </div>
  </div>

  {#if !isCollapsed}
    <div
      bind:this={entryListElement}
      class="h-44 overflow-y-auto px-3 py-2 text-xs"
    >
      {#if entries.length > 0}
        <div class="grid gap-1">
          {#each entries as entry (entry.id)}
            {@const EntryIcon = getEntryIcon(entry.level)}
            <div
              class="grid grid-cols-[4.5rem_4.5rem_1fr] items-start gap-2 px-1.5 py-1 hover:bg-muted/50"
            >
              <span class="text-muted-foreground"
                >{formatEntryTime(entry.timestamp)}</span
              >
              <span
                class={`flex items-center gap-1 uppercase ${getEntryColor(entry.level)}`}
              >
                <EntryIcon class="size-3" />
                {entry.level}
              </span>
              <span class="min-w-0 text-foreground">
                {#if entry.source}
                  <span class="text-muted-foreground">[{entry.source}]</span>
                {/if}
                {entry.message}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</section>
