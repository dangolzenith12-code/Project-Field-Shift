<script lang="ts">
  interface Props {
    p10: number; // 0-100
    median: number; // 0-100
    p90: number; // 0-100
    distribution?: number[];
    label?: string;
  }

  let { p10, median, p90, distribution = [], label = "5-Yr Projected Resilience (Monte Carlo 40-Yr Resample)" }: Props = $props();

  // Width & Height for SVG ribbon
  const svgWidth = 280;
  const svgHeight = 44;

  // Convert percentage (0-100) to SVG X coordinate
  function toX(val: number) {
    return 10 + (val / 100) * (svgWidth - 20);
  }

  const x10 = $derived(toX(p10));
  const xMed = $derived(toX(median));
  const x90 = $derived(toX(p90));

  // Generate slightly wobbly hand-drawn top and bottom ribbon paths
  const topWobble = $derived(`M ${x10} 14 Q ${(x10 + xMed)/2} 11 ${xMed} 13 T ${x90} 12 L ${x90} 32 Q ${(xMed + x90)/2} 34 ${xMed} 31 T ${x10} 33 Z`);
</script>

<div class="monte-carlo-box">
  <div class="ribbon-header">
    <span class="ribbon-title font-body">{label}</span>
    <span class="median-pill font-data">P50: {median}%</span>
  </div>

  <svg class="ribbon-svg" viewBox="0 0 {svgWidth} {svgHeight}">
    <!-- Background track -->
    <rect x="10" y="21" width="{svgWidth - 20}" height="4" rx="2" fill="color-mix(in srgb, var(--ink) 18%, transparent)" />

    <!-- Range Ribbon (p10 to p90) with subtle wobbly path -->
    <path 
      d={topWobble} 
      fill="color-mix(in srgb, var(--paddy) 35%, var(--paper))" 
      stroke="var(--ink)" 
      stroke-width="2" 
      stroke-linejoin="round"
    />

    <!-- Tick mark for p10 -->
    <line x1={x10} y1="8" x2={x10} y2="38" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" />
    <text x={x10} y="43" font-family="Space Mono" font-size="8" fill="var(--ink)" text-anchor="middle">p10:{p10}%</text>

    <!-- Tick mark for p90 -->
    <line x1={x90} y1="8" x2={x90} y2="38" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" />
    <text x={x90} y="43" font-family="Space Mono" font-size="8" fill="var(--ink)" text-anchor="middle">p90:{p90}%</text>

    <!-- Thick Ink Line for Median -->
    <line x1={xMed} y1="6" x2={xMed} y2="38" stroke="var(--ink)" stroke-width="4.5" stroke-linecap="round" />
    <circle cx={xMed} cy="22" r="5.5" fill="var(--turmeric)" stroke="var(--ink)" stroke-width="2" />
  </svg>

  <div class="caption-note font-data">
    <span>Uncertainty ribbon: range of 40 resampled historical weather years.</span>
  </div>
</div>

<style>
  .monte-carlo-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background-color: color-mix(in srgb, var(--paper) 90%, var(--paddy));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
  }

  .ribbon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ribbon-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--ink);
  }

  .median-pill {
    font-size: 0.75rem;
    font-weight: 700;
    background-color: var(--paddy);
    color: var(--paper);
    padding: 1px 6px;
    border: 1.5px solid var(--ink);
    border-radius: 4px;
  }

  .ribbon-svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .caption-note {
    font-size: 0.65rem;
    color: color-mix(in srgb, var(--ink) 70%, transparent);
    text-align: center;
  }
</style>
