<script lang="ts">
  import type { SceneView, RegionInfo, EraInfo, FarmMeters, StrategyOption } from './types/game';
  import { REGIONS, ERAS } from './data/mockData';
  import IntroScreen from './components/intro/IntroScreen.svelte';
  import RegionSelectScreen from './components/region/RegionSelectScreen.svelte';
  import FarmPlayScreen from './components/game/FarmPlayScreen.svelte';
  import GbaGame from './components/gba/GbaGame.svelte';
  import StoryGame from './components/story/StoryGame.svelte';
  import CompareScreen from './components/compare/CompareScreen.svelte';
  import NasaDataView from './components/nasa/NasaDataView.svelte';
  import StyleguideView from './components/styleguide/StyleguideView.svelte';

  // Master State Machine - Starts directly into Hari's Story Game!
  let currentView = $state<SceneView>('STORY_GAME');
  let selectedRegion = $state<RegionInfo>(REGIONS.punjab);
  let eraIndex = $state(0);
  const currentEra = $derived(ERAS[eraIndex]);

  // Seasons cycle
  const SEASONS = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'];
  let seasonIndex = $state(0);
  const currentSeasonName = $derived(SEASONS[seasonIndex]);

  // Live Farm Meters
  let meters = $state<FarmMeters>({ ...REGIONS.punjab.initialMeters });

  // Play Mode: 'gba' (GBA Pokémon/Zelda style) vs 'almanac' (classic illustrated almanac)
  let playMode = $state<'gba' | 'almanac'>('gba');

  // Weather condition for graphics
  let weatherCondition = $state<'normal' | 'rain' | 'dry' | 'harvest'>('normal');

  // Sound toggle (visual indicator)
  let isMuted = $state(false);

  // Transition to specific view
  function setView(view: SceneView) {
    currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Region Selection Handler
  function handleSelectRegion(region: RegionInfo) {
    selectedRegion = region;
    meters = { ...region.initialMeters };
    setView('SEASON_PLAY');
  }

  // Season Progression
  function advanceSeason() {
    seasonIndex = (seasonIndex + 1) % SEASONS.length;
    
    // If completed full year, advance era or cycle
    if (seasonIndex === 0) {
      if (eraIndex < ERAS.length - 1) {
        eraIndex++;
      }
    }

    // Dynamic seasonal adjustments based on weather
    if (seasonIndex === 0) {
      // Monsoon
      weatherCondition = 'rain';
      meters.soilMoisture = Math.min(95, meters.soilMoisture + 35);
      meters.erosionRisk = Math.min(85, meters.erosionRisk + 12);
      meters.waterUse += 120;
    } else if (seasonIndex === 1) {
      // Winter harvest
      weatherCondition = 'harvest';
      meters.soilMoisture = Math.max(25, meters.soilMoisture - 18);
      meters.income += 45;
      meters.organicMatter = Math.min(90, meters.organicMatter + 4);
    } else {
      // Dry Summer
      weatherCondition = 'dry';
      meters.soilMoisture = Math.max(15, meters.soilMoisture - 24);
      meters.erosionRisk = Math.min(90, meters.erosionRisk + 8);
    }
  }

  // Trigger manual weather condition
  function handleTriggerEvent(event: 'rain' | 'dry' | 'harvest' | 'normal') {
    weatherCondition = event;
    if (event === 'rain') {
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 25);
    } else if (event === 'dry') {
      meters.soilMoisture = Math.max(10, meters.soilMoisture - 20);
    } else if (event === 'harvest') {
      meters.income += 30;
      meters.nitrogen = Math.min(100, meters.nitrogen + 10);
    }
  }

  // Strategy Adoption
  function handleSelectStrategy(strat: StrategyOption) {
    // Apply strategy delta to meters
    meters.soilMoisture = Math.min(100, Math.max(10, meters.soilMoisture - strat.metrics.waterStressDelta * 0.4));
    meters.income = Math.max(20, Math.round(meters.income * (1 + strat.metrics.incomeReturn / 100)));
    meters.organicMatter = Math.min(100, Math.max(15, meters.organicMatter + strat.metrics.soilCarbonDelta * 0.5));
    meters.erosionRisk = Math.max(10, Math.min(90, meters.erosionRisk - 15));
    
    // Return to field play
    setView('SEASON_PLAY');
  }
</script>

<div class="app-root">
  <!-- Persistent Vintage Top Bar -->
  <header class="app-header">
    <div class="header-inner">
      <button class="brand-link" onclick={() => setView('INTRO')}>
        <span class="seed-icon">🌱</span>
        <span class="brand-title font-display">Field Shift</span>
        <span class="brand-sub font-data">Amma's Field</span>
      </button>

      <!-- Navigation Tabs -->
      <nav class="nav-links">
        <button 
          class="nav-tab {currentView === 'STORY_GAME' ? 'active' : ''}" 
          onclick={() => setView('STORY_GAME')}
        >
          🎮 Hari's Story Game
        </button>
        <button 
          class="nav-tab {currentView === 'SEASON_PLAY' ? 'active' : ''}" 
          onclick={() => setView('SEASON_PLAY')}
        >
          📜 Freeplay Almanac
        </button>
        <button 
          class="nav-tab {currentView === 'STRATEGY_COMPARE' ? 'active' : ''}" 
          onclick={() => setView('STRATEGY_COMPARE')}
        >
          📊 Compare (3 Rotations)
        </button>
        <button 
          class="nav-tab {currentView === 'NASA_DATA' ? 'active' : ''}" 
          onclick={() => setView('NASA_DATA')}
        >
          🛰️ NASA Data
        </button>
        <button 
          class="nav-tab {currentView === 'STYLEGUIDE' ? 'active' : ''}" 
          onclick={() => setView('STYLEGUIDE')}
        >
          🎨 /styleguide
        </button>
      </nav>

      <!-- Sound Toggle -->
      <button 
        class="sound-btn font-data" 
        onclick={() => isMuted = !isMuted}
        title={isMuted ? "Sound Muted" : "Sound Enabled"}
      >
        {isMuted ? "🔇 Muted" : "🔊 Audio ON"}
      </button>
    </div>
  </header>

  <!-- Active Main Content Scene -->
  <main class="app-main">
    {#if currentView === 'STORY_GAME'}
      <StoryGame 
        currentRegion={selectedRegion}
        onViewStyleguide={() => setView('STYLEGUIDE')}
      />
    {:else if currentView === 'INTRO'}
      <IntroScreen 
        onStartGame={() => setView('REGION_SELECT')} 
        onViewStyleguide={() => setView('STYLEGUIDE')}
        onViewNasaDocs={() => setView('NASA_DATA')}
      />
    {:else if currentView === 'REGION_SELECT'}
      <RegionSelectScreen 
        onSelectRegion={handleSelectRegion}
        onBack={() => setView('INTRO')}
      />
    {:else if currentView === 'SEASON_PLAY'}
      {#if playMode === 'gba'}
        <GbaGame 
          currentRegion={selectedRegion}
          {currentEra}
          {meters}
          {currentSeasonName}
          {weatherCondition}
          onOpenCompare={() => setView('STRATEGY_COMPARE')}
          onOpenNasa={() => setView('NASA_DATA')}
          onOpenRegionSelect={() => setView('REGION_SELECT')}
          onOpenStyleguide={() => setView('STYLEGUIDE')}
          onAdvanceSeason={advanceSeason}
        />
      {:else}
        <FarmPlayScreen 
          currentRegion={selectedRegion}
          {currentEra}
          {meters}
          {currentSeasonName}
          {weatherCondition}
          onOpenCompare={() => setView('STRATEGY_COMPARE')}
          onChangeRegion={() => setView('REGION_SELECT')}
          onViewNasaDocs={() => setView('NASA_DATA')}
          onAdvanceSeason={advanceSeason}
          onTriggerEvent={handleTriggerEvent}
        />
      {/if}
    {:else if currentView === 'STRATEGY_COMPARE'}
      <CompareScreen 
        onSelectStrategy={handleSelectStrategy}
        onBack={() => setView('SEASON_PLAY')}
      />
    {:else if currentView === 'NASA_DATA'}
      <NasaDataView onBack={() => setView('SEASON_PLAY')} />
    {:else if currentView === 'STYLEGUIDE'}
      <StyleguideView onBack={() => setView('SEASON_PLAY')} />
    {/if}
  </main>
</div>

<style>
  .app-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--paper);
  }

  .app-header {
    background-color: var(--paper);
    border-bottom: var(--outline);
    padding: var(--space-2) var(--space-3);
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 0 var(--ink);
  }

  .header-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  .seed-icon {
    font-size: 1.5rem;
  }

  .brand-title {
    font-size: 1.35rem;
    color: var(--ink);
    line-height: 1;
  }

  .brand-sub {
    font-size: 0.72rem;
    color: var(--soil);
    padding: 2px 6px;
    background-color: color-mix(in srgb, var(--turmeric) 35%, var(--paper));
    border: 1px solid var(--ink);
    border-radius: 4px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .nav-tab {
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--ink);
    background-color: var(--paper);
    border: 2px solid var(--ink);
    border-radius: var(--radius-pill);
    padding: 4px 12px;
    cursor: pointer;
    box-shadow: 0 2px 0 var(--ink);
    transition: transform var(--fast) var(--spring), background-color var(--fast) ease;
  }

  .nav-tab:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 0 var(--ink);
  }

  .nav-tab:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--ink);
  }

  .nav-tab.active {
    background-color: var(--turmeric);
    box-shadow: 0 3px 0 var(--ink);
  }

  .sound-btn {
    font-size: 0.75rem;
    background-color: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 4px 8px;
    cursor: pointer;
    box-shadow: 0 1px 0 var(--ink);
  }

  .sound-btn:hover {
    background-color: color-mix(in srgb, var(--ink) 8%, var(--paper));
  }

  .app-main {
    flex-grow: 1;
    width: 100%;
  }
</style>
