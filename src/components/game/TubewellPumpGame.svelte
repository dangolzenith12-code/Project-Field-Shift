<script lang="ts">
  import { onMount } from 'svelte';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  // Game state
  let timerSeconds = $state(15);
  let isRunning = $state(false);
  let isGameOver = $state(false);
  let didWin = $state(false);
  let gameInterval: any = null;

  // NASA GRACE Aquifer Level (starts at 100)
  let aquiferLevel = $state(100);
  // Pump pressure (0 to 100)
  let pumpPressure = $state(0);
  let isPumping = $state(false);

  // 3 Plots
  let plot1Moisture = $state(45); // Wheat: target 55-80
  let plot2Moisture = $state(30); // Millet: target 30-50
  let plot3Moisture = $state(25); // Pulses: target 35-55

  // Valves
  let valve1Open = $state(true);
  let valve2Open = $state(false);
  let valve3Open = $state(false);

  let alertMessage = $state<string | null>("Turn on valves and pump water to balance moisture without draining the aquifer!");

  // Targets (widened for a smooth, accessible challenge)
  const plot1Target = { min: 48, max: 82, name: 'Wheat' };
  const plot2Target = { min: 25, max: 55, name: 'Finger Millet' };
  const plot3Target = { min: 28, max: 60, name: 'Chickpea' };

  const plot1Ok = $derived(plot1Moisture >= plot1Target.min && plot1Moisture <= plot1Target.max);
  const plot2Ok = $derived(plot2Moisture >= plot2Target.min && plot2Moisture <= plot2Target.max);
  const plot3Ok = $derived(plot3Moisture >= plot3Target.min && plot3Moisture <= plot3Target.max);
  const allPlotsOk = $derived(plot1Ok && plot2Ok && plot3Ok);

  function startGame() {
    isRunning = true;
    isGameOver = false;
    didWin = false;
    timerSeconds = 20;
    aquiferLevel = 100;
    pumpPressure = 0;
    plot1Moisture = 55;
    plot2Moisture = 36;
    plot3Moisture = 38;
    alertMessage = "Maintain all 3 plots in their green target zones!";

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      // Tick every second
      if (timerSeconds > 0) {
        timerSeconds--;

        // Gentle natural moisture evaporation
        plot1Moisture = Math.max(10, plot1Moisture - 1.1);
        plot2Moisture = Math.max(10, plot2Moisture - 0.8);
        plot3Moisture = Math.max(10, plot3Moisture - 0.9);

        // Gentle pressure drop
        if (!isPumping) {
          pumpPressure = Math.max(0, pumpPressure - 8);
        }

        // Check loss condition
        if (aquiferLevel <= 0) {
          handleLose("AQUIFER DEPLETED! NASA GRACE alert: Groundwater fell to zero.");
        }
      } else {
        // Time expired! Check if plots were maintained
        if (allPlotsOk) {
          handleWin();
        } else {
          handleLose("TIME EXPIRED! Some plots were under-watered or drowned.");
        }
      }
    }, 1000);
  }

  function handlePumpPulse() {
    if (!isRunning || isGameOver) return;
    isPumping = true;
    sfx.playSelect();

    const openValvesCount = (valve1Open ? 1 : 0) + (valve2Open ? 1 : 0) + (valve3Open ? 1 : 0);

    if (openValvesCount === 0) {
      // Overpressure!
      pumpPressure = Math.min(100, pumpPressure + 35);
      sfx.playAlert();
      alertMessage = "WARNING: All valves closed! Pressure spiking!";
      if (pumpPressure >= 95) {
        handleLose("PUMP BLOWN! The tubewell coughed sand and overheated.");
      }
      return;
    }

    // Pump water through open valves
    pumpPressure = Math.min(90, pumpPressure + 10);
    aquiferLevel = Math.max(0, aquiferLevel - openValvesCount * 3.5);

    if (valve1Open) plot1Moisture = Math.min(100, plot1Moisture + 8);
    if (valve2Open) plot2Moisture = Math.min(100, plot2Moisture + 8);
    if (valve3Open) plot3Moisture = Math.min(100, plot3Moisture + 8);

    setTimeout(() => { isPumping = false; }, 200);
  }

  function toggleValve(num: 1 | 2 | 3) {
    sfx.playSelect();
    if (num === 1) valve1Open = !valve1Open;
    if (num === 2) valve2Open = !valve2Open;
    if (num === 3) valve3Open = !valve3Open;
  }

  function handleWin() {
    isGameOver = true;
    isRunning = false;
    didWin = true;
    clearInterval(gameInterval);
    sfx.playSuccess();
    alertMessage = "SUCCESS! Perfect water management achieved! Aquifer protected.";
  }

  function handleLose(reason: string) {
    isGameOver = true;
    isRunning = false;
    didWin = false;
    clearInterval(gameInterval);
    sfx.playAlert();
    alertMessage = reason;
  }

  onMount(() => {
    startGame();
    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  });
</script>

<div class="tubewell-game-wrapper">
  <!-- Top Arcade Header -->
  <div class="top-arcade-banner">
    <div class="banner-corn font-pixel">|||</div>
    <div class="banner-title-group">
      <h2 class="banner-title font-pixel">CHAPTER 2: TUBEWELL & AQUIFER BALANCE</h2>
      <span class="banner-sub font-retro">NASA GRACE Groundwater Anomaly Simulation (−3.2 cm/yr)</span>
    </div>
    <div class="banner-corn font-pixel">|||</div>
  </div>

  <!-- Narrative Briefing -->
  <div class="briefing-box">
    <div class="brief-badge font-pixel">[ THE WELL THAT COUGHED SAND ]</div>
    <p class="brief-text font-retro">
      "The winter canal is dry, Hari! Neighbor Balbir says to pump non-stop, but NASA GRACE satellites show our deep aquifer is rapidly sinking. If you pump with all valves closed, the pump blows. If you pump too much, the aquifer dries up. Keep all 3 plots in their green moisture zone until the timer hits zero!"
    </p>
  </div>

  <!-- Main Game Stage -->
  <div class="game-stage-console">
    <!-- Status & Telemetry Header -->
    <div class="telemetry-bar font-data">
      <div class="timer-badge font-pixel">
        TIME LEFT: <strong style="color: #00FF66;">{timerSeconds}s</strong>
      </div>
      <div class="aquifer-badge font-pixel">
        NASA GRACE AQUIFER: 
        <strong style="color: {aquiferLevel > 35 ? '#00FF66' : '#E63946'};">{Math.round(aquiferLevel)}%</strong>
      </div>
      <div class="pressure-badge font-pixel">
        PUMP PRESSURE: 
        <strong style="color: {pumpPressure < 70 ? '#00FF66' : '#E63946'};">{Math.round(pumpPressure)} PSI</strong>
      </div>
    </div>

    <!-- Alert Message Banner -->
    <div class="alert-strip font-retro" class:success={didWin} class:danger={isGameOver && !didWin}>
      {alertMessage}
    </div>

    <!-- 3 Crop Plot Meters -->
    <div class="plots-grid">
      <!-- Plot 1: Wheat -->
      <div class="plot-card {plot1Ok ? 'in-zone' : ''}">
        <div class="plot-header font-pixel">
          <span>PLOT 1: WHEAT</span>
          <span class="target-tag font-data">Target: 55-80%</span>
        </div>
        <div class="moisture-bar-wrap">
          <div class="moisture-fill" style="width: {plot1Moisture}%;"></div>
          <div class="safe-zone-overlay" style="left: 55%; width: 25%;"></div>
        </div>
        <div class="plot-footer font-retro">
          <span>Moisture: {Math.round(plot1Moisture)}%</span>
          <span class="status-indicator">{plot1Ok ? '◆ OPTIMAL' : '▲ STRESSED'}</span>
        </div>
        <button 
          type="button" 
          class="valve-toggle-btn font-pixel {valve1Open ? 'open' : 'closed'}"
          onclick={() => toggleValve(1)}
        >
          VALVE 1: {valve1Open ? 'OPEN (FLOWING)' : 'CLOSED'}
        </button>
      </div>

      <!-- Plot 2: Finger Millet -->
      <div class="plot-card {plot2Ok ? 'in-zone' : ''}">
        <div class="plot-header font-pixel">
          <span>PLOT 2: MILLET</span>
          <span class="target-tag font-data">Target: 30-50%</span>
        </div>
        <div class="moisture-bar-wrap">
          <div class="moisture-fill" style="width: {plot2Moisture}%;"></div>
          <div class="safe-zone-overlay" style="left: 30%; width: 20%;"></div>
        </div>
        <div class="plot-footer font-retro">
          <span>Moisture: {Math.round(plot2Moisture)}%</span>
          <span class="status-indicator">{plot2Ok ? '◆ OPTIMAL' : '▲ STRESSED'}</span>
        </div>
        <button 
          type="button" 
          class="valve-toggle-btn font-pixel {valve2Open ? 'open' : 'closed'}"
          onclick={() => toggleValve(2)}
        >
          VALVE 2: {valve2Open ? 'OPEN (FLOWING)' : 'CLOSED'}
        </button>
      </div>

      <!-- Plot 3: Chickpea -->
      <div class="plot-card {plot3Ok ? 'in-zone' : ''}">
        <div class="plot-header font-pixel">
          <span>PLOT 3: CHICKPEA</span>
          <span class="target-tag font-data">Target: 35-55%</span>
        </div>
        <div class="moisture-bar-wrap">
          <div class="moisture-fill" style="width: {plot3Moisture}%;"></div>
          <div class="safe-zone-overlay" style="left: 35%; width: 20%;"></div>
        </div>
        <div class="plot-footer font-retro">
          <span>Moisture: {Math.round(plot3Moisture)}%</span>
          <span class="status-indicator">{plot3Ok ? '◆ OPTIMAL' : '▲ STRESSED'}</span>
        </div>
        <button 
          type="button" 
          class="valve-toggle-btn font-pixel {valve3Open ? 'open' : 'closed'}"
          onclick={() => toggleValve(3)}
        >
          VALVE 3: {valve3Open ? 'OPEN (FLOWING)' : 'CLOSED'}
        </button>
      </div>
    </div>

    <!-- Center Tubewell Pump Handle Controls -->
    <div class="pump-controls-panel">
      {#if !isGameOver}
        <button 
          type="button" 
          class="pump-handle-btn font-pixel"
          onclick={handlePumpPulse}
        >
          [PUMP WATER] (CLICK PULSE)
        </button>
      {:else if didWin}
        <div class="outcome-cluster">
          <button type="button" class="pixel-btn" onclick={onComplete}>
            PROCEED TO SUMMER HEATWAVE CRISIS →
          </button>
        </div>
      {:else}
        <div class="outcome-cluster">
          <button type="button" class="pixel-btn btn-secondary" onclick={startGame}>
            ↺ RETRY WATER PUZZLE
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .tubewell-game-wrapper {
    background-color: #121814;
    color: #F8EAD6;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 1040px;
    margin: 0 auto;
    border: 4px solid #2E5A35;
    box-shadow: 0 6px 0 #000;
  }

  .top-arcade-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #0A140A;
    border: 3px solid #00FF66;
    padding: 10px 18px;
    box-shadow: 0 0 14px rgba(0, 255, 102, 0.3), 0 4px 0 #000;
  }

  .banner-title-group {
    text-align: center;
  }

  .banner-title {
    color: #00FF66;
    font-size: 1.15rem;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }

  .banner-sub {
    color: #52B788;
    font-size: 0.95rem;
  }

  .banner-corn {
    color: #FFB703;
    font-size: 1rem;
    letter-spacing: 3px;
  }

  .briefing-box {
    background-color: #18241C;
    border: 2px solid #2E5A35;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .brief-badge {
    color: #FFB703;
    font-size: 0.75rem;
  }

  .brief-text {
    font-size: 1.25rem;
    color: #EBD6C2;
    line-height: 1.35;
  }

  .game-stage-console {
    background-color: #0A120A;
    border: 3px solid #00FF66;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.25), 0 4px 0 #000;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .telemetry-bar {
    display: flex;
    justify-content: space-between;
    background-color: #142214;
    border: 1px solid #2E5A35;
    padding: 8px 14px;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.75rem;
  }

  .alert-strip {
    text-align: center;
    padding: 10px;
    font-size: 1.25rem;
    background-color: #1A281A;
    border: 2px solid #2E5A35;
    color: #FFB703;
  }

  .alert-strip.success {
    background-color: #143814;
    border-color: #00FF66;
    color: #00FF66;
    font-weight: bold;
  }

  .alert-strip.danger {
    background-color: #381414;
    border-color: #E63946;
    color: #FFAAAA;
  }

  /* Plots Grid */
  .plots-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (max-width: 800px) {
    .plots-grid {
      grid-template-columns: 1fr;
    }
  }

  .plot-card {
    background-color: #162418;
    border: 2px solid #2E5A35;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 3px;
    transition: border-color 0.2s;
  }

  .plot-card.in-zone {
    border-color: #00FF66;
    background-color: #1A2E1A;
  }

  .plot-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.68rem;
    color: #F8EAD6;
  }

  .target-tag {
    color: #FFB703;
    font-size: 0.65rem;
  }

  .moisture-bar-wrap {
    position: relative;
    height: 24px;
    background-color: #0E160E;
    border: 2px solid #000;
    overflow: hidden;
  }

  .moisture-fill {
    height: 100%;
    background: linear-gradient(90deg, #1E3A8A 0%, #38BDF8 100%);
    transition: width 0.2s ease;
  }

  .safe-zone-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: rgba(0, 255, 102, 0.35);
    border-left: 2px dashed #00FF66;
    border-right: 2px dashed #00FF66;
    pointer-events: none;
  }

  .plot-footer {
    display: flex;
    justify-content: space-between;
    font-size: 1.1rem;
    color: #C2DEC2;
  }

  .status-indicator {
    font-size: 0.75rem;
    font-family: var(--font-pixel);
  }

  .plot-card.in-zone .status-indicator {
    color: #00FF66;
  }

  .valve-toggle-btn {
    padding: 8px 10px;
    font-size: 0.68rem;
    cursor: pointer;
    border: 2px solid #000;
    text-align: center;
    transition: transform 0.1s;
  }

  .valve-toggle-btn.open {
    background-color: #00FF66;
    color: #000;
  }

  .valve-toggle-btn.closed {
    background-color: #382414;
    color: #FFB703;
  }

  .pump-controls-panel {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }

  .pump-handle-btn {
    background-color: #2F6FED;
    color: #FFF;
    border: 3px solid #000;
    font-size: 1.1rem;
    padding: 16px 40px;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(47, 111, 237, 0.6), 0 5px 0 #000;
    transition: transform 0.1s, box-shadow 0.1s;
    letter-spacing: 1px;
  }

  .pump-handle-btn:hover {
    background-color: #4B88FF;
    transform: translateY(-2px);
    box-shadow: 0 0 28px rgba(47, 111, 237, 0.8), 0 7px 0 #000;
  }

  .pump-handle-btn:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 #000;
  }

  .outcome-cluster {
    display: flex;
    justify-content: center;
  }
</style>