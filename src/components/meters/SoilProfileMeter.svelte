<script lang="ts">
  interface Props {
    value: number; // 0 to 100
    label?: string;
  }

  let { value, label = "Organic Matter" }: Props = $props();

  const clampedVal = $derived(Math.max(0, Math.min(100, Math.round(value))));
  // Topsoil depth expands as organic matter rises
  const topsoilDepth = $derived(Math.max(8, Math.min(42, Math.round((clampedVal / 100) * 42))));
  
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

<div class="soil-meter-wrapper {isWobbling ? 'wobble-anim' : ''}">
  <div class="soil-graphic" aria-label="{label}: {clampedVal}%">
    <svg class="soil-svg" viewBox="0 0 54 66" width="46" height="58">
      <!-- Container Outline -->
      <rect x="4" y="4" width="46" height="58" rx="6" fill="var(--paper)" stroke="var(--ink)" stroke-width="3" />
      
      <g clip-path="url(#soil-box-clip)">
        <defs>
          <clipPath id="soil-box-clip">
            <rect x="4" y="4" width="46" height="58" rx="6" />
          </clipPath>
        </defs>

        <!-- Base Bedrock (light tan) -->
        <rect x="4" y="40" width="46" height="22" fill="color-mix(in srgb, var(--soil) 40%, var(--paper))" />
        <circle cx="16" cy="52" r="3" fill="var(--soil)" opacity="0.4" />
        <circle cx="34" cy="56" r="4" fill="var(--soil)" opacity="0.3" />
        <circle cx="44" cy="48" r="2.5" fill="var(--soil)" opacity="0.5" />

        <!-- Mineral Subsoil (medium earthy) -->
        <rect x="4" y="16" width="46" height="32" fill="color-mix(in srgb, var(--soil) 70%, var(--paper))" />

        <!-- Rich Organic Topsoil (dark soil #8A4B2A) -->
        <rect 
          x="4" 
          y="4" 
          width="46" 
          height="{topsoilDepth}" 
          fill="var(--soil)" 
          class="topsoil-layer"
        />

        <!-- Grass blades on top surface -->
        <path d="M 10 4 L 12 -1 L 14 4 M 22 4 L 24 -2 L 26 4 M 36 4 L 38 -1 L 40 4" stroke="var(--paddy)" stroke-width="2" stroke-linecap="round" />

        <!-- Tiny soil roots/worms inside topsoil -->
        {#if clampedVal > 35}
          <path d="M 24 10 Q 28 16 32 20" stroke="var(--turmeric)" stroke-width="1.5" fill="none" opacity="0.8" />
          <path d="M 14 8 Q 12 14 16 18" stroke="var(--turmeric)" stroke-width="1.2" fill="none" opacity="0.7" />
        {/if}
      </g>

      <!-- Strata divider lines -->
      <line x1="4" y1="{4 + topsoilDepth}" x2="50" y2="{4 + topsoilDepth}" stroke="var(--ink)" stroke-width="1.8" stroke-dasharray="2 2" />
      <line x1="4" y1="46" x2="50" y2="46" stroke="var(--ink)" stroke-width="1.8" />
    </svg>
  </div>

  <div class="meter-info">
    <span class="meter-label font-body">{label}</span>
    <span class="meter-readout font-data">{clampedVal}%</span>
  </div>
</div>

<style>
  .soil-meter-wrapper {
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
    animation: soil-wobble var(--slow) var(--spring);
  }

  @keyframes soil-wobble {
    0% { transform: scale(1); }
    30% { transform: scale(1.08) translateY(-2px); }
    60% { transform: scale(0.96) translateY(1px); }
    100% { transform: scale(1); }
  }

  .topsoil-layer {
    transition: height var(--slow) var(--spring);
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
</style>
