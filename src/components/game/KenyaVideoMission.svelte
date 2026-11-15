<script lang="ts">
  import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
    onClose: () => void;
  }

  let { onComplete, onClose }: Props = $props();

  let isPlaying = $state(true);
  let activeSceneIndex = $state(0);
  let videoProgress = $state(22); // percent
  let isMuted = $state(false);

  // Zaï pit recipe puzzle state
  let selectedRecipeSteps = $state<string[]>([]);
  let puzzleChecked = $state(false);
  let puzzleSuccess = $state(false);

  interface VideoScene {
    timestamp: string;
    chapterTitle: string;
    nasaSensor: string;
    headline: string;
    description: string;
    keyMetric: string;
    metricValue: string;
    sceneVisualType: 'thermal' | 'soil' | 'zai' | 'yield';
  }

  const SCENES: VideoScene[] = [
    {
      timestamp: '00:45',
      chapterTitle: 'Chapter 1: The Sahel Heat Dome',
      nasaSensor: 'NASA MODIS & ECOSTRESS (Thermal Infrared)',
      headline: '46.4°C Land Surface Temperature Alert in Machakos',
      description: 'NASA satellite thermal scans expose an unprecedented prolonged heat dome across the Sahel and East African rift valleys. Soil surfaces without vegetation bake past 48°C, vaporizing residual moisture within hours.',
      keyMetric: 'Max Surface Temperature:',
      metricValue: '46.4°C (Normal: 34.2°C)',
      sceneVisualType: 'thermal'
    },
    {
      timestamp: '01:52',
      chapterTitle: 'Chapter 2: The Hardpan Dilemma',
      nasaSensor: 'NASA SMAP L4 (Soil Moisture Active Passive)',
      headline: 'Farmer Amina Shows Crusted Laterite Hardpan',
      description: 'Decades of clear-cutting and conventional plowing stripped the organic topsoil. Rains bounce off the baked clay hardpan like concrete, washing into seasonal dry gullies rather than recharging the root zone.',
      keyMetric: 'Topsoil Water Permeability:',
      metricValue: 'Only 3.2 mm/hr (Severely Crusted)',
      sceneVisualType: 'soil'
    },
    {
      timestamp: '03:10',
      chapterTitle: 'Chapter 3: The Ancient Zaï Pits Revived',
      nasaSensor: 'NASA Landsat 9 & Sentinel-2 (NDVI Vegetation Index)',
      headline: 'Traditional Pits + Organic Compost Bio-Shields',
      description: 'Amina and her women’s cooperative revived the ancient Zaï technique: digging 20cm deep basins, layering compost and neem biochar, and letting native termites dig natural aerating macro-tunnels.',
      keyMetric: 'Root Zone Moisture Jump:',
      metricValue: '14% → 38% Volumetric Saturation',
      sceneVisualType: 'zai'
    },
    {
      timestamp: '04:20',
      chapterTitle: 'Chapter 4: The Green Canopy Returns',
      nasaSensor: 'NASA GPM & ECOSTRESS Evapotranspiration',
      headline: '1,400 Hectares Restored with Zero Chemical Inputs',
      description: 'Sorghum and pearl millet canopies now shade the soil, reducing ground temps by 8.5°C. Amina sends her field data to the global network to inspire regenerative farmers in India and across the world.',
      keyMetric: 'Sorghum Harvest Yield:',
      metricValue: '3.4x Increase over scorched controls',
      sceneVisualType: 'yield'
    }
  ];

  interface RecipeOption {
    id: string;
    text: string;
    stepNumber: number;
    icon: string;
  }

  const RECIPE_STEPS: RecipeOption[] = [
    {
      id: 'step_dig',
      text: 'Dig 20cm × 30cm Basins Along Topographic Contours',
      stepNumber: 1,
      icon: '⛏️'
    },
    {
      id: 'step_compost',
      text: 'Layer Animal Manure, Organic Compost & Neem Twigs',
      stepNumber: 2,
      icon: '🍂'
    },
    {
      id: 'step_seed',
      text: 'Plant Drought-Tolerant Sorghum / Millet Seeds on Ridge',
      stepNumber: 3,
      icon: '🌾'
    }
  ];

  const DISTRACTOR_STEPS: RecipeOption[] = [
    {
      id: 'step_chemical',
      text: 'Pour Liquid Chemical Nitrogen Fertilizer to Force Rapid Growth',
      stepNumber: -1,
      icon: '🧪'
    },
    {
      id: 'step_plastic',
      text: 'Cover Entire Field with Petroleum Plastic Film Sheet',
      stepNumber: -2,
      icon: '⬛'
    }
  ];

  const ALL_RECIPE_CHOICES = [...RECIPE_STEPS, ...DISTRACTOR_STEPS].sort(() => 0.5 - Math.random());

  function handleSelectScene(index: number) {
    sfx.playSelect();
    activeSceneIndex = index;
    videoProgress = Math.round(((index + 1) / SCENES.length) * 100);
  }

  function togglePlay() {
    sfx.playSelect();
    isPlaying = !isPlaying;
  }

  function handleAddStep(stepId: string) {
    if (selectedRecipeSteps.includes(stepId)) return;
    if (selectedRecipeSteps.length >= 3) return;
    sfx.playSelect();
    selectedRecipeSteps = [...selectedRecipeSteps, stepId];
    puzzleChecked = false;
  }

  function handleRemoveStep(stepId: string) {
    sfx.playSelect();
    selectedRecipeSteps = selectedRecipeSteps.filter(id => id !== stepId);
    puzzleChecked = false;
  }

  function handleVerifyRecipe() {
    puzzleChecked = true;
    const isCorrect = 
      selectedRecipeSteps.length === 3 &&
      selectedRecipeSteps[0] === 'step_dig' &&
      selectedRecipeSteps[1] === 'step_compost' &&
      selectedRecipeSteps[2] === 'step_seed';

    puzzleSuccess = isCorrect;
    if (isCorrect) {
      sfx.playSuccess();
      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      sfx.playErosion();
    }
  }

  function handleClaimMission() {
    sfx.playSuccess();
    onComplete();
  }
</script>

<div class="video-backdrop" role="presentation" onclick={onClose}>
  <div 
    class="video-modal"
    role="dialog"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Modal Header -->
    <header class="modal-header">
      <div class="header-left">
        <span class="yt-logo-badge font-pixel">
          <span class="yt-play-icon">▶</span> FieldTube Global
        </span>
        <span class="stream-badge font-pixel">LIVE SATELLITE DISPATCH</span>
      </div>
      <button class="close-x-btn" onclick={onClose} aria-label="Close modal">✕</button>
    </header>

    <!-- Main Video Frame -->
    <div class="video-player-container">
      <!-- Simulated Video Screen Viewport -->
      <div class="video-screen" class:paused={!isPlaying}>
        <!-- Top HUD overlay inside video -->
        <div class="video-top-overlay">
          <span class="channel-callout font-pixel">
            🔴 NASA Earth Observatory | Field Report #418
          </span>
          <span class="sensor-chip font-data">
            {SCENES[activeSceneIndex].nasaSensor}
          </span>
        </div>

        <!-- Visual Scene Graphic representation -->
        <div class="scene-visual-art type-{SCENES[activeSceneIndex].sceneVisualType}">
          {#if SCENES[activeSceneIndex].sceneVisualType === 'thermal'}
            <div class="thermal-graphic">
              <div class="thermal-sun">☀️ 46.4°C</div>
              <div class="heat-waves">
                <span class="heat-line hl-1"></span>
                <span class="heat-line hl-2"></span>
                <span class="heat-line hl-3"></span>
              </div>
              <div class="thermal-ground">
                <div class="ground-label font-pixel">CRACKED CLAY HARDPAN (3.2 mm/hr INFILTRATION)</div>
              </div>
            </div>
          {:else if SCENES[activeSceneIndex].sceneVisualType === 'soil'}
            <div class="soil-graphic">
              <div class="amina-portrait">
                <span class="amina-emoji">👩🏿‍🌾</span>
                <span class="amina-name font-pixel">FARMER AMINA (KENYA)</span>
              </div>
              <div class="speech-quote font-body">
                "When the rains fall on bare land, the drops hit like hammers and seal the soil pores. We needed to heal the surface first."
              </div>
            </div>
          {:else if SCENES[activeSceneIndex].sceneVisualType === 'zai'}
            <div class="zai-graphic">
              <div class="zai-pit-cutaway">
                <div class="pit-basin">
                  <span class="pit-layer compost">🍂 Organic Compost & Biochar</span>
                  <span class="pit-layer seeds">🌱 Sprouting Sorghum Roots</span>
                  <span class="pit-layer termites">🐜 Termite Macro-Pores (Water Channels)</span>
                </div>
              </div>
              <div class="zai-callout font-pixel">
                WATER RETENTION: +170% OVER CONVENTIONAL FURROWS
              </div>
            </div>
          {:else}
            <div class="yield-graphic">
              <div class="canopy-banner font-pixel">
                🌾 FLOURISHING SAHEL SORGHUM CANOPY
              </div>
              <div class="yield-meter font-data">
                <div class="meter-bar">
                  <div class="meter-fill" style="width: 88%;"></div>
                </div>
                <span>3.4x Crop Biomass (NASA Landsat 9 Verified)</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Live Subtitles & Telemetry Overlay -->
        <div class="video-lower-third">
          <div class="lower-third-meta font-data">
            <span class="metric-label">{SCENES[activeSceneIndex].keyMetric}</span>
            <span class="metric-val font-pixel">{SCENES[activeSceneIndex].metricValue}</span>
          </div>
          <h4 class="scene-headline font-pixel">{SCENES[activeSceneIndex].headline}</h4>
          <p class="scene-desc font-body">{SCENES[activeSceneIndex].description}</p>
        </div>

        <!-- Video Player Controls Bar (YouTube Style) -->
        <div class="video-controls-bar">
          <!-- Progress bar -->
          <div 
            class="progress-track" 
            role="slider"
            tabindex="0"
            aria-label="Seek video chapter"
            aria-valuenow={videoProgress}
            aria-valuemin="0"
            aria-valuemax="100"
            onclick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              const targetIdx = Math.min(SCENES.length - 1, Math.floor(ratio * SCENES.length));
              handleSelectScene(targetIdx);
            }}
            onkeydown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                handleSelectScene(Math.min(SCENES.length - 1, activeSceneIndex + 1));
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                handleSelectScene(Math.max(0, activeSceneIndex - 1));
              }
            }}
          >
            <div class="progress-fill" style:width="{videoProgress}%"></div>
            <div class="progress-scrubber" style:left="{videoProgress}%"></div>
          </div>

          <div class="controls-row">
            <div class="left-controls">
              <button class="ctrl-btn font-pixel" onclick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button class="ctrl-btn font-pixel" onclick={() => isMuted = !isMuted}>
                {isMuted ? '🔇' : '🔊'}
              </button>
              <span class="timecode font-data">
                {SCENES[activeSceneIndex].timestamp} / 04:30
              </span>
            </div>

            <div class="right-chapters font-pixel">
              {#each SCENES as sc, i}
                <button 
                  class="chapter-dot-btn" 
                  class:active={activeSceneIndex === i}
                  onclick={() => handleSelectScene(i)}
                  title={sc.chapterTitle}
                >
                  Ch {i + 1}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- YouTube Channel Info & Video Title -->
      <div class="video-metadata-section">
        <h3 class="video-main-title font-pixel">
          NASA Earth Observatory: 46.4°C Sahel Heat Dome & Ancient Zaï Pit Solutions in Kenya
        </h3>

        <div class="channel-bar">
          <div class="channel-info">
            <div class="channel-icon">🛰️</div>
            <div class="channel-names">
              <div class="c-name font-pixel">NASA Earth Applied Sciences <span class="badge-check">✓</span></div>
              <div class="c-subs font-data">1.48M subscribers • Field Shift Global Exchange</div>
            </div>
          </div>

          <div class="video-actions-pills font-pixel">
            <span class="pill-btn">👍 14.2K</span>
            <span class="pill-btn">🔁 Share</span>
            <span class="pill-btn">💾 Save</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Zaï Pit Recipe Builder Challenge -->
    <div class="recipe-challenge-section">
      <div class="challenge-header">
        <span class="challenge-badge font-pixel">🎯 MISSION CHALLENGE: RESTORE THE SAHEL</span>
        <h4 class="challenge-title font-pixel">
          Assemble Farmer Amina's 3-Step Zaï Pit Recipe in Correct Chronological Order:
        </h4>
        <p class="challenge-sub font-body">
          Select the correct 3 actions in sequence to recreate the biological water sponge that withstands 46°C heatwaves.
        </p>
      </div>

      <!-- Current Assembled Sequence Slots -->
      <div class="slots-assembly-row">
        {#each [0, 1, 2] as slotIdx}
          {@const stepId = selectedRecipeSteps[slotIdx]}
          {@const stepObj = ALL_RECIPE_CHOICES.find(c => c.id === stepId)}
          <div 
            class="assembly-slot" 
            class:filled={!!stepObj}
            class:correct={puzzleChecked && puzzleSuccess}
            class:wrong={puzzleChecked && !puzzleSuccess && !!stepObj}
          >
            <div class="slot-step-num font-pixel">STEP 0{slotIdx + 1}</div>
            {#if stepObj}
              <div class="slot-content">
                <span class="slot-icon">{stepObj.icon}</span>
                <span class="slot-text font-pixel">{stepObj.text}</span>
                <button 
                  class="remove-step-btn" 
                  onclick={() => handleRemoveStep(stepObj.id)}
                  aria-label="Remove step"
                >✕</button>
              </div>
            {:else}
              <div class="slot-placeholder font-data">
                [ Click an option below to fill Step {slotIdx + 1} ]
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Options Tray -->
      <div class="options-tray">
        <div class="tray-title font-pixel">AVAILABLE FIELD ACTIONS:</div>
        <div class="tray-buttons">
          {#each ALL_RECIPE_CHOICES as choice}
            {@const isSelected = selectedRecipeSteps.includes(choice.id)}
            <button
              type="button"
              class="choice-btn font-pixel"
              class:selected={isSelected}
              disabled={isSelected || selectedRecipeSteps.length >= 3}
              onclick={() => handleAddStep(choice.id)}
            >
              <span class="btn-icon">{choice.icon}</span>
              <span class="btn-text">{choice.text}</span>
              {#if isSelected}
                <span class="check-mark font-data">✓ SELECTED</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <footer class="modal-footer">
      <div class="footer-status font-data">
        {#if puzzleChecked}
          {#if puzzleSuccess}
            <div class="status-msg success font-pixel">
              🎉 SPECTACULAR! THE ZAÏ PIT COMPOST BIO-SHIELD IS PERFECTLY CONFIGURED!
            </div>
          {:else}
            <div class="status-msg error font-pixel">
              ⚠️ Not quite right! Clear incorrect choices and review Farmer Amina's video chapters above.
            </div>
          {/if}
        {:else}
          <div class="status-hint">
            💡 Watch all 4 chapters, then assemble the 3 recipe steps in chronological order.
          </div>
        {/if}
      </div>

      <div class="footer-buttons">
        {#if puzzleChecked && puzzleSuccess}
          <button class="claim-reward-btn font-pixel" onclick={handleClaimMission}>
            🌟 CLAIM MISSION REWARD (+40 COINS & ZAÏ PIT BIO-SHIELD)
          </button>
        {:else}
          <button 
            class="verify-recipe-btn font-pixel"
            disabled={selectedRecipeSteps.length < 3}
            onclick={handleVerifyRecipe}
          >
            🔍 VERIFY BIO-SHIELD RECIPE
          </button>
        {/if}
      </div>
    </footer>
  </div>
</div>

<style>
  .video-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(8, 12, 10, 0.9);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 0.25s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .video-modal {
    width: 100%;
    max-width: 880px;
    max-height: 94vh;
    overflow-y: auto;
    background: #121815;
    border: 3px solid #E63946;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8), inset 0 0 24px rgba(230, 57, 70, 0.2);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    color: #F8F9FA;
  }

  .modal-header {
    background: #0D1210;
    border-bottom: 2px solid #233029;
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .yt-logo-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #FFFFFF;
    background: #E63946;
    padding: 4px 10px;
    border-radius: 4px;
  }

  .yt-play-icon {
    font-size: 10px;
  }

  .stream-badge {
    font-size: 11px;
    color: #FFB703;
    background: #2B1D12;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #C05C46;
  }

  .close-x-btn {
    background: #241414;
    border: 1px solid #E63946;
    color: #FFB703;
    font-size: 14px;
    width: 30px;
    height: 30px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .close-x-btn:hover {
    background: #E63946;
    color: #FFFFFF;
  }

  .video-player-container {
    padding: 16px 20px;
    background: #0E1411;
  }

  .video-screen {
    position: relative;
    background: #050806;
    border: 2px solid #26382F;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 320px;
  }

  .video-top-overlay {
    position: absolute;
    top: 10px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }

  .channel-callout {
    font-size: 11px;
    color: #FFFFFF;
    background: rgba(0, 0, 0, 0.7);
    padding: 4px 8px;
    border-radius: 4px;
    border-left: 3px solid #E63946;
  }

  .sensor-chip {
    font-size: 10px;
    color: #A0E8B0;
    background: rgba(10, 30, 20, 0.8);
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #3FA34D;
  }

  .scene-visual-art {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 45px 20px 20px 20px;
    min-height: 180px;
    transition: background 0.3s ease;
  }

  .type-thermal {
    background: radial-gradient(circle at center, #782D16 0%, #3B140A 60%, #1A0905 100%);
  }

  .type-soil {
    background: radial-gradient(circle at center, #5A3F28 0%, #2E1F14 60%, #140C08 100%);
  }

  .type-zai {
    background: radial-gradient(circle at center, #264A2F 0%, #122818 60%, #08140B 100%);
  }

  .type-yield {
    background: radial-gradient(circle at center, #2C6E3B 0%, #143C1D 60%, #071A0B 100%);
  }

  .thermal-graphic {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .thermal-sun {
    font-size: 28px;
    font-weight: bold;
    color: #FFD166;
    text-shadow: 0 0 16px rgba(255, 209, 102, 0.6);
  }

  .heat-waves {
    display: flex;
    gap: 8px;
  }

  .heat-line {
    width: 60px;
    height: 4px;
    background: #E63946;
    border-radius: 2px;
    animation: wave 1.2s infinite alternate;
  }

  .hl-2 { animation-delay: 0.3s; width: 80px; background: #FFB703; }
  .hl-3 { animation-delay: 0.6s; width: 50px; background: #E63946; }

  @keyframes wave {
    from { transform: scaleX(0.8) translateY(-2px); }
    to { transform: scaleX(1.1) translateY(2px); }
  }

  .ground-label {
    font-size: 11px;
    color: #FFB703;
    background: rgba(0, 0, 0, 0.6);
    padding: 3px 8px;
    border-radius: 4px;
    margin-top: 8px;
  }

  .soil-graphic {
    display: flex;
    align-items: center;
    gap: 20px;
    max-width: 540px;
  }

  .amina-portrait {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 90px;
  }

  .amina-emoji {
    font-size: 42px;
  }

  .amina-name {
    font-size: 10px;
    color: #FFD166;
    text-align: center;
    margin-top: 4px;
  }

  .speech-quote {
    font-size: 13px;
    line-height: 1.5;
    color: #E2ECE5;
    background: rgba(0, 0, 0, 0.5);
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #E63946;
  }

  .zai-graphic {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .pit-basin {
    background: #1B2E21;
    border: 2px dashed #52B788;
    border-radius: 8px;
    padding: 12px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .pit-layer {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 4px;
  }

  .pit-layer.compost { background: #3B2B1B; color: #FFD166; }
  .pit-layer.seeds { background: #1B4527; color: #A0E8B0; }
  .pit-layer.termites { background: #112417; color: #74C69D; }

  .zai-callout {
    font-size: 11px;
    color: #00FF66;
  }

  .yield-graphic {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .canopy-banner {
    font-size: 14px;
    color: #FFD166;
  }

  .meter-bar {
    width: 240px;
    height: 12px;
    background: #0E2013;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .meter-fill {
    height: 100%;
    background: linear-gradient(90deg, #3FA34D, #00FF66);
    border-radius: 6px;
  }

  .video-lower-third {
    background: rgba(10, 16, 12, 0.92);
    border-top: 1px solid #23382B;
    padding: 10px 14px;
  }

  .lower-third-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    margin-bottom: 4px;
  }

  .metric-label { color: #A0B8A8; }
  .metric-val { color: #FFD166; font-size: 12px; }

  .scene-headline {
    font-size: 13px;
    color: #FFFFFF;
    margin: 2px 0 4px 0;
  }

  .scene-desc {
    font-size: 12px;
    line-height: 1.4;
    color: #C0D6C8;
  }

  .video-controls-bar {
    background: #080D0A;
    border-top: 1px solid #1E2E24;
    padding: 6px 12px 10px 12px;
  }

  .progress-track {
    position: relative;
    width: 100%;
    height: 6px;
    background: #24362B;
    border-radius: 3px;
    cursor: pointer;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: #E63946;
    border-radius: 3px;
  }

  .progress-scrubber {
    position: absolute;
    top: -4px;
    width: 14px;
    height: 14px;
    background: #FFFFFF;
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  }

  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .left-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ctrl-btn {
    background: none;
    border: none;
    color: #FFFFFF;
    font-size: 14px;
    cursor: pointer;
    padding: 2px 6px;
  }

  .ctrl-btn:hover {
    color: #E63946;
  }

  .timecode {
    font-size: 11px;
    color: #A0B8A8;
  }

  .right-chapters {
    display: flex;
    gap: 6px;
  }

  .chapter-dot-btn {
    background: #152219;
    border: 1px solid #2B4232;
    color: #A0C0B0;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .chapter-dot-btn:hover,
  .chapter-dot-btn.active {
    background: #E63946;
    border-color: #FF5A67;
    color: #FFFFFF;
  }

  .video-metadata-section {
    margin-top: 12px;
  }

  .video-main-title {
    font-size: 15px;
    color: #FFFFFF;
    margin: 4px 0 10px 0;
    line-height: 1.4;
  }

  .channel-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .channel-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .channel-icon {
    font-size: 26px;
  }

  .c-name {
    font-size: 13px;
    color: #FFD166;
  }

  .badge-check {
    color: #52B788;
  }

  .c-subs {
    font-size: 11px;
    color: #8CA896;
  }

  .video-actions-pills {
    display: flex;
    gap: 8px;
  }

  .pill-btn {
    font-size: 11px;
    background: #1B2A20;
    border: 1px solid #324D3C;
    padding: 5px 12px;
    border-radius: 16px;
    cursor: pointer;
  }

  .recipe-challenge-section {
    padding: 16px 20px;
    background: #141C17;
    border-top: 2px solid #24362B;
    border-bottom: 2px solid #24362B;
  }

  .challenge-header {
    margin-bottom: 14px;
  }

  .challenge-badge {
    font-size: 10px;
    color: #FFD166;
    background: #2B2212;
    padding: 3px 8px;
    border-radius: 3px;
  }

  .challenge-title {
    font-size: 14px;
    color: #FFFFFF;
    margin: 6px 0 4px 0;
  }

  .challenge-sub {
    font-size: 12px;
    color: #A0BCA8;
  }

  .slots-assembly-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .assembly-slot {
    background: #0E1611;
    border: 2px dashed #3D5A47;
    border-radius: 6px;
    padding: 10px 12px;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
  }

  .assembly-slot.filled {
    border-style: solid;
    border-color: #52B788;
    background: #18261D;
  }

  .assembly-slot.correct {
    border-color: #00FF66;
    background: #12301C;
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.3);
  }

  .assembly-slot.wrong {
    border-color: #FF4D4D;
    background: #2E1414;
    box-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
  }

  .slot-step-num {
    font-size: 10px;
    color: #74C69D;
    margin-bottom: 4px;
  }

  .slot-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .slot-icon {
    font-size: 18px;
  }

  .slot-text {
    font-size: 11px;
    color: #FFFFFF;
    flex: 1;
    line-height: 1.3;
  }

  .remove-step-btn {
    background: #3B1B1B;
    border: 1px solid #FF4D4D;
    color: #FFFFFF;
    font-size: 10px;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    cursor: pointer;
  }

  .slot-placeholder {
    font-size: 11px;
    color: #64826F;
    text-align: center;
    margin: auto 0;
  }

  .options-tray {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tray-title {
    font-size: 11px;
    color: #FFD166;
  }

  .tray-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .choice-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #1A261E;
    border: 2px solid #2F4536;
    border-radius: 6px;
    padding: 10px 14px;
    color: #FFFFFF;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .choice-btn:hover:not(:disabled) {
    background: #25382B;
    border-color: #52B788;
    transform: translateY(-1px);
  }

  .choice-btn.selected {
    opacity: 0.45;
    cursor: not-allowed;
    background: #111A14;
    border-color: #1F2D23;
  }

  .btn-icon {
    font-size: 16px;
  }

  .btn-text {
    flex: 1;
  }

  .check-mark {
    font-size: 10px;
    color: #52B788;
  }

  .modal-footer {
    background: #0D1210;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .footer-status {
    flex: 1;
  }

  .status-hint {
    font-size: 12px;
    color: #A0BCA8;
  }

  .status-msg.success {
    font-size: 12px;
    color: #00FF66;
  }

  .status-msg.error {
    font-size: 12px;
    color: #FF6B6B;
  }

  .verify-recipe-btn {
    background: #FFB703;
    color: #1A1A1A;
    font-size: 13px;
    padding: 10px 18px;
    border-radius: 6px;
    border: 2px solid #FFA000;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .verify-recipe-btn:hover:not(:disabled) {
    background: #FFC107;
    transform: scale(1.03);
  }

  .verify-recipe-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .claim-reward-btn {
    background: #00FF66;
    color: #052611;
    font-size: 13px;
    padding: 10px 20px;
    border-radius: 6px;
    border: 2px solid #52B788;
    cursor: pointer;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.4);
    animation: glowPulse 1.5s infinite alternate;
  }

  @keyframes glowPulse {
    from { box-shadow: 0 0 10px rgba(0, 255, 102, 0.3); }
    to { box-shadow: 0 0 20px rgba(0, 255, 102, 0.8); }
  }
</style>
