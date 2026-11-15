<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    tilt?: number; // degrees, e.g. -1 to 1
    hasTape?: boolean;
    tapeColor?: string;
    class?: string;
    children?: Snippet;
  }

  let { 
    tilt = 0, 
    hasTape = true, 
    tapeColor = 'color-mix(in srgb, var(--turmeric) 45%, var(--paper))', 
    class: className = '',
    children 
  }: Props = $props();
</script>

<div 
  class="sticker-card {className} {hasTape ? 'with-tape' : ''}" 
  style:--card-tilt="{tilt}deg"
  style:--custom-tape-color={tapeColor}
>
  {#if hasTape}
    <div class="tape-strip" aria-hidden="true"></div>
  {/if}
  <div class="card-inner">
    {@render children?.()}
  </div>
</div>

<style>
  .sticker-card {
    background-color: var(--paper);
    border: var(--outline);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    transform: rotate(var(--card-tilt, 0deg));
    position: relative;
    padding: var(--space-4);
    transition: transform var(--fast) var(--spring), box-shadow var(--fast) var(--spring);
  }

  .sticker-card:hover {
    box-shadow: var(--shadow-lg);
  }

  .tape-strip {
    position: absolute;
    top: -9px;
    left: 24px;
    width: 60px;
    height: 18px;
    background-color: var(--custom-tape-color);
    border: 1.5px dashed var(--ink);
    transform: rotate(-2.5deg);
    pointer-events: none;
    z-index: 3;
    opacity: 0.95;
    box-shadow: 0 1px 2px rgba(43, 27, 18, 0.15);
  }

  .card-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
</style>
