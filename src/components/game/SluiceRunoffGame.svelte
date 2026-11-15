<script lang="ts">
  import { onMount } from 'svelte';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  // Game state
  let timerSeconds = $state(20);
  let isRunning = $state(false);
  let isGameOver = $state(false);
  let didWin = $state(false);
  let gameInterval: any = null;

  // NASA GPM Storm Intensity (mm/hr)
  let stormIntensity = $state(45);
  // Topsoil Erosion Gauge (0 to 100%) - if it hits 100, hillside blows out
  let erosionPercent = $state(5);
  // Stream Water Clarity (100% is crystal clear, drops with silt)
  let waterClarity = $state(90);

  // Sluice Gate States
  let upperSluiceOpen = $state(false);
  let midCulvertOpen = $state(false);

  // Winter Rye Bundles (3 total)
  let ryeBundles = $state(3);
  let ryeUpperActive = $state(false);
  let ryeMidActive = $state(false);

  // Dynamic storm narrative alert
  let alertMessage = $state<string | null>("NASA GPM radar detects incoming 90 mm/hr cloudburst! Open sluice gates and plant rye buffers!");

  function startGame() {
    isRunning = true;
    isGameOver = false;
    didWin = false;
    timerSeconds = 20;
    stormIntensity = 45;
    erosionPercent = 5;
    waterClarity = 90;
    upperSluiceOpen = false;
    midCulvertOpen = false;
    ryeBundles = 3;
    ryeUpperActive = false;
    ryeMidActive = false;
    alertMessage = "Storm front hits! Divert water into grassed retention basins!";
    sfx.playSelect();

    if (gameInterval) clearInterval(gameInterval);

    gameInterval = setInterval(() => {
      if (!isRunning) return;

      timerSeconds--;

      // Storm curve: builds up to peak at 10-15s, then subsides
      if (timerSeconds > 12) {
        stormIntensity = Math.min(105, stormIntensity + 6);
      } else if (timerSeconds > 5) {
        stormIntensity = Math.max(75, stormIntensity - 3);
      } else {
        stormIntensity = Math.max(25, stormIntensity - 8);
      }

      // Erosion calculation based on gates and rye (gentler, accessible curve)
      let erosionSpeed = (stormIntensity / 45);
      if (upperSluiceOpen) erosionSpeed -= 1.4;
      if (midCulvertOpen) erosionSpeed -= 1.2;
      if (ryeUpperActive) erosionSpeed *= 0.45;
      if (ryeMidActive) erosionSpeed *= 0.55;

      erosionPercent = Math.min(100, Math.max(0, erosionPercent + Math.max(0.1, erosionSpeed)));

      // Water clarity calculation
      if (upperSluiceOpen && midCulvertOpen && (ryeUpperActive || ryeMidActive)) {
        waterClarity = Math.min(95, waterClarity + 2.0);
      } else if (!upperSluiceOpen && !midCulvertOpen) {
        waterClarity = Math.max(15, waterClarity - 3.0);
      } else {
        waterClarity = Math.max(30, waterClarity - 1.0);
      }

      // Audio blip on high erosion
      if (erosionPercent > 75 && timerSeconds % 2 === 0) {
        sfx.playAlert();
      }

      // Check failure condition
      if (erosionPercent >= 100) {
        endGame(false, "Topsoil washed away! Silt overwhelmed the creek basin!");
      }

      // Check victory on timer (forgiving threshold)
      if (timerSeconds <= 0) {
        if (erosionPercent < 85 && waterClarity > 25) {
          endGame(true, "Cloudburst passed! Winter rye and sluices saved Iowa's rich topsoil!");
        } else {
          endGame(false, "Storm passed, but excessive erosion stripped the fertile slope.");
        }
      }
    }, 1000);
  }

  function endGame(win: boolean, msg: string) {
    isRunning = false;
    isGameOver = true;
    didWin = win;
    alertMessage = msg;
    if (gameInterval) clearInterval(gameInterval);
    if (win) {
      sfx.playSuccess();
    } else {
      sfx.playAlert();
    }
  }

  function toggleUpperSluice() {
    if (!isRunning) return;
    sfx.playSelect();
    upperSluiceOpen = !upperSluiceOpen;
  }

  function toggleMidCulvert() {
    if (!isRunning) return;
    sfx.playSelect();
    midCulvertOpen = !midCulvertOpen;
  }

  function deployRye(sector: 'upper' | 'mid') {
    if (!isRunning || ryeBundles <= 0) return;
    sfx.playSelect();

    if (sector === 'upper' && !ryeUpperActive) {
      ryeUpperActive = true;
      ryeBundles--;
    } else if (sector === 'mid' && !ryeMidActive) {
      ryeMidActive = true;
      ryeBundles--;
    }
  }

  onMount(() => {
    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  });
</script>

<div class="sluice-game-card">
  <!-- Retro Header -->
  <div class="game-arcade-header">
    <div class="header-left">
      <span class="arcade-glyph font-pixel">▲</span>
      <span class="header-title font-pixel">IOWA CLOUDBURST: SLUICE & EROSION SHIELD</span>
    </div>
    <div class="header-right">
      <span class="mission-tag font-pixel">NASA GPM + SWOT</span>
    </div>
  </div>

  <!-- Status Telemetry Bar -->
  <div class="telemetry-bar font-pixel">
    <div class="telemetry-cell">
      <span class="cell-label">STORM TIMER</span>
      <span class="cell-val {timerSeconds <= 5 ? 'val-danger' : 'val-gold'}">{timerSeconds}s</span>
    </div>
    <div class="telemetry-cell">
      <span class="cell-label">GPM RAIN RATE</span>
      <span class="cell-val {stormIntensity > 80 ? 'val-danger' : 'val-teal'}">{Math.round(stormIntensity)} mm/h</span>
    </div>
    <div class="telemetry-cell">
      <span class="cell-label">TOPSOIL EROSION</span>
      <span class="cell-val {erosionPercent > 70 ? 'val-danger' : 'val-green'}">{Math.round(erosionPercent)}%</span>
    </div>
    <div class="telemetry-cell">
      <span class="cell-label">CREEK CLARITY</span>
      <span class="cell-val {waterClarity < 40 ? 'val-danger' : 'val-teal'}">{Math.round(waterClarity)}%</span>
    </div>
  </div>

  <!-- Main Game Field -->
  <div class="prairie-slope-viewport">
    <!-- SVG Hillside Cross-Section -->
    <svg class="slope-svg" viewBox="0 0 600 240" preserveAspectRatio="none">
      <defs>
        <!-- Gradients -->
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1b1c2e"/>
          <stop offset="100%" stop-color="#323854"/>
        </linearGradient>
        <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a3f23"/>
          <stop offset="60%" stop-color="#1e2c19"/>
          <stop offset="100%" stop-color="#141c10"/>
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00ffff"/>
          <stop offset="100%" stop-color="#0088cc"/>
        </linearGradient>
      </defs>

      <!-- Storm Sky -->
      <rect x="0" y="0" width="600" height="240" fill="url(#skyGrad)"/>

      <!-- Rain streaks if storm is active -->
      {#if isRunning}
        <g stroke="#00ffff" stroke-width="1.5" opacity="0.65" stroke-dasharray="8 12">
          <line x1="40" y1="10" x2="20" y2="120" />
          <line x1="120" y1="5" x2="100" y2="140" />
          <line x1="200" y1="15" x2="180" y2="160" />
          <line x1="300" y1="5" x2="280" y2="150" />
          <line x1="420" y1="12" x2="400" y2="170" />
          <line x1="520" y1="8" x2="500" y2="180" />
        </g>
      {/if}

      <!-- Rolling Prairie Hill Slope Polygon -->
      <polygon points="0,70 180,95 380,140 520,180 600,200 600,240 0,240" fill="url(#hillGrad)" />

      <!-- Creek Water at Bottom Right -->
      <polygon points="480,210 600,195 600,240 480,240" fill="url(#waterGrad)" opacity="{waterClarity / 100}" />

      <!-- Sluice Gate 1: Upper Swale -->
      <rect x="170" y="80" width="22" height="25" fill="{upperSluiceOpen ? '#00FF66' : '#E63946'}" stroke="#111" stroke-width="2" />
      <text x="181" y="74" fill="#FFB703" font-family="'Press Start 2P', monospace" font-size="7" text-anchor="middle">GATE 1</text>

      <!-- Sluice Gate 2: Mid Culvert -->
      <rect x="370" y="125" width="22" height="25" fill="{midCulvertOpen ? '#00FF66' : '#E63946'}" stroke="#111" stroke-width="2" />
      <text x="381" y="119" fill="#FFB703" font-family="'Press Start 2P', monospace" font-size="7" text-anchor="middle">GATE 2</text>

      <!-- Winter Rye Vegetative Buffers -->
      {#if ryeUpperActive}
        <g fill="#00FF66" opacity="0.9">
          <rect x="70" y="82" width="90" height="8" rx="2" />
          <text x="115" y="76" fill="#00FF66" font-family="'Press Start 2P', monospace" font-size="6" text-anchor="middle">RYE BUFFER</text>
        </g>
      {/if}

      {#if ryeMidActive}
        <g fill="#00FF66" opacity="0.9">
          <rect x="230" y="122" width="120" height="8" rx="2" />
          <text x="290" y="116" fill="#00FF66" font-family="'Press Start 2P', monospace" font-size="6" text-anchor="middle">RYE BUFFER</text>
        </g>
      {/if}

      <!-- Flow Lines if Gates Open -->
      {#if upperSluiceOpen}
        <path d="M 180 105 Q 220 120 260 150" fill="none" stroke="#00ffff" stroke-width="3" stroke-dasharray="4 4" />
      {/if}
      {#if midCulvertOpen}
        <path d="M 380 150 Q 430 170 490 210" fill="none" stroke="#00ffff" stroke-width="3" stroke-dasharray="4 4" />
      {/if}
    </svg>

    <!-- Overlay Alerts -->
    {#if alertMessage}
      <div class="slope-alert font-pixel {didWin ? 'alert-win' : isGameOver ? 'alert-fail' : ''}">
        {alertMessage}
      </div>
    {/if}
  </div>

  <!-- Interactive Controls Dashboard -->
  <div class="controls-panel">
    <div class="control-col">
      <div class="control-header font-pixel">◆ SLUICE GATES</div>
      <div class="btn-group">
        <button 
          class="nes-btn {upperSluiceOpen ? 'is-success' : 'is-error'} font-pixel btn-compact"
          onclick={toggleUpperSluice}
          disabled={!isRunning}
        >
          {upperSluiceOpen ? '[GATE 1 OPEN]' : '[GATE 1 CLOSED]'}
        </button>
        <button 
          class="nes-btn {midCulvertOpen ? 'is-success' : 'is-error'} font-pixel btn-compact"
          onclick={toggleMidCulvert}
          disabled={!isRunning}
        >
          {midCulvertOpen ? '[GATE 2 OPEN]' : '[GATE 2 CLOSED]'}
        </button>
      </div>
    </div>

    <div class="control-col">
      <div class="control-header font-pixel">▲ WINTER RYE BUFFERS ({ryeBundles} REMAINING)</div>
      <div class="btn-group">
        <button 
          class="nes-btn {ryeUpperActive ? 'is-disabled' : 'is-warning'} font-pixel btn-compact"
          onclick={() => deployRye('upper')}
          disabled={!isRunning || ryeUpperActive || ryeBundles <= 0}
        >
          {ryeUpperActive ? 'UPPER BUFFER ROOTED' : '+ SOW UPPER RYE'}
        </button>
        <button 
          class="nes-btn {ryeMidActive ? 'is-disabled' : 'is-warning'} font-pixel btn-compact"
          onclick={() => deployRye('mid')}
          disabled={!isRunning || ryeMidActive || ryeBundles <= 0}
        >
          {ryeMidActive ? 'MID BUFFER ROOTED' : '+ SOW MID RYE'}
        </button>
      </div>
    </div>
  </div>

  <!-- Bottom Action Footer -->
  <div class="game-footer">
    {#if !isRunning && !isGameOver}
      <button class="nes-btn is-primary font-pixel start-btn" onclick={startGame}>
        START 20s CLOUDBURST SIMULATION
      </button>
    {:else if isGameOver}
      {#if didWin}
        <button class="nes-btn is-success font-pixel start-btn" onclick={onComplete}>
          SAVE TOPSOIL & CONTINUE JOURNEY ◆
        </button>
      {:else}
        <button class="nes-btn is-error font-pixel start-btn" onclick={startGame}>
          RETRY CLOUDBURST DEFENSE ▲
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .sluice-game-card {
    background: #0f1412;
    border: 3px solid #00FF66;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.25);
    padding: 16px;
    margin: 16px 0;
  }

  .game-arcade-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #1f2e26;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .arcade-glyph {
    color: #00FF66;
    margin-right: 6px;
  }

  .header-title {
    font-size: 11px;
    color: #fff;
    letter-spacing: 0.5px;
  }

  .mission-tag {
    font-size: 9px;
    background: #0056b3;
    color: #fff;
    padding: 3px 6px;
    border: 1px solid #3388ff;
  }

  .telemetry-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    background: #070a08;
    border: 1px solid #1f2e26;
    padding: 8px;
    margin-bottom: 12px;
  }

  .telemetry-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .cell-label {
    font-size: 7px;
    color: #88a896;
    margin-bottom: 2px;
  }

  .cell-val {
    font-size: 11px;
    font-weight: bold;
  }

  .val-gold { color: #FFB703; }
  .val-teal { color: #00ffff; }
  .val-green { color: #00FF66; }
  .val-danger { color: #E63946; animation: blink 0.8s infinite; }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .prairie-slope-viewport {
    position: relative;
    border: 2px solid #2a3d31;
    height: 220px;
    overflow: hidden;
    background: #000;
  }

  .slope-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .slope-alert {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.88);
    border: 1px solid #FFB703;
    color: #FFB703;
    font-size: 8px;
    padding: 6px 10px;
    text-align: center;
    line-height: 1.4;
  }

  .alert-win {
    border-color: #00FF66;
    color: #00FF66;
  }

  .alert-fail {
    border-color: #E63946;
    color: #E63946;
  }

  .controls-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 12px;
  }

  .control-col {
    background: #070a08;
    border: 1px solid #1f2e26;
    padding: 10px;
  }

  .control-header {
    font-size: 8px;
    color: #88a896;
    margin-bottom: 8px;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .btn-compact {
    font-size: 8px !important;
    padding: 6px 8px !important;
    text-align: center;
  }

  .game-footer {
    margin-top: 12px;
    display: flex;
    justify-content: center;
  }

  .start-btn {
    width: 100%;
    font-size: 10px !important;
    padding: 10px !important;
  }
</style>
