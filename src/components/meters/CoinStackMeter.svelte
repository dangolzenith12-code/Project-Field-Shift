<script lang="ts">
  interface Props {
    value: number; // Coins count
    label?: string;
  }

  let { value, label = "Farm Income" }: Props = $props();

  // Number of visual coins in stack (1 to 8)
  const coinCount = $derived(Math.max(1, Math.min(8, Math.ceil(value / 35))));

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

<div class="coin-meter-wrapper {isWobbling ? 'bounce-anim' : ''}">
  <div class="coin-graphic" aria-label="{label}: {value} Coins">
    <svg class="coin-svg" viewBox="0 0 54 66" width="46" height="58">
      <!-- Shadow at base -->
      <ellipse cx="27" cy="62" rx="18" ry="3" fill="var(--ink)" opacity="0.4" />

      <!-- Render stacked coins from bottom to top -->
      {#each Array(coinCount) as _, i}
        {@const yPos = 58 - (i * 6.5)}
        <g class="single-coin" style:animation-delay="{i * 40}ms">
          <!-- Coin thickness / side cylinder -->
          <rect 
            x="9" 
            y="{yPos - 4}" 
            width="36" 
            height="4" 
            fill="color-mix(in srgb, var(--turmeric) 75%, var(--soil))" 
            stroke="var(--ink)" 
            stroke-width="1.8" 
          />
          <!-- Coin top ellipse face -->
          <ellipse 
            cx="27" 
            cy="{yPos - 4}" 
            rx="18" 
            ry="4.5" 
            fill="var(--turmeric)" 
            stroke="var(--ink)" 
            stroke-width="2" 
          />
          <!-- Coin rim engraving -->
          <ellipse 
            cx="27" 
            cy="{yPos - 4}" 
            rx="13" 
            ry="2.8" 
            fill="none" 
            stroke="color-mix(in srgb, var(--turmeric) 80%, var(--paper))" 
            stroke-width="1.2" 
          />
        </g>
      {/each}

      <!-- Sparkle on top coin if high income -->
      {#if value > 120}
        <path d="M 38 10 L 40 14 L 44 16 L 40 18 L 38 22 L 36 18 L 32 16 L 36 14 Z" fill="var(--turmeric)" stroke="var(--ink)" stroke-width="1" />
      {/if}
    </svg>
  </div>

  <div class="meter-info">
    <span class="meter-label font-body">{label}</span>
    <span class="meter-readout font-data">🪙 {value}</span>
  </div>
</div>

<style>
  .coin-meter-wrapper {
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

  .bounce-anim {
    animation: coin-bounce var(--slow) var(--spring);
  }

  @keyframes coin-bounce {
    0% { transform: translateY(0); }
    30% { transform: translateY(-8px) scale(1.06); }
    60% { transform: translateY(2px) scale(0.97); }
    100% { transform: translateY(0) scale(1); }
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
