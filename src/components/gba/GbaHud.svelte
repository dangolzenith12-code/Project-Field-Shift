<script lang="ts">
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';
  import type { TimeOfDay, EquippedTool } from './types';

  interface Props {
    meters: FarmMeters;
    era: EraInfo;
    region: RegionInfo;
    seasonName: string;
    timeOfDay?: TimeOfDay;
    equippedTool?: EquippedTool;
    onToggleTimeOfDay?: () => void;
    onCycleTool?: () => void;
    onOpenMenu: () => void;
    onOpenCompare: () => void;
    onOpenBackpack?: () => void;
  }

  let { 
    meters, 
    era, 
    region, 
    seasonName, 
    timeOfDay = 'noon',
    equippedTool = 'seeds',
    onToggleTimeOfDay,
    onCycleTool,
    onOpenMenu, 
    onOpenCompare,
    onOpenBackpack
  }: Props = $props();

  const toolLabels: Record<EquippedTool, string> = {
    seeds: 'Cover Seeds',
    water: 'AWD Water',
    probe: 'SMAP Probe',
    almanac: 'Almanac'
  };

  const todLabels: Record<TimeOfDay, string> = {
    dawn: 'Dawn',
    noon: 'Noon',
    sunset: 'Sunset',
    night: 'Night'
  };
</script>

<div class="gba-hud-strip">
  <div class="hud-left">
    <div class="hud-badge era-badge font-display">
      <span>{era.year}</span>
      <span class="sub font-data">[{era.label}]</span>
    </div>

    <div class="hud-badge season-badge font-data">
      <span>{seasonName}</span>
    </div>

    {#if onToggleTimeOfDay}
      <button 
        type="button" 
        class="hud-badge tod-badge font-data" 
        onclick={onToggleTimeOfDay}
        title="Click to toggle lighting (Dawn / Noon / Sunset / Night)"
      >
        <span>{todLabels[timeOfDay]}</span>
      </button>
    {/if}
  </div>

  <div class="hud-center-meters">
    <!-- Mini Water Jar -->
    <div class="mini-meter" title="Root-Zone Moisture: {meters.soilMoisture}%">
      <svg class="mini-svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="var(--journal-monsoon, #2B69A3)" />
      </svg>
      <div class="mini-bar">
        <div class="bar-fill water" style:width="{meters.soilMoisture}%"></div>
      </div>
      <span class="mini-val font-data">{meters.soilMoisture}%</span>
    </div>

    <!-- Mini Soil Health -->
    <div class="mini-meter" title="Organic Matter: {meters.organicMatter}%">
      <svg class="mini-svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d="M12 2C8 6 6 11 6 16c0 3.3 2.7 6 6 6s6-2.7 6-6c0-5-2-10-6-14z" fill="var(--journal-forest, #1F3825)" />
      </svg>
      <div class="mini-bar">
        <div class="bar-fill soil" style:width="{meters.organicMatter}%"></div>
      </div>
      <span class="mini-val font-data">{meters.organicMatter}%</span>
    </div>

    <!-- Mini Nitrogen -->
    <div class="mini-meter" title="Soil Nitrogen: {meters.nitrogen} kg/ha">
      <svg class="mini-svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="var(--journal-rust, #C86D51)" />
      </svg>
      <span class="mini-val font-data">N:{meters.nitrogen}</span>
    </div>

    <!-- Active Tool Indicator Pill -->
    {#if onCycleTool}
      <button 
        type="button" 
        class="mini-meter tool-pill" 
        onclick={onCycleTool} 
        title="Click to cycle active tool [Q]"
      >
        <span class="tool-tag font-data">TOOL: {toolLabels[equippedTool]}</span>
      </button>
    {/if}
  </div>

  <div class="hud-right">
    {#if onOpenBackpack}
      <button type="button" class="hud-btn backpack-btn font-display" onclick={onOpenBackpack} title="Open Farmer's Field Pack (Strategies, Tools, Journal, NASA Data)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z" fill="var(--journal-gold, #E5A93C)" stroke="var(--journal-ink, #1B2B1F)" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="var(--journal-ink, #1B2B1F)" />
          <rect x="7" y="11" width="10" height="6" rx="1.5" fill="#FAF6ED" stroke="var(--journal-ink, #1B2B1F)" />
        </svg>
        <span>Backpack</span>
      </button>
    {/if}
    <button type="button" class="hud-btn font-display" onclick={onOpenCompare} title="Compare 3 Rotations">
      Compare
    </button>
    <button type="button" class="hud-btn menu-btn font-data" onclick={onOpenMenu} title="GBA Pause Menu">
      START
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

  .tod-badge {
    background-color: color-mix(in srgb, var(--turmeric) 25%, var(--paper));
    color: var(--ink);
    cursor: pointer;
    transition: transform var(--fast);
  }

  .tod-badge:hover {
    transform: translateY(-1px);
  }

  .tool-pill {
    background-color: color-mix(in srgb, var(--forest) 18%, var(--paper));
    cursor: pointer;
    border: 1.5px solid var(--forest);
    transition: transform var(--fast);
  }

  .tool-pill:hover {
    transform: translateY(-1px);
  }

  .tool-tag {
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--forest);
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
