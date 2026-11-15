<script lang="ts">
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';
  import { REGIONS } from '../../data/mockData';

  interface Props {
    meters: FarmMeters;
    era: EraInfo;
    region: RegionInfo;
    seasonName: string;
    onOpenMenu: () => void;
    onOpenCompare: () => void;
    onOpenRegionSelect?: () => void;
    onBackToStory?: () => void;
    onBackToIntro?: () => void;
    onSelectRegion?: (region: RegionInfo) => void;
  }

  let { 
    meters, 
    era, 
    region, 
    seasonName, 
    onOpenMenu, 
    onOpenCompare, 
    onOpenRegionSelect,
    onBackToStory,
    onBackToIntro,
    onSelectRegion
  }: Props = $props();

  const regionsList = Object.values(REGIONS);
</script>

<div class="gba-hud-strip">
  <!-- Left Side: Back Navigation & Era Info -->
  <div class="hud-left">
    {#if onBackToStory}
      <button 
        class="hud-btn back-btn font-pixel" 
        onclick={onBackToStory}
        title="Return to Hari's Main Story Flow"
      >
        <span class="back-arrow font-pixel">←</span>
        <span>[BACK TO STORY]</span>
      </button>
    {/if}

    <div class="hud-badge era-badge font-pixel">
      <span>[◆ {era.year}]</span>
      <span class="sub font-pixel">{era.label.split(' ')[1] || 'Era'}</span>
    </div>

    <div class="hud-badge season-badge font-pixel">
      <span>▲ {seasonName.split(' ')[0]}</span>
    </div>
  </div>

  <!-- Center: Live Farm & NASA SMAP/SOC Telemetry Meters -->
  <div class="hud-center-meters font-pixel">
    <!-- Root-Zone Moisture (NASA SMAP) -->
    <div class="mini-meter" title="Root-Zone Moisture: {meters.soilMoisture}%">
      <span class="mini-icon font-pixel">💧</span>
      <span class="mini-label font-pixel">SMAP:</span>
      <div class="mini-bar">
        <div class="bar-fill water" style:width="{meters.soilMoisture}%"></div>
      </div>
      <span class="mini-val font-pixel">{meters.soilMoisture}%</span>
    </div>

    <!-- Soil Organic Carbon -->
    <div class="mini-meter" title="Organic Matter: {meters.organicMatter}%">
      <span class="mini-icon font-pixel">🌱</span>
      <span class="mini-label font-pixel">SOC:</span>
      <div class="mini-bar">
        <div class="bar-fill soil" style:width="{meters.organicMatter}%"></div>
      </div>
      <span class="mini-val font-pixel">{meters.organicMatter}%</span>
    </div>

    <!-- Farm Coin Vault -->
    <div class="mini-meter coins" title="Farm Income Vault: {meters.income} Coins">
      <span class="mini-icon font-pixel">🪙</span>
      <span class="mini-val font-pixel">{meters.income}G</span>
    </div>
  </div>

  <!-- Right: Overworld Quick-Travel Regions & Menu -->
  <div class="hud-right">
    <!-- 4 Regions Travel Switcher -->
    <div class="region-fast-travel font-pixel" title="Switch Agro-Ecological Region">
      <span class="travel-icon">🗺️</span>
      {#each regionsList as reg}
        <button
          type="button"
          class="region-pill font-pixel {region.id === reg.id ? 'active' : ''}"
          onclick={() => onSelectRegion?.(reg)}
          title="Fast Travel to {reg.name} ({reg.badge})"
        >
          {reg.name.split(' ')[0]}
        </button>
      {/each}
    </div>

    <button class="hud-btn compare-btn font-pixel" onclick={onOpenCompare} title="Compare 3 Rotations">
      [MATRIX]
    </button>
    <button class="hud-btn menu-btn font-pixel" onclick={onOpenMenu} title="GBA Pause Menu">
      [START ≡]
    </button>
  </div>
</div>

<style>
  .gba-hud-strip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    background: linear-gradient(180deg, #0d1b12 0%, #080f0a 100%);
    border: 2px solid #00FF66;
    border-radius: 6px;
    padding: 6px 12px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 255, 102, 0.25);
    user-select: none;
    flex-wrap: wrap;
    color: #e5f5eb;
    margin-bottom: 6px;
  }

  .hud-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .hud-btn {
    font-family: var(--font-pixel, monospace);
    font-size: 0.68rem;
    padding: 4px 8px;
    background-color: #14241b;
    border: 1px solid #2a5a3a;
    border-radius: 3px;
    color: #00FF66;
    cursor: pointer;
    box-shadow: 0 2px 0 #000;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .hud-btn:hover {
    background-color: #00FF66;
    color: #000000;
    transform: translateY(-1px);
    box-shadow: 0 3px 0 #000, 0 0 8px rgba(0, 255, 102, 0.4);
  }

  .back-btn {
    background: linear-gradient(180deg, #381a1a 0%, #1f0d0d 100%);
    border-color: #e63946;
    color: #ffb4a2;
    font-weight: bold;
  }

  .back-btn:hover {
    background: #e63946;
    color: #ffffff;
    box-shadow: 0 3px 0 #000, 0 0 10px rgba(230, 57, 70, 0.5);
  }

  .back-arrow {
    font-size: 0.8rem;
    line-height: 1;
  }

  .hud-badge {
    border: 1px solid #1f3d2b;
    border-radius: 3px;
    padding: 3px 6px;
    font-size: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: default;
  }

  .era-badge {
    background-color: #1f3d2b;
    color: #FFB703;
  }

  .era-badge .sub {
    font-size: 7px;
    color: #88a896;
  }

  .season-badge {
    background-color: #0f2e1b;
    color: #00FF66;
  }

  .hud-center-meters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    background: rgba(0, 0, 0, 0.35);
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #1f3d2b;
  }

  .mini-meter {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 8.5px;
  }

  .mini-icon {
    font-size: 10px;
  }

  .mini-label {
    color: #88a896;
  }

  .mini-bar {
    width: 38px;
    height: 7px;
    background-color: #0b140f;
    border: 1px solid #2a5a3a;
    border-radius: 2px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .bar-fill.water {
    background: linear-gradient(90deg, #1e6cb0, #00e5ff);
  }

  .bar-fill.soil {
    background: linear-gradient(90deg, #5a3818, #3fa34d);
  }

  .mini-val {
    color: #ffffff;
    font-weight: bold;
    min-width: 26px;
  }

  .coins .mini-val {
    color: #FFB703;
  }

  .hud-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .region-fast-travel {
    display: flex;
    align-items: center;
    gap: 3px;
    background-color: #080f0a;
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid #1f3d2b;
  }

  .travel-icon {
    font-size: 10px;
    margin-right: 2px;
  }

  .region-pill {
    background: #14241b;
    border: 1px solid #2a5a3a;
    color: #88a896;
    font-size: 7.5px;
    padding: 2px 5px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .region-pill:hover {
    color: #ffffff;
    border-color: #00FF66;
  }

  .region-pill.active {
    background-color: #00FF66;
    color: #000000;
    font-weight: bold;
    border-color: #000000;
    box-shadow: 0 0 6px rgba(0, 255, 102, 0.6);
  }

  .menu-btn {
    background: #241414;
    border-color: #8c3838;
    color: #ff8585;
  }

  .menu-btn:hover {
    background: #ff4d4d;
    color: #000;
    box-shadow: 0 3px 0 #000, 0 0 8px rgba(255, 77, 77, 0.5);
  }
</style>
