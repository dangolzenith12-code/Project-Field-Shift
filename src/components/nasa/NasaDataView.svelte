<script lang="ts">
  import Button from '../common/Button.svelte';
  import StickerCard from '../common/StickerCard.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onBack: () => void;
  }

  let { onBack }: Props = $props();

  const datasets = [
    {
      name: 'NASA POWER (Prediction Of Worldwide Energy Resources)',
      role: 'Core Climate Backbone',
      parameters: 'T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, EVLAND, GWETROOT, GWETTOP, ALLSKY_SFC_SW_DWN',
      description: 'Provides daily continuous meteorological data since 1981 from the NASA GMAO MERRA-2 assimilation model and satellite solar observations. Used to compute 45-year historical baselines and temperature/rainfall anomalies for each demo region.',
      access: 'Public REST API (key-free), community=AG.'
    },
    {
      name: 'NASA SMAP (Soil Moisture Active Passive)',
      role: 'Root-Zone Hydrology Validation',
      parameters: 'L4 Surface & Root-Zone Soil Moisture (GWETROOT / GWETTOP)',
      description: 'L-band microwave radiometer measuring soil wetness in the top 100 cm. In Field Shift, it grounds the Water Jar meter and reveals when topsoil flash-dries despite deep rainfall.',
      access: 'NASA Earthdata / GIBS WMS layers.'
    },
    {
      name: 'NASA GIBS & MODIS (Terra & Aqua)',
      role: 'Satellite Imagery & NDVI Phenology',
      parameters: 'MODIS Normalized Difference Vegetation Index (250m) & Land Surface Temperature',
      description: 'Tracks vegetative vigor across the agricultural growing seasons. Used for visual satellite overlay validation and phenological growth curves.',
      access: 'NASA Global Imagery Browse Services (GIBS) WMTS key-free raster tiles.'
    },
    {
      name: 'NASA GRACE & GRACE-FO (Gravity Recovery and Climate Experiment)',
      role: 'Groundwater Aquifer Depletion Narrative',
      parameters: 'Terrestrial Water Storage Anomaly (TWS)',
      description: 'Twin satellites measuring Earth’s gravitational field changes caused by shifting mass of underground water. Grounded as a regional narrative trend (e.g. -3.2 cm/yr in northwest India) rather than raw live processing.',
      access: 'NASA JPL GRACE Tellus monthly mascon grids.'
    },
    {
      name: 'ISRIC SoilGrids & SRTM Topography',
      role: 'Soil Physical Properties & Field Slope',
      parameters: 'Clay, Sand, Silt fractions, Soil Organic Carbon (SOC), SRTM 30m Elevation',
      description: 'Provides baseline soil textural classes and erosion vulnerability indices across our four agro-ecological zones.',
      access: 'ISRIC REST API & NASA Shuttle Radar Topography Mission (SRTM).'
    }
  ];
</script>

<div class="nasa-docs-container">
  <div class="docs-header">
    <div class="header-titles">
      <h2 class="title font-display">NASA Earth Science Data Citations & Methodology</h2>
      <p class="subtitle font-body">
        Full transparency on the satellite instruments, models, and honest limitations powering Field Shift.
      </p>
    </div>
    <Button variant="secondary" size="md" onclick={onBack}>← Back to Game</Button>
  </div>

  <BlockPrintBorder height={14} />

  <!-- The "Supports, Doesn't Replace Farmers" Core Philosophy -->
  <div class="manifesto-card sticker-card no-tape">
    <div class="manifesto-badge font-display">OUR ETHICAL MANDATE</div>
    <h3 class="manifesto-title font-display">A Decision Aid, Not a Black-Box Yield Predictor</h3>
    <p class="manifesto-text font-body">
      Field Shift uses explainable, transparent bucket water balance and agronomic rules—<strong>not a black-box deep learning model</strong>. Satellites observe regional climate patterns from hundreds of kilometers above, but they cannot replace a farmer's tactile knowledge of their soil, local market dynamics, or extension agent wisdom. Every high-risk recommendation carries an <strong>"ASK A LOCAL EXPERT"</strong> rubber stamp to reinforce this message.
    </p>
  </div>

  <!-- Detailed Dataset Breakdown -->
  <div class="datasets-list">
    {#each datasets as ds}
      <StickerCard hasTape={false} class="dataset-card">
        <div class="ds-top">
          <span class="ds-role font-data">[{ds.role}]</span>
          <span class="ds-access font-data">{ds.access}</span>
        </div>
        <h4 class="ds-name font-display">{ds.name}</h4>
        <div class="ds-params font-data">Parameters: <code>{ds.parameters}</code></div>
        <p class="ds-desc font-body">{ds.description}</p>
      </StickerCard>
    {/each}
  </div>

  <!-- Honest Limitations Section -->
  <div class="limitations-card sticker-card no-tape">
    <h3 class="lim-title font-display">Honest Scientific Limitations</h3>
    <ul class="lim-list font-body">
      <li>
        <strong>Spatial Resolution:</strong> NASA POWER data is assimilated at ~0.5° (~50km) resolution. Micro-climates, localized rain shadows, and valley breezes may vary from regional grid points.
      </li>
      <li>
        <strong>Agronomic Trait Approximations:</strong> Crop trait parameters (water use, rooting depth, nitrogen fixation) are synthesized from FAO 56 guidelines and regional extension publications; field yields depend on seed variety, pest pressure, and timing.
      </li>
      <li>
        <strong>Monte Carlo Stochasticity:</strong> Projected resilience bands are simulated by resampling 40 years of actual NASA POWER historical records with additive temperature shifts, providing a realistic distribution of climate volatility rather than an infallible forecast.
      </li>
    </ul>
  </div>
</div>

<style>
  .nasa-docs-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 1040px;
    margin: 0 auto;
    padding: var(--space-4) var(--space-2);
  }

  .docs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .title {
    font-size: 1.85rem;
    color: var(--ink);
    transform: rotate(-0.8deg);
  }

  .subtitle {
    font-size: 0.95rem;
    max-width: 650px;
  }

  .manifesto-card {
    background-color: color-mix(in srgb, var(--turmeric) 20%, var(--paper));
    border: var(--outline-thick);
    padding: var(--space-4);
  }

  .manifesto-badge {
    color: var(--chili);
    font-size: 0.85rem;
    letter-spacing: 0.8px;
    margin-bottom: 4px;
  }

  .manifesto-title {
    font-size: 1.4rem;
    margin-bottom: 6px;
  }

  .manifesto-text {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .datasets-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  :global(.dataset-card) {
    padding: var(--space-3) var(--space-4);
  }

  .ds-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  .ds-role {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--monsoon);
  }

  .ds-access {
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--ink) 75%, transparent);
  }

  .ds-name {
    font-size: 1.25rem;
    margin: 4px 0;
  }

  .ds-params {
    font-size: 0.78rem;
    background-color: color-mix(in srgb, var(--paper) 90%, var(--soil));
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid var(--ink);
    display: inline-block;
    margin-bottom: 6px;
  }

  .ds-desc {
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .limitations-card {
    background-color: color-mix(in srgb, var(--soil) 12%, var(--paper));
    padding: var(--space-4);
  }

  .lim-title {
    font-size: 1.3rem;
    margin-bottom: var(--space-2);
  }

  .lim-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.9rem;
    padding-left: 20px;
  }
</style>
