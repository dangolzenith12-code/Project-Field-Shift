<script lang="ts">
  interface Props {
    orientation?: 'horizontal' | 'vertical';
    height?: number;
    color?: string;
  }

  let { orientation = 'horizontal', height = 16, color = 'var(--ink)' }: Props = $props();
</script>

<div 
  class="block-print-strip {orientation}" 
  style:--pattern-color={color}
  style:--strip-height="{height}px"
  aria-hidden="true"
>
  <svg class="pattern-svg" width="100%" height={height} preserveAspectRatio="repeat">
    <defs>
      <pattern id="block-print-motif" width="32" height="16" patternUnits="userSpaceOnUse">
        <!-- Diamond motif with central ink dot and leaf accents -->
        <path 
          d="M 16 2 L 28 8 L 16 14 L 4 8 Z" 
          fill="none" 
          stroke="var(--pattern-color)" 
          stroke-width="1.8" 
          stroke-linejoin="round"
        />
        <circle cx="16" cy="8" r="2.2" fill="var(--pattern-color)" />
        <!-- Small flanking botanical leaves -->
        <circle cx="0" cy="8" r="1.5" fill="var(--pattern-color)" />
        <circle cx="32" cy="8" r="1.5" fill="var(--pattern-color)" />
        <path d="M 16 0 L 16 2 M 16 14 L 16 16" stroke="var(--pattern-color)" stroke-width="1.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#block-print-motif)" />
  </svg>
</div>

<style>
  .block-print-strip {
    width: 100%;
    height: var(--strip-height);
    overflow: hidden;
    user-select: none;
    opacity: 0.85;
    margin: var(--space-2) 0;
  }

  .pattern-svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .block-print-strip.vertical {
    width: var(--strip-height);
    height: 100%;
    margin: 0 var(--space-2);
  }
</style>
