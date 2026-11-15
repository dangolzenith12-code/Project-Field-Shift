<script lang="ts">
  interface Props {
    value: number; // 0 to 100 (higher means higher danger)
    label?: string;
  }

  let { value, label = "Erosion Risk" }: Props = $props();

  const clampedVal = $derived(Math.max(0, Math.min(100, Math.round(value))));
  // Crumble intensity
  const isHighRisk = $derived(clampedVal > 50);

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

<div class="erosion-meter-wrapper {isWobbling ? 'wobble-anim' : ''}">
  <div class="erosion-graphic" aria-label="{label}: {clampedVal}%">
    <svg class="erosion-svg" viewBox="0 0 54 66" width="46" height="58">
      <!-- Background Sky -->
      <rect x="4" y="4" width="46" height="58" rx="6" fill="var(--sky)" stroke="var(--ink)" stroke-width="3" />
      
      <g clip-path="url(#cliff-clip)">
        <defs>
          <clipPath id="cliff-clip">
            <rect x="4" y="4" width="46" height="58" rx="6" />
          </clipPath>
        </defs>

        <!-- Cliff Body -->
        <path 
          d="M 4 24 Q 18 20 28 22 L 28 32 L 24 44 L 28 54 L 32 64 L 4 64 Z" 
          fill="var(--soil)" 
          stroke="var(--ink)" 
          stroke-width="2" 
        />

        <!-- Top grass layer -->
        <path d="M 4 24 Q 18 20 28 22" stroke="var(--paddy)" stroke-width="4" fill="none" />

        <!-- Crumbling shear fracture lines -->
        {#if clampedVal > 30}
          <path d="M 22 28 L 18 36 L 22 44" stroke="var(--ink)" stroke-width="2" fill="none" />
        {/if}
        {#if clampedVal > 60}
          <path d="M 12 24 L 14 34 L 10 46" stroke="var(--chili)" stroke-width="2" fill="none" />
        {/if}

        <!-- Falling debris / crumbs -->
        {#if clampedVal > 25}
          <circle cx="34" cy="38" r="2" fill="var(--soil)" stroke="var(--ink)" stroke-width="1" />
          <circle cx="42" cy="52" r="2.5" fill="var(--soil)" stroke="var(--ink)" stroke-width="1" />
          <polygon points="36,58 39,62 33,62" fill="var(--soil)" stroke="var(--ink)" stroke-width="1" />
        {/if}
        {#if isHighRisk}
          <circle cx="38" cy="28" r="1.5" fill="var(--chili)" />
          <circle cx="46" cy="42" r="2" fill="var(--chili)" />
        {/if}
      </g>

      <!-- Danger icon indicator if high -->
      {#if isHighRisk}
        <text x="36" y="18" font-size="12" text-anchor="middle">⚠️</text>
      {/if}
    </svg>
  </div>

  <div class="meter-info">
    <span class="meter-label font-body">{label}</span>
    <span class="meter-readout font-data {isHighRisk ? 'text-danger' : ''}">{clampedVal}%</span>
  </div>
</div>

<style>
  .erosion-meter-wrapper {
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

  .wobble-anim {
    animation: erosion-shake var(--slow) var(--spring);
  }

  @keyframes erosion-shake {
    0% { transform: rotate(0deg); }
    20% { transform: rotate(-5deg); }
    40% { transform: rotate(4deg); }
    60% { transform: rotate(-3deg); }
    80% { transform: rotate(2deg); }
    100% { transform: rotate(0deg); }
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
    color: var(--soil);
  }

  .text-danger {
    color: var(--chili);
  }
</style>
