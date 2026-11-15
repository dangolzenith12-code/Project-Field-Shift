<script lang="ts">
  import type { RegionInfo, EraInfo, FarmMeters, StrategyOption } from './types/game';
  import { REGIONS, ERAS } from './data/mockData';
  import { sfx } from './utils/sound';
  import StartScreen from './components/intro/StartScreen.svelte';
  import PlaymodeSelectScreen from './components/intro/PlaymodeSelectScreen.svelte';
  import RegionSelectScreen from './components/region/RegionSelectScreen.svelte';
  import GbaGame from './components/gba/GbaGame.svelte';
  import PunjabStoryView from './components/story/PunjabStoryView.svelte';
  import KarnatakaStoryView from './components/story/KarnatakaStoryView.svelte';
  import CompareScreen from './components/compare/CompareScreen.svelte';
  import NasaDataView from './components/nasa/NasaDataView.svelte';
  import JournalView from './components/journal/JournalView.svelte';
  import StyleguideView from './components/styleguide/StyleguideView.svelte';

  // Master Application Journey View State Machine
  type AppView = 
    | 'START' 
    | 'PLAYMODE' 
    | 'GBA_GAME' 
    | 'REGION_SELECT' 
    | 'PUNJAB_STORY' 
    | 'KARNATAKA_STORY'
    | 'STRATEGY_COMPARE' 
    | 'JOURNAL' 
    | 'NASA_DATA' 
    | 'STYLEGUIDE';

  // Screen 1: Start Screen as requested in UI sketch
  let currentView = $state<AppView>('START');
  let previousView = $state<AppView>('START');

  let selectedRegion = $state<RegionInfo>(REGIONS.punjab);
  let eraIndex = $state(0);
  const currentEra = $derived(ERAS[eraIndex]);

  // Seasons cycle
  const SEASONS = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'];
  let seasonIndex = $state(0);
  const currentSeasonName = $derived(SEASONS[seasonIndex]);

  // Farm Meters
  let meters = $state<FarmMeters>({ ...REGIONS.punjab.initialMeters });

  // Weather condition
  let weatherCondition = $state<'normal' | 'rain' | 'dry' | 'harvest'>('normal');

  // Sound toggle
  let isMuted = $state(false);

  function toggleSound() {
    isMuted = !isMuted;
    sfx.enabled = !isMuted;
  }

  // State Transition with history preservation
  function setView(view: AppView) {
    previousView = currentView;
    currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Region Selection Handler (Punjab & Karnataka active)
  function handleSelectRegion(region: RegionInfo) {
    selectedRegion = region;
    meters = { ...region.initialMeters };
    if (region.id === 'karnataka') {
      setView('KARNATAKA_STORY');
    } else {
      setView('PUNJAB_STORY');
    }
  }

  // Season Progression in GBA Overworld
  function advanceSeason() {
    seasonIndex = (seasonIndex + 1) % SEASONS.length;
    
    if (seasonIndex === 0) {
      if (eraIndex < ERAS.length - 1) {
        eraIndex++;
      }
      weatherCondition = 'rain';
      meters.soilMoisture = Math.min(95, meters.soilMoisture + 35);
      meters.erosionRisk = Math.min(85, meters.erosionRisk + 12);
      meters.waterUse += 120;
    } else if (seasonIndex === 1) {
      weatherCondition = 'harvest';
      meters.soilMoisture = Math.max(25, meters.soilMoisture - 18);
      meters.income += 45;
      meters.organicMatter = Math.min(90, meters.organicMatter + 4);
    } else {
      weatherCondition = 'dry';
      meters.soilMoisture = Math.max(15, meters.soilMoisture - 24);
      meters.erosionRisk = Math.min(90, meters.erosionRisk + 8);
    }
  }

  // Strategy Adoption
  function handleSelectStrategy(strat: StrategyOption) {
    meters.soilMoisture = Math.min(100, Math.max(10, meters.soilMoisture - strat.metrics.waterStressDelta * 0.4));
    meters.income = Math.max(20, Math.round(meters.income * (1 + strat.metrics.incomeReturn / 100)));
    meters.organicMatter = Math.min(100, Math.max(15, meters.organicMatter + strat.metrics.soilCarbonDelta * 0.5));
    meters.erosionRisk = Math.max(10, Math.min(90, meters.erosionRisk - 15));
    setView(selectedRegion.id === 'karnataka' ? 'KARNATAKA_STORY' : 'PUNJAB_STORY');
  }
</script>

<div class="app-root">
  <!-- Top Header: Only Game Name and Mute Button (No emojis, no other options) -->
  <header class="app-header">
    <div class="header-inner">
      <!-- Game Name (with SVG sprout symbol) -->
      <button class="brand-link" onclick={() => setView('START')} title="Return to Amma's Farm Start Screen">
        <svg class="brand-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M12 3C8 7 6 12 6 17c0 3.3 2.7 6 6 6s6-2.7 6-6c0-5-2-10-6-14z" fill="var(--journal-gold, #E5A93C)" stroke="var(--journal-ink, #1B2B1F)" stroke-width="1.5" />
          <path d="M12 9v12" stroke="var(--journal-ink, #1B2B1F)" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span class="brand-title font-display">AMMA'S FARM</span>
      </button>

      <!-- Mute Button (SVG Speaker icon, no emoji) -->
      <button 
        type="button"
        class="sound-btn font-data {isMuted ? 'muted' : 'active'}" 
        onclick={toggleSound}
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        title={isMuted ? "Sound Muted (Click to enable)" : "Sound Enabled (Click to mute)"}
      >
        {#if isMuted}
          <svg class="audio-svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
            <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>MUTED</span>
        {:else}
          <svg class="audio-svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
            <path d="M19 5a9.5 9.5 0 0 1 0 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
          </svg>
          <span>AUDIO</span>
        {/if}
      </button>
    </div>
  </header>

  <!-- Active Main Screen -->
  <main class="app-main">
    {#if currentView === 'START'}
      <!-- Screen 1: Start Screen (Amma's Farm) -->
      <StartScreen 
        onPlay={() => setView('PLAYMODE')} 
        {isMuted} 
        onToggleSound={toggleSound} 
      />
    {:else if currentView === 'PLAYMODE'}
      <!-- Screen 2: Choose Playmode (Overworld vs Storymode) -->
      <PlaymodeSelectScreen 
        onSelectOverworld={() => setView('GBA_GAME')}
        onSelectStorymode={() => setView('REGION_SELECT')}
        onBack={() => setView('START')}
      />
    {:else if currentView === 'GBA_GAME'}
      <!-- Screen 3: Full-screen GBA Game -->
      <div class="fullscreen-game-container">
        <GbaGame 
          currentRegion={selectedRegion}
          {currentEra}
          {meters}
          {currentSeasonName}
          {weatherCondition}
          onOpenCompare={() => setView('STRATEGY_COMPARE')}
          onOpenNasa={() => setView('NASA_DATA')}
          onOpenRegionSelect={() => setView('REGION_SELECT')}
          onOpenStory={() => setView(selectedRegion.id === 'karnataka' ? 'KARNATAKA_STORY' : 'PUNJAB_STORY')}
          onReturnToStart={() => setView('START')}
          onOpenStyleguide={() => setView('STYLEGUIDE')}
          onOpenJournal={() => setView('JOURNAL')}
          onAdvanceSeason={advanceSeason}
        />
      </div>
    {:else if currentView === 'REGION_SELECT'}
      <!-- Screen 4: Choose Region (Punjab vs Karnataka) -->
      <RegionSelectScreen 
        onSelectRegion={handleSelectRegion}
        onBack={() => setView('PLAYMODE')}
      />
    {:else if currentView === 'PUNJAB_STORY'}
      <!-- Screen 5A: Punjab Story and AI-powered Farming Experience (DOCX Verbatim) -->
      <PunjabStoryView 
        onBackToRegions={() => setView('REGION_SELECT')}
        onOpenOverworld={() => setView('GBA_GAME')}
        onOpenJournal={() => setView('JOURNAL')}
        onOpenStrategies={() => setView('STRATEGY_COMPARE')}
        onOpenNasa={() => setView('NASA_DATA')}
      />
    {:else if currentView === 'KARNATAKA_STORY'}
      <!-- Screen 5B: Karnataka Generational Story & Dryland Agroecology Minigames -->
      <KarnatakaStoryView 
        onBackToRegions={() => setView('REGION_SELECT')}
        onOpenOverworld={() => setView('GBA_GAME')}
        onOpenJournal={() => setView('JOURNAL')}
        onOpenStrategies={() => setView('STRATEGY_COMPARE')}
        onOpenNasa={() => setView('NASA_DATA')}
      />
    {:else if currentView === 'STRATEGY_COMPARE'}
      <!-- Strategy Comparison / Monte Carlo Ribbons -->
      <div class="paper-view journal-paper-texture">
        <CompareScreen 
          regionId={selectedRegion.id}
          onSelectStrategy={handleSelectStrategy}
          onBack={() => setView(previousView === 'GBA_GAME' ? 'GBA_GAME' : (selectedRegion.id === 'karnataka' ? 'KARNATAKA_STORY' : 'PUNJAB_STORY'))}
        />
      </div>
    {:else if currentView === 'JOURNAL'}
      <!-- Field Journal View -->
      <JournalView onBack={() => setView(previousView === 'GBA_GAME' ? 'GBA_GAME' : (selectedRegion.id === 'karnataka' ? 'KARNATAKA_STORY' : 'PUNJAB_STORY'))} />
    {:else if currentView === 'NASA_DATA'}
      <!-- NASA Earth Science Logbook & Limitations -->
      <div class="paper-view journal-paper-texture">
        <NasaDataView onBack={() => setView(previousView === 'GBA_GAME' ? 'GBA_GAME' : (selectedRegion.id === 'karnataka' ? 'KARNATAKA_STORY' : 'PUNJAB_STORY'))} />
      </div>
    {:else if currentView === 'STYLEGUIDE'}
      <!-- Design Styleguide -->
      <div class="paper-view journal-paper-texture">
        <StyleguideView onBack={() => setView(previousView === 'GBA_GAME' ? 'GBA_GAME' : (selectedRegion.id === 'karnataka' ? 'KARNATAKA_STORY' : 'PUNJAB_STORY'))} />
      </div>
    {/if}
  </main>
</div>

<style>
  .app-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #121A14;
    color: var(--journal-paper, #FAF6ED);
  }

  .app-header {
    background: var(--journal-forest, #1F3825);
    border-bottom: 2.5px solid var(--journal-gold, #E5A93C);
    padding: 8px 16px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
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
  }

  .brand-icon {
    display: block;
    flex-shrink: 0;
  }

  .brand-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--journal-paper, #FAF6ED);
    letter-spacing: 0.5px;
  }

  .sound-btn {
    background: var(--journal-paper, #FAF6ED);
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    color: var(--journal-ink, #1B2B1F);
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
    display: flex;
    align-items: center;
    gap: 6px;
    transition: transform 0.15s, background-color 0.15s;
  }

  .sound-btn:hover {
    transform: translateY(-1px);
    background-color: #F8F5EE;
  }

  .sound-btn.active {
    background-color: var(--journal-gold, #E5A93C);
  }

  .audio-svg {
    display: block;
    flex-shrink: 0;
  }

  .app-main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  /* Journal-styled screens that still sit on legacy paper tokens get the
     botanical paper backdrop instead of the dark app canvas. */
  .paper-view {
    flex-grow: 1;
    min-height: calc(100vh - 60px);
    background-color: var(--journal-paper, #F9F6EE);
    color: var(--journal-ink, #1B2B1F);
  }

  .fullscreen-game-container {
    padding: 16px 8px;
    display: flex;
    justify-content: center;
  }
</style>
