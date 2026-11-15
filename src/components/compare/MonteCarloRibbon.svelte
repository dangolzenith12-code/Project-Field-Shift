<script lang="ts">
  interface Props {
    p10: number; // 0-100
    median: number; // 0-100
    p90: number; // 0-100
    distribution?: number[];
    label?: string;
  }

  let { p10, median, p90, distribution = [], label = "5-Yr Projected Resilience (Monte Carlo 40-Yr Resample)" }: Props = $props();

  const svgWidth = 280;
  const svgHeight = 44;

  function toX(val: number) {
    return 10 + (Math.min(100, Math.max(0, val)) / 100) * (svgWidth - 20);
  }

  const x10 = $derived(toX(p10));
  const xMed = $derived(toX(median));
  const x90 = $derived(toX(p90));

  // Hand-drawn botanical watercolor ribbon path
  const topWobble = $derived(
    `M ${x10} 14 Q ${(x10 + xMed)/2} 11 ${xMed} 13 T ${x90} 12 L ${x90} 32 Q ${(xMed + x90)/2} 34 ${xMed} 31 T ${x10} 33 Z`
  );
</script>

<div class="monte-carlo-box">
  <div class="ribbon-header">
    <span class="ribbon-title font-body">{label}</span>
    <span class="median-pill font-data">P50: {median.toFixed(0)}%</span>
  </div>

  <svg class="ribbon-svg" viewBox="0 0 {svgWidth} {svgHeight}">
    <!-- Background track -->
    <rect x="10" y="21" width="{svgWidth - 20}" height="4" rx="2" fill="rgba(27, 43, 31, 0.18)" />

    <!-- Range Ribbon (p10 to p90) with hand-drawn botanical ink contour -->
    <path 
      d={topWobble} 
      fill="rgba(78, 124, 90, 0.28)" 
      stroke="var(--journal-border, #1B2B1F)" 
      stroke-width="1.8" 
      stroke-linejoin="round"
    />

    <!-- Tick mark for p10 -->
    <line x1={x10} y1="8" x2={x10} y2="38" stroke="var(--journal-border, #1B2B1F)" stroke-width="1.8" stroke-linecap="round" />

    <!-- Tick mark for p90 -->
    <line x1={x90} y1="8" x2={x90} y2="38" stroke="var(--journal-border, #1B2B1F)" stroke-width="1.8" stroke-linecap="round" />

    <!-- Median Pin with gold seed circle -->
    <line x1={xMed} y1="6" x2={xMed} y2="38" stroke="var(--journal-border, #1B2B1F)" stroke-width="3.5" stroke-linecap="round" />
    <circle cx={xMed} cy="22" r="5" fill="var(--journal-gold, #E5A93C)" stroke="var(--journal-border, #1B2B1F)" stroke-width="1.8" />
  </svg>

  <div class="range-labels font-data">
    <span>p10: {p10.toFixed(0)}%</span>
    <span>p90: {p90.toFixed(0)}%</span>
  </div>

  <div class="caption-note font-data">
    <span>Monotonic uncertainty ribbon: empirical distribution across 40 historical NASA POWER seasons.</span>
  </div>
</div>

<style>
  .monte-carlo-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background-color: #EDF4EE;
    border: 2px solid var(--journal-border, #1B2B1F);
    border-radius: var(--radius-sm, 6px);
    padding: 10px 12px;
  }

  .ribbon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .ribbon-title {
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--journal-ink, #1B2B1F);
  }

  .median-pill {
    font-size: 0.72rem;
    font-weight: 700;
    background-color: var(--journal-sage, #4E7C5A);
    color: #FFFFFF;
    padding: 1px 6px;
    border: 1.5px solid var(--journal-border, #1B2B1F);
    border-radius: 4px;
  }

  .ribbon-svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .range-labels {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.65rem;
    color: var(--journal-ink, #1B2B1F);
    padding: 0 2px;
  }

  .caption-note {
    font-size: 0.65rem;
    color: var(--journal-ink-muted, #556E5C);
    text-align: center;
  }
</style>
