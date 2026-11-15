<script lang="ts">
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';

  interface Props {
    meters: FarmMeters;
    era: EraInfo;
    region: RegionInfo;
    seasonName: string;
    onOpenMenu: () => void;
    onOpenCompare: () => void;
    onOpenRegionSelect?: () => void;
  }

  let { meters, era, region, seasonName, onOpenMenu, onOpenCompare, onOpenRegionSelect }: Props = $props();
</script>

<div class="gba-hud-strip">
  <div class="hud-left">
    <div class="hud-badge era-badge font-pixel">
      <span>[◆ {era.year}]</span>
      <span class="sub font-pixel">{era.label}</span>
    </div>

    <div class="hud-badge season-badge font-pixel">
      <span>▲ {seasonName}</span>
    </div>

    {#if region}
      <button 
        type="button" 
        class="hud-badge region-badge font-pixel" 
        onclick={onOpenRegionSelect}
        title="Change Agro-Ecological Region"
      >
        <span>◆ {region.name}</span>
        <span class="travel-tag font-pixel">[TRAVEL]</span>
      </button>
    {/if}
  </div>

  <div class="hud-center-meters font-pixel">
    <!-- Root-Zone Moisture (NASA SMAP) -->
    <div class="mini-meter" title="Root-Zone Moisture: {meters.soilMoisture}%">
      <span class="mini-icon font-pixel">|||</span>
      <span class="mini-label font-pixel">SMAP:</span>
      <div class="mini-bar">
        <div class="bar-fill water" style:width="{meters.soilMoisture}%"></div>
      </div>
      <span class="mini-val font-pixel">{meters.soilMoisture}%</span>
    </div>

    <!-- Soil Organic Carbon -->
    <div class="mini-meter" title="Organic Matter: {meters.organicMatter}%">
      <span class="mini-icon font-pixel">◆</span>
      <span class="mini-label font-pixel">SOC:</span>
      <div class="mini-bar">
        <div class="bar-fill soil" style:width="{meters.organicMatter}%"></div>
      </div>
      <span class="mini-val font-pixel">{meters.organicMatter}%</span>
    </div>

    <!-- Farm Coin Vault -->
    <div class="mini-meter coins" title="Farm Income Vault: {meters.income} Coins">
      <span class="mini-icon font-pixel">▲</span>
      <span class="mini-val font-pixel">{meters.income}G</span>
    </div>
  </div>

  <div class="hud-right">
    <button class="hud-btn font-pixel" onclick={onOpenCompare} title="Compare 3 Rotations">
      [◆ ALMANAC]
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
    background-color: #0b140f;
    border: 2px solid #00FF66;
    border-radius: 4px;
    padding: 6px 12px;
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.2);
    user-select: none;
    flex-wrap: wrap;
    color: #e5f5eb;
  }

  .hud-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
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

  .region-badge {
    background-color: #14241b;
    color: #00ffff;
    border-color: #0088cc;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .region-badge:hover {
    background-color: #0088cc;
    color: #000;
  }

  .travel-tag {
    font-size: 6px;
    background: #FFB703;
    color: #000;
    padding: 1px 3px;
    border-radius: 2px;
    margin-left: 2px;
  }

  .hud-center-meters {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .mini-meter {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 8px;
  }

  .mini-icon {
    color: #00FF66;
  }

  .mini-label {
    color: #88a896;
    font-size: 7px;
  }

  .mini-bar {
    width: 48px;
    height: 8px;
    background: #000;
    border: 1px solid #1f3d2b;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .bar-fill.water {
    background: #00ffff;
  }

  .bar-fill.soil {
    background: #FFB703;
  }

  .mini-val {
    color: #fff;
    font-size: 8px;
  }

  .mini-meter.coins .mini-val {
    color: #FFB703;
  }

  .hud-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hud-btn {
    background: #0f2e1b;
    border: 1px solid #00FF66;
    color: #00FF66;
    font-size: 8px;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 2px;
  }

  .hud-btn:hover {
    background: #00FF66;
    color: #000;
  }

  .menu-btn {
    border-color: #FFB703;
    color: #FFB703;
  }

  .menu-btn:hover {
    background: #FFB703;
    color: #000;
  }
</style>
