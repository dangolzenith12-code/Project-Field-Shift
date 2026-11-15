<script lang="ts">
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';
  import FarmScene from '../scene/FarmScene.svelte';
  import HudPanel from '../meters/HudPanel.svelte';
  import AmmaBubble from '../common/AmmaBubble.svelte';
  import Button from '../common/Button.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';
  import { AMMA_DIALOGS } from '../../data/mockData';

  interface Props {
    currentRegion: RegionInfo;
    currentEra: EraInfo;
    meters: FarmMeters;
    onOpenCompare: () => void;
    onChangeRegion: () => void;
    onViewNasaDocs: () => void;
    onAdvanceSeason: () => void;
    onTriggerEvent: (event: 'rain' | 'dry' | 'harvest' | 'normal') => void;
    currentSeasonName: string;
    weatherCondition: 'normal' | 'rain' | 'dry' | 'harvest';
  }

  let { 
    currentRegion, 
    currentEra, 
    meters, 
    onOpenCompare, 
    onChangeRegion, 
    onViewNasaDocs, 
    onAdvanceSeason,
    onTriggerEvent,
    currentSeasonName,
    weatherCondition 
  }: Props = $props();

  // Dynamic Amma dialogue based on field condition
  const dynamicAmmaText = $derived(
    meters.soilMoisture < 35 
      ? AMMA_DIALOGS.drought_warning 
      : weatherCondition === 'rain' 
        ? AMMA_DIALOGS.monsoon_arrival 
        : weatherCondition === 'harvest' 
          ? AMMA_DIALOGS.harvest_joy 
          : AMMA_DIALOGS.intro
  );
</script>

<div class="farm-play-container">
  <!-- Top Navigation & Switcher Bar -->
  <div class="top-nav-bar">
    <div class="nav-left">
      <span class="logo font-display">🌾 Field Shift</span>
      <span class="region-chip font-data">Region: {currentRegion.name}</span>
    </div>

    <div class="nav-right">
      <Button variant="secondary" size="sm" onclick={onChangeRegion}>🔄 Switch Region</Button>
      <Button variant="secondary" size="sm" onclick={onViewNasaDocs}>🛰️ NASA Evidence</Button>
    </div>
  </div>

  <!-- The Living Farm Hero (60% screen height focus) -->
  <div class="scene-stage">
    <FarmScene 
      {meters} 
      era={currentEra} 
      {weatherCondition} 
    />
  </div>

  <!-- Amma Narrator Speech Bubble -->
  <div class="narrator-strip">
    <AmmaBubble text={dynamicAmmaText} sublabel="Amma ({currentEra.year})" />
  </div>

  <BlockPrintBorder height={12} />

  <!-- Pinned Tactile HUD Panel -->
  <div class="hud-stage">
    <HudPanel 
      {meters} 
      {currentEra} 
      {currentRegion} 
      seasonName={currentSeasonName} 
    />
  </div>

  <!-- Bottom Farm Action Console -->
  <div class="action-console-card sticker-card no-tape">
    <div class="console-left">
      <div class="console-title font-display">Seasonal Decisions</div>
      <p class="console-hint font-body">
        Review satellite observations, compare crop rotations, or advance through the year.
      </p>
    </div>

    <div class="console-controls">
      <!-- Weather simulation triggers to test farm graphics -->
      <div class="weather-buttons-row">
        <span class="ctrl-label font-data">NASA Event Sim:</span>
        <button 
          type="button" 
          class="sim-btn {weatherCondition === 'rain' ? 'active' : ''}" 
          onclick={() => onTriggerEvent('rain')}
          title="Simulate sudden monsoon cloudburst"
        >
          🌧️ Monsoon Rain
        </button>
        <button 
          type="button" 
          class="sim-btn {weatherCondition === 'dry' ? 'active' : ''}" 
          onclick={() => onTriggerEvent('dry')}
          title="Simulate dry summer heat spell"
        >
          ☀️ Heat Spell
        </button>
        <button 
          type="button" 
          class="sim-btn {weatherCondition === 'harvest' ? 'active' : ''}" 
          onclick={() => onTriggerEvent('harvest')}
          title="Celebrate crop harvest"
        >
          ✨ Harvest Burst
        </button>
      </div>

      <div class="main-actions-row">
        <Button variant="secondary" size="md" onclick={onAdvanceSeason}>
          ⏭️ Advance Next Season
        </Button>
        <Button variant="primary" size="lg" onclick={onOpenCompare}>
          📊 Compare 3 Crop Rotations →
        </Button>
      </div>
    </div>
  </div>
</div>

<style>
  .farm-play-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-2);
  }

  .top-nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .logo {
    font-size: 1.4rem;
    color: var(--ink);
  }

  .region-chip {
    font-size: 0.78rem;
    background-color: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 3px 8px;
    margin-left: 8px;
    box-shadow: 0 1px 0 var(--ink);
  }

  .nav-right {
    display: flex;
    gap: var(--space-2);
  }

  .scene-stage {
    width: 100%;
    height: clamp(340px, 48vh, 520px);
  }

  .narrator-strip {
    padding: 2px 0;
  }

  .hud-stage {
    width: 100%;
  }

  .action-console-card {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    background-color: var(--paper);
    padding: var(--space-3) var(--space-4);
  }

  .console-title {
    font-size: 1.25rem;
    color: var(--ink);
  }

  .console-hint {
    font-size: 0.88rem;
    color: color-mix(in srgb, var(--ink) 80%, transparent);
  }

  .console-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-2);
  }

  .weather-buttons-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .ctrl-label {
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--ink);
  }

  .sim-btn {
    font-family: var(--font-body);
    font-size: 0.78rem;
    background-color: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-pill);
    padding: 3px 10px;
    cursor: pointer;
    box-shadow: 0 2px 0 var(--ink);
    transition: transform var(--fast) var(--spring);
  }

  .sim-btn:hover {
    transform: translateY(-1px);
  }

  .sim-btn.active {
    background-color: var(--turmeric);
    font-weight: bold;
  }

  .main-actions-row {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
</style>
