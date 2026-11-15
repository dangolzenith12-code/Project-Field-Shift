<script lang="ts">
  interface Props {
    value: number; // 0 to 100
    label?: string;
  }

  let { value, label = "Nitrogen" }: Props = $props();

  const clampedVal = $derived(Math.max(0, Math.min(100, Math.round(value))));
  // Leaf stages based on nitrogen
  const hasSecondLeaf = $derived(clampedVal > 35);
  const hasThirdLeaf = $derived(clampedVal > 65);
  const isHealthyGlow = $derived(clampedVal >= 50 && clampedVal <= 85);

  let isWobbling = $state(false);
  let prevVal = $state<number | undefined>(undefined);

  $effect(() => {
    if (prevVal !== undefined && prevVal !== value) {
      isWobbling = true;
      const t = setTimeout(() => isWobbling = false, 600);
      prevVal = value;
      return () => clearTimeout(t);
    }
    prevVal = value;
  });
</script>

<div class="sprout-meter-wrapper {isWobbling ? 'sprout-wobble' : ''}">
  <div class="sprout-graphic" aria-label="{label}: {clampedVal}%">
    <svg class="sprout-svg" viewBox="0 0 54 66" width="46" height="58">
      <!-- Glow Aura if balanced -->
      {#if isHealthyGlow}
        <ellipse cx="27" cy="30" rx="18" ry="20" fill="var(--paddy)" opacity="0.18" />
      {/if}

      <!-- Soil Bed Mound -->
      <path d="M 6 56 Q 27 46 48 56 L 48 64 L 6 64 Z" fill="var(--soil)" stroke="var(--ink)" stroke-width="2.5" />
      
      <!-- Sprout Central Stem -->
      <path 
        d="M 27 50 Q 25 36 27 22" 
        stroke="var(--paddy)" 
        stroke-width="3.5" 
        stroke-linecap="round" 
        fill="none" 
      />

      <!-- First Leaf (Left) -->
      <path 
        d="M 26 38 C 16 34 12 24 18 20 C 24 24 26 30 26 38 Z" 
        fill="var(--paddy)" 
        stroke="var(--ink)" 
        stroke-width="1.8" 
      />

      <!-- Second Leaf (Right) -->
      {#if hasSecondLeaf}
        <path 
          d="M 27 32 C 37 28 41 18 35 14 C 29 18 27 24 27 32 Z" 
          fill="var(--paddy)" 
          stroke="var(--ink)" 
          stroke-width="1.8" 
        />
      {/if}

      <!-- Third Budding Leaf (Top) -->
      {#if hasThirdLeaf}
        <path 
          d="M 27 22 C 24 14 27 8 28 8 C 29 8 32 14 27 22 Z" 
          fill="color-mix(in srgb, var(--paddy) 80%, var(--paper))" 
          stroke="var(--ink)" 
          stroke-width="1.5" 
        />
      {/if}

      <!-- Nitrogen Sparkles -->
      {#if isHealthyGlow}
        <circle cx="14" cy="18" r="1.5" fill="var(--paddy)" />
        <circle cx="39" cy="24" r="1.5" fill="var(--paddy)" />
      {/if}
    </svg>
  </div>

  <div class="meter-info">
    <span class="meter-label font-body">{label}</span>
    <span class="meter-readout font-data">{clampedVal}%</span>
  </div>
</div>

<style>
  .sprout-meter-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background-color: var(--paper);
    border: var(--outline-thin);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    box-shadow: var(--shadow-sm);
    user-select: none;
    min-width: 86px;
  }

  .sprout-wobble {
    animation: sprout-pop var(--slow) var(--spring);
  }

  @keyframes sprout-pop {
    0% { transform: scale(1); }
    35% { transform: scale(1.1) rotate(-3deg); }
    70% { transform: scale(0.95) rotate(2deg); }
    100% { transform: scale(1); }
  }

  .meter-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.1;
  }

  .meter-label {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--ink);
    text-align: center;
    white-space: nowrap;
  }

  .meter-readout {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--paddy);
  }
</style>
