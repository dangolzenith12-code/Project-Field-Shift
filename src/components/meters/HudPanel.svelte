<script lang="ts">
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';
  import WaterJarMeter from './WaterJarMeter.svelte';
  import SoilProfileMeter from './SoilProfileMeter.svelte';
  import ErosionGaugeMeter from './ErosionGaugeMeter.svelte';
  import CoinStackMeter from './CoinStackMeter.svelte';
  import SproutMeter from './SproutMeter.svelte';

  interface Props {
    meters: FarmMeters;
    currentEra: EraInfo;
    currentRegion: RegionInfo;
    seasonName?: string;
  }

  let { meters, currentEra, currentRegion, seasonName = "Kharif (Monsoon)" }: Props = $props();
</script>

<div class="hud-panel">
  <!-- Status & Era Badge Header -->
  <div class="hud-badge-strip">
    <div class="badge-pill era-pill font-display">
      <span class="pill-icon">⏳</span>
      <span>{currentEra.year}</span>
      <span class="sub font-data">[{currentEra.label}]</span>
    </div>

    <div class="badge-pill region-pill font-display">
      <span class="pill-icon">📍</span>
      <span>{currentRegion.name}</span>
    </div>

    <div class="badge-pill season-pill font-body">
      <span class="pill-icon">☀️</span>
      <span>{seasonName}</span>
    </div>

    <div class="water-draw-tag font-data">
      <span>Seasonal Water Draw:</span>
      <strong>{meters.waterUse} mm</strong>
    </div>
  </div>

  <!-- 5 Tactile Jars & Meters Row -->
  <div class="meters-row">
    <WaterJarMeter value={meters.soilMoisture} label="Soil Moisture" />
    <SoilProfileMeter value={meters.organicMatter} label="Organic Matter" />
    <SproutMeter value={meters.nitrogen} label="Nitrogen Bio" />
    <ErosionGaugeMeter value={meters.erosionRisk} label="Erosion Risk" />
    <CoinStackMeter value={meters.income} label="Vault Coins" />
  </div>
</div>

<style>
  .hud-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background-color: color-mix(in srgb, var(--paper) 95%, var(--ink));
    border: var(--outline);
    border-radius: var(--radius);
    padding: var(--space-3);
    box-shadow: var(--shadow);
  }

  .hud-badge-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    justify-content: space-between;
    padding-bottom: var(--space-1);
    border-bottom: 2px dashed var(--ink);
  }

  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 2px solid var(--ink);
    border-radius: var(--radius-pill);
    padding: 3px 12px;
    box-shadow: var(--shadow-sm);
    font-size: 0.88rem;
  }

  .era-pill {
    background-color: var(--turmeric);
    color: var(--ink);
  }

  .era-pill .sub {
    font-size: 0.72rem;
    font-weight: normal;
  }

  .region-pill {
    background-color: color-mix(in srgb, var(--soil) 25%, var(--paper));
    color: var(--ink);
  }

  .season-pill {
    background-color: color-mix(in srgb, var(--monsoon) 18%, var(--paper));
    color: var(--ink);
    font-weight: 600;
  }

  .water-draw-tag {
    font-size: 0.78rem;
    color: var(--ink);
    background-color: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 2px 8px;
  }

  .meters-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    gap: var(--space-2);
  }

  @media (max-width: 680px) {
    .meters-row {
      overflow-x: auto;
      justify-content: flex-start;
      padding-bottom: 6px;
    }
  }
</style>
