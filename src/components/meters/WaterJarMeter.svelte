<script lang="ts">
  interface Props {
    value: number; // 0 to 100
    label?: string;
  }

  let { value, label = "Soil Moisture" }: Props = $props();

  const clampedVal = $derived(Math.max(0, Math.min(100, Math.round(value))));
  // Water height percentage
  const waterHeight = $derived(clampedVal);
  // Wobble trigger when value changes
  let isWobbling = $state(false);
  let prevVal = $state<number | undefined>(undefined);

  $effect(() => {
    if (prevVal !== undefined && prevVal !== value) {
      isWobbling = true;
      const timer = setTimeout(() => {
        isWobbling = false;
      }, 600);
      prevVal = value;
      return () => clearTimeout(timer);
    }
    prevVal = value;
  });
</script>

<div class="jar-meter-wrapper {isWobbling ? 'wobble-anim' : ''}">
  <div class="jar-graphic" aria-label="{label}: {clampedVal}%">
    <svg class="jar-svg" viewBox="0 0 64 74" width="56" height="66">
      <defs>
        <!-- Water Clip Path to stay inside jar belly -->
        <clipPath id="jar-interior-clip">
          <path d="M 18 16 C 18 16 10 22 10 44 C 10 66 18 68 32 68 C 46 68 54 66 54 44 C 54 22 46 16 46 16 Z" />
        </clipPath>
      </defs>

      <!-- Jar Shadow on shelf -->
      <ellipse cx="32" cy="71" rx="20" ry="3" fill="var(--ink)" opacity="0.4" />

      <!-- Jar Background interior -->
      <path 
        d="M 18 16 C 18 16 10 22 10 44 C 10 66 18 68 32 68 C 46 68 54 66 54 44 C 54 22 46 16 46 16 Z" 
        fill="color-mix(in srgb, var(--paper) 90%, var(--monsoon))" 
      />

      <!-- Rising Water with clip path -->
      <g clip-path="url(#jar-interior-clip)">
        <rect 
          x="6" 
          y="{68 - (waterHeight * 0.52)}" 
          width="52" 
          height="60" 
          fill="var(--monsoon)" 
          class="water-liquid"
        />
        <!-- Water meniscus ripple surface -->
        <ellipse 
          cx="32" 
          cy="{68 - (waterHeight * 0.52)}" 
          rx="22" 
          ry="3" 
          fill="color-mix(in srgb, var(--monsoon) 70%, var(--paper))" 
        />
        <!-- Tiny bubbles -->
        {#if clampedVal > 30}
          <circle cx="24" cy="{66 - (waterHeight * 0.25)}" r="1.5" fill="var(--paper)" opacity="0.6" />
          <circle cx="38" cy="{66 - (waterHeight * 0.4)}" r="1" fill="var(--paper)" opacity="0.7" />
        {/if}
      </g>

      <!-- Glass Jar Outline & Highlights -->
      <path 
        d="M 18 16 C 18 16 10 22 10 44 C 10 66 18 68 32 68 C 46 68 54 66 54 44 C 54 22 46 16 46 16 Z" 
        fill="none" 
        stroke="var(--ink)" 
        stroke-width="3" 
        stroke-linejoin="round"
      />
      <!-- Jar Mouth & Neck -->
      <path d="M 18 16 L 46 16" stroke="var(--ink)" stroke-width="3" />
      <ellipse cx="32" cy="14" rx="14" ry="4" fill="var(--paper)" stroke="var(--ink)" stroke-width="3" />
      <ellipse cx="32" cy="14" rx="9" ry="2" fill="none" stroke="var(--ink)" stroke-width="1.5" />
      
      <!-- Glass highlight reflection -->
      <path d="M 16 26 C 14 34 14 50 18 60" stroke="var(--paper)" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.7" />
    </svg>
  </div>

  <div class="meter-info">
    <span class="meter-label font-body">{label}</span>
    <span class="meter-readout font-data">{clampedVal}%</span>
  </div>
</div>

<style>
  .jar-meter-wrapper {
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
    animation: jar-wobble var(--slow) var(--spring);
  }

  @keyframes jar-wobble {
    0% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.08) rotate(-4deg); }
    50% { transform: scale(0.96) rotate(3deg); }
    75% { transform: scale(1.02) rotate(-1deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  .water-liquid {
    transition: y var(--slow) var(--spring), height var(--slow) var(--spring);
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
    color: var(--monsoon);
  }
</style>
