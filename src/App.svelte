<script lang="ts">
  import type { SceneView, RegionInfo, EraInfo, FarmMeters, StrategyOption } from './types/game';
  import { REGIONS, ERAS } from './data/mockData';
  import IntroScreen from './components/intro/IntroScreen.svelte';
  import RegionSelectScreen from './components/region/RegionSelectScreen.svelte';
  import FarmPlayScreen from './components/game/FarmPlayScreen.svelte';
  import GbaGame from './components/gba/GbaGame.svelte';
  import StoryGame from './components/story/StoryGame.svelte';
  import HariStoryFlow from './components/story/HariStoryFlow.svelte';
  import CompareScreen from './components/compare/CompareScreen.svelte';
  import NasaDataView from './components/nasa/NasaDataView.svelte';
  import StyleguideView from './components/styleguide/StyleguideView.svelte';
  import GamePromoModal from './components/promo/GamePromoModal.svelte';

  // Master State Machine - Starts directly into Hari's Story Game!
  let currentView = $state<SceneView>('STORY_GAME');
  let isPromoOpen = $state(false);
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
  <!-- Persistent Retro Arcade Console Top Bar -->
  <header class="app-header">
    <div class="header-inner">
      <button class="brand-link" onclick={() => setView('STORY_GAME')}>
        <span class="seed-symbol font-pixel">◆</span>
        <span class="brand-title font-pixel">FIELD SHIFT</span>
        <span class="brand-sub font-data">AMMA'S FIELD</span>
      </button>

      <!-- Navigation Tabs (Retro Arcade Buttons with NO emojis) -->
      <nav class="nav-links">
        <button 
          class="nav-tab {currentView === 'STORY_GAME' ? 'active' : ''}" 
          onclick={() => setView('STORY_GAME')}
        >
          [◆ HARI'S STORY]
        </button>
        <button 
          class="nav-tab {currentView === 'SEASON_PLAY' ? 'active' : ''}" 
          onclick={() => setView('SEASON_PLAY')}
        >
          [▲ OVERWORLD RPG]
        </button>
        <button 
          class="nav-tab {currentView === 'STRATEGY_COMPARE' ? 'active' : ''}" 
          onclick={() => setView('STRATEGY_COMPARE')}
        >
          [▼ 3-STRATEGY MATRIX]
        </button>
        <button 
          class="nav-tab {currentView === 'NASA_DATA' ? 'active' : ''}" 
          onclick={() => setView('NASA_DATA')}
        >
          [★ NASA SATELLITE HUB]
        </button>
        <button 
          class="nav-tab {currentView === 'STYLEGUIDE' ? 'active' : ''}" 
          onclick={() => setView('STYLEGUIDE')}
        >
          [? STYLEGUIDE]
        </button>
        <button 
          type="button"
          class="promo-nav-btn font-pixel" 
          onclick={() => isPromoOpen = true}
          title="Play 10-Second NASA Space Apps Promo Trailer"
        >
          [🎬 10s PROMO]
        </button>
      </nav>

      <!-- Sound Toggle -->
      <button 
        class="sound-btn font-data" 
        onclick={() => isMuted = !isMuted}
        title={isMuted ? "Sound Muted" : "Sound Enabled"}
      >
        {isMuted ? "[♪ MUTED]" : "[♪ AUDIO ON]"}
      </button>
    </div>
  </header>

  <!-- Active Main Content Scene -->
  <main class="app-main">
    {#if currentView === 'STORY_GAME'}
      <HariStoryFlow 
        currentRegion={selectedRegion}
        onViewStyleguide={() => setView('STYLEGUIDE')}
        onOpenOverworld={() => setView('SEASON_PLAY')}
        onOpenPromo={() => isPromoOpen = true}
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
          onBackToStory={() => setView('STORY_GAME')}
          onBackToIntro={() => setView('INTRO')}
          onSelectRegion={handleSelectRegion}
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

  <!-- 10-Second Cinematic Promo Trailer Modal -->
  {#if isPromoOpen}
    <GamePromoModal 
      isOpen={isPromoOpen}
      onClose={() => isPromoOpen = false} 
      onPlayGame={() => {
        isPromoOpen = false;
        setView('STORY_GAME');
      }} 
    />
  {/if}
</div>

<style>
  .app-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #0E140E;
    color: #FFFFFF;
  }

  .app-header {
    background-color: #080D08;
    border-bottom: 3px solid #00FF66;
    padding: 8px 16px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 255, 102, 0.2);
  }

  .header-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
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
    color: #00FF66;
  }

  .seed-symbol {
    font-size: 1.1rem;
    color: #FFB703;
  }

  .brand-title {
    font-size: 0.95rem;
    color: #00FF66;
    letter-spacing: 1px;
    line-height: 1;
  }

  .brand-sub {
    font-size: 0.65rem;
    color: #FFB703;
    padding: 2px 6px;
    background-color: #1A261A;
    border: 1px solid #FFB703;
    border-radius: 2px;
    letter-spacing: 0.5px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .nav-tab {
    font-family: var(--font-pixel);
    font-size: 0.68rem;
    color: #A0C8AA;
    background-color: #141F14;
    border: 2px solid #2E5A35;
    padding: 6px 10px;
    cursor: pointer;
    box-shadow: 0 3px 0 #000;
    transition: transform var(--fast) var(--spring), background-color var(--fast) ease, color var(--fast) ease;
  }

  .nav-tab:hover {
    color: #00FF66;
    border-color: #00FF66;
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #000;
  }

  .nav-tab:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #000;
  }

  .nav-tab.active {
    background-color: #00FF66;
    color: #000000;
    border-color: #000000;
    font-weight: bold;
    box-shadow: 0 3px 0 #000, 0 0 10px rgba(0, 255, 102, 0.4);
  }

  .sound-btn {
    font-family: var(--font-pixel);
    font-size: 0.65rem;
    background-color: #1A281A;
    color: #FFB703;
    border: 2px solid #FFB703;
    padding: 6px 10px;
    cursor: pointer;
    box-shadow: 0 3px 0 #000;
  }

  .sound-btn:hover {
    background-color: #FFB703;
    color: #000000;
  }

  .promo-nav-btn {
    font-family: var(--font-pixel);
    font-size: 0.68rem;
    color: #000000;
    background: linear-gradient(135deg, #FFB703 0%, #FF8500 100%);
    border: 2px solid #FFE699;
    padding: 6px 12px;
    cursor: pointer;
    box-shadow: 0 3px 0 #000, 0 0 12px rgba(255, 183, 3, 0.45);
    animation: promoPulse 2s infinite ease-in-out;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .promo-nav-btn:hover {
    background: linear-gradient(135deg, #00FF66 0%, #00CC55 100%);
    border-color: #A0FFA0;
    color: #000000;
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #000, 0 0 20px rgba(0, 255, 102, 0.7);
  }

  @keyframes promoPulse {
    0%, 100% {
      box-shadow: 0 3px 0 #000, 0 0 8px rgba(255, 183, 3, 0.4);
    }
    50% {
      box-shadow: 0 3px 0 #000, 0 0 18px rgba(255, 183, 3, 0.85);
    }
  }

  .app-main {
    flex-grow: 1;
    width: 100%;
    background-color: #0E140E;
  }
</style>
