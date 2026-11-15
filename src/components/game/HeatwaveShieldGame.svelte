<script lang="ts">
  import { onMount } from 'svelte';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  interface BedState {
    id: number;
    name: string;
    tempC: number;
    hasMulch: boolean;
    hasShade: boolean;
    hasDrip: boolean;
  }

  let beds = $state<BedState[]>([
    { id: 1, name: 'Bed 1: Pulses', tempC: 46, hasMulch: false, hasShade: false, hasDrip: false },
    { id: 2, name: 'Bed 2: Millets', tempC: 43, hasMulch: false, hasShade: false, hasDrip: false },
    { id: 3, name: 'Bed 3: Wheat', tempC: 48, hasMulch: false, hasShade: false, hasDrip: false },
    { id: 4, name: 'Bed 4: Mustard', tempC: 45, hasMulch: false, hasShade: false, hasDrip: false },
  ]);

  type ToolType = 'mulch' | 'shade' | 'drip';
  let selectedTool = $state<ToolType>('mulch');

  let mulchCount = $state(4);
  let shadeCount = $state(3);
  let dripCount = $state(3);

  let countdownSeconds = $state(18);
  let isGameOver = $state(false);
  let didWin = $state(false);
  let timerId: any = null;

  // Safe temperature threshold is <= 36°C (generous threshold)
  const SAFE_TEMP = 36;
  const allBedsSafe = $derived(beds.every(b => b.tempC <= SAFE_TEMP));

  function startGame() {
    isGameOver = false;
    didWin = false;
    countdownSeconds = 24;
    mulchCount = 4;
    shadeCount = 4;
    dripCount = 4;
    beds = [
      { id: 1, name: 'Bed 1: Pulses', tempC: 44, hasMulch: false, hasShade: false, hasDrip: false },
      { id: 2, name: 'Bed 2: Millets', tempC: 41, hasMulch: false, hasShade: false, hasDrip: false },
      { id: 3, name: 'Bed 3: Wheat', tempC: 45, hasMulch: false, hasShade: false, hasDrip: false },
      { id: 4, name: 'Bed 4: Mustard', tempC: 42, hasMulch: false, hasShade: false, hasDrip: false },
    ];

    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (countdownSeconds > 0) {
        countdownSeconds--;

        // Solar heat radiation increases unshielded beds (gentler pace)
        beds = beds.map(bed => {
          let heatGain = 0.7;
          if (bed.hasShade) heatGain -= 0.6;
          if (bed.hasMulch) heatGain -= 0.5;
          if (bed.hasDrip) heatGain -= 0.4;

          return {
            ...bed,
            tempC: Math.min(60, Math.max(22, Number((bed.tempC + heatGain).toFixed(1))))
          };
        });
      } else {
        // Time over! Check if all beds survived
        if (allBedsSafe) {
          handleWin();
        } else {
          handleLose("TIME EXPIRED! Some soil beds exceeded safe vegetative temperatures.");
        }
      }
    }, 1000);
  }

  function applyToolToBed(bedId: number) {
    if (isGameOver) return;
    const bedIndex = beds.findIndex(b => b.id === bedId);
    if (bedIndex === -1) return;

    const bed = beds[bedIndex];

    if (selectedTool === 'mulch') {
      if (mulchCount <= 0 || bed.hasMulch) return;
      sfx.playSelect();
      mulchCount--;
      bed.hasMulch = true;
      bed.tempC = Math.max(22, bed.tempC - 11);
    } else if (selectedTool === 'shade') {
      if (shadeCount <= 0 || bed.hasShade) return;
      sfx.playSelect();
      shadeCount--;
      bed.hasShade = true;
      bed.tempC = Math.max(22, bed.tempC - 9);
    } else if (selectedTool === 'drip') {
      if (dripCount <= 0 || bed.hasDrip) return;
      sfx.playSelect();
      dripCount--;
      bed.hasDrip = true;
      bed.tempC = Math.max(22, bed.tempC - 13);
    }

    beds = [...beds];

    // Check immediate victory if all safe
    if (allBedsSafe && countdownSeconds <= 5) {
      handleWin();
    }
  }

  function handleWin() {
    isGameOver = true;
    didWin = true;
    clearInterval(timerId);
    sfx.playSuccess();
  }

  function handleLose(msg: string) {
    isGameOver = true;
    didWin = false;
    clearInterval(timerId);
    sfx.playAlert();
  }

  onMount(() => {
    startGame();
    return () => {
      if (timerId) clearInterval(timerId);
    };
  });
</script>

<div class="heatwave-game-wrapper">
  <!-- Top Banner -->
  <div class="top-arcade-banner">
    <div class="banner-corn font-pixel">|||</div>
    <div class="banner-title-group">
      <h2 class="banner-title font-pixel">CHAPTER 3: HEATWAVE SHIELD DEFENSE</h2>
      <span class="banner-sub font-retro">NASA MERRA-2 Summer Heatwave (+1.6°C Anomaly)</span>
    </div>
    <div class="banner-corn font-pixel">|||</div>
  </div>

  <!-- Narrative Briefing -->
  <div class="briefing-box">
    <div class="brief-badge font-pixel">[ TRIAL BY FIRE: THE SCORCHED EARTH ]</div>
    <p class="brief-text font-retro">
      "NASA MERRA-2 satellites alert: Extreme 45°C heatwave descending! Topsoil is drying out and crops are at risk of wilting. Apply <strong>Straw Mulch</strong>, <strong>Agroforestry Shade</strong>, and <strong>Misting Drip</strong> to cool all 4 beds below 32°C before time runs out!"
    </p>
  </div>

  <!-- Game Stage -->
  <div class="game-stage-console">
    <!-- Telemetry Header -->
    <div class="telemetry-bar font-data">
      <div class="timer-badge font-pixel">
        HEATWAVE DURATION: <strong style="color: #FFB703;">{countdownSeconds}s</strong>
      </div>
      <div class="heat-anomaly-badge font-pixel">
        NASA MERRA-2: <strong style="color: #E63946;">+1.6°C PEAK ANOMALY</strong>
      </div>
    </div>

    <!-- Tool Selector Tray -->
    <div class="tool-tray font-pixel">
      <button 
        type="button" 
        class="tool-btn {selectedTool === 'mulch' ? 'active' : ''}"
        onclick={() => selectedTool = 'mulch'}
      >
        ◆ STRAW MULCH ({mulchCount})
        <span class="tool-desc font-retro">−9°C Cools Topsoil</span>
      </button>

      <button 
        type="button" 
        class="tool-btn {selectedTool === 'shade' ? 'active' : ''}"
        onclick={() => selectedTool = 'shade'}
      >
        ▲ AGROFORESTRY SHADE ({shadeCount})
        <span class="tool-desc font-retro">−7°C Blocks Solar Rays</span>
      </button>

      <button 
        type="button" 
        class="tool-btn {selectedTool === 'drip' ? 'active' : ''}"
        onclick={() => selectedTool = 'drip'}
      >
        ● MISTING DRIP ({dripCount})
        <span class="tool-desc font-retro">−11°C Evaporative Cool</span>
      </button>
    </div>

    <!-- 4 Soil Beds Grid -->
    <div class="beds-grid">
      {#each beds as bed}
        {@const isSafe = bed.tempC <= SAFE_TEMP}
        <button 
          type="button" 
          class="bed-card {isSafe ? 'is-safe' : 'is-hot'}"
          onclick={() => applyToolToBed(bed.id)}
        >
          <div class="bed-header font-pixel">
            <span>{bed.name}</span>
            <span class="temp-badge font-pixel" style="color: {isSafe ? '#00FF66' : '#FF4D4D'};">
              {bed.tempC}°C {isSafe ? '✓' : '▲'}
            </span>
          </div>

          <!-- Soil Bed Pixel Visual -->
          <div class="bed-visual-box">
            <!-- Soil Base -->
            <div class="soil-texture"></div>

            <!-- Visual Mulch Layer -->
            {#if bed.hasMulch}
              <div class="mulch-overlay font-data">══ STRAW MULCH ══</div>
            {/if}

            <!-- Visual Shade Layer -->
            {#if bed.hasShade}
              <div class="shade-overlay font-data">▓▓ SHADE CANOPY ▓▓</div>
            {/if}

            <!-- Visual Misting Drip -->
            {#if bed.hasDrip}
              <div class="drip-overlay font-data">∴ ∴ MIST DRIP ∴ ∴</div>
            {/if}
          </div>

          <!-- Active Shields Tag -->
          <div class="shields-status-row font-data">
            <span class="tag {bed.hasMulch ? 'on' : 'off'}">Mulch</span>
            <span class="tag {bed.hasShade ? 'on' : 'off'}">Shade</span>
            <span class="tag {bed.hasDrip ? 'on' : 'off'}">Drip</span>
          </div>
        </button>
      {/each}
    </div>

    <!-- Action Outcome Footer -->
    <div class="outcome-footer">
      {#if isGameOver}
        {#if didWin}
          <div class="outcome-success font-pixel">
            ◆ ALL CROPS SHIELDED! HEATWAVE WITHSTOOD SUCCESSFULLY! ◆
          </div>
          <button type="button" class="pixel-btn" onclick={onComplete}>
            PROCEED TO 3-STRATEGY ADAPTATION MATRIX →
          </button>
        {:else}
          <div class="outcome-fail font-pixel">
            ▲ HEAT COLLAPSE DETECTED! CROPS SUFFERED HEAT STRESS ▲
          </div>
          <button type="button" class="pixel-btn btn-secondary" onclick={startGame}>
            ↺ RETRY SHIELD DEFENSE
          </button>
        {/if}
      {:else}
        <div class="hint-text font-retro">
          Click any tool above, then click on a hot soil bed to shield it! Target: Below {SAFE_TEMP}°C
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .heatwave-game-wrapper {
    background-color: #1A0D08;
    color: #F8EAD6;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 1040px;
    margin: 0 auto;
    border: 4px solid #8A4B2A;
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
    background-color: #24140D;
    border: 2px solid #8A4B2A;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .brief-badge {
    color: #E63946;
    font-size: 0.75rem;
  }

  .brief-text {
    font-size: 1.25rem;
    color: #EBD6C2;
    line-height: 1.35;
  }

  .game-stage-console {
    background-color: #0E140E;
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
    background-color: #1A2218;
    border: 1px solid #2E5A35;
    padding: 8px 14px;
    font-size: 0.75rem;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* Tool Tray */
  .tool-tray {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  @media (max-width: 768px) {
    .tool-tray {
      grid-template-columns: 1fr;
    }
  }

  .tool-btn {
    background-color: #24140D;
    border: 2px solid #6E3B1C;
    padding: 10px;
    color: #F8EAD6;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    transition: transform 0.1s, border-color 0.2s;
  }

  .tool-btn:hover {
    border-color: #FFB703;
    transform: translateY(-2px);
  }

  .tool-btn.active {
    border-color: #00FF66;
    background-color: #1A2E1A;
    color: #00FF66;
    box-shadow: 0 0 12px rgba(0, 255, 102, 0.4);
  }

  .tool-desc {
    font-size: 1rem;
    color: #CDB4A2;
  }

  /* Beds Grid */
  .beds-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 700px) {
    .beds-grid {
      grid-template-columns: 1fr;
    }
  }

  .bed-card {
    background-color: #182018;
    border: 3px solid #6E3B1C;
    padding: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
    transition: transform 0.1s, border-color 0.2s;
  }

  .bed-card:hover {
    transform: translateY(-2px);
  }

  .bed-card.is-hot {
    border-color: #E63946;
    background-color: #2E1414;
    box-shadow: 0 0 10px rgba(230, 57, 70, 0.4);
  }

  .bed-card.is-safe {
    border-color: #00FF66;
    background-color: #142E18;
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.3);
  }

  .bed-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    color: #F8EAD6;
  }

  .bed-visual-box {
    position: relative;
    height: 70px;
    background-color: #4A2818;
    border: 2px solid #000;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
  }

  .mulch-overlay {
    background-color: #FFB703;
    color: #000;
    font-size: 0.65rem;
    padding: 2px 8px;
    border-radius: 2px;
    font-weight: bold;
  }

  .shade-overlay {
    background-color: #15803D;
    color: #FFF;
    font-size: 0.65rem;
    padding: 2px 8px;
    border-radius: 2px;
  }

  .drip-overlay {
    background-color: #0284C7;
    color: #FFF;
    font-size: 0.65rem;
    padding: 2px 8px;
    border-radius: 2px;
  }

  .shields-status-row {
    display: flex;
    gap: 8px;
    font-size: 0.65rem;
  }

  .tag {
    padding: 2px 6px;
    border-radius: 2px;
  }

  .tag.on {
    background-color: #00FF66;
    color: #000;
    font-weight: bold;
  }

  .tag.off {
    background-color: #2E1810;
    color: #7A5844;
  }

  .outcome-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
  }

  .outcome-success {
    color: #00FF66;
    font-size: 0.85rem;
    text-align: center;
    letter-spacing: 0.5px;
  }

  .outcome-fail {
    color: #E63946;
    font-size: 0.85rem;
    text-align: center;
  }

  .hint-text {
    font-size: 1.15rem;
    color: #CDB4A2;
    text-align: center;
  }
</style>