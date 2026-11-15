<script lang="ts">
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onBack: () => void;
  }

  let { onBack }: Props = $props();

  const datasets = [
    {
      id: 'power',
      name: 'NASA POWER (Prediction Of Worldwide Energy Resources)',
      role: 'Core Climate Backbone',
      badgeColor: '#00E5FF',
      icon: '🛰️',
      satellite: 'MERRA-2 Reanalysis & Solar Satellites',
      resolution: '~0.5° Grid (~50km)',
      cadence: 'Daily Continuous (1981–Present)',
      parameters: 'T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, EVLAND, GWETROOT, GWETTOP, ALLSKY_SFC_SW_DWN',
      description: 'Provides continuous daily meteorological parameters derived from the NASA GMAO MERRA-2 assimilation model and spaceborne solar instruments. In Field Shift, it powers the 45-year historical climate baselines, temperature stress thresholds, and regional rainfall deficit simulations.',
      access: 'Public REST API (Key-Free) • Agroclimatology Community (AG)'
    },
    {
      id: 'smap',
      name: 'NASA SMAP (Soil Moisture Active Passive)',
      role: 'Root-Zone Hydrology Validation',
      badgeColor: '#00FF66',
      icon: '📡',
      satellite: 'Observational L-Band Microwave Radiometer (685 km Orbit)',
      resolution: '9 km / 36 km Gridded Products',
      cadence: '2–3 Day Global Revisit',
      parameters: 'L4 Surface (0–5 cm) & Root-Zone (0–100 cm) Soil Moisture (GWETROOT / GWETTOP)',
      description: 'Employs high-sensitivity L-band (1.41 GHz) microwave emissions to pierce cloud cover and probe water content in the top meter of soil. Grounds Field Shift’s Water Balance Jar meter and reveals when topsoil flash-dries despite deep seasonal rainfall.',
      access: 'NASA Earthdata / GIBS WMS Layers • Open Access'
    },
    {
      id: 'modis',
      name: 'NASA GIBS & MODIS (Terra & Aqua)',
      role: 'Satellite Imagery & NDVI Phenology',
      badgeColor: '#FFD166',
      icon: '🌍',
      satellite: 'Terra (10:30 AM equator crossing) & Aqua (1:30 PM equator crossing)',
      resolution: '250m / 500m / 1km Spectral Bands',
      cadence: 'Daily Global Coverage / 16-Day NDVI Composites',
      parameters: 'MOD13Q1 Normalized Difference Vegetation Index (NDVI) & Land Surface Temperature (LST)',
      description: 'Observes photosynthetic canopy reflectance in near-infrared and red spectra. Validates agricultural crop growth stages, detect mid-season vegetative stress, and generates seasonal greenness curves for each crop rotation path.',
      access: 'NASA Global Imagery Browse Services (GIBS) WMTS Tiles'
    },
    {
      id: 'grace',
      name: 'NASA GRACE & GRACE-FO (Gravity Recovery and Climate Experiment)',
      role: 'Groundwater Aquifer Depletion Narrative',
      badgeColor: '#A78BFA',
      icon: '🌊',
      satellite: 'Twin K-Band / Laser Ranging Interferometry Satellites (500 km Orbit)',
      resolution: '~300 km Mascon Grids',
      cadence: 'Monthly Gravitational Anomaly Solutions',
      parameters: 'Terrestrial Water Storage Anomaly (TWSA) & Groundwater Storage Deficit',
      description: 'Measures ultra-minute micron-scale distance variations between paired satellites to detect shifting subterranean water mass. Grounded as a regional narrative trend (e.g., −3.2 cm/year aquifer drawdown in northwest India) illustrating deep borewell depletion.',
      access: 'NASA JPL Tellus Monthly Mascon Solutions'
    },
    {
      id: 'soilgrids',
      name: 'ISRIC SoilGrids & SRTM Topography',
      role: 'Soil Physical Properties & Field Slope',
      badgeColor: '#38BDF8',
      icon: '🌱',
      satellite: 'Shuttle Radar Topography Mission (SRTM) & Global Soil Profiles',
      resolution: '30m Elevation / 250m Soil Profile Depth Grids',
      cadence: 'Static High-Resolution Baselines',
      parameters: 'Clay, Sand, Silt fractions, Soil Organic Carbon (SOC), Bulk Density, Slope Angle',
      description: 'Supplies foundational soil hydraulic parameters and topographic steepness indices. Enables Field Shift to model water percolation velocity, crusting tendency, and erosion risk across our four agro-ecological zones.',
      access: 'ISRIC WCS REST API & USGS Earth Resources'
    }
  ];
</script>

<div class="nasa-hub-container">
  <!-- Top Navigation Header -->
  <header class="hub-header">
    <div class="header-left">
      <div class="hub-tag font-pixel">
        <span class="pulse-satellite">🛰️</span>
        <span>NASA EARTH SCIENCE TELEMETRY HUB</span>
      </div>
      <h1 class="hub-title font-pixel">Satellite Data Citations & Scientific Grounding</h1>
      <p class="hub-subtitle font-body">
        Complete transparency on the NASA orbital instruments, climate models, open APIs, and agronomic physics powering Field Shift.
      </p>
    </div>
    <div class="header-right">
      <button type="button" class="return-game-btn font-pixel" onclick={onBack}>
        ← Return to Field
      </button>
    </div>
  </header>

  <!-- Quick Telemetry Stats Strip -->
  <div class="telemetry-summary-strip font-pixel">
    <div class="strip-item">
      <span class="strip-label">SATELLITE MISSIONS</span>
      <span class="strip-val text-cyan">5 CORE FEEDS</span>
    </div>
    <div class="strip-item">
      <span class="strip-label">ORBITAL BANDS</span>
      <span class="strip-val text-green">L-BAND • VIS • NIR • GRAVITY</span>
    </div>
    <div class="strip-item">
      <span class="strip-label">HISTORICAL BASELINE</span>
      <span class="strip-val text-gold">45 YEARS (1981–2026)</span>
    </div>
    <div class="strip-item">
      <span class="strip-label">API ARCHITECTURE</span>
      <span class="strip-val text-white">KEY-FREE OPEN ACCESS</span>
    </div>
  </div>

  <BlockPrintBorder height={14} color="#00FF66" />

  <!-- Ethical Mandate Card -->
  <section class="mandate-card" aria-labelledby="mandate-heading">
    <div class="mandate-top">
      <span class="mandate-badge font-pixel">ETHICAL MANDATE • TRANSPARENT AGRONOMY</span>
      <span class="mandate-status font-pixel">✓ 100% EXPLAINABLE</span>
    </div>
    <h2 id="mandate-heading" class="mandate-title font-pixel">
      A Decision Aid to Support Farmers — Not a Black-Box Yield Predictor
    </h2>
    <div class="mandate-body font-body">
      <p>
        Field Shift is built on physical, transparent bucket water balance models and FAO-56 agroclimatology—<strong class="highlight-accent">not an opaque black-box machine learning algorithm</strong>.
      </p>
      <p>
        NASA satellites observe regional climate trajectories and topsoil moisture from 680 kilometers above Earth. While invaluable for spotting multi-week monsoon delays and historical aquifer trends, orbital sensors cannot replace a farmer’s tactile connection with their soil, local seed wisdom, or village cooperative knowledge.
      </p>
      <p class="mandate-callout font-data">
        Every high-risk seasonal rotation recommendation carries an <span class="badge-expert font-pixel">"ASK A LOCAL EXPERT"</span> stamp, affirming that satellite technology must empower farmers and extension officers, not dictate to them.
      </p>
    </div>
  </section>

  <!-- Detailed Dataset Breakdown Cards -->
  <section class="datasets-section" aria-label="NASA Datasets and Instruments">
    <div class="section-heading-bar">
      <h3 class="section-heading-title font-pixel">📡 Active Satellite Constellations & Ground Instruments</h3>
      <span class="section-heading-sub font-data">Click or inspect each instrument’s parameters below</span>
    </div>

    <div class="datasets-grid">
      {#each datasets as ds}
        <article class="dataset-card" style:--accent-color={ds.badgeColor}>
          <!-- Card Header Strip -->
          <div class="ds-card-header">
            <div class="ds-role-pill font-pixel" style:color={ds.badgeColor} style:border-color={ds.badgeColor}>
              <span>{ds.icon}</span>
              <span>{ds.role}</span>
            </div>
            <div class="ds-access-pill font-data">
              <span class="live-indicator">●</span>
              <span>{ds.access}</span>
            </div>
          </div>

          <!-- Dataset Title -->
          <h4 class="ds-card-title font-pixel">{ds.name}</h4>

          <!-- Orbital Spec Matrix -->
          <div class="ds-specs-matrix font-data">
            <div class="spec-cell">
              <span class="spec-label">PLATFORM:</span>
              <span class="spec-value">{ds.satellite}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-label">RESOLUTION:</span>
              <span class="spec-value">{ds.resolution}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-label">CADENCE:</span>
              <span class="spec-value">{ds.cadence}</span>
            </div>
          </div>

          <!-- Parameters Box -->
          <div class="ds-params-box">
            <div class="params-label font-pixel">MEASURED PARAMETERS:</div>
            <code class="params-code font-data">{ds.parameters}</code>
          </div>

          <!-- Description -->
          <p class="ds-card-desc font-body">{ds.description}</p>
        </article>
      {/each}
    </div>
  </section>

  <BlockPrintBorder height={14} color="#00FF66" />

  <!-- Honest Scientific Limitations Card -->
  <section class="limitations-card" aria-labelledby="limitations-heading">
    <div class="lim-header">
      <span class="lim-alert-icon">⚠️</span>
      <div>
        <h3 id="limitations-heading" class="lim-title font-pixel">Honest Scientific Limitations & Assumptions</h3>
        <p class="lim-subtitle font-body">Transparent disclosure of spatial bounds, model approximations, and uncertainty.</p>
      </div>
    </div>

    <ul class="lim-list font-body">
      <li>
        <strong class="font-pixel lim-bullet-title">Spatial Resolution vs. Microclimates:</strong>
        NASA POWER grid cells span approximately 0.5° (~50 km). Local micro-climates, valley thermal pockets, hill shade, and convective rainstorms may differ from the regional assimilation grid.
      </li>
      <li>
        <strong class="font-pixel lim-bullet-title">Agronomic Trait Approximations:</strong>
        Crop parameters (water demand, root depth coefficients, nitrogen fixation rates) are synthesized from peer-reviewed FAO-56 agronomic tables and Indian Council of Agricultural Research (ICAR) field studies. Actual farm yields vary based on seed variety, weed competition, pest pressure, and timing.
      </li>
      <li>
        <strong class="font-pixel lim-bullet-title">Monte Carlo Stochasticity (40-Year Resample):</strong>
        Projected resilience ribbons are generated by resampling 40 years of actual NASA meteorological observations combined with projected temperature offsets, providing an empirical probability range (p10, median, p90) rather than an infallible deterministic prophecy.
      </li>
      <li>
        <strong class="font-pixel lim-bullet-title">Subsurface Groundwater Mapping:</strong>
        GRACE twin satellite gravity signals map broad regional basin water deficits (e.g. northwest India's Indo-Gangetic aquifer), not individual farm tube-well water depths.
      </li>
    </ul>
  </section>
</div>

<style>
  .nasa-hub-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 16px 48px;
    color: #FFFFFF;
  }

  /* Header */
  .hub-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    background: #09130D;
    border: 2px solid #244C32;
    border-radius: 8px;
    padding: 20px 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 820px;
  }

  .hub-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #00E5FF;
    letter-spacing: 0.5px;
  }

  .pulse-satellite {
    animation: satelliteFloat 2s ease-in-out infinite;
  }

  @keyframes satelliteFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  .hub-title {
    font-size: clamp(1.15rem, 2.5vw, 1.55rem);
    color: #FFFFFF;
    line-height: 1.35;
    text-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
  }

  .hub-subtitle {
    font-size: 14px;
    color: #A0C8AA;
    line-height: 1.5;
  }

  .return-game-btn {
    background: #0E1F14;
    border: 2px solid #00FF66;
    color: #00FF66;
    font-size: 11px;
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.25);
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .return-game-btn:hover {
    background: #00FF66;
    color: #000000;
    transform: translateY(-2px);
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.6);
  }

  /* Telemetry Summary Strip */
  .telemetry-summary-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    background: #06100B;
    border: 1.5px solid #1D3B27;
    border-radius: 6px;
    padding: 12px 16px;
  }

  .strip-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .strip-label {
    font-size: 9px;
    color: #6C8E76;
    letter-spacing: 0.5px;
  }

  .strip-val {
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 0.5px;
  }

  .text-cyan { color: #00E5FF; }
  .text-green { color: #00FF66; }
  .text-gold { color: #FFD166; }
  .text-white { color: #FFFFFF; }

  /* Ethical Mandate Card */
  .mandate-card {
    background: linear-gradient(180deg, #0C1E14 0%, #06120B 100%);
    border: 2.5px solid #00FF66;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 0 20px rgba(0, 255, 102, 0.2), 0 8px 24px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .mandate-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .mandate-badge {
    font-size: 10px;
    color: #000000;
    background-color: #FFB703;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: bold;
    box-shadow: 0 0 8px rgba(255, 183, 3, 0.4);
  }

  .mandate-status {
    font-size: 10px;
    color: #00FF66;
    background: #11281A;
    border: 1px solid #00FF66;
    padding: 3px 8px;
    border-radius: 4px;
  }

  .mandate-title {
    font-size: 15px;
    color: #FFFFFF;
    line-height: 1.4;
  }

  .mandate-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
    line-height: 1.6;
    color: #D2EBD7;
  }

  .highlight-accent {
    color: #00FF66;
  }

  .mandate-callout {
    background: #08170D;
    border-left: 4px solid #FFB703;
    padding: 12px 14px;
    border-radius: 0 6px 6px 0;
    font-size: 13px;
    color: #FFE699;
    line-height: 1.5;
  }

  .badge-expert {
    display: inline-block;
    background: #E63946;
    color: #FFFFFF;
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 3px;
    margin: 0 3px;
  }

  /* Datasets Grid */
  .datasets-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .section-heading-bar {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
    border-bottom: 2px solid #234E32;
    padding-bottom: 8px;
  }

  .section-heading-title {
    font-size: 13px;
    color: #00E5FF;
    letter-spacing: 0.5px;
  }

  .section-heading-sub {
    font-size: 12px;
    color: #84CCA0;
  }

  .datasets-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .dataset-card {
    background: linear-gradient(180deg, #0D1C14 0%, #06100B 100%);
    border: 2px solid #234E32;
    border-left: 5px solid var(--accent-color, #00FF66);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .dataset-card:hover {
    transform: translateY(-2px);
    border-color: var(--accent-color, #00FF66);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 255, 102, 0.2);
  }

  .ds-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ds-role-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: bold;
    background: #0B1C13;
    border: 1.5px solid;
    padding: 4px 10px;
    border-radius: 4px;
  }

  .ds-access-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #A0C8AA;
    background: #08140D;
    border: 1px solid #1D3B27;
    padding: 3px 8px;
    border-radius: 4px;
  }

  .live-indicator {
    color: #00FF66;
    font-size: 10px;
  }

  .ds-card-title {
    font-size: 14px;
    color: #FFFFFF;
    line-height: 1.4;
    letter-spacing: 0.3px;
  }

  .ds-specs-matrix {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
    background: #050D08;
    border: 1px solid #173322;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 11px;
  }

  .spec-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .spec-label {
    color: #6C8E76;
    font-size: 9px;
  }

  .spec-value {
    color: #BAE6FD;
  }

  .ds-params-box {
    background: #040A06;
    border: 1px solid #1D432A;
    border-left: 3px solid #00E5FF;
    border-radius: 4px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .params-label {
    font-size: 9px;
    color: #00E5FF;
    letter-spacing: 0.5px;
  }

  .params-code {
    font-size: 12px;
    color: #00FF66;
    word-break: break-all;
    line-height: 1.4;
  }

  .ds-card-desc {
    font-size: 14px;
    line-height: 1.55;
    color: #D8EEDF;
  }

  /* Limitations Card */
  .limitations-card {
    background: linear-gradient(180deg, #1C0B0E 0%, #100608 100%);
    border: 2px solid #E63946;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 0 16px rgba(230, 57, 70, 0.25), 0 8px 24px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .lim-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .lim-alert-icon {
    font-size: 26px;
    line-height: 1;
  }

  .lim-title {
    font-size: 14px;
    color: #FF6B6B;
    margin-bottom: 4px;
  }

  .lim-subtitle {
    font-size: 13px;
    color: #FFB3B3;
  }

  .lim-list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 13px;
    line-height: 1.55;
    color: #FFE6E6;
  }

  .lim-list li {
    padding-left: 20px;
    position: relative;
  }

  .lim-list li::before {
    content: "•";
    position: absolute;
    left: 4px;
    color: #FF6B6B;
    font-size: 18px;
    line-height: 1;
    top: 0;
  }

  .lim-bullet-title {
    display: block;
    font-size: 11px;
    color: #FFD166;
    margin-bottom: 3px;
  }
</style>
