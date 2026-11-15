<script lang="ts">
  import type { RegionalWeather } from '../../../contracts/weather';

  interface Props {
    records: RegionalWeather;
    /** Provenance label shown in the caption. */
    source?: string;
  }
  let { records, source = 'synthetic mock' }: Props = $props();

  const W = 720;
  const BASE = 118;

  const n = $derived(Math.max(records.length, 1));
  const step = $derived(W / n);
  const barW = $derived(Math.min(step * 0.64, 46));
  const rainMax = $derived(Math.max(1, ...records.map((r) => r.rain ?? 0), 15));
  const temps = $derived(records.flatMap((r) => [r.tmax, r.tmin]).filter((t): t is number => t != null));
  const tMin = $derived(temps.length ? Math.min(...temps) : 0);
  const tSpan = $derived(temps.length ? Math.max(Math.max(...temps) - tMin, 1) : 1);
  const yTemp = (t: number) => 10 + (1 - (t - tMin) / tSpan) * 52;
  const yWet = (v: number) => 78 + (1 - Math.max(0, Math.min(1, v))) * 26;
</script>

<figure class="weather">
  <svg
    viewBox="0 0 720 150"
    role="img"
    aria-label="Weekly weather strip: rain bars, temperature range lines, and soil wetness dots."
  >
    <line class="axis" x1="0" x2={W} y1={BASE} y2={BASE} />
    {#each records as r, i (r.year + '-' + r.week)}
      {@const x = step * (i + 0.5)}
      {#if r.rain != null && r.rain > 0}
        {@const h = (r.rain / rainMax) * 50}
        <rect x={x - barW / 2} width={barW} y={BASE - h} height={h} fill="#5b7fa6" rx="2" opacity="0.85" />
      {/if}
      {#if r.tmax != null && r.tmin != null}
        <line x1={x} x2={x} y1={yTemp(r.tmax)} y2={yTemp(r.tmin)} stroke="#b65d3d" stroke-width="3" stroke-linecap="round" />
      {/if}
      {#if r.soilWet != null}
        <circle cx={x} cy={yWet(r.soilWet)} r="3.5" fill="#486c42" />
      {/if}
    {/each}
  </svg>
  <figcaption class="legend">
    <span><i class="swatch" style:background="#5b7fa6"></i>Rain (mm/week)</span>
    <span><i class="swatch" style:background="#b65d3d"></i>Temperature range (°C)</span>
    <span><i class="swatch" style:background="#486c42"></i>Soil wetness (fraction)</span>
    <span class="legend-note">{records.length} weeks · {source} · gaps not interpolated</span>
  </figcaption>
</figure>

<style>
  .weather {
    width: 100%;
    max-width: 720px;
    margin: 18px 0;
  }
  .weather svg {
    display: block;
    width: 100%;
    height: auto;
    background: var(--weather-bg, #fffdf7);
    border: 1px solid var(--weather-border-color, #e1ded3);
    border-radius: 8px;
  }
  .axis {
    stroke: var(--weather-axis-color, #d8d5ca);
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    margin: 10px 0 0;
    font-size: 0.78rem;
    color: var(--weather-legend-color, #52604c);
  }
  .legend-note {
    margin-left: auto;
    opacity: 0.75;
  }
  .swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 6px;
    border-radius: 2px;
    vertical-align: -1px;
  }
  @media (max-width: 640px) {
    .legend-note {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
