<script lang="ts">
  import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';
  import type { RegionInfo, StrategyOption, FarmMeters } from '../../types/game';
  import { sfx } from '../../utils/sound';
  import SowingTimingGame from '../game/SowingTimingGame.svelte';
  import TubewellPumpGame from '../game/TubewellPumpGame.svelte';
  import SluiceRunoffGame from '../game/SluiceRunoffGame.svelte';
  import HeatwaveShieldGame from '../game/HeatwaveShieldGame.svelte';
  import CompareScreen from '../compare/CompareScreen.svelte';
  import BackpackModal from '../common/BackpackModal.svelte';

  interface Props {
    currentRegion: RegionInfo;
    onViewStyleguide?: () => void;
    onOpenOverworld?: () => void;
    onOpenPromo?: () => void;
    onBackToOverworldSelect?: () => void;
  }

  let { currentRegion, onViewStyleguide, onOpenOverworld, onOpenPromo, onBackToOverworldSelect }: Props = $props();

  let isBackpackOpen = $state(false);

  // The 5-Act Global Story Stages
  type StoryStage = 
    | 'PROLOGUE_CONSENT'
    | 'ACT1_KARNATAKA' 
    | 'GAME1_SOWING'
    | 'ACT2_PUNJAB'
    | 'GAME2_TUBEWELL'
    | 'ACT3_IOWA'
    | 'GAME3_SLUICE'
    | 'ACT4_SAHEL'
    | 'GAME4_HEATWAVE'
    | 'ACT5_SUMMIT'
    | 'FINALE_COMMUNITY';

  let currentStage = $state<StoryStage>('PROLOGUE_CONSENT');
  let introDialogueStep = $state(0);
  let displayedText = $state('');
  let isTyping = $state(true);
  let typingTimer: any = null;
  let hasStartedAdventure = $state(false);

  // Active satellite telemetry popout drawer
  let activeTelemetryMission = $state<string | null>(null);

  // Cumulative Farm Resilience Meters
  let meters = $state<FarmMeters>({
    soilMoisture: 42,
    organicMatter: 34,
    nitrogen: 65,
    erosionRisk: 28,
    income: 180,
    waterUse: 620
  });

  $effect(() => {
    if (currentRegion?.initialMeters) {
      meters = { ...currentRegion.initialMeters };
    }
  });

  let chosenStrategy = $state<StrategyOption | null>(null);

  // Prologue dialogue lines
  const prologueLines = [
    "Hello! I am Hari, a local farmer.",
    "My family and Amma have tended this soil for three generations. Today, the deeds are in my hands.",
    "The weather patterns are changing across the world. I have open NASA satellite telemetry, but I cannot do this alone. Will you join me on this journey?"
  ];

  function startTypewriter(text: string) {
    if (typingTimer) clearInterval(typingTimer);
    displayedText = '';
    isTyping = true;
    let idx = 0;

    typingTimer = setInterval(() => {
      if (idx < text.length) {
        displayedText += text[idx];
        if (idx % 2 === 0) sfx.playTextBlip();
        idx++;
      } else {
        isTyping = false;
        clearInterval(typingTimer);
      }
    }, 20);
  }

  $effect(() => {
    if (currentStage === 'PROLOGUE_CONSENT') {
      if (hasStartedAdventure) {
        startTypewriter(prologueLines[introDialogueStep]);
      }
    } else if (currentStage === 'ACT1_KARNATAKA') {
      startTypewriter("Blessings upon you, Hari! Our heirloom Ragi seeds have survived droughts for centuries. But look at the dry crust... the top 2 cm are scorched, yet NASA SMAP radar reveals 28% moisture at 5 cm! Guide the furrow drill into that exact moisture band!");
    } else if (currentStage === 'ACT2_PUNJAB') {
      sfx.playAlert();
      startTypewriter("Cousin Gurpreet's diesel tubewells are roaring day and night! NASA GRACE twin gravity satellites show our regional aquifer dropping by 1.2 meters per year. If we pump continuously, the community well will collapse into salty mud!");
    } else if (currentStage === 'ACT3_IOWA') {
      sfx.playAlert();
      startTypewriter("Farmer Sarah in the Corn Belt is facing a monster storm! NASA GPM precipitation radar clocks rainfall at 92 mm/hr. On bare slopes, that rain acts like sandpaper. Help Sarah open the retention sluices and deploy winter rye buffers!");
    } else if (currentStage === 'ACT4_SAHEL') {
      sfx.playAlert();
      startTypewriter("Farmer Amina on the African savanna fringe is fighting a historic 46.4°C heat dome! NASA MERRA-2 thermal radiation sensors are flashing red, and ECOSTRESS shows plant pores shutting down! Help Amina shield her Zaï pits with mulch, shade, and drip mist!");
    }
    return () => {
      if (typingTimer) clearInterval(typingTimer);
    };
  });

  function jumpToStage(stage: StoryStage) {
    sfx.playSelect();
    currentStage = stage;
    hasStartedAdventure = true;
    activeTelemetryMission = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStartAdventureClick() {
    sfx.playSelect();
    hasStartedAdventure = true;
    startTypewriter(prologueLines[0]);
  }

  function handleNextIntroLine() {
    sfx.playSelect();
    if (isTyping) {
      displayedText = prologueLines[introDialogueStep];
      isTyping = false;
      if (typingTimer) clearInterval(typingTimer);
      return;
    }
    if (introDialogueStep < prologueLines.length - 1) {
      introDialogueStep++;
    }
  }

  function handleConsentGiven() {
    sfx.playSelect();
    currentStage = 'ACT1_KARNATAKA';
  }

  function handleStartSowingGame() {
    sfx.playSelect();
    currentStage = 'GAME1_SOWING';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSowingComplete() {
    sfx.playSuccess();
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {}
    meters.organicMatter += 10;
    meters.soilMoisture += 15;
    currentStage = 'ACT2_PUNJAB';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStartTubewellGame() {
    sfx.playSelect();
    currentStage = 'GAME2_TUBEWELL';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleTubewellComplete() {
    sfx.playSuccess();
    try {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    } catch {}
    meters.waterUse = Math.max(100, meters.waterUse - 50);
    meters.income += 35;
    currentStage = 'ACT3_IOWA';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStartSluiceGame() {
    sfx.playSelect();
    currentStage = 'GAME3_SLUICE';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSluiceComplete() {
    sfx.playSuccess();
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {}
    meters.erosionRisk = Math.max(5, meters.erosionRisk - 15);
    meters.organicMatter += 12;
    currentStage = 'ACT4_SAHEL';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStartHeatwaveGame() {
    sfx.playSelect();
    currentStage = 'GAME4_HEATWAVE';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleHeatwaveComplete() {
    sfx.playSuccess();
    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } catch {}
    meters.soilMoisture = Math.max(25, meters.soilMoisture - 5);
    meters.income += 45;
    currentStage = 'ACT5_SUMMIT';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAdoptStrategy(strat: StrategyOption) {
    sfx.playSuccess();
    try {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    } catch {}

    chosenStrategy = strat;
    meters.soilMoisture = Math.min(100, Math.max(15, meters.soilMoisture - strat.metrics.waterStressDelta * 0.4));
    meters.organicMatter = Math.min(100, meters.organicMatter + strat.metrics.soilCarbonDelta * 0.5);
    meters.income = Math.round(meters.income * (1 + strat.metrics.incomeReturn / 100));
    meters.erosionRisk = Math.max(10, meters.erosionRisk - 15);

    currentStage = 'FINALE_COMMUNITY';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePlayAgain() {
    sfx.playSelect();
    currentStage = 'PROLOGUE_CONSENT';
    introDialogueStep = 0;
    hasStartedAdventure = false;
    chosenStrategy = null;
    meters = { ...currentRegion.initialMeters };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<div class="hari-arcade-viewport">
  <!-- Interactive Chapter Fast-Travel & Story Navigation Rail -->
  <header class="story-chapter-strip font-pixel">
    <div class="strip-left">
      <span class="chapter-strip-title font-pixel">STORY MODE:</span>
      <button 
        type="button" 
        class="chapter-pill {currentStage === 'PROLOGUE_CONSENT' ? 'active' : ''}" 
        onclick={() => jumpToStage('PROLOGUE_CONSENT')}
      >
        <span>[00]</span> Prologue
      </button>
      <button 
        type="button" 
        class="chapter-pill {currentStage.includes('KARNATAKA') || currentStage === 'GAME1_SOWING' ? 'active' : ''}" 
        onclick={() => jumpToStage('ACT1_KARNATAKA')}
      >
        <span>[01]</span> Act 1: Karnataka
      </button>
      <button 
        type="button" 
        class="chapter-pill {currentStage.includes('PUNJAB') || currentStage === 'GAME2_TUBEWELL' ? 'active' : ''}" 
        onclick={() => jumpToStage('ACT2_PUNJAB')}
      >
        <span>[02]</span> Act 2: Punjab
      </button>
      <button 
        type="button" 
        class="chapter-pill {currentStage.includes('IOWA') || currentStage === 'GAME3_SLUICE' ? 'active' : ''}" 
        onclick={() => jumpToStage('ACT3_IOWA')}
      >
        <span>[03]</span> Act 3: Iowa
      </button>
      <button 
        type="button" 
        class="chapter-pill {currentStage.includes('SAHEL') || currentStage === 'GAME4_HEATWAVE' ? 'active' : ''}" 
        onclick={() => jumpToStage('ACT4_SAHEL')}
      >
        <span>[04]</span> Act 4: Sahel
      </button>
      <button 
        type="button" 
        class="chapter-pill {currentStage === 'ACT5_SUMMIT' ? 'active' : ''}" 
        onclick={() => jumpToStage('ACT5_SUMMIT')}
      >
        <span>[05]</span> Act 5: Summit
      </button>
      <button 
        type="button" 
        class="chapter-pill {currentStage === 'FINALE_COMMUNITY' ? 'active' : ''}" 
        onclick={() => jumpToStage('FINALE_COMMUNITY')}
      >
        <span>[FINALE]</span> Finale
      </button>
    </div>

    <div class="strip-actions">
      <button type="button" class="backpack-strip-btn font-data" onclick={() => isBackpackOpen = true} title="Open Farmer's Field Pack">
        [BACKPACK]
      </button>
      {#if onBackToOverworldSelect}
        <button type="button" class="back-select-btn font-data" onclick={onBackToOverworldSelect}>
          ← Back
        </button>
      {/if}
      {#if onOpenOverworld}
        <button type="button" class="overworld-jump-btn font-data" onclick={onOpenOverworld}>
          [OPEN GBA OVERWORLD]
        </button>
      {/if}
    </div>
  </header>

  {#if currentStage === 'PROLOGUE_CONSENT'}
    <!-- PROLOGUE: PEACEFUL SUNSET IN KISANPUR -->
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel">PROLOGUE: THE CALL FROM KISANPUR</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage">
        <!-- Sunset Panoramic SVG -->
        <svg viewBox="0 0 960 540" class="panorama-svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
          <rect x="0" y="0" width="960" height="90" fill="#FFF5EB" />
          <rect x="0" y="90" width="960" height="70" fill="#FED7AA" />
          <rect x="0" y="160" width="960" height="60" fill="#FB923C" />
          <rect x="0" y="220" width="960" height="60" fill="#EA580C" />
          <circle cx="720" cy="180" r="45" fill="#FFFBEB" />
          <polygon points="0,320 80,240 180,320 280,210 400,320 540,190 680,320 800,220 960,320" fill="#1C3829" />
          <polygon points="0,340 120,260 220,340 340,240 480,340 600,250 720,340 860,260 960,340" fill="#2E5A44" />
          <rect x="0" y="320" width="960" height="60" fill="#92400E" />
          <path d="M 0 360 Q 240 330 520 360 T 960 350 L 960 540 L 0 540 Z" fill="#15803D" />
          <path d="M 0 400 Q 340 370 660 410 T 960 390 L 960 540 L 0 540 Z" fill="#16A34A" />
          <path d="M 0 450 Q 280 430 600 460 T 960 440 L 960 540 L 0 540 Z" fill="#22C55E" />
          <rect x="760" y="360" width="110" height="60" fill="#FFF8E6" stroke="#2B1B12" stroke-width="3" />
          <polygon points="745,360 815,310 885,360" fill="#E76F51" stroke="#2B1B12" stroke-width="3" />
        </svg>

        {#if !hasStartedAdventure}
          <div class="center-hero-prompt">
            <button type="button" class="start-adventure-hero-btn font-pixel" onclick={handleStartAdventureClick}>
              START GLOBAL STORY CAMPAIGN
            </button>
          </div>
        {/if}

        <!-- Lively Animated Hari Character Sprite -->
        <div class="lively-character-box">
          <div class="floating-emote-bubble font-pixel">
            <span class="font-data">[NOTE]</span>
            <span class="emote-text">HARI'S MISSION</span>
          </div>

          <div class="character-animated-sprite">
            <svg viewBox="0 0 64 64" width="84" height="84" shape-rendering="crispEdges">
              <rect x="16" y="16" width="32" height="6" fill="#FBBF24" />
              <rect x="20" y="10" width="24" height="8" fill="#F59E0B" />
              <rect x="20" y="14" width="24" height="3" fill="#92400E" />
              <rect x="22" y="18" width="20" height="12" fill="#D29A72" />
              <rect x="25" y="22" width="3" height="3" fill="#1C1917" />
              <rect x="36" y="22" width="3" height="3" fill="#1C1917" />
              <rect x="28" y="26" width="8" height="2" fill="#78350F" />
              <rect x="18" y="30" width="28" height="16" fill="#22C55E" />
              <rect x="22" y="32" width="20" height="16" fill="#2563EB" />
              <rect x="24" y="34" width="2" height="2" fill="#FDE047" />
              <rect x="38" y="34" width="2" height="2" fill="#FDE047" />
              <rect x="12" y="38" width="6" height="6" fill="#4ADE80" />
              <rect x="14" y="44" width="4" height="4" fill="#F97316" />
              <rect x="44" y="36" width="8" height="12" fill="#B45309" />
              <rect x="46" y="38" width="4" height="8" fill="#F59E0B" />
              <rect x="22" y="48" width="7" height="8" fill="#78350F" />
              <rect x="35" y="48" width="7" height="8" fill="#78350F" />
            </svg>
          </div>
          <div class="character-ground-shadow"></div>
        </div>

        <!-- Floating Speech Dialogue Box with pointer tail -->
        {#if hasStartedAdventure}
          <div class="floating-speech-bubble" onclick={handleNextIntroLine} role="presentation">
            <div class="dialogue-box-inner">
              <div class="dialogue-portrait-frame {isTyping ? 'speaking-pulse' : ''}">
                <svg viewBox="0 0 40 40" width="56" height="56" shape-rendering="crispEdges">
                  <rect width="40" height="40" fill="#142414" stroke="#00FF66" stroke-width="2" />
                  <rect x="8" y="8" width="24" height="4" fill="#FBBF24" />
                  <rect x="12" y="3" width="16" height="6" fill="#F59E0B" />
                  <rect x="12" y="7" width="16" height="2" fill="#92400E" />
                  <rect x="13" y="12" width="14" height="12" fill="#D29A72" />
                  <rect x="15" y="16" width="2" height="2" fill="#1C1917" />
                  <rect x="23" y="16" width="2" height="2" fill="#1C1917" />
                  <rect x="18" y="20" width="4" height="2" fill="#78350F" />
                  <rect x="10" y="24" width="20" height="14" fill="#22C55E" />
                  <rect x="14" y="26" width="12" height="12" fill="#2563EB" />
                </svg>
              </div>

              <div class="dialogue-text-column">
                <div class="dialogue-header-badge font-pixel">
                  <span>[ HARI ]</span>
                  <span class="sub-role font-retro">Local Farmer & NASA Delegate</span>
                  <span class="wisdom-tag">ANCESTRAL SEED-KEEPER</span>
                </div>

                <div class="dialogue-text-body font-retro">
                  {displayedText}
                  {#if isTyping}
                    <span class="cursor">▌</span>
                  {/if}
                </div>

                <div class="dialogue-footer-strip">
                  {#if introDialogueStep < prologueLines.length - 1}
                    <button type="button" class="click-to-continue-btn font-pixel" onclick={handleNextIntroLine}>
                      ▼ CLICK ANYWHERE TO CONTINUE ▼
                    </button>
                  {:else}
                    <div class="consent-buttons-row">
                      <button type="button" class="consent-btn yes font-pixel" onclick={handleConsentGiven}>
                        [ YES, LET'S SHIFT THE FIELD ]
                      </button>
                      <button type="button" class="consent-btn explore font-pixel" onclick={() => { if (onOpenOverworld) onOpenOverworld(); }}>
                        [ EXPLORE GBA OVERWORLD FIRST ]
                      </button>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

  {:else if currentStage === 'ACT1_KARNATAKA'}
    <!-- ACT 1: KARNATAKA (AMMA'S HEIRLOOM SEEDS & NASA SMAP) -->
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel">ACT 1: KARNATAKA &bull; SOWING IN THE DECEPTIVE DUST</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage">
        <svg viewBox="0 0 960 540" class="panorama-svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
          <rect x="0" y="0" width="960" height="90" fill="#FFF8EA" />
          <rect x="0" y="90" width="960" height="70" fill="#FDE68A" />
          <rect x="0" y="160" width="960" height="60" fill="#FDBA74" />
          <polygon points="0,320 180,240 380,320 600,220 800,320 960,260" fill="#2E5A44" />
          <rect x="0" y="320" width="960" height="220" fill="#8C3A27" />
          <rect x="760" y="340" width="120" height="70" fill="#FFF8E6" stroke="#2B1B12" stroke-width="3" />
          <polygon points="745,340 820,290 895,340" fill="#E76F51" stroke="#2B1B12" stroke-width="3" />
        </svg>

        <!-- NASA SMAP Satellite Telemetry Card Popout -->
        <div class="telemetry-hud-card font-pixel">
          <span class="telemetry-badge">NASA SMAP L4</span>
          <span class="telemetry-stat">Root-Zone Wetness: 0.28 m³/m³ @ 5cm Depth</span>
          <span class="telemetry-note font-retro">Optimal Sowing Window: Next 48 Hours</span>
        </div>

        <!-- Lively Animated Amma Character Sprite -->
        <div class="lively-character-box amma-sprite">
          <div class="floating-emote-bubble amma-bubble font-pixel">
            <span class="font-data">[CROP]</span>
            <span class="emote-text">AMMA'S HEIRLOOM RAGI</span>
          </div>

          <div class="character-animated-sprite">
            <svg viewBox="0 0 64 64" width="88" height="88" shape-rendering="crispEdges">
              <rect x="26" y="8" width="12" height="10" fill="#E5E7EB" />
              <rect x="24" y="6" width="6" height="4" fill="#FFFFFF" />
              <rect x="22" y="16" width="20" height="14" fill="#B45309" />
              <rect x="31" y="18" width="2" height="2" fill="#DC2626" />
              <rect x="25" y="22" width="3" height="2" fill="#1C1917" />
              <rect x="36" y="22" width="3" height="2" fill="#1C1917" />
              <rect x="28" y="26" width="8" height="2" fill="#78350F" />
              <rect x="18" y="30" width="28" height="26" fill="#F59E0B" />
              <polygon points="20,30 38,30 24,56 18,56" fill="#B91C1C" />
              <rect x="18" y="54" width="28" height="3" fill="#FDE047" />
              <rect x="24" y="38" width="16" height="5" fill="#D97706" />
              <rect x="26" y="36" width="12" height="3" fill="#FEF08A" />
              <rect x="24" y="56" width="6" height="4" fill="#78350F" />
              <rect x="34" y="56" width="6" height="4" fill="#78350F" />
            </svg>
          </div>
          <div class="character-ground-shadow"></div>
        </div>

        <!-- Floating Amma Speech Bubble -->
        <div class="floating-speech-bubble amma-bubble-frame">
          <div class="dialogue-box-inner">
            <div class="dialogue-portrait-frame amma-portrait {isTyping ? 'speaking-pulse' : ''}">
              <svg viewBox="0 0 40 40" width="58" height="58" shape-rendering="crispEdges">
                <rect width="40" height="40" fill="#241208" stroke="#FFB703" stroke-width="2" />
                <rect x="15" y="4" width="10" height="6" fill="#E5E7EB" />
                <rect x="12" y="10" width="16" height="14" fill="#B45309" />
                <rect x="19" y="12" width="2" height="2" fill="#DC2626" />
                <rect x="14" y="16" width="2" height="2" fill="#1C1917" />
                <rect x="24" y="16" width="2" height="2" fill="#1C1917" />
                <rect x="17" y="20" width="6" height="2" fill="#78350F" />
                <rect x="8" y="24" width="24" height="14" fill="#F59E0B" />
                <polygon points="12,24 22,24 16,38 10,38" fill="#B91C1C" />
                <rect x="15" y="24" width="2" height="14" fill="#FDE047" />
              </svg>
            </div>

            <div class="dialogue-text-column">
              <div class="dialogue-header-badge font-pixel" style="color: #FFB703;">
                <span>[ AMMA ]</span>
                <span class="sub-role font-retro">Farm Matriarch (Deccan Plateau)</span>
                <span class="wisdom-tag">HEIRLOOM KNOWLEDGE</span>
              </div>

              <div class="dialogue-text-body font-retro">
                {displayedText}
                {#if isTyping}
                  <span class="cursor" style="color: #FFB703;">▌</span>
                {/if}
              </div>

              <div class="dialogue-footer-strip">
                <button type="button" class="pixel-btn btn-warning" onclick={handleStartSowingGame}>
                  START PRECISION SOWING DRILL (NASA SMAP) →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if currentStage === 'GAME1_SOWING'}
    <SowingTimingGame onComplete={handleSowingComplete} />

  {:else if currentStage === 'ACT2_PUNJAB'}
    <!-- ACT 2: PUNJAB (COUSIN GURPREET & NASA GRACE) -->
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel" style="color: #00ffff;">ACT 2: PUNJAB &bull; THE ROARING TUBEWELLS</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage">
        <!-- Alluvial Plains with Canal -->
        <svg viewBox="0 0 960 540" class="panorama-svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
          <rect x="0" y="0" width="960" height="240" fill="#87CEEB" />
          <rect x="0" y="240" width="960" height="300" fill="#2E7D32" />
          <polygon points="200,540 380,240 460,240 340,540" fill="#0088cc" />
          <rect x="680" y="220" width="140" height="100" fill="#475569" stroke="#1E293B" stroke-width="3" />
          <rect x="720" y="180" width="20" height="40" fill="#334155" />
          <circle cx="730" cy="160" r="14" fill="#64748B" opacity="0.8" />
          <circle cx="740" cy="140" r="20" fill="#94A3B8" opacity="0.6" />
        </svg>

        <!-- NASA GRACE Telemetry Card Popout -->
        <div class="telemetry-hud-card font-pixel" style="border-color: #00ffff;">
          <span class="telemetry-badge" style="color: #00ffff; border-color: #00ffff;">NASA GRACE-FO</span>
          <span class="telemetry-stat">Subsurface Mass Deficit: -3.2 cm/yr Equiv Water Loss</span>
          <span class="telemetry-note font-retro">Aquifer Extraction Rate: 165% of Natural Recharge</span>
        </div>

        <!-- Lively Animated Gurpreet Character Sprite -->
        <div class="lively-character-box">
          <div class="floating-emote-bubble gurpreet-bubble font-pixel">
            <span class="font-data">[WATER]</span>
            <span class="emote-text">AQUIFER CRITICAL</span>
          </div>

          <div class="character-animated-sprite">
            <svg viewBox="0 0 64 64" width="88" height="88" shape-rendering="crispEdges">
              <rect x="18" y="8" width="28" height="12" fill="#F59E0B" />
              <rect x="22" y="4" width="20" height="6" fill="#D97706" />
              <rect x="22" y="20" width="20" height="14" fill="#B45309" />
              <rect x="20" y="26" width="24" height="10" fill="#1C1917" />
              <rect x="25" y="24" width="3" height="2" fill="#FFFFFF" />
              <rect x="36" y="24" width="3" height="2" fill="#FFFFFF" />
              <rect x="18" y="34" width="28" height="22" fill="#F8FAFC" />
              <rect x="18" y="34" width="6" height="16" fill="#1E3A8A" />
              <rect x="40" y="34" width="6" height="16" fill="#1E3A8A" />
              <rect x="22" y="54" width="7" height="6" fill="#475569" />
              <rect x="35" y="54" width="7" height="6" fill="#475569" />
            </svg>
          </div>
          <div class="character-ground-shadow"></div>
        </div>

        <!-- Floating Gurpreet Speech Bubble -->
        <div class="floating-speech-bubble gurpreet-bubble-frame">
          <div class="dialogue-box-inner">
            <div class="dialogue-portrait-frame {isTyping ? 'speaking-pulse' : ''}">
              <svg viewBox="0 0 40 40" width="58" height="58" shape-rendering="crispEdges">
                <rect width="40" height="40" fill="#0c1e28" stroke="#00ffff" stroke-width="2" />
                <rect x="8" y="4" width="24" height="10" fill="#F59E0B" />
                <rect x="11" y="2" width="18" height="4" fill="#D97706" />
                <rect x="12" y="14" width="16" height="12" fill="#B45309" />
                <rect x="10" y="18" width="20" height="10" fill="#1C1917" />
                <rect x="14" y="17" width="2" height="2" fill="#FFFFFF" />
                <rect x="24" y="17" width="2" height="2" fill="#FFFFFF" />
                <rect x="8" y="26" width="24" height="12" fill="#F8FAFC" />
                <rect x="8" y="26" width="4" height="12" fill="#1E3A8A" />
                <rect x="28" y="26" width="4" height="12" fill="#1E3A8A" />
              </svg>
            </div>

            <div class="dialogue-text-column">
              <div class="dialogue-header-badge font-pixel" style="color: #00ffff;">
                <span>[ GURPREET ]</span>
                <span class="sub-role font-retro">Wheat & Rice Farmer (Punjab Plain)</span>
                <span class="wisdom-tag" style="border-color: #00ffff; color: #00ffff;">SATELLITE WARNING</span>
              </div>

              <div class="dialogue-text-body font-retro">
                {displayedText}
                {#if isTyping}
                  <span class="cursor" style="color: #00ffff;">▌</span>
                {/if}
              </div>

              <div class="dialogue-footer-strip">
                <button type="button" class="pixel-btn btn-warning" onclick={handleStartTubewellGame}>
                  CALIBRATE TUBEWELL VALVES (NASA GRACE) →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if currentStage === 'GAME2_TUBEWELL'}
    <TubewellPumpGame onComplete={handleTubewellComplete} />

  {:else if currentStage === 'ACT3_IOWA'}
    <!-- ACT 3: IOWA, USA (FARMER SARAH & NASA GPM) -->
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel" style="color: #38bdf8;">ACT 3: IOWA &bull; THE PRAIRIE CLOUDBURST</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage">
        <!-- Rolling Prairie with Storm Clouds -->
        <svg viewBox="0 0 960 540" class="panorama-svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
          <rect x="0" y="0" width="960" height="220" fill="#1e1b4b" />
          <circle cx="200" cy="80" r="70" fill="#312e81" opacity="0.9" />
          <circle cx="360" cy="70" r="90" fill="#4338ca" opacity="0.8" />
          <circle cx="580" cy="90" r="80" fill="#312e81" opacity="0.9" />
          <polygon points="0,220 320,180 640,240 960,200 960,540 0,540" fill="#1c1917" />
          <path d="M 0 280 Q 240 240 480 290 T 960 260 L 960 540 L 0 540 Z" fill="#1e293b" />
          <path d="M 0 350 Q 300 310 620 360 T 960 330 L 960 540 L 0 540 Z" fill="#14532d" />
          <rect x="740" y="240" width="130" height="80" fill="#b91c1c" stroke="#450a0a" stroke-width="3" />
          <polygon points="720,240 805,180 890,240" fill="#ffffff" stroke="#450a0a" stroke-width="3" />
        </svg>

        <!-- NASA GPM Radar Telemetry Card Popout -->
        <div class="telemetry-hud-card font-pixel" style="border-color: #38bdf8;">
          <span class="telemetry-badge" style="color: #38bdf8; border-color: #38bdf8;">NASA GPM RADAR</span>
          <span class="telemetry-stat">Extreme Precipitation Surge: 92 mm/hr Peak Rate</span>
          <span class="telemetry-note font-retro">Sheet Runoff Risk: 85% on Unprotected Slopes</span>
        </div>

        <!-- Lively Animated Sarah Character Sprite -->
        <div class="lively-character-box">
          <div class="floating-emote-bubble sarah-bubble font-pixel">
            <span>⚡</span>
            <span class="emote-text">GPM CLOUDBURST ALERT</span>
          </div>

          <div class="character-animated-sprite">
            <svg viewBox="0 0 64 64" width="88" height="88" shape-rendering="crispEdges">
              <rect x="18" y="10" width="26" height="6" fill="#1D4ED8" />
              <rect x="16" y="14" width="14" height="3" fill="#1E40AF" />
              <rect x="42" y="14" width="6" height="12" fill="#78350F" />
              <rect x="22" y="16" width="20" height="14" fill="#FBCFE8" />
              <rect x="25" y="20" width="3" height="2" fill="#1E293B" />
              <rect x="36" y="20" width="3" height="2" fill="#1E293B" />
              <rect x="28" y="25" width="8" height="2" fill="#BE185D" />
              <rect x="18" y="30" width="28" height="20" fill="#DC2626" />
              <rect x="22" y="34" width="20" height="18" fill="#1E40AF" />
              <rect x="22" y="52" width="7" height="6" fill="#78350F" />
              <rect x="35" y="52" width="7" height="6" fill="#78350F" />
            </svg>
          </div>
          <div class="character-ground-shadow"></div>
        </div>

        <!-- Floating Sarah Speech Bubble -->
        <div class="floating-speech-bubble sarah-bubble-frame">
          <div class="dialogue-box-inner">
            <div class="dialogue-portrait-frame {isTyping ? 'speaking-pulse' : ''}">
              <svg viewBox="0 0 40 40" width="58" height="58" shape-rendering="crispEdges">
                <rect width="40" height="40" fill="#111c2e" stroke="#38bdf8" stroke-width="2" />
                <rect x="10" y="6" width="20" height="6" fill="#1D4ED8" />
                <rect x="8" y="10" width="10" height="3" fill="#1E40AF" />
                <rect x="12" y="12" width="16" height="14" fill="#FBCFE8" />
                <rect x="14" y="16" width="2" height="2" fill="#1E293B" />
                <rect x="24" y="16" width="2" height="2" fill="#1E293B" />
                <rect x="17" y="21" width="6" height="2" fill="#BE185D" />
                <rect x="8" y="26" width="24" height="12" fill="#DC2626" />
                <rect x="12" y="28" width="16" height="10" fill="#1E40AF" />
              </svg>
            </div>

            <div class="dialogue-text-column">
              <div class="dialogue-header-badge font-pixel" style="color: #38bdf8;">
                <span>[ SARAH ]</span>
                <span class="sub-role font-retro">Prairie Conservationist (Iowa Corn Belt)</span>
                <span class="wisdom-tag" style="border-color: #38bdf8; color: #38bdf8;">PRAIRIE RYE BUFFERS</span>
              </div>

              <div class="dialogue-text-body font-retro">
                {displayedText}
                {#if isTyping}
                  <span class="cursor" style="color: #38bdf8;">▌</span>
                {/if}
              </div>

              <div class="dialogue-footer-strip">
                <button type="button" class="pixel-btn btn-warning" onclick={handleStartSluiceGame}>
                  DEPLOY SLUICE & RYE SHIELD (NASA GPM) →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if currentStage === 'GAME3_SLUICE'}
    <SluiceRunoffGame onComplete={handleSluiceComplete} />

  {:else if currentStage === 'ACT4_SAHEL'}
    <!-- ACT 4: SAHEL (FARMER AMINA & NASA MERRA-2) -->
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel" style="color: #f97316;">ACT 4: SAHEL &bull; THE DESERT'S EDGE</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage">
        <!-- Arid Savanna & Acacia Trees -->
        <svg viewBox="0 0 960 540" class="panorama-svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
          <rect x="0" y="0" width="960" height="240" fill="#FFF7ED" />
          <circle cx="800" cy="120" r="50" fill="#FDBA74" />
          <rect x="0" y="240" width="960" height="300" fill="#D97706" />
          <polygon points="0,320 280,260 560,330 840,270 960,300 960,540 0,540" fill="#B45309" />
          <rect x="680" y="200" width="16" height="80" fill="#78350F" />
          <ellipse cx="688" cy="190" rx="60" ry="18" fill="#15803D" />
          <ellipse cx="688" cy="170" rx="40" ry="14" fill="#166534" />
        </svg>

        <!-- NASA MERRA-2 Telemetry Card Popout -->
        <div class="telemetry-hud-card font-pixel" style="border-color: #f97316;">
          <span class="telemetry-badge" style="color: #f97316; border-color: #f97316;">☀️ NASA MERRA-2</span>
          <span class="telemetry-stat">Extreme Heat Dome Anomaly: +4.8°C (Peak 46.4°C)</span>
          <span class="telemetry-note font-retro">ECOSTRESS Alert: Evapotranspiration Shutoff Imminent</span>
        </div>

        <!-- Lively Animated Amina Character Sprite -->
        <div class="lively-character-box">
          <div class="floating-emote-bubble amina-bubble font-pixel">
            <span class="font-data">[HEAT]</span>
            <span class="emote-text">ZAÏ PIT HEAT SHIELD</span>
          </div>

          <div class="character-animated-sprite">
            <svg viewBox="0 0 64 64" width="88" height="88" shape-rendering="crispEdges">
              <rect x="18" y="6" width="28" height="14" fill="#4338CA" />
              <rect x="22" y="2" width="20" height="6" fill="#312E81" />
              <rect x="22" y="20" width="20" height="14" fill="#9A3412" />
              <rect x="19" y="24" width="2" height="4" fill="#FDE047" />
              <rect x="25" y="24" width="3" height="2" fill="#FFFFFF" />
              <rect x="36" y="24" width="3" height="2" fill="#FFFFFF" />
              <rect x="28" y="29" width="8" height="2" fill="#451A03" />
              <rect x="18" y="34" width="28" height="22" fill="#15803D" />
              <rect x="22" y="56" width="6" height="4" fill="#78350F" />
              <rect x="34" y="56" width="6" height="4" fill="#78350F" />
            </svg>
          </div>
          <div class="character-ground-shadow"></div>
        </div>

        <!-- Floating Amina Speech Bubble -->
        <div class="floating-speech-bubble amina-bubble-frame">
          <div class="dialogue-box-inner">
            <div class="dialogue-portrait-frame {isTyping ? 'speaking-pulse' : ''}">
              <svg viewBox="0 0 40 40" width="58" height="58" shape-rendering="crispEdges">
                <rect width="40" height="40" fill="#24100c" stroke="#f97316" stroke-width="2" />
                <rect x="8" y="3" width="24" height="12" fill="#4338CA" />
                <rect x="11" y="1" width="18" height="4" fill="#312E81" />
                <rect x="12" y="14" width="16" height="13" fill="#9A3412" />
                <rect x="9" y="18" width="2" height="3" fill="#FDE047" />
                <rect x="14" y="18" width="2" height="2" fill="#FFFFFF" />
                <rect x="24" y="18" width="2" height="2" fill="#FFFFFF" />
                <rect x="17" y="22" width="6" height="2" fill="#451A03" />
                <rect x="8" y="26" width="24" height="12" fill="#15803D" />
              </svg>
            </div>

            <div class="dialogue-text-column">
              <div class="dialogue-header-badge font-pixel" style="color: #f97316;">
                <span>[ AMINA ]</span>
                <span class="sub-role font-retro">Zaï Pit Specialist (Sahel / Senegal)</span>
                <span class="wisdom-tag" style="border-color: #f97316; color: #f97316;">ANCESTRAL ZAÏ BASINS</span>
              </div>

              <div class="dialogue-text-body font-retro">
                {displayedText}
                {#if isTyping}
                  <span class="cursor" style="color: #f97316;">▌</span>
                {/if}
              </div>

              <div class="dialogue-footer-strip">
                <button type="button" class="pixel-btn btn-warning" onclick={handleStartHeatwaveGame}>
                  DEPLOY 45°C BIO-SHIELD (NASA MERRA-2) →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if currentStage === 'GAME4_HEATWAVE'}
    <HeatwaveShieldGame onComplete={handleHeatwaveComplete} />

  {:else if currentStage === 'ACT5_SUMMIT'}
    <!-- ACT 5: THE BANYAN COUNCIL & GLOBAL SUMMIT -->
    <CompareScreen 
      onSelectStrategy={handleAdoptStrategy}
      onBack={() => currentStage = 'GAME4_HEATWAVE'}
    />

  {:else if currentStage === 'FINALE_COMMUNITY'}
    <!-- FINALE: CELEBRATION ACROSS THE 4 REGIONS -->
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel">GLOBAL CLIMATE-SMART ALLIANCE ACHIEVED!</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage finale-backdrop">
        <div class="farmers-celebration-lineup">
          <div class="farmer-unit">
            <span class="farmer-name font-pixel">[AMMA]</span>
            <span class="farmer-origin font-retro">Karnataka</span>
          </div>
          <div class="farmer-unit">
            <span class="farmer-name font-pixel">[GURPREET]</span>
            <span class="farmer-origin font-retro">Punjab</span>
          </div>
          <div class="farmer-unit primary-hero">
            <span class="farmer-name font-pixel">[HARI]</span>
            <span class="farmer-origin font-retro">Kisanpur</span>
          </div>
          <div class="farmer-unit">
            <span class="farmer-name font-pixel">[SARAH]</span>
            <span class="farmer-origin font-retro">Iowa, USA</span>
          </div>
          <div class="farmer-unit">
            <span class="farmer-name font-pixel">[AMINA]</span>
            <span class="farmer-origin font-retro">Sahel, Africa</span>
          </div>
        </div>

        <!-- Finale Summary Scorecard -->
        <div class="finale-scorecard-card">
          <div class="scorecard-title font-pixel">
            ◆ 10-YEAR PLANETARY RESILIENCE SCORECARD ◆
          </div>
          <div class="scorecard-grid font-data">
            <div class="score-row">
              <span>NASA GRACE Aquifer Conservation:</span>
              <strong style="color: #00FF66;">+38% Groundwater Saved</strong>
            </div>
            <div class="score-row">
              <span>NASA GPM & SWOT Runoff Control:</span>
              <strong style="color: #00ffff;">Zero Topsoil Lost in 90mm Cloudbursts</strong>
            </div>
            <div class="score-row">
              <span>NASA SMAP Precision Root Moisture:</span>
              <strong style="color: #FFB703;">98% Seed Emergence Across 4 Biomes</strong>
            </div>
            <div class="score-row">
              <span>NASA MERRA-2 Canopy Thermal Protection:</span>
              <strong style="color: #f97316;">Bio-Shield Maintained Stomata Transpiration</strong>
            </div>
          </div>

          <div class="finale-actions-row">
            <button type="button" class="pixel-btn btn-warning" onclick={handlePlayAgain}>
              ↺ REPLAY STORY CAMPAIGN
            </button>
            {#if onOpenOverworld}
              <button type="button" class="pixel-btn btn-explore font-pixel" onclick={onOpenOverworld}>
                ▲ EXPLORE FREE-ROAM GBA OVERWORLD →
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Farmer's Field Pack Modal (Never resets story progress) -->
  <BackpackModal 
    isOpen={isBackpackOpen}
    regionId={currentRegion.id}
    {meters}
    onClose={() => isBackpackOpen = false}
    onSelectStrategy={(strat) => {
      meters.soilMoisture = Math.min(100, Math.max(10, meters.soilMoisture - strat.metrics.waterStressDelta * 0.4));
      meters.income = Math.max(20, Math.round(meters.income * (1 + strat.metrics.incomeReturn / 100)));
      meters.organicMatter = Math.min(100, Math.max(15, meters.organicMatter + strat.metrics.soilCarbonDelta * 0.5));
      meters.erosionRisk = Math.max(10, Math.min(90, meters.erosionRisk - 15));
    }}
  />
</div>

<style>
  .hari-arcade-viewport {
    width: 100%;
    max-width: 1040px;
    margin: 0 auto;
    padding: 12px;
    background: #060c07;
  }

  /* Chapter Fast-Travel & Navigation Rail */
  .story-chapter-strip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    background: linear-gradient(180deg, #0d1e13 0%, #08110b 100%);
    border: 2px solid #00FF66;
    border-radius: 6px;
    padding: 6px 12px;
    margin-bottom: 10px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 255, 102, 0.2);
    flex-wrap: wrap;
  }

  .strip-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .chapter-strip-title {
    font-size: 8px;
    color: #FFB703;
    margin-right: 4px;
  }

  .chapter-pill {
    background: #112417;
    border: 1px solid #1f4229;
    color: #88a896;
    font-size: 8px;
    padding: 3px 6px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .chapter-pill:hover {
    color: #00FF66;
    border-color: #00FF66;
  }

  .chapter-pill.active {
    background: #00FF66;
    color: #000000;
    font-weight: bold;
    border-color: #000000;
    box-shadow: 0 0 8px rgba(0, 255, 102, 0.5);
  }

  .strip-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .promo-strip-btn {
    background: linear-gradient(135deg, #FFB703 0%, #FF8500 100%);
    border: 1px solid #FFE699;
    color: #000000;
    font-size: 8px;
    font-weight: bold;
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(255, 183, 3, 0.4);
    transition: all 0.15s ease;
  }

  .promo-strip-btn:hover {
    background: #00FF66;
    border-color: #A0FFA0;
    box-shadow: 0 0 12px rgba(0, 255, 102, 0.6);
  }

  .overworld-jump-btn {
    background: #2a1f0a;
    border: 1px solid #FFB703;
    color: #FFB703;
    font-size: 8px;
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .overworld-jump-btn:hover {
    background: #FFB703;
    color: #000000;
    box-shadow: 0 0 10px rgba(255, 183, 3, 0.5);
  }

  /* Scene Frames */
  .scene-screen-frame {
    background: #08120b;
    border: 3px solid #00FF66;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 102, 0.2);
  }

  .arcade-header-bar {
    background: #060e08;
    border-bottom: 2px solid #00FF66;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .arcade-corn-glyphs {
    color: #FFB703;
    font-size: 12px;
  }

  .arcade-header-title {
    font-size: 10px;
    color: #00FF66;
    letter-spacing: 1px;
  }

  .panoramic-canvas-stage {
    position: relative;
    width: 100%;
    height: 520px;
    overflow: hidden;
    background: #000;
  }

  .panorama-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .center-hero-prompt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
  }

  .start-adventure-hero-btn {
    background: #FFB703;
    color: #000;
    border: 3px solid #000;
    box-shadow: 0 0 25px rgba(255, 183, 3, 0.7);
    font-size: 12px;
    padding: 16px 28px;
    cursor: pointer;
    letter-spacing: 1px;
    transition: all 0.15s ease;
    animation: heroPulse 1.8s infinite alternate;
  }

  @keyframes heroPulse {
    from { transform: scale(1); }
    to { transform: scale(1.06); }
  }

  /* NASA Telemetry HUD Badge inside Panoramic Scene */
  .telemetry-hud-card {
    position: absolute;
    top: 14px;
    right: 18px;
    z-index: 30;
    background: rgba(5, 14, 9, 0.88);
    border: 2px solid #00FF66;
    border-radius: 4px;
    padding: 6px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }

  .telemetry-badge {
    font-size: 8px;
    color: #00FF66;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
    padding-bottom: 2px;
  }

  .telemetry-stat {
    font-size: 8px;
    color: #ffffff;
    font-weight: bold;
  }

  .telemetry-note {
    font-size: 9px;
    color: #88a896;
  }

  /* Lively Animated Character Sprites */
  .lively-character-box {
    position: absolute;
    bottom: 20px;
    left: 45px;
    z-index: 25;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .lively-character-box.amma-sprite {
    left: 55px;
  }

  .floating-emote-bubble {
    background: rgba(8, 20, 13, 0.95);
    border: 2px solid #00FF66;
    color: #00FF66;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 7.5px;
    margin-bottom: 4px;
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.4);
    animation: emoteFloat 2.2s ease-in-out infinite alternate;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .floating-emote-bubble.amma-bubble {
    border-color: #FFB703;
    color: #FFB703;
    box-shadow: 0 0 10px rgba(255, 183, 3, 0.4);
  }

  .floating-emote-bubble.gurpreet-bubble {
    border-color: #00ffff;
    color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
  }

  .floating-emote-bubble.sarah-bubble {
    border-color: #38bdf8;
    color: #38bdf8;
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
  }

  .floating-emote-bubble.amina-bubble {
    border-color: #f97316;
    color: #f97316;
    box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
  }

  @keyframes emoteFloat {
    from { transform: translateY(0); }
    to { transform: translateY(-5px); }
  }

  .character-animated-sprite {
    animation: characterBreathe 2.4s ease-in-out infinite alternate;
    transform-origin: bottom center;
  }

  @keyframes characterBreathe {
    0% { transform: translateY(0) scale(1, 1); }
    50% { transform: translateY(-4px) scale(1.02, 0.98); }
    100% { transform: translateY(0) scale(1, 1); }
  }

  .character-ground-shadow {
    width: 44px;
    height: 8px;
    background: rgba(0, 0, 0, 0.45);
    border-radius: 50%;
    margin-top: -6px;
    animation: shadowScale 2.4s ease-in-out infinite alternate;
  }

  @keyframes shadowScale {
    0% { transform: scale(1); opacity: 0.45; }
    50% { transform: scale(0.85); opacity: 0.3; }
    100% { transform: scale(1); opacity: 0.45; }
  }

  /* True Floating Speech Bubble Box */
  .floating-speech-bubble {
    position: absolute;
    bottom: 22px;
    left: 170px;
    right: 28px;
    z-index: 35;
    background: linear-gradient(135deg, rgba(11, 24, 16, 0.96) 0%, rgba(6, 15, 10, 0.98) 100%);
    border: 3px solid #00FF66;
    border-radius: 8px;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 255, 102, 0.28);
    backdrop-filter: blur(10px);
    padding: 16px 20px;
    animation: floatDialogueBox 3.2s ease-in-out infinite alternate;
  }

  .floating-speech-bubble::before {
    content: '';
    position: absolute;
    bottom: 24px;
    left: -14px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 14px solid #00FF66;
  }

  .floating-speech-bubble::after {
    content: '';
    position: absolute;
    bottom: 26px;
    left: -10px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 11px solid #08120b;
  }

  .amma-bubble-frame {
    border-color: #FFB703;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 183, 3, 0.28);
  }
  .amma-bubble-frame::before { border-right-color: #FFB703; }

  .gurpreet-bubble-frame {
    border-color: #00ffff;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 255, 255, 0.28);
  }
  .gurpreet-bubble-frame::before { border-right-color: #00ffff; }

  .sarah-bubble-frame {
    border-color: #38bdf8;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.28);
  }
  .sarah-bubble-frame::before { border-right-color: #38bdf8; }

  .amina-bubble-frame {
    border-color: #f97316;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(249, 115, 22, 0.28);
  }
  .amina-bubble-frame::before { border-right-color: #f97316; }

  @keyframes floatDialogueBox {
    0% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0); }
  }

  .dialogue-box-inner {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .dialogue-portrait-frame {
    flex-shrink: 0;
    border: 2px solid #00FF66;
    background: #000;
  }

  .dialogue-portrait-frame.speaking-pulse {
    animation: portraitPulse 0.4s infinite alternate;
  }

  @keyframes portraitPulse {
    from { transform: scale(1); }
    to { transform: scale(1.04); }
  }

  .dialogue-portrait-frame.amma-portrait {
    border-color: #FFB703;
  }

  .dialogue-text-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dialogue-header-badge {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 10px;
    color: #00FF66;
    flex-wrap: wrap;
  }

  .wisdom-tag {
    font-size: 8px;
    border: 1px solid #00FF66;
    padding: 1px 5px;
    border-radius: 2px;
    color: #00FF66;
  }

  .sub-role {
    color: #88a896;
    font-size: 11px;
  }

  .dialogue-text-body {
    font-size: 14px;
    line-height: 1.5;
    color: #e5f5eb;
    min-height: 52px;
  }

  .cursor {
    color: #00FF66;
    animation: blink 0.8s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .dialogue-footer-strip {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
  }

  .click-to-continue-btn {
    background: none;
    border: none;
    color: #FFB703;
    font-size: 9px;
    cursor: pointer;
    animation: bounce 1s infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-3px); }
  }

  .consent-buttons-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .consent-btn {
    font-size: 9px;
    padding: 8px 12px;
    cursor: pointer;
    border: 2px solid;
    transition: all 0.15s ease;
  }

  .consent-btn.yes {
    background: #0f2e1b;
    border-color: #00FF66;
    color: #00FF66;
  }

  .consent-btn.yes:hover {
    background: #00FF66;
    color: #000;
  }

  .consent-btn.explore {
    background: #1f1b0a;
    border-color: #FFB703;
    color: #FFB703;
  }

  .consent-btn.explore:hover {
    background: #FFB703;
    color: #000;
  }

  .pixel-btn {
    font-family: 'Press Start 2P', monospace;
    font-size: 9px;
    padding: 10px 14px;
    border: 2px solid;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-warning {
    background: #241400;
    border-color: #FFB703;
    color: #FFB703;
  }

  .btn-warning:hover {
    background: #FFB703;
    color: #000;
  }

  .btn-explore {
    background: #0c1a10;
    border-color: #00FF66;
    color: #00FF66;
  }

  .btn-explore:hover {
    background: #00FF66;
    color: #000;
  }

  /* Finale Styling */
  .finale-backdrop {
    background: linear-gradient(180deg, #07120a 0%, #0d2616 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    padding: 24px;
  }

  .farmers-celebration-lineup {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .farmer-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid #1f3d2b;
    padding: 8px 12px;
  }

  .farmer-unit.primary-hero {
    border-color: #00FF66;
    background: rgba(0, 255, 102, 0.1);
  }

  .farmer-name {
    font-size: 9px;
    color: #FFB703;
    margin-bottom: 2px;
  }

  .farmer-origin {
    font-size: 10px;
    color: #88a896;
  }

  .finale-scorecard-card {
    background: #060e0a;
    border: 2px solid #00FF66;
    padding: 16px;
    max-width: 680px;
    width: 100%;
    margin-top: 16px;
  }

  .scorecard-title {
    font-size: 10px;
    color: #FFB703;
    text-align: center;
    border-bottom: 1px solid #1f3d2b;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .scorecard-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .score-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #e5f5eb;
    border-bottom: 1px dashed #14241b;
    padding-bottom: 4px;
  }

  .finale-actions-row {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
</style>
