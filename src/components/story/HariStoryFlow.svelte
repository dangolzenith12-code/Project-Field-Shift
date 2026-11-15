<script lang="ts">
  import type { RegionInfo, StrategyOption, FarmMeters } from '../../types/game';
  import CropMatchingGame from '../game/CropMatchingGame.svelte';
  import CrisisScenariosHub from '../game/CrisisScenariosHub.svelte';
  import CompareScreen from '../compare/CompareScreen.svelte';

  interface Props {
    currentRegion: RegionInfo;
    onViewStyleguide?: () => void;
  }

  let { currentRegion, onViewStyleguide }: Props = $props();

  // Story Stages
  type StoryStage = 
    | 'INTRO_CONSENT' 
    | 'AMMA_BLESSING' 
    | 'MATCHING_GAME' 
    | 'CRISIS_ALERT' 
    | 'SCENARIOS_HUB' 
    | 'STRATEGY_COMPARE' 
    | 'FINALE_COMMUNITY';

  let currentStage = $state<StoryStage>('INTRO_CONSENT');
  let introDialogueStep = $state(0);

  // Hari's Farm Meters
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

  // Chosen Strategy
  let chosenStrategy = $state<StrategyOption | null>(null);

  // Intro Dialogues
  const introLines = [
    "Hello! I am Hari. A young farmer who just received the responsibility of this land.",
    "My family and Amma have tended this soil for three generations. Today, the deeds are in my hands.",
    "I want to make sure our soil thrives, but I cannot do it alone. Will you help me with this season's farming?"
  ];

  function handleNextIntroLine() {
    if (introDialogueStep < introLines.length - 1) {
      introDialogueStep++;
    }
  }

  function handleConsentGiven() {
    currentStage = 'AMMA_BLESSING';
  }

  function handleStartMatchingGame() {
    currentStage = 'MATCHING_GAME';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleMatchingComplete() {
    // Boost meters for successful match
    meters.organicMatter += 12;
    meters.nitrogen += 15;
    meters.income += 35;
    // Advance to crisis alert
    currentStage = 'CRISIS_ALERT';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenScenariosHub() {
    currentStage = 'SCENARIOS_HUB';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectScenario(scenarioId: string) {
    // Open 3-Strategy Compare Matrix
    currentStage = 'STRATEGY_COMPARE';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAdoptStrategy(strat: StrategyOption) {
    chosenStrategy = strat;
    meters.soilMoisture = Math.min(100, Math.max(15, meters.soilMoisture - strat.metrics.waterStressDelta * 0.4));
    meters.organicMatter = Math.min(100, meters.organicMatter + strat.metrics.soilCarbonDelta * 0.5);
    meters.income = Math.round(meters.income * (1 + strat.metrics.incomeReturn / 100));
    meters.erosionRisk = Math.max(10, meters.erosionRisk - 15);

    currentStage = 'FINALE_COMMUNITY';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePlayAgain() {
    currentStage = 'INTRO_CONSENT';
    introDialogueStep = 0;
    chosenStrategy = null;
    meters = { ...currentRegion.initialMeters };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<div class="hari-flow-root">
  {#if currentStage === 'INTRO_CONSENT'}
    <!-- ACT 1: PEACEFUL INTRO & CONSENT (Images 3, 4, 5 style) -->
    <div class="vignette-stage">
      <div class="top-arcade-banner">
        <div class="banner-corn font-data">◆ ◆ ◆</div>
        <h2 class="banner-title font-display">FARMING JOURNEY: AMMA'S FIELD</h2>
        <div class="banner-corn font-data">◆ ◆ ◆</div>
      </div>

      <!-- Panoramic 16-Bit Valley Background -->
      <div class="panoramic-scene">
        <svg viewBox="0 0 800 420" class="panorama-svg" preserveAspectRatio="xMidYMid slice">
          <!-- Sky with morning sun -->
          <rect width="800" height="420" fill="#7EC8E3" />
          <circle cx="680" cy="90" r="50" fill="#FFD700" opacity="0.9" />

          <!-- Distant green mountain ranges -->
          <polygon points="0,260 140,160 300,280" fill="#3D7D4A" />
          <polygon points="180,270 380,140 560,280" fill="#2E6B3B" />
          <polygon points="460,280 620,170 800,280" fill="#3D7D4A" />

          <!-- Middleground Rolling Hills -->
          <path d="M 0 260 Q 220 220 460 250 T 800 240 L 800 420 L 0 420 Z" fill="#52A45C" />
          <path d="M 0 290 Q 300 260 580 280 T 800 270 L 800 420 L 0 420 Z" fill="#64B860" />

          <!-- Amma's Thatched Cottage on the hillside -->
          <rect x="520" y="220" width="120" height="60" fill="#FFF8E6" stroke="#2B1B12" stroke-width="2" />
          <polygon points="505,220 580,175 655,220" fill="#FFB703" stroke="#2B1B12" stroke-width="2" />

          <!-- Terraced field contours -->
          <line x1="80" y1="330" x2="380" y2="330" stroke="#3A7036" stroke-width="3" stroke-dasharray="8 6" />
          <line x1="420" y1="360" x2="720" y2="360" stroke="#3A7036" stroke-width="3" stroke-dasharray="8 6" />
        </svg>

        <!-- Young Hari Sprite on bottom left -->
        <div class="young-hari-container">
          <svg viewBox="0 0 64 64" width="80" height="80">
            <!-- Shadow -->
            <ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(0,0,0,0.3)" />
            <!-- Young Hari Head -->
            <circle cx="32" cy="24" r="14" fill="#D29A72" stroke="#2B1B12" stroke-width="2.5" />
            <!-- Young tousled hair -->
            <path d="M 18 20 C 18 10 46 10 46 20 Z" fill="#2B1B12" />
            <!-- Eyes & smile -->
            <circle cx="27" cy="24" r="2" fill="#2B1B12" />
            <circle cx="37" cy="24" r="2" fill="#2B1B12" />
            <path d="M 28 30 Q 32 34 36 30" stroke="#2B1B12" stroke-width="2" fill="none" />
            <!-- Farmer tunic with rolled sleeves -->
            <path d="M 18 36 C 22 32 42 32 46 36 L 46 54 L 18 54 Z" fill="#3FA34D" stroke="#2B1B12" stroke-width="2" />
            <!-- Boots -->
            <rect x="22" y="52" width="8" height="6" fill="#5A3818" stroke="#2B1B12" stroke-width="1.5" />
            <rect x="34" y="52" width="8" height="6" fill="#5A3818" stroke="#2B1B12" stroke-width="1.5" />
          </svg>
        </div>

        <!-- Dialogue Box on bottom right -->
        <div class="dialogue-box-panel">
          <div class="dialogue-tag font-data">
            <span>[SPEAKER: HARI]</span>
            <span class="sub-label">Young Farmer</span>
          </div>

          <p class="dialogue-content font-body">
            {introLines[introDialogueStep]}
          </p>

          <div class="dialogue-actions">
            {#if introDialogueStep < introLines.length - 1}
              <button type="button" class="action-btn-next font-data" onclick={handleNextIntroLine}>
                ▼ CLICK TO CONTINUE
              </button>
            {:else}
              <!-- Consent Prompt Choices -->
              <div class="consent-buttons-wrap">
                <button type="button" class="btn-consent font-display" onclick={handleConsentGiven}>
                  ◆ YES, LET'S FARM TOGETHER, HARI!
                </button>
                <button type="button" class="btn-consent secondary font-display" onclick={handleConsentGiven}>
                  ◆ I WILL HELP YOU, HARI
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

  {:else if currentStage === 'AMMA_BLESSING'}
    <!-- AMMA'S BLESSING CUTSCENE -->
    <div class="vignette-stage">
      <div class="top-arcade-banner">
        <div class="banner-corn font-data">◆ ◆ ◆</div>
        <h2 class="banner-title font-display">AMMA'S BLESSING & THE SOIL</h2>
        <div class="banner-corn font-data">◆ ◆ ◆</div>
      </div>

      <div class="panoramic-scene">
        <!-- Amma and Hari standing together -->
        <div class="amma-blessing-wrap">
          <div class="dialogue-box-panel" style="position: static; max-width: 650px; margin: 40px auto;">
            <div class="dialogue-tag font-data" style="color: #FFB703;">
              <span>[SPEAKER: AMMA]</span>
              <span class="sub-label">Farm Matriarch</span>
            </div>

            <p class="dialogue-content font-body" style="font-size: 1.1rem; line-height: 1.5;">
              "Blessings upon you both! Before you scatter a single seed into the ground, remember: the soil speaks before the crop grows. Look at the NASA satellite benchmarks and understand what our soil needs."
            </p>

            <div class="dialogue-actions" style="justify-content: center; margin-top: 14px;">
              <button type="button" class="btn-consent font-display" onclick={handleStartMatchingGame}>
                START SOIL & CROP COMPATIBILITY CHALLENGE →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if currentStage === 'MATCHING_GAME'}
    <!-- ACT 2: CROP & SOIL MATCHING CHALLENGE WITH NASA DATA (Image 2 style) -->
    <CropMatchingGame onComplete={handleMatchingComplete} />

  {:else if currentStage === 'CRISIS_ALERT'}
    <!-- ACT 3: THE CRISIS ARISES (Images 6, 7, 8 style) -->
    <div class="vignette-stage">
      <div class="top-arcade-banner">
        <div class="banner-corn font-data">▲ ▲ ▲</div>
        <h2 class="banner-title font-display" style="color: #E63946;">UNEXPECTED CLIMATE ANOMALY</h2>
        <div class="banner-corn font-data">▲ ▲ ▲</div>
      </div>

      <div class="panoramic-scene crisis-tone">
        <!-- Photo Popup Card in Center (Image 6 style) -->
        <div class="photo-crisis-card">
          <div class="crisis-badge font-display">▲ CROP FAILURE & WATER CRISIS ▲</div>
          
          <!-- Illustrated Drought Parched Earth Graphic -->
          <div class="photo-placeholder">
            <svg viewBox="0 0 320 160" width="100%" height="100%">
              <rect width="320" height="160" fill="#C29870" />
              <!-- Cracked earth jagged lines -->
              <path d="M 20 40 L 80 80 L 60 130 M 80 80 L 140 100 L 190 70 M 140 100 L 160 150 M 190 70 L 260 90 L 300 40 M 260 90 L 270 140" stroke="#2B1B12" stroke-width="3" fill="none" />
              <path d="M 120 20 L 150 50 L 210 30" stroke="#2B1B12" stroke-width="2.5" fill="none" />
              <!-- Withered drooping stalks -->
              <line x1="90" y1="120" x2="80" y2="70" stroke="#8A4B2A" stroke-width="3" />
              <line x1="210" y1="110" x2="225" y2="65" stroke="#8A4B2A" stroke-width="3" />
            </svg>
          </div>

          <div class="telemetry-readout font-data">
            <div>[NASA GRACE]: Groundwater sinking −3.2 cm/year</div>
            <div>[NASA POWER]: Summer heatwave +1.6°C above normal</div>
            <div>[NASA SMAP]: Root-zone moisture depleted to 0.22</div>
          </div>
        </div>

        <!-- Hari in Distress on Bottom Left -->
        <div class="young-hari-container">
          <svg viewBox="0 0 64 64" width="80" height="80">
            <circle cx="32" cy="24" r="14" fill="#D29A72" stroke="#2B1B12" stroke-width="2.5" />
            <path d="M 18 20 C 18 10 46 10 46 20 Z" fill="#2B1B12" />
            <circle cx="27" cy="25" r="2" fill="#2B1B12" />
            <circle cx="37" cy="25" r="2" fill="#2B1B12" />
            <!-- Worried mouth -->
            <path d="M 28 33 Q 32 29 36 33" stroke="#2B1B12" stroke-width="2" fill="none" />
            <path d="M 18 36 C 22 32 42 32 46 36 L 46 54 L 18 54 Z" fill="#3FA34D" stroke="#2B1B12" stroke-width="2" />
          </svg>
        </div>

        <!-- Dialogue Box on Bottom Right -->
        <div class="dialogue-box-panel">
          <div class="dialogue-tag font-data">
            <span>[SPEAKER: HARI]</span>
            <span class="sub-label">Concerned Farmer</span>
          </div>

          <p class="dialogue-content font-body">
            "The soil, the water, the weather... something is wrong! Amma's traditional calendar didn't foresee this dry spell. The tubewell is coughing sand and the topsoil is cracking."
          </p>

          <div class="dialogue-actions">
            <button type="button" class="btn-consent font-display" onclick={handleOpenScenariosHub}>
              EXPLORE CRISIS SCENARIOS & ADAPTATION →
            </button>
          </div>
        </div>
      </div>
    </div>

  {:else if currentStage === 'SCENARIOS_HUB'}
    <!-- ACT 4: CRISIS SCENARIOS HUB (Image 1 style) -->
    <CrisisScenariosHub 
      onSelectScenario={handleSelectScenario}
      onBack={() => currentStage = 'CRISIS_ALERT'}
    />

  {:else if currentStage === 'STRATEGY_COMPARE'}
    <!-- ACT 5: THE 3-STRATEGY COMPARE MATRIX -->
    <CompareScreen 
      onSelectStrategy={handleAdoptStrategy}
      onBack={() => currentStage = 'SCENARIOS_HUB'}
    />

  {:else if currentStage === 'FINALE_COMMUNITY'}
    <!-- ACT 6: THE COMMUNITY FINALE (Image 9 style) -->
    <div class="vignette-stage">
      <div class="top-arcade-banner">
        <div class="banner-corn font-data">◆ ◆ ◆</div>
        <h2 class="banner-title font-display" style="color: #00FF66;">HARVEST CELEBRATION & 2040 LEGACY</h2>
        <div class="banner-corn font-data">◆ ◆ ◆</div>
      </div>

      <div class="panoramic-scene finale-tone">
        <!-- Lineup of Global Regional Farmers (Image 9 style) -->
        <div class="farmers-lineup-row">
          <!-- Young Hari -->
          <div class="farmer-figure">
            <div class="figure-label font-data">Hari (You)</div>
            <div class="pixel-man-sprite">🧑🏽‍🌾</div>
          </div>
          <!-- Amma -->
          <div class="farmer-figure">
            <div class="figure-label font-data">Amma</div>
            <div class="pixel-man-sprite">👵🏾</div>
          </div>
          <!-- Indian Farmer (Punjab/Deccan) -->
          <div class="farmer-figure">
            <div class="figure-label font-data">Punjab [IN]</div>
            <div class="pixel-man-sprite">👳🏽‍♂️</div>
          </div>
          <!-- American Farmer (Iowa) -->
          <div class="farmer-figure">
            <div class="figure-label font-data">Iowa [US]</div>
            <div class="pixel-man-sprite">👨🏼‍🌾</div>
          </div>
          <!-- Sahel Farmer (Africa) -->
          <div class="farmer-figure">
            <div class="figure-label font-data">Sahel [SN]</div>
            <div class="pixel-man-sprite">🧔🏾‍♂️</div>
          </div>
        </div>

        <div class="dialogue-box-panel finale-box">
          <h3 class="font-display" style="color: #00FF66; font-size: 1.3rem; margin: 0; text-align: center;">
            ◆ MISSION ACCOMPLISHED: SUSTAINABLE FARMING ACHIEVED ◆
          </h3>
          <p class="font-body" style="text-align: center; font-size: 1rem; color: #FFFFFF;">
            Thank you for guiding Hari through the 50-year climate transition! By matching soil types to resilient crops and adopting the {chosenStrategy?.title ?? 'Resilience Plan'}, Amma's field has withstood climate volatility and secured a thriving harvest for the next generation.
          </p>

          <div class="final-stats-strip font-data">
            <span>Soil Organic Carbon: <strong>+24%</strong></span>
            <span>Aquifer Preserved: <strong>380 mm</strong></span>
            <span>Vault Earnings: <strong>260 Coins</strong></span>
          </div>

          <div style="display: flex; justify-content: center; margin-top: 8px;">
            <button type="button" class="btn-consent font-display" onclick={handlePlayAgain}>
              ↺ PLAY HARI'S ADVENTURE AGAIN
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .hari-flow-root {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-width: 960px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-2);
  }

  .vignette-stage {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Top Arcade Banner */
  .top-arcade-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #0A1C0A;
    border: 3px solid #3FA34D;
    border-radius: var(--radius-sm);
    padding: 10px 18px;
    box-shadow: 0 4px 0 var(--ink);
  }

  .banner-title {
    color: #00FF66;
    font-size: clamp(1.1rem, 2.8vw, 1.6rem);
    letter-spacing: 1px;
    text-align: center;
    margin: 0;
  }

  .banner-corn {
    color: #FFB703;
    font-size: 0.85rem;
    letter-spacing: 2px;
  }

  /* Panoramic Landscape */
  .panoramic-scene {
    position: relative;
    width: 100%;
    min-height: 440px;
    border: 3.5px solid var(--ink);
    border-radius: var(--radius);
    overflow: hidden;
    background-color: #7EC8E3;
    box-shadow: 0 6px 0 var(--ink);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .panoramic-scene.crisis-tone {
    background-color: #D29A72;
  }

  .panoramic-scene.finale-tone {
    background-color: #64B860;
    justify-content: space-between;
    padding: 24px 16px;
  }

  .panorama-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* Young Hari Sprite Box */
  .young-hari-container {
    position: absolute;
    bottom: 24px;
    left: 28px;
    z-index: 10;
  }

  /* Bottom Dialogue Box Panel */
  .dialogue-box-panel {
    position: relative;
    z-index: 12;
    margin: 0 16px 16px 120px;
    background-color: #0E1A12;
    border: 3px solid #00FF66;
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
    box-shadow: 0 4px 0 var(--ink);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dialogue-tag {
    display: flex;
    gap: 8px;
    font-size: 0.75rem;
    color: #00FF66;
    font-weight: bold;
    border-bottom: 1.5px dashed #1E3D24;
    padding-bottom: 4px;
  }

  .sub-label {
    color: #FFB703;
  }

  .dialogue-content {
    font-size: 1.05rem;
    color: #FFFFFF;
    line-height: 1.45;
  }

  .dialogue-actions {
    display: flex;
    justify-content: flex-end;
  }

  .action-btn-next {
    background: none;
    border: none;
    color: #00FF66;
    font-size: 0.78rem;
    cursor: pointer;
    animation: bounce 600ms infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(3px); }
  }

  .consent-buttons-wrap {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn-consent {
    background-color: #00FF66;
    color: #0A1C0A;
    border: 2px solid var(--ink);
    border-radius: var(--radius-pill);
    padding: 8px 18px;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--ink);
    transition: transform var(--fast) var(--spring);
  }

  .btn-consent:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--ink);
  }

  .btn-consent.secondary {
    background-color: #FFB703;
  }

  /* Photo Crisis Card (Image 6 style) */
  .photo-crisis-card {
    position: relative;
    z-index: 15;
    margin: 24px auto 10px auto;
    width: 380px;
    max-width: 90%;
    background-color: #141414;
    border: 3.5px solid #E63946;
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    box-shadow: 0 6px 0 var(--ink);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .crisis-badge {
    background-color: #E63946;
    color: #FFFFFF;
    text-align: center;
    padding: 3px;
    font-size: 0.82rem;
    font-weight: bold;
    letter-spacing: 0.5px;
  }

  .photo-placeholder {
    height: 130px;
    border: 2px solid #2B1B12;
    overflow: hidden;
  }

  .telemetry-readout {
    font-size: 0.72rem;
    color: #FFB703;
    line-height: 1.35;
    background-color: #0A0A0A;
    padding: 6px 8px;
    border: 1px solid #333;
  }

  /* Finale Community Row (Image 9 style) */
  .farmers-lineup-row {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    z-index: 10;
  }

  .farmer-figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .figure-label {
    font-size: 0.72rem;
    background-color: #0A1C0A;
    color: #00FF66;
    border: 1px solid #3FA34D;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .pixel-man-sprite {
    font-size: 2.8rem;
  }

  .finale-box {
    margin: 0 auto;
    max-width: 720px;
  }

  .final-stats-strip {
    display: flex;
    justify-content: space-around;
    gap: 12px;
    background-color: #14281A;
    border: 1px solid #3FA34D;
    padding: 8px;
    border-radius: 4px;
    color: #E0F2E9;
    font-size: 0.8rem;
    flex-wrap: wrap;
  }
</style>
