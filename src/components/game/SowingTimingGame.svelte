<script lang="ts">
  import { onMount } from 'svelte';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  // Mini-game state
  const TOTAL_SEEDS = 5;
  let currentSeedIndex = $state(0);
  let needlePosition = $state(0); // 0 to 100%
  let needleDirection = $state(1); // 1 = moving right, -1 = moving left
  let needleSpeed = 0.72; // Slower, accessible and easy to time accurately
  let animFrameId: number;

  // The NASA SMAP Moisture Sweet-Spot (e.g. 36% to 68% depth range = ~4.3cm to 8.1cm depth)
  const targetZoneStart = 36;
  const targetZoneEnd = 68;

  let feedbackText = $state<string | null>("Press [SPACE] or click [DROP SEED] when needle is in the GREEN zone!");
  let feedbackType = $state<'normal' | 'perfect' | 'good' | 'miss'>('normal');
  let sownSeeds = $state<Array<{ depthCm: number; quality: 'perfect' | 'good' | 'miss' }>>([]);
  let isGameOver = $derived(sownSeeds.length >= TOTAL_SEEDS);

  const perfectCount = $derived(sownSeeds.filter(s => s.quality === 'perfect').length);
  const goodCount = $derived(sownSeeds.filter(s => s.quality === 'good').length);

  function gameLoop() {
    if (!isGameOver) {
      needlePosition += needleSpeed * needleDirection;
      if (needlePosition >= 100) {
        needlePosition = 100;
        needleDirection = -1;
      } else if (needlePosition <= 0) {
        needlePosition = 0;
        needleDirection = 1;
      }
    }
    animFrameId = requestAnimationFrame(gameLoop);
  }

  function handleDropSeed() {
    if (isGameOver) return;

    const currentPos = needlePosition;
    // Map 0-100% to 0cm - 12cm soil depth
    const depthCm = Number(((currentPos / 100) * 12).toFixed(1));

    if (currentPos >= targetZoneStart && currentPos <= targetZoneEnd) {
      // In optimal zone!
      const centerDist = Math.abs(currentPos - (targetZoneStart + targetZoneEnd) / 2);
      if (centerDist <= 8.5) {
        sfx.playSuccess();
        feedbackText = `★ PERFECT DEPTH! ${depthCm} cm (Optimal SMAP moisture zone)`;
        feedbackType = 'perfect';
        sownSeeds = [...sownSeeds, { depthCm, quality: 'perfect' }];
      } else {
        sfx.playSelect();
        feedbackText = `◆ GOOD DEPTH! ${depthCm} cm (Adequate seed germination)`;
        feedbackType = 'good';
        sownSeeds = [...sownSeeds, { depthCm, quality: 'good' }];
      }
    } else if (currentPos < targetZoneStart) {
      sfx.playAlert();
      feedbackText = `▲ TOO SHALLOW! ${depthCm} cm (Topsoil is dry, birds may eat it)`;
      feedbackType = 'miss';
      sownSeeds = [...sownSeeds, { depthCm, quality: 'miss' }];
    } else {
      sfx.playAlert();
      feedbackText = `▼ TOO DEEP! ${depthCm} cm (Compacted subsoil, seeds lack oxygen)`;
      feedbackType = 'miss';
      sownSeeds = [...sownSeeds, { depthCm, quality: 'miss' }];
    }

    currentSeedIndex++;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space') {
      e.preventDefault();
      handleDropSeed();
    }
  }

  function resetGame() {
    sownSeeds = [];
    currentSeedIndex = 0;
    feedbackText = "Press [SPACE] or click [DROP SEED] when needle is in the GREEN zone!";
    feedbackType = 'normal';
  }

  onMount(() => {
    animFrameId = requestAnimationFrame(gameLoop);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<div class="sowing-game-container">
  <!-- Top Arcade Title Bar -->
  <div class="top-arcade-banner">
    <div class="banner-corn font-pixel">|||</div>
    <div class="banner-title-group">
      <h2 class="banner-title font-pixel">CHAPTER 1: SOWING TIMING CHALLENGE</h2>
      <span class="banner-sub font-retro">Optimal Seed Furrow Depth (NASA SMAP Root-Zone)</span>
    </div>
    <div class="banner-corn font-pixel">|||</div>
  </div>

  <!-- Story Mission Briefing -->
  <div class="briefing-box">
    <div class="brief-badge font-pixel">[ AMMA'S SOWING SECRET ]</div>
    <p class="brief-text font-retro">
      "Hari, the monsoon clouds are gathering! If we sow too shallow, the scorching sun will bake the seeds. If we sow too deep, the seeds suffocate. NASA SMAP shows optimal root moisture between <strong>4.0 cm and 6.5 cm</strong>. Drop all 5 seeds into the green sweet-spot!"
    </p>
  </div>

  <!-- Interactive Meter Viewport -->
  <div class="meter-viewport-box">
    <!-- Feedback Banner -->
    <div class="feedback-strip font-retro {feedbackType}">
      {feedbackText}
    </div>

    <!-- Soil Profile Depth Gauge -->
    <div class="soil-depth-meter-track">
      <!-- Target Sweet-Spot Region -->
      <div 
        class="target-green-zone"
        style="left: {targetZoneStart}%; width: {targetZoneEnd - targetZoneStart}%;"
      >
        <span class="zone-label font-pixel">SMAP OPTIMAL (4-6.5cm)</span>
      </div>

      <!-- Moving Needle -->
      <div class="meter-needle" style="left: {needlePosition}%;">
        <div class="needle-tip font-pixel">▼</div>
        <div class="needle-line"></div>
      </div>

      <!-- Soil Profile Layer Graphic (Cross-Section) -->
      <div class="soil-layer-slice">
        <span class="soil-tag font-data left">0cm Surface</span>
        <span class="soil-tag font-data center">6cm Root Zone</span>
        <span class="soil-tag font-data right">12cm Hardpan</span>
      </div>
    </div>

    <!-- Action Button -->
    <div class="action-controls-row">
      {#if !isGameOver}
        <button type="button" class="drop-seed-btn font-pixel" onclick={handleDropSeed}>
          [DROP SEED] (SPACEBAR)
        </button>
      {:else}
        <div class="results-cluster">
          <div class="results-score font-pixel">
            SOWING COMPLETE: {perfectCount} PERFECT, {goodCount} GOOD, {TOTAL_SEEDS - (perfectCount + goodCount)} MISSED
          </div>
          <div class="results-actions">
            <button type="button" class="pixel-btn" onclick={onComplete}>
              PROCEED TO CROP SELECTION →
            </button>
            <button type="button" class="pixel-btn btn-secondary" onclick={resetGame}>
              ↺ RETRY SOWING
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Furrow Bed Seed Sowing Progress (Visual Soil Row) -->
    <div class="furrow-bed-row">
      <div class="furrow-header font-data">
        FARM FIELD FURROW: SEEDS PLANTED ({sownSeeds.length} / {TOTAL_SEEDS})
      </div>
      <div class="seed-plots-track">
        {#each Array(TOTAL_SEEDS) as _, i}
          {@const seed = sownSeeds[i]}
          <div class="seed-slot {seed ? seed.quality : 'empty'}">
            <span class="slot-num font-data">#{i + 1}</span>
            {#if seed}
              {#if seed.quality === 'perfect'}
                <div class="sprout-icon font-pixel">★ 5cm</div>
              {:else if seed.quality === 'good'}
                <div class="sprout-icon font-pixel">● {seed.depthCm}cm</div>
              {:else}
                <div class="sprout-icon font-pixel">× {seed.depthCm}cm</div>
              {/if}
            {:else}
              <div class="empty-dot">·</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .sowing-game-container {
    background-color: #160C08;
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
    border: 2px solid #8A522A;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .brief-badge {
    color: #FFB703;
    font-size: 0.75rem;
    letter-spacing: 1px;
  }

  .brief-text {
    font-size: 1.25rem;
    color: #EBD6C2;
    line-height: 1.35;
  }

  .meter-viewport-box {
    background-color: #0E160E;
    border: 3px solid #00FF66;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.25), 0 4px 0 #000;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .feedback-strip {
    text-align: center;
    padding: 10px;
    font-size: 1.35rem;
    background-color: #1A281A;
    border: 2px solid #2E5A35;
    color: #F8EAD6;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feedback-strip.perfect {
    background-color: #143814;
    border-color: #00FF66;
    color: #00FF66;
    font-weight: bold;
    box-shadow: 0 0 12px rgba(0, 255, 102, 0.4);
  }

  .feedback-strip.good {
    background-color: #2E2812;
    border-color: #FFB703;
    color: #FFB703;
  }

  .feedback-strip.miss {
    background-color: #381414;
    border-color: #E63946;
    color: #FFAAAA;
  }

  /* Depth Gauge Track */
  .soil-depth-meter-track {
    position: relative;
    height: 70px;
    background: linear-gradient(90deg, #A47148 0%, #6E3B1C 50%, #3D1C08 100%);
    border: 3px solid #000;
    overflow: hidden;
    box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.7);
  }

  .target-green-zone {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: rgba(0, 255, 102, 0.45);
    border-left: 3px dashed #00FF66;
    border-right: 3px dashed #00FF66;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.5);
  }

  .zone-label {
    font-size: 0.58rem;
    color: #000;
    background-color: #00FF66;
    padding: 2px 6px;
    letter-spacing: 0.5px;
    font-weight: bold;
  }

  .meter-needle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: #FFD700;
    transform: translateX(-50%);
    z-index: 10;
    box-shadow: 0 0 10px #FFD700;
  }

  .needle-tip {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    color: #FFD700;
    font-size: 1rem;
    text-shadow: 0 0 8px #FF0000;
  }

  .soil-layer-slice {
    position: absolute;
    bottom: 4px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
  }

  .soil-tag {
    font-size: 0.7rem;
    color: #EBD6C2;
    text-shadow: 1px 1px 2px #000;
  }

  .action-controls-row {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  .drop-seed-btn {
    background-color: #00FF66;
    color: #000;
    border: 3px solid #000;
    font-size: 1.1rem;
    padding: 16px 36px;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(0, 255, 102, 0.6), 0 5px 0 #000;
    transition: transform 0.1s, box-shadow 0.1s;
    letter-spacing: 1px;
  }

  .drop-seed-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 28px rgba(0, 255, 102, 0.8), 0 7px 0 #000;
    background-color: #33FF88;
  }

  .drop-seed-btn:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 #000;
  }

  .results-cluster {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .results-score {
    font-size: 0.95rem;
    color: #00FF66;
    text-align: center;
    letter-spacing: 1px;
  }

  .results-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* Furrow Row */
  .furrow-bed-row {
    background-color: #24140D;
    border: 2px solid #6E3B1C;
    padding: 12px;
  }

  .furrow-header {
    font-size: 0.72rem;
    color: #FFB703;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }

  .seed-plots-track {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  .seed-slot {
    background-color: #1A0D08;
    border: 2px solid #4A2818;
    border-radius: 3px;
    padding: 10px 6px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .seed-slot.perfect {
    border-color: #00FF66;
    background-color: #142814;
    color: #00FF66;
  }

  .seed-slot.good {
    border-color: #FFB703;
    background-color: #282412;
    color: #FFB703;
  }

  .seed-slot.miss {
    border-color: #E63946;
    background-color: #281212;
    color: #E63946;
  }

  .slot-num {
    font-size: 0.65rem;
    color: #8A6850;
  }

  .sprout-icon {
    font-size: 0.75rem;
  }

  .empty-dot {
    font-size: 1.2rem;
    color: #553A28;
  }
</style>