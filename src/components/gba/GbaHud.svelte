<script lang="ts">
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';

  interface Props {
    meters: FarmMeters;
    era: EraInfo;
    region: RegionInfo;
    seasonName: string;
    onOpenMenu: () => void;
    onOpenCompare: () => void;
  }

  let { meters, era, region, seasonName, onOpenMenu, onOpenCompare }: Props = $props();
</script>

<div class="gba-hud-strip">
  <div class="hud-left">
    <div class="hud-badge era-badge font-display">
      <span>⏳ {era.year}</span>
      <span class="sub font-data">[{era.label}]</span>
    </div>

    <div class="hud-badge season-badge font-data">
      <span>☀️ {seasonName}</span>
    </div>
  </div>

  <div class="hud-center-meters">
    <!-- Mini Water Jar -->
    <div class="mini-meter" title="Root-Zone Moisture: {meters.soilMoisture}%">
      <span class="mini-icon">💧</span>
      <div class="mini-bar">
        <div class="bar-fill water" style:width="{meters.soilMoisture}%"></div>
      </div>
      <span class="mini-val font-data">{meters.soilMoisture}%</span>
    </div>

    <!-- Mini Soil Health -->
    <div class="mini-meter" title="Organic Matter: {meters.organicMatter}%">
      <span class="mini-icon">🌱</span>
      <div class="mini-bar">
        <div class="bar-fill soil" style:width="{meters.organicMatter}%"></div>
      </div>
      <span class="mini-val font-data">{meters.organicMatter}%</span>
    </div>

    <!-- Mini Coins -->
    <div class="mini-meter coins" title="Farm Income Vault: {meters.income} Coins">
      <span class="mini-icon">🪙</span>
      <span class="mini-val font-data">{meters.income}</span>
    </div>
  </div>

  <div class="hud-right">
    <button class="hud-btn font-display" onclick={onOpenCompare} title="Compare 3 Rotations">
      🌾 Compare
    </button>
    <button class="hud-btn menu-btn font-data" onclick={onOpenMenu} title="GBA Pause Menu">
      START ☰
    </button>
  </div>
</div>

<style>
  .gba-hud-strip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    background-color: var(--paper);
    border: 3px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 6px 12px;
    box-shadow: 0 4px 0 var(--ink);
    user-select: none;
    flex-wrap: wrap;
  }

  .hud-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hud-badge {
    border: 1.5px solid var(--ink);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 0.78rem;
    box-shadow: 0 1px 0 var(--ink);
  }

  .era-badge {
    background-color: var(--turmeric);
    color: var(--ink);
  }

  .era-badge .sub {
    font-size: 0.68rem;
    font-weight: normal;
  }

  .season-badge {
    background-color: color-mix(in srgb, var(--monsoon) 18%, var(--paper));
    color: var(--ink);
    font-weight: bold;
  }

  .hud-center-meters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .mini-meter {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background-color: color-mix(in srgb, var(--paper) 90%, var(--ink));
    border: 1.5px solid var(--ink);
    border-radius: 4px;
    padding: 2px 6px;
  }

  .mini-icon {
    font-size: 0.82rem;
  }

  .mini-bar {
    width: 36px;
    height: 7px;
    background-color: var(--paper);
    border: 1px solid var(--ink);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    transition: width var(--fast) ease;
  }

  .bar-fill.water {
    background-color: var(--monsoon);
  }

  .bar-fill.soil {
    background-color: var(--soil);
  }

  .mini-val {
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--ink);
  }

  .mini-meter.coins {
    background-color: color-mix(in srgb, var(--turmeric) 35%, var(--paper));
  }

  .hud-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hud-btn {
    background-color: var(--turmeric);
    color: var(--ink);
    border: 2px solid var(--ink);
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 0.78rem;
    cursor: pointer;
    box-shadow: 0 2px 0 var(--ink);
    transition: transform var(--fast) var(--spring);
  }

  .hud-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 0 var(--ink);
  }

  .hud-btn:active {
    transform: translateY(2px);
    box-shadow: 0 0 0 var(--ink);
  }

  .menu-btn {
    background-color: var(--paper);
    font-weight: bold;
  }
</style>
