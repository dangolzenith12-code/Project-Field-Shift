<script lang="ts">
  import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';
  import type { RegionInfo, StrategyOption, FarmMeters } from '../../types/game';
  import { sfx } from '../../utils/sound';
  import CropMatchingGame from '../game/CropMatchingGame.svelte';
  import CrisisScenariosHub from '../game/CrisisScenariosHub.svelte';
  import CompareScreen from '../compare/CompareScreen.svelte';

  interface Props {
    currentRegion: RegionInfo;
    onViewStyleguide?: () => void;
    onOpenOverworld?: () => void;
  }

  let { currentRegion, onViewStyleguide, onOpenOverworld }: Props = $props();

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
  let displayedText = $state('');
  let isTyping = $state(true);
  let typingTimer: any = null;
  let hasStartedAdventure = $state(false);

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
    "Hello! I am Hari, a local farmer.",
    "My family and Amma have tended this soil for three generations. Today, the deeds are in my hands.",
    "I want to make sure our soil thrives, but I cannot do it alone. Will you help me with this season's farming?"
  ];

  // Typewriter effect with retro audio blip
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
    }, 24);
  }

  $effect(() => {
    if (currentStage === 'INTRO_CONSENT') {
      if (hasStartedAdventure) {
        startTypewriter(introLines[introDialogueStep]);
      }
    } else if (currentStage === 'AMMA_BLESSING') {
      startTypewriter("Blessings upon you both! Before you scatter a single seed into the ground, remember: the soil speaks before the crop grows. Look at the NASA satellite benchmarks and understand what our soil needs.");
    } else if (currentStage === 'CRISIS_ALERT') {
      sfx.playAlert();
      startTypewriter("The soil, the water, the weather... something's wrong! Amma's traditional calendar didn't foresee this heatwave. The tubewell is coughing sand and the topsoil is cracking.");
    }
    return () => {
      if (typingTimer) clearInterval(typingTimer);
    };
  });

  function handleStartAdventureClick() {
    sfx.playSelect();
    hasStartedAdventure = true;
    startTypewriter(introLines[0]);
  }

  function handleNextIntroLine() {
    sfx.playSelect();
    if (isTyping) {
      displayedText = introLines[introDialogueStep];
      isTyping = false;
      if (typingTimer) clearInterval(typingTimer);
      return;
    }
    if (introDialogueStep < introLines.length - 1) {
      introDialogueStep++;
    }
  }

  function handleConsentGiven() {
    sfx.playSelect();
    currentStage = 'AMMA_BLESSING';
  }

  function handleStartMatchingGame() {
    sfx.playSelect();
    currentStage = 'MATCHING_GAME';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleMatchingComplete() {
    sfx.playSuccess();
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {}

    meters.organicMatter += 14;
    meters.nitrogen += 16;
    meters.income += 40;

    setTimeout(() => {
      currentStage = 'CRISIS_ALERT';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }

  function handleOpenScenariosHub() {
    sfx.playSelect();
    currentStage = 'SCENARIOS_HUB';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectScenario(scenarioId: string) {
    sfx.playSelect();
    currentStage = 'STRATEGY_COMPARE';
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
    currentStage = 'INTRO_CONSENT';
    introDialogueStep = 0;
    hasStartedAdventure = false;
    chosenStrategy = null;
    meters = { ...currentRegion.initialMeters };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<div class="hari-arcade-viewport">
  {#if currentStage === 'INTRO_CONSENT'}
    <!-- ACT 1: PEACEFUL INTRO & CONSENT (Images 3, 4, 5 style) -->
    <div class="scene-screen-frame">
      <!-- Top Arcade Header Bar (Image 3 style) -->
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel">FARMING JOURNEY: AMMA'S FIELD</div>
        <div class="arcade-right-actions">
          <div class="arcade-corn-glyphs font-pixel">|||</div>
          <button type="button" class="retro-skip-btn font-pixel" onclick={() => currentStage = 'CRISIS_ALERT'}>
            SKIP ⏭
          </button>
        </div>
      </div>

      <!-- Panoramic 16-Bit Valley Sunset Background (Exact Image 3, 4, 5 style) -->
      <div class="panoramic-canvas-stage">
        <svg viewBox="0 0 960 540" class="panorama-svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
          <!-- Sky Gradient Layers -->
          <rect x="0" y="0" width="960" height="90" fill="#FFF8EA" />
          <rect x="0" y="90" width="960" height="70" fill="#FDE68A" />
          <rect x="0" y="160" width="960" height="60" fill="#FDBA74" />
          <rect x="0" y="220" width="960" height="60" fill="#FB923C" />

          <!-- Golden Sunset Sun Disc -->
          <rect x="680" y="130" width="60" height="60" fill="#FFFBEB" />
          <rect x="670" y="140" width="80" height="40" fill="#FEF08A" />
          <rect x="690" y="120" width="40" height="80" fill="#FEF08A" />

          <!-- Pixel Clouds on Left -->
          <rect x="10" y="60" width="160" height="50" fill="#F59E0B" />
          <rect x="30" y="40" width="120" height="30" fill="#FB923C" />
          <rect x="50" y="30" width="80" height="20" fill="#FDE68A" />
          <!-- Cloud Dithering staircases -->
          <rect x="170" y="80" width="30" height="20" fill="#F59E0B" />
          <rect x="140" y="100" width="40" height="20" fill="#F59E0B" />

          <!-- Pixel Clouds on Right -->
          <rect x="740" y="80" width="210" height="60" fill="#F59E0B" />
          <rect x="780" y="60" width="160" height="40" fill="#FB923C" />
          <rect x="820" y="40" width="110" height="30" fill="#FDE68A" />

          <!-- Distant Dark Pine Green Mountains (Multi-tiered pixel peaks) -->
          <!-- Mountain Tier 1 (Background Silhouette) -->
          <polygon points="0,320 80,240 180,320 280,210 400,320 540,190 680,320 800,220 960,320" fill="#0F2E1B" />
          <!-- Mountain Tier 2 (Middle Ridge with highlights) -->
          <polygon points="0,340 120,260 220,340 340,240 480,340 600,250 720,340 860,260 960,340" fill="#1C4A2B" />
          <polygon points="120,260 170,340 220,340" fill="#2E6B3B" />
          <polygon points="340,240 410,340 480,340" fill="#2E6B3B" />
          <polygon points="600,250 660,340 720,340" fill="#2E6B3B" />

          <!-- Horizontal Reflective Lake / River in Center -->
          <rect x="0" y="320" width="960" height="60" fill="#C5A582" />
          <!-- Water Dither Horizontal Stripes reflecting sky and mountains -->
          <rect x="0" y="324" width="960" height="4" fill="#A4815F" />
          <rect x="80" y="332" width="240" height="4" fill="#E2C9A6" />
          <rect x="420" y="336" width="300" height="4" fill="#E2C9A6" />
          <rect x="180" y="344" width="200" height="4" fill="#8E6A49" />
          <rect x="520" y="348" width="260" height="4" fill="#8E6A49" />
          <rect x="0" y="356" width="960" height="4" fill="#755437" />

          <!-- Foreground Terraced Agricultural Green Fields -->
          <!-- Terraced Field Tier 1 -->
          <path d="M 0 360 Q 240 330 520 360 T 960 350 L 960 540 L 0 540 Z" fill="#2D6A4F" />
          <!-- Terraced Field Tier 2 -->
          <path d="M 0 400 Q 340 370 660 410 T 960 390 L 960 540 L 0 540 Z" fill="#40916C" />
          <!-- Terraced Field Tier 3 (Lush green foreground) -->
          <path d="M 0 450 Q 280 430 600 460 T 960 440 L 960 540 L 0 540 Z" fill="#52B788" />

          <!-- Checkered Crop Row Textures -->
          {#each [40, 100, 180, 260, 360, 480, 580, 700, 820] as x}
            <rect x={x} y="440" width="16" height="6" fill="#1B4332" />
            <rect x={x+20} y="460" width="20" height="6" fill="#1B4332" />
            <rect x={x+8} y="480" width="24" height="6" fill="#1B4332" />
          {/each}

          <!-- Amma's Thatched Cottage on the right hill -->
          <rect x="760" y="360" width="110" height="60" fill="#FFF8E6" stroke="#2B1B12" stroke-width="3" />
          <polygon points="745,360 815,310 885,360" fill="#E76F51" stroke="#2B1B12" stroke-width="3" />
          <rect x="800" y="380" width="24" height="40" fill="#5A3818" />
          <rect x="775" y="375" width="16" height="16" fill="#87CEEB" stroke="#2B1B12" stroke-width="2" />
        </svg>

        <!-- Center Glowing Button (Image 3 style: START ADVENTURE) -->
        {#if !hasStartedAdventure}
          <div class="center-hero-prompt">
            <button type="button" class="start-adventure-hero-btn font-pixel" onclick={handleStartAdventureClick}>
              START ADVENTURE
            </button>
          </div>
        {/if}

        <!-- Young Hari Sprite on bottom left (Exact Image 3, 4, 5 style) -->
        <div class="character-sprite-holder">
          <svg viewBox="0 0 64 64" width="84" height="84" shape-rendering="crispEdges">
            <!-- Shadow on ground -->
            <rect x="18" y="56" width="28" height="4" fill="rgba(0,0,0,0.3)" />
            <!-- Straw Hat (Henry style) -->
            <rect x="16" y="16" width="32" height="6" fill="#FBBF24" />
            <rect x="20" y="10" width="24" height="8" fill="#F59E0B" />
            <rect x="20" y="14" width="24" height="3" fill="#92400E" />
            <!-- Face & Hair -->
            <rect x="22" y="18" width="20" height="12" fill="#D29A72" />
            <rect x="25" y="22" width="3" height="3" fill="#1C1917" />
            <rect x="36" y="22" width="3" height="3" fill="#1C1917" />
            <rect x="28" y="26" width="8" height="2" fill="#78350F" />
            <!-- Green Farmer Shirt -->
            <rect x="18" y="30" width="28" height="16" fill="#22C55E" />
            <!-- Denim Overalls -->
            <rect x="22" y="32" width="20" height="16" fill="#2563EB" />
            <rect x="24" y="34" width="2" height="2" fill="#FDE047" />
            <rect x="38" y="34" width="2" height="2" fill="#FDE047" />
            <!-- Holding Green Sprout in Left Hand -->
            <rect x="12" y="38" width="6" height="6" fill="#4ADE80" />
            <rect x="14" y="44" width="4" height="4" fill="#F97316" />
            <!-- Wooden Shield / Tool on Right Arm -->
            <rect x="44" y="36" width="8" height="12" fill="#B45309" />
            <rect x="46" y="38" width="4" height="8" fill="#F59E0B" />
            <!-- Leather Boots -->
            <rect x="22" y="48" width="7" height="8" fill="#78350F" />
            <rect x="35" y="48" width="7" height="8" fill="#78350F" />
          </svg>
        </div>

        <!-- Terminal Dialogue Box on bottom center/right (Image 3, 4, 5 style) -->
        {#if hasStartedAdventure}
          <div class="terminal-dialogue-box">
            <div class="dialogue-box-inner">
              <!-- Hari Portrait in Dialogue Box -->
              <div class="dialogue-portrait-frame">
                <svg viewBox="0 0 40 40" width="54" height="54" shape-rendering="crispEdges">
                  <rect width="40" height="40" fill="#142414" stroke="#00FF66" stroke-width="2" />
                  <!-- Straw Hat -->
                  <rect x="8" y="8" width="24" height="4" fill="#FBBF24" />
                  <rect x="12" y="3" width="16" height="6" fill="#F59E0B" />
                  <rect x="12" y="7" width="16" height="2" fill="#92400E" />
                  <!-- Face -->
                  <rect x="13" y="12" width="14" height="12" fill="#D29A72" />
                  <rect x="15" y="16" width="2" height="2" fill="#1C1917" />
                  <rect x="23" y="16" width="2" height="2" fill="#1C1917" />
                  <rect x="18" y="20" width="4" height="2" fill="#78350F" />
                  <!-- Green Shirt & Blue Overalls -->
                  <rect x="10" y="24" width="20" height="14" fill="#22C55E" />
                  <rect x="14" y="26" width="12" height="12" fill="#2563EB" />
                  <rect x="15" y="27" width="2" height="2" fill="#FDE047" />
                  <rect x="23" y="27" width="2" height="2" fill="#FDE047" />
                </svg>
              </div>

              <div class="dialogue-text-column">
                <div class="dialogue-header-badge font-pixel">
                  <span>[ HARI ]</span>
                  <span class="sub-role font-retro">Local Farmer</span>
                </div>

                <div class="dialogue-text-body font-retro">
                  {displayedText}
                  {#if isTyping}
                    <span class="cursor">▌</span>
                  {/if}
                </div>

                <div class="dialogue-footer-strip">
                  {#if introDialogueStep < introLines.length - 1}
                    <button type="button" class="click-to-continue-btn font-pixel" onclick={handleNextIntroLine}>
                      ▼ CLICK TO CONTINUE ▼
                    </button>
                  {:else}
                    <!-- Consent Question Choices -->
                    <div class="consent-buttons-cluster">
                      <button type="button" class="pixel-btn" onclick={handleConsentGiven}>
                        ◆ YES, LET'S FARM TOGETHER!
                      </button>
                      <button type="button" class="pixel-btn btn-warning" onclick={handleConsentGiven}>
                        ◆ I WILL HELP YOU, HARI
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

  {:else if currentStage === 'AMMA_BLESSING'}
    <!-- AMMA'S BLESSING CUTSCENE WITH AMMA'S CHARACTER IMAGE & PORTRAIT -->
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel">AMMA'S BLESSING & THE SOIL</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage">
        <!-- Panoramic Background SVG -->
        <svg viewBox="0 0 960 540" class="panorama-svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
          <rect x="0" y="0" width="960" height="90" fill="#FFF8EA" />
          <rect x="0" y="90" width="960" height="70" fill="#FDE68A" />
          <rect x="0" y="160" width="960" height="60" fill="#FDBA74" />
          <rect x="0" y="220" width="960" height="60" fill="#FB923C" />
          <rect x="680" y="130" width="60" height="60" fill="#FFFBEB" />
          <polygon points="0,320 80,240 180,320 280,210 400,320 540,190 680,320 800,220 960,320" fill="#0F2E1B" />
          <polygon points="0,340 120,260 220,340 340,240 480,340 600,250 720,340 860,260 960,340" fill="#1C4A2B" />
          <rect x="0" y="320" width="960" height="60" fill="#C5A582" />
          <path d="M 0 360 Q 240 330 520 360 T 960 350 L 960 540 L 0 540 Z" fill="#2D6A4F" />
          <path d="M 0 400 Q 340 370 660 410 T 960 390 L 960 540 L 0 540 Z" fill="#40916C" />
          <path d="M 0 450 Q 280 430 600 460 T 960 440 L 960 540 L 0 540 Z" fill="#52B788" />
          <rect x="760" y="360" width="110" height="60" fill="#FFF8E6" stroke="#2B1B12" stroke-width="3" />
          <polygon points="745,360 815,310 885,360" fill="#E76F51" stroke="#2B1B12" stroke-width="3" />
        </svg>

        <!-- Amma's Pixel Art Character Standing Sprite on bottom left -->
        <div class="character-sprite-holder amma-sprite">
          <svg viewBox="0 0 64 64" width="88" height="88" shape-rendering="crispEdges">
            <!-- Ground Shadow -->
            <rect x="18" y="58" width="28" height="4" fill="rgba(0,0,0,0.35)" />
            <!-- Silver Hair Bun with White Jasmine Flowers -->
            <rect x="26" y="8" width="12" height="10" fill="#E5E7EB" />
            <rect x="24" y="6" width="6" height="4" fill="#FFFFFF" />
            <rect x="34" y="6" width="6" height="4" fill="#FFFFFF" />
            <!-- Face & Warm Skin -->
            <rect x="22" y="16" width="20" height="14" fill="#B45309" />
            <!-- Red Bindi / Tilak -->
            <rect x="31" y="18" width="2" height="2" fill="#DC2626" />
            <!-- Eyes & Kind Smile -->
            <rect x="25" y="22" width="3" height="2" fill="#1C1917" />
            <rect x="36" y="22" width="3" height="2" fill="#1C1917" />
            <rect x="28" y="26" width="8" height="2" fill="#78350F" />
            <!-- Gold Earrings -->
            <rect x="20" y="22" width="2" height="3" fill="#FDE047" />
            <rect x="42" y="22" width="2" height="3" fill="#FDE047" />
            <!-- Traditional Saree - Turmeric Body with Madder Red Pallu -->
            <rect x="18" y="30" width="28" height="26" fill="#F59E0B" />
            <!-- Diagonal Red Pallu draped over shoulder -->
            <polygon points="20,30 38,30 24,56 18,56" fill="#B91C1C" />
            <!-- Gold Zari Border on Pallu and Hem -->
            <rect x="18" y="54" width="28" height="3" fill="#FDE047" />
            <!-- Gold Bangles on Wrists -->
            <rect x="15" y="40" width="3" height="4" fill="#FDE047" />
            <rect x="46" y="40" width="3" height="4" fill="#FDE047" />
            <!-- Holding Traditional Brass Thali with Heritage Seeds -->
            <rect x="24" y="38" width="16" height="5" fill="#D97706" />
            <rect x="26" y="36" width="12" height="3" fill="#FEF08A" />
            <!-- Sandals -->
            <rect x="24" y="56" width="6" height="4" fill="#78350F" />
            <rect x="34" y="56" width="6" height="4" fill="#78350F" />
          </svg>
        </div>

        <!-- Amma's Terminal Dialogue Box with Portrait -->
        <div class="terminal-dialogue-box amma-box">
          <div class="dialogue-box-inner">
            <!-- Amma Portrait Avatar Frame -->
            <div class="dialogue-portrait-frame amma-portrait">
              <svg viewBox="0 0 40 40" width="58" height="58" shape-rendering="crispEdges">
                <rect width="40" height="40" fill="#241208" stroke="#FFB703" stroke-width="2" />
                <!-- Silver Hair Bun with White Flowers -->
                <rect x="15" y="4" width="10" height="6" fill="#E5E7EB" />
                <rect x="17" y="3" width="6" height="2" fill="#FFFFFF" />
                <!-- Face -->
                <rect x="12" y="10" width="16" height="14" fill="#B45309" />
                <!-- Bindi -->
                <rect x="19" y="12" width="2" height="2" fill="#DC2626" />
                <!-- Eyes & Smile -->
                <rect x="14" y="16" width="2" height="2" fill="#1C1917" />
                <rect x="24" y="16" width="2" height="2" fill="#1C1917" />
                <rect x="17" y="20" width="6" height="2" fill="#78350F" />
                <!-- Gold Earrings -->
                <rect x="10" y="16" width="2" height="3" fill="#FDE047" />
                <rect x="28" y="16" width="2" height="3" fill="#FDE047" />
                <!-- Turmeric Saree with Red Pallu & Gold Border -->
                <rect x="8" y="24" width="24" height="14" fill="#F59E0B" />
                <polygon points="12,24 22,24 16,38 10,38" fill="#B91C1C" />
                <rect x="15" y="24" width="2" height="14" fill="#FDE047" />
              </svg>
            </div>

            <div class="dialogue-text-column">
              <div class="dialogue-header-badge font-pixel" style="color: #FFB703;">
                <span>[ AMMA ]</span>
                <span class="sub-role font-retro">Farm Matriarch</span>
              </div>

              <div class="dialogue-text-body font-retro" style="font-size: 1.4rem;">
                {displayedText}
                {#if isTyping}
                  <span class="cursor" style="color: #FFB703;">▌</span>
                {/if}
              </div>

              <div class="dialogue-footer-strip" style="margin-top: 10px;">
                <button type="button" class="pixel-btn btn-warning" onclick={handleStartMatchingGame}>
                  START WATER MANAGEMENT & CROP MATCHING CHALLENGE →
                </button>
              </div>
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
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel" style="color: #E63946;">FARMING CRISIS: AMMA'S FIELD</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage crisis-dusk">
        <!-- Center Photo Box Popup (Image 6, 7, 8 style) -->
        <div class="crisis-photo-card">
          <div class="crisis-banner-header font-pixel">
            ▲ CROP FAILURE ▲
          </div>
          <!-- Photographic crop failure representation -->
          <div class="photo-viewport">
            <svg viewBox="0 0 340 180" width="100%" height="100%" shape-rendering="crispEdges">
              <rect width="340" height="180" fill="#B88458" />
              <!-- Cracked parched silt soil -->
              <path d="M 30 30 L 90 70 L 70 140 M 90 70 L 160 90 L 220 50 M 160 90 L 180 150 M 220 50 L 280 80 L 310 30" stroke="#1E140C" stroke-width="3" fill="none" />
              <!-- Drooping corn stalks -->
              <line x1="80" y1="130" x2="70" y2="70" stroke="#5A3818" stroke-width="4" />
              <path d="M 70 70 Q 55 50 40 65" stroke="#8A4B2A" stroke-width="3" fill="none" />
              <line x1="160" y1="140" x2="175" y2="75" stroke="#5A3818" stroke-width="4" />
              <path d="M 175 75 Q 195 55 210 70" stroke="#8A4B2A" stroke-width="3" fill="none" />
              <line x1="250" y1="120" x2="240" y2="60" stroke="#5A3818" stroke-width="4" />
            </svg>
          </div>

          <div class="nasa-telemetry-box font-data">
            <div>• [NASA GRACE]: Groundwater sinking −3.2 cm/year</div>
            <div>• [NASA POWER]: Summer heatwave +1.6°C above baseline</div>
            <div>• [NASA SMAP]: Root-zone moisture depleted to 0.22</div>
          </div>
        </div>

        <!-- Hari Sprite on Bottom Left -->
        <div class="character-sprite-holder">
          <svg viewBox="0 0 64 64" width="84" height="84" shape-rendering="crispEdges">
            <rect x="18" y="56" width="28" height="4" fill="rgba(0,0,0,0.3)" />
            <rect x="16" y="16" width="32" height="6" fill="#FBBF24" />
            <rect x="20" y="10" width="24" height="8" fill="#F59E0B" />
            <rect x="20" y="14" width="24" height="3" fill="#92400E" />
            <rect x="22" y="18" width="20" height="12" fill="#D29A72" />
            <rect x="25" y="22" width="3" height="3" fill="#1C1917" />
            <rect x="36" y="22" width="3" height="3" fill="#1C1917" />
            <!-- Worried mouth -->
            <rect x="27" y="27" width="10" height="2" fill="#78350F" />
            <rect x="18" y="30" width="28" height="16" fill="#22C55E" />
            <rect x="22" y="32" width="20" height="16" fill="#2563EB" />
            <rect x="22" y="48" width="7" height="8" fill="#78350F" />
            <rect x="35" y="48" width="7" height="8" fill="#78350F" />
          </svg>
        </div>

        <!-- Terminal Dialogue Box on bottom center/right -->
        <div class="terminal-dialogue-box">
          <div class="dialogue-box-inner">
            <!-- Worried Hari Portrait in Dialogue Box -->
            <div class="dialogue-portrait-frame">
              <svg viewBox="0 0 40 40" width="54" height="54" shape-rendering="crispEdges">
                <rect width="40" height="40" fill="#241010" stroke="#E63946" stroke-width="2" />
                <rect x="8" y="8" width="24" height="4" fill="#FBBF24" />
                <rect x="12" y="3" width="16" height="6" fill="#F59E0B" />
                <rect x="12" y="7" width="16" height="2" fill="#92400E" />
                <rect x="13" y="12" width="14" height="12" fill="#D29A72" />
                <rect x="15" y="16" width="2" height="2" fill="#1C1917" />
                <rect x="23" y="16" width="2" height="2" fill="#1C1917" />
                <!-- Worried open mouth -->
                <rect x="18" y="21" width="4" height="2" fill="#78350F" />
                <rect x="10" y="24" width="20" height="14" fill="#22C55E" />
                <rect x="14" y="26" width="12" height="12" fill="#2563EB" />
              </svg>
            </div>

            <div class="dialogue-text-column">
              <div class="dialogue-header-badge font-pixel" style="color: #E63946;">
                <span>[ HARI ]</span>
                <span class="sub-role font-retro">Distressed Farmer</span>
              </div>

              <div class="dialogue-text-body font-retro">
                {displayedText}
                {#if isTyping}
                  <span class="cursor" style="color: #E63946;">▌</span>
                {/if}
              </div>

              <div class="dialogue-footer-strip">
                <button type="button" class="pixel-btn btn-danger" onclick={handleOpenScenariosHub}>
                  EXPLORE CRISIS SCENARIOS & ADAPTATION →
                </button>
              </div>
            </div>
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
    <div class="scene-screen-frame">
      <div class="arcade-header-bar">
        <div class="arcade-corn-glyphs font-pixel">|||</div>
        <div class="arcade-header-title font-pixel">SUSTAINABLE FARMING ACHIEVED!</div>
        <div class="arcade-corn-glyphs font-pixel">|||</div>
      </div>

      <div class="panoramic-canvas-stage finale-backdrop">
        <!-- Global Farmers Lineup (NO emojis, pure pixel art characters!) -->
        <div class="global-farmers-lineup">
          <!-- Hari -->
          <div class="farmer-unit">
            <span class="flag-tag font-pixel">HARI</span>
            <div class="farmer-pixel-art">
              <svg viewBox="0 0 32 32" width="48" height="48" shape-rendering="crispEdges">
                <rect x="8" y="6" width="16" height="4" fill="#FBBF24" />
                <rect x="10" y="2" width="12" height="4" fill="#F59E0B" />
                <rect x="11" y="10" width="10" height="8" fill="#D29A72" />
                <rect x="9" y="18" width="14" height="10" fill="#22C55E" />
                <rect x="11" y="20" width="10" height="10" fill="#2563EB" />
              </svg>
            </div>
          </div>

          <!-- Amma -->
          <div class="farmer-unit">
            <span class="flag-tag font-pixel">AMMA</span>
            <div class="farmer-pixel-art">
              <svg viewBox="0 0 32 32" width="48" height="48" shape-rendering="crispEdges">
                <circle cx="16" cy="8" r="5" fill="#E5E7EB" />
                <rect x="11" y="10" width="10" height="8" fill="#B45309" />
                <rect x="8" y="18" width="16" height="12" fill="#F59E0B" />
                <rect x="12" y="18" width="8" height="12" fill="#B91C1C" />
              </svg>
            </div>
          </div>

          <!-- Punjab Farmer -->
          <div class="farmer-unit">
            <span class="flag-tag font-pixel">PUNJAB</span>
            <div class="farmer-pixel-art">
              <svg viewBox="0 0 32 32" width="48" height="48" shape-rendering="crispEdges">
                <rect x="10" y="4" width="12" height="6" fill="#F97316" />
                <rect x="11" y="10" width="10" height="8" fill="#D29A72" />
                <rect x="9" y="18" width="14" height="12" fill="#FFFFFF" />
              </svg>
            </div>
          </div>

          <!-- Deccan Farmer -->
          <div class="farmer-unit">
            <span class="flag-tag font-pixel">DECCAN</span>
            <div class="farmer-pixel-art">
              <svg viewBox="0 0 32 32" width="48" height="48" shape-rendering="crispEdges">
                <rect x="8" y="6" width="16" height="4" fill="#EAB308" />
                <rect x="11" y="10" width="10" height="8" fill="#78350F" />
                <rect x="9" y="18" width="14" height="12" fill="#15803D" />
              </svg>
            </div>
          </div>

          <!-- Sahel Farmer -->
          <div class="farmer-unit">
            <span class="flag-tag font-pixel">SAHEL</span>
            <div class="farmer-pixel-art">
              <svg viewBox="0 0 32 32" width="48" height="48" shape-rendering="crispEdges">
                <rect x="10" y="4" width="12" height="6" fill="#1E3A8A" />
                <rect x="11" y="10" width="10" height="8" fill="#451A03" />
                <rect x="9" y="18" width="14" height="12" fill="#3B82F6" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Ending Dialogue Box -->
        <div class="terminal-dialogue-box finale-dialogue">
          <div class="dialogue-header-badge font-pixel" style="color: #00FF66; text-align: center; justify-content: center;">
            ◆ THANK YOU FOR PLAYING NASA FARMING GAME! ◆
          </div>

          <p class="dialogue-text-body font-retro" style="text-align: center; font-size: 1.35rem;">
            You have learned about climate challenges and sustainable farming practices! By rotating deep-rooted millets and nitrogen-fixing pulses, Amma's field has withstood climate volatility and secured a thriving 2040 harvest for the next generation.
          </p>

          <div class="stats-pills-row font-data">
            <span class="stat-pill">Organic Carbon: <strong>+24%</strong></span>
            <span class="stat-pill">Aquifer Saved: <strong>380 mm</strong></span>
            <span class="stat-pill">Vault Earnings: <strong>260 Coins</strong></span>
          </div>

          <div class="dialogue-footer-strip" style="justify-content: center; gap: 14px; margin-top: 10px;">
            <button type="button" class="pixel-btn" onclick={handlePlayAgain}>
              ↺ PLAY AGAIN
            </button>
            {#if onOpenOverworld}
              <button type="button" class="pixel-btn btn-warning" onclick={onOpenOverworld}>
                ▲ ENTER WALKABLE OVERWORLD RPG
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .hari-arcade-viewport {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 16px;
  }

  .scene-screen-frame {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Top Arcade Header Bar (Image 3 style) */
  .arcade-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #0A140A;
    border: 3px solid #00FF66;
    border-radius: 4px;
    padding: 10px 18px;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.3), 0 4px 0 #000;
  }

  .arcade-header-title {
    color: #00FF66;
    font-size: 1.15rem;
    letter-spacing: 1.5px;
    text-align: center;
  }

  .arcade-corn-glyphs {
    color: #FFB703;
    font-size: 1rem;
    letter-spacing: 3px;
  }

  .arcade-right-actions {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .retro-skip-btn {
    background-color: #2E1810;
    color: #D4A373;
    border: 2px solid #8A4B2A;
    padding: 6px 12px;
    font-size: 0.68rem;
    cursor: pointer;
  }

  .retro-skip-btn:hover {
    background-color: #4A2818;
    color: #FFF;
  }

  /* Panoramic Canvas Viewport */
  .panoramic-canvas-stage {
    position: relative;
    width: 100%;
    min-height: 480px;
    border: 4px solid #00FF66;
    border-radius: 4px;
    overflow: hidden;
    background-color: #121A12;
    box-shadow: 0 6px 0 #000000;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .panorama-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* Center Hero Button (Image 3 style) */
  .center-hero-prompt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
  }

  .start-adventure-hero-btn {
    background-color: #00FF66;
    color: #000000;
    font-size: 1.15rem;
    padding: 16px 28px;
    border: 3px solid #000000;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(0, 255, 102, 0.7), 0 6px 0 #000000;
    transition: transform 0.15s, box-shadow 0.15s;
    letter-spacing: 1px;
  }

  .start-adventure-hero-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(0, 255, 102, 0.9), 0 8px 0 #000000;
    background-color: #33FF88;
  }

  /* Character Sprite on Bottom Left */
  .character-sprite-holder {
    position: absolute;
    bottom: 24px;
    left: 36px;
    z-index: 10;
    animation: idleBobbing 2s infinite ease-in-out;
  }

  @keyframes idleBobbing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  /* Dialogue Box (Image 3, 4, 5 style) */
  .terminal-dialogue-box {
    position: relative;
    z-index: 15;
    background-color: #0B120B;
    border: 3px solid #00FF66;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.3), 0 4px 0 #000000;
    border-radius: 3px;
    margin: 0 30px 24px 140px;
    padding: 14px 18px;
  }

  .dialogue-box-inner {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .dialogue-portrait-frame {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .dialogue-text-column {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .amma-box {
    margin: 0 30px 24px 140px;
    position: relative;
    border-color: #FFB703;
    box-shadow: 0 0 16px rgba(255, 183, 3, 0.3), 0 4px 0 #000000;
  }

  .dialogue-header-badge {
    font-size: 0.85rem;
    color: #00FF66;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sub-role {
    font-size: 1.15rem;
    color: #A0C8AA;
  }

  .dialogue-text-body {
    font-size: 1.45rem;
    color: #FFFFFF;
    line-height: 1.35;
    min-height: 52px;
  }

  .cursor {
    color: #00FF66;
    animation: cursorBlink 0.8s infinite;
  }

  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .dialogue-footer-strip {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .click-to-continue-btn {
    background: none;
    border: none;
    color: #00FF66;
    font-size: 0.75rem;
    cursor: pointer;
    letter-spacing: 1px;
    animation: textPulse 1.4s infinite;
  }

  @keyframes textPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .consent-buttons-cluster {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* Crisis Alert Scene */
  .crisis-dusk {
    background-color: #26140A;
  }

  .crisis-photo-card {
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #0A0A0A;
    border: 4px solid #8A4B2A;
    outline: 2px solid #00FF66;
    box-shadow: 0 0 20px rgba(230, 57, 70, 0.4), 0 6px 0 #000;
    max-width: 440px;
    width: 90%;
    z-index: 10;
  }

  .crisis-banner-header {
    background-color: #E63946;
    color: #FFF;
    text-align: center;
    padding: 6px;
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  .photo-viewport {
    height: 180px;
    background-color: #B88458;
    overflow: hidden;
  }

  .nasa-telemetry-box {
    background-color: #121612;
    color: #FFB703;
    padding: 8px 12px;
    font-size: 0.72rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-top: 2px solid #8A4B2A;
  }

  /* Finale Scene */
  .finale-backdrop {
    background-color: #0A1C0A;
    padding: 30px;
    justify-content: center;
    align-items: center;
  }

  .global-farmers-lineup {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    z-index: 10;
  }

  .farmer-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background-color: #142214;
    border: 2px solid #00FF66;
    padding: 8px;
    border-radius: 4px;
  }

  .flag-tag {
    font-size: 0.62rem;
    color: #FFB703;
  }

  .farmer-pixel-art {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .finale-dialogue {
    margin: 0;
    max-width: 720px;
  }

  .stats-pills-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin: 10px 0;
  }

  .stat-pill {
    background-color: #1A2E1A;
    border: 1px solid #00FF66;
    color: #A0C8AA;
    padding: 6px 12px;
    border-radius: 3px;
    font-size: 0.75rem;
  }

  .stat-pill strong {
    color: #00FF66;
  }
</style>