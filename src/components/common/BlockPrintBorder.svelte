<script lang="ts">
  interface Props {
    orientation?: 'horizontal' | 'vertical';
    height?: number;
    color?: string;
    variant?: 'default' | 'phulkari' | 'tanjore' | 'kasuti' | 'midwest' | 'sahel';
  }

  let { 
    orientation = 'horizontal', 
    height = 18, 
    color = 'var(--journal-ink)',
    variant = 'default' 
  }: Props = $props();

  // Unique pattern ID to prevent conflicts when multiple variants render on the same page
  const patternId = $derived(`border-motif-${variant}-${Math.round(height)}`);
</script>

<div 
  class="block-print-strip {orientation} {variant}" 
  style:--pattern-color={color}
  style:--strip-height="{height}px"
  aria-hidden="true"
>
  <svg class="pattern-svg" width="100%" height={height} preserveAspectRatio="repeat">
    <defs>
      {#if variant === 'phulkari'}
        <!-- Phulkari Geometrics: Stepped Chevrons & Diamond Flower Needlework (Punjab) -->
        <pattern id={patternId} width="40" height="20" patternUnits="userSpaceOnUse">
          <!-- Outer stepped embroidery diamond -->
          <polygon points="20,1 39,10 20,19 1,10" fill="none" stroke="var(--pattern-color)" stroke-width="1.6" />
          <!-- Inner geometric cross-stitch diamonds -->
          <polygon points="20,4 32,10 20,16 8,10" fill="none" stroke="#C0292B" stroke-width="1.4" opacity="0.8" />
          <polygon points="20,7 26,10 20,13 14,10" fill="#F2A31B" opacity="0.9" />
          <!-- Corner needlework stitches -->
          <line x1="0" y1="0" x2="6" y2="4" stroke="var(--pattern-color)" stroke-width="1.2" />
          <line x1="40" y1="0" x2="34" y2="4" stroke="var(--pattern-color)" stroke-width="1.2" />
          <line x1="0" y1="20" x2="6" y2="16" stroke="var(--pattern-color)" stroke-width="1.2" />
          <line x1="40" y1="20" x2="34" y2="16" stroke="var(--pattern-color)" stroke-width="1.2" />
        </pattern>
      {:else if variant === 'tanjore'}
        <!-- Tanjore Temple Frieze: Lotus Petals & Gold Foil Beads (Karnataka) -->
        <pattern id={patternId} width="36" height="20" patternUnits="userSpaceOnUse">
          <!-- Arching temple petal frame -->
          <path d="M 0 16 Q 9 2 18 16 Q 27 2 36 16" fill="none" stroke="var(--pattern-color)" stroke-width="1.8" />
          <path d="M 0 18 Q 9 5 18 18 Q 27 5 36 18" fill="none" stroke="#A43C25" stroke-width="1.2" opacity="0.75" />
          <!-- Tanjore gilded bead center -->
          <circle cx="18" cy="9" r="3" fill="#DF9B1A" stroke="var(--pattern-color)" stroke-width="1" />
          <circle cx="0" cy="18" r="1.8" fill="#DF9B1A" />
          <circle cx="36" cy="18" r="1.8" fill="#DF9B1A" />
          <!-- Fine temple pillar lines -->
          <line x1="18" y1="12" x2="18" y2="19" stroke="var(--pattern-color)" stroke-width="1.2" />
        </pattern>
      {:else if variant === 'kasuti'}
        <!-- Kasuti Folk Embroidery: Stepped Gopura, Ratha Chevron & Cross Stitches (Karnataka) -->
        <pattern id={patternId} width="40" height="20" patternUnits="userSpaceOnUse">
          <polygon points="20,1 38,10 20,19 2,10" fill="none" stroke="var(--pattern-color)" stroke-width="1.6" />
          <polygon points="20,4 32,10 20,16 8,10" fill="none" stroke="#A43C25" stroke-width="1.3" opacity="0.85" />
          <circle cx="20" cy="10" r="2" fill="#DF9B1A" />
          <line x1="0" y1="1" x2="8" y2="1" stroke="var(--pattern-color)" stroke-width="1.2" />
          <line x1="32" y1="1" x2="40" y2="1" stroke="var(--pattern-color)" stroke-width="1.2" />
          <line x1="0" y1="19" x2="8" y2="19" stroke="var(--pattern-color)" stroke-width="1.2" />
          <line x1="32" y1="19" x2="40" y2="19" stroke="var(--pattern-color)" stroke-width="1.2" />
        </pattern>
      {:else if variant === 'midwest'}
        <!-- Midwestern Prairie & Barn Quilt: Eight-Point Star & Lattice (Iowa) -->
        <pattern id={patternId} width="36" height="20" patternUnits="userSpaceOnUse">
          <!-- Quilt-block diagonal grid -->
          <line x1="0" y1="0" x2="36" y2="20" stroke="var(--pattern-color)" stroke-width="1.2" opacity="0.4" />
          <line x1="0" y1="20" x2="36" y2="0" stroke="var(--pattern-color)" stroke-width="1.2" opacity="0.4" />
          <!-- Corn-and-beans central diamond star -->
          <polygon points="18,3 24,10 18,17 12,10" fill="#E8AA15" stroke="var(--pattern-color)" stroke-width="1.5" />
          <polygon points="18,6 21,10 18,14 15,10" fill="#2B6E3B" />
          <!-- Top & bottom barn framing lines -->
          <line x1="0" y1="1" x2="36" y2="1" stroke="var(--pattern-color)" stroke-width="1.6" />
          <line x1="0" y1="19" x2="36" y2="19" stroke="var(--pattern-color)" stroke-width="1.6" />
        </pattern>
      {:else if variant === 'sahel'}
        <!-- Sahelian Woven Mudcloth: Raffia Chevron Weave & Desert Sun (Sahel) -->
        <pattern id={patternId} width="36" height="20" patternUnits="userSpaceOnUse">
          <!-- Chevron textile weave -->
          <polyline points="0,14 9,4 18,14 27,4 36,14" fill="none" stroke="var(--pattern-color)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <polyline points="0,17 9,7 18,17 27,7 36,17" fill="none" stroke="#D67A26" stroke-width="1.4" opacity="0.8" />
          <!-- Solar dot symbols -->
          <circle cx="9" cy="2" r="1.8" fill="#E8BA78" />
          <circle cx="27" cy="2" r="1.8" fill="#E8BA78" />
          <circle cx="18" cy="18" r="1.8" fill="#7C3B22" />
        </pattern>
      {:else}
        <!-- Classic Botanical Field Journal Diamond Motif -->
        <pattern id={patternId} width="32" height="18" patternUnits="userSpaceOnUse">
          <path d="M 16 2 L 28 9 L 16 16 L 4 9 Z" fill="none" stroke="var(--pattern-color)" stroke-width="1.6" stroke-linejoin="round" />
          <circle cx="16" cy="9" r="2.2" fill="var(--pattern-color)" />
          <circle cx="0" cy="9" r="1.6" fill="var(--pattern-color)" />
          <circle cx="32" cy="9" r="1.6" fill="var(--pattern-color)" />
          <path d="M 16 0 L 16 2 M 16 16 L 16 18" stroke="var(--pattern-color)" stroke-width="1.4" />
        </pattern>
      {/if}
    </defs>
    <rect width="100%" height="100%" fill="url(#{patternId})" />
  </svg>
</div>

<style>
  .block-print-strip {
    width: 100%;
    height: var(--strip-height);
    overflow: hidden;
    user-select: none;
    opacity: 0.9;
    margin: 8px 0;
  }

  .pattern-svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .block-print-strip.vertical {
    width: var(--strip-height);
    height: 100%;
    margin: 0 8px;
  }
</style>
