<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import confetti from 'canvas-confetti';
  import { sfx } from '../../utils/sound';

  interface Props {
    isOpen?: boolean;
    onClose: () => void;
    onPlayGame?: () => void;
  }

  let { isOpen = true, onClose, onPlayGame }: Props = $props();

  // 10-Second Promo Timer State
  const TOTAL_DURATION_MS = 10000;
  let elapsedMs = $state(0);
  let isPlaying = $state(true);
  let timerInterval: any = null;
  let hasTriggeredConfetti = false;

  // Derive current scene (0 to 3) based on elapsed time:
  // Scene 0: 0.0s - 2.5s (The Crisis / Monsoons Shift)
  // Scene 1: 2.5s - 5.0s (NASA Satellites Engage)
  // Scene 2: 5.0s - 7.5s (Global Farmer Alliance)
  // Scene 3: 7.5s - 10.0s (Title Splash / Call to Action)
  const currentScene = $derived(
    elapsedMs < 2500 ? 0 :
    elapsedMs < 5000 ? 1 :
    elapsedMs < 7500 ? 2 : 3
  );

  const progressPercent = $derived(Math.min(100, (elapsedMs / TOTAL_DURATION_MS) * 100));
  const secondsRemaining = $derived(Math.max(0, ((TOTAL_DURATION_MS - elapsedMs) / 1000)).toFixed(1));
  const currentSeconds = $derived((elapsedMs / 1000).toFixed(1));

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    isPlaying = true;
    const intervalTick = 30; // 30ms resolution

    timerInterval = setInterval(() => {
      elapsedMs += intervalTick;

      // Sound triggers synced to scene cuts
      if (elapsedMs >= 2480 && elapsedMs <= 2520) {
        sfx.playTelemetry();
      } else if (elapsedMs >= 4980 && elapsedMs <= 5020) {
        sfx.playTextBlip();
      } else if (elapsedMs >= 7480 && elapsedMs <= 7520 && !hasTriggeredConfetti) {
        hasTriggeredConfetti = true;
        sfx.playSuccess();
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.5 }
          });
        } catch {}
      }

      if (elapsedMs >= TOTAL_DURATION_MS) {
        elapsedMs = TOTAL_DURATION_MS;
        isPlaying = false;
        clearInterval(timerInterval);
      }
    }, intervalTick);
  }

  function pauseTimer() {
    isPlaying = false;
    if (timerInterval) clearInterval(timerInterval);
  }

  function togglePlay() {
    if (isPlaying) {
      pauseTimer();
    } else {
      if (elapsedMs >= TOTAL_DURATION_MS) {
        replay();
      } else {
        startTimer();
      }
    }
  }

  function replay() {
    pauseTimer();
    elapsedMs = 0;
    hasTriggeredConfetti = false;
    sfx.playAlert();
    startTimer();
  }

  function jumpToScene(sceneIdx: number) {
    pauseTimer();
    elapsedMs = sceneIdx * 2500;
    if (sceneIdx === 3) {
      sfx.playSuccess();
    } else if (sceneIdx === 1) {
      sfx.playTelemetry();
    } else {
      sfx.playSelect();
    }
    startTimer();
  }

  onMount(() => {
    sfx.playAlert();
    startTimer();
  });

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });
</script>

<div class="promo-backdrop" role="presentation" onclick={onClose}>
  <div 
    class="promo-modal"
    role="dialog"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Top Header Bar -->
    <header class="promo-header">
      <div class="promo-tag font-pixel">
        <span class="rec-dot" class:pulsing={isPlaying}>●</span>
        <span>FIELD SHIFT — OFFICIAL 10-SEC PROMO TRAILER</span>
      </div>
      <div class="timer-badge font-pixel">
        <span class="time-readout">{currentSeconds}s / 10.0s</span>
        <span class="rem-readout font-data">({secondsRemaining}s left)</span>
      </div>
      <button class="promo-close font-pixel" onclick={onClose} aria-label="Close promo">✕</button>
    </header>

    <!-- Main 16:9 Cinematic Screen -->
    <div class="cinematic-stage">
      <!-- 10s Top Precision Progress Bar -->
      <div class="promo-timeline-bar">
        <div class="timeline-fill" style:width="{progressPercent}%"></div>
        <!-- 2.5s scene markers -->
        <div class="timeline-marker m1" title="0.0s - The Crisis"></div>
        <div class="timeline-marker m2" title="2.5s - NASA Satellites"></div>
        <div class="timeline-marker m3" title="5.0s - Global Alliance"></div>
        <div class="timeline-marker m4" title="7.5s - Shift The Field"></div>
      </div>

      <!-- Cinematic Viewport -->
      <div class="cinematic-viewport scene-{currentScene}">
        <!-- Top Letterbox Bar -->
        <div class="cinematic-letterbox top">
          <span class="mission-watermark font-pixel">NASA SPACE APPS GLOBAL CHALLENGE 2024</span>
          <span class="live-clock font-data">T+{currentSeconds}s</span>
        </div>

        <!-- SCENE 0: (0.0s - 2.5s) The Monsoons Are Shifting -->
        {#if currentScene === 0}
          <div class="scene-frame scene-crisis">
            <div class="crisis-radar-glow"></div>
            <div class="scene-content">
              <div class="eyebrow-alert font-pixel">⚠️ GLOBAL CLIMATE DRIFT DETECTED</div>
              <h2 class="scene-headline font-pixel text-danger">
                THE MONSOONS ARE SHIFTING.
              </h2>
              <p class="scene-subtext font-data">
                Aquifers sinking by −3.2 cm/year. Scorching 46°C heat domes.
                Amma's ancestral farm is running out of time.
              </p>
              <div class="urgent-stats-strip font-pixel">
                <span class="stat-pill red">BOREWELL: CRITICAL (42%)</span>
                <span class="stat-pill amber">SOIL MOISTURE: 18%</span>
              </div>
            </div>
          </div>

        <!-- SCENE 1: (2.5s - 5.0s) NASA Satellites Engage -->
        {:else if currentScene === 1}
          <div class="scene-frame scene-satellite">
            <div class="satellite-sweep-cone"></div>
            <div class="scene-content">
              <div class="eyebrow-alert font-pixel text-cyan">🛰️ 680 KM ORBITAL SCAN ACTIVE</div>
              <h2 class="scene-headline font-pixel text-cyan">
                NASA SATELLITES UNLOCK THE SKY.
              </h2>
              <p class="scene-subtext font-data">
                SMAP root-zone microwave radiometry. GRACE groundwater gravity sensors. 
                GPM real-time cloudburst storm tracking.
              </p>
              <div class="telemetry-badges-row font-pixel">
                <span class="stat-pill cyan">NASA SMAP: L-BAND 1.41 GHz</span>
                <span class="stat-pill blue">NASA GRACE-FO: MASS GRAVITY</span>
                <span class="stat-pill green">NASA GPM: 92mm/hr RADAR</span>
              </div>
            </div>
          </div>

        <!-- SCENE 2: (5.0s - 7.5s) Global Farmer Alliance -->
        {:else if currentScene === 2}
          <div class="scene-frame scene-alliance">
            <div class="alliance-grid-bg"></div>
            <div class="scene-content">
              <div class="eyebrow-alert font-pixel text-gold">🌍 4 AGRO-ECOLOGICAL REGIONS UNITED</div>
              <h2 class="scene-headline font-pixel text-gold">
                HEROES ACROSS 3 CONTINENTS.
              </h2>
              
              <!-- Character Roster Grid -->
              <div class="heroes-lineup">
                <div class="hero-chip">
                  <span class="hero-icon">👨‍🌾</span>
                  <div class="hero-text">
                    <span class="h-name font-pixel">HARI</span>
                    <span class="h-loc font-data">India • Millets</span>
                  </div>
                </div>

                <div class="hero-chip">
                  <span class="hero-icon">👩‍🌾</span>
                  <div class="hero-text">
                    <span class="h-name font-pixel">SARAH</span>
                    <span class="h-loc font-data">USA • Contour Rye</span>
                  </div>
                </div>

                <div class="hero-chip">
                  <span class="hero-icon">👩🏿‍🌾</span>
                  <div class="hero-text">
                    <span class="h-name font-pixel">AMINA</span>
                    <span class="h-loc font-data">Kenya • Zaï Pits</span>
                  </div>
                </div>

                <div class="hero-chip">
                  <span class="hero-icon">👵</span>
                  <div class="hero-text">
                    <span class="h-name font-pixel">AMMA</span>
                    <span class="h-loc font-data">Punjab • Heirloom</span>
                  </div>
                </div>
              </div>

              <div class="action-mantra font-pixel">
                "SUPPORTS FARMERS — DOESN'T REPLACE THEM!"
              </div>
            </div>
          </div>

        <!-- SCENE 3: (7.5s - 10.0s) Title Splash & Play CTA -->
        {:else}
          <div class="scene-frame scene-splash">
            <div class="splash-sunburst"></div>
            <div class="scene-content">
              <div class="final-badge font-pixel">🌾 PLAY THE 100% SCIENTIFIC FARM SIMULATION</div>
              <h1 class="game-logo font-pixel">
                FIELD SHIFT
              </h1>
              <div class="game-tagline font-data">
                AMMA'S FIELD • CLIMATE ADAPTATION RPG
              </div>

              <div class="final-cta-row">
                <button 
                  type="button" 
                  class="promo-play-btn font-pixel"
                  onclick={() => {
                    onClose();
                    onPlayGame?.();
                  }}
                >
                  ⚡ [PLAY FULL GAME NOW]
                </button>
              </div>

              <div class="accreditation font-data">
                Powered by NASA Earth Applied Sciences • Open-Source NASA Data
              </div>
            </div>
          </div>
        {/if}

        <!-- Bottom Letterbox Bar -->
        <div class="cinematic-letterbox bottom">
          <div class="scene-stepper font-pixel">
            <button class="step-btn" class:active={currentScene === 0} onclick={() => jumpToScene(0)}>
              01 CRISIS
            </button>
            <span class="step-divider">|</span>
            <button class="step-btn" class:active={currentScene === 1} onclick={() => jumpToScene(1)}>
              02 SATELLITES
            </button>
            <span class="step-divider">|</span>
            <button class="step-btn" class:active={currentScene === 2} onclick={() => jumpToScene(2)}>
              03 ALLIANCE
            </button>
            <span class="step-divider">|</span>
            <button class="step-btn" class:active={currentScene === 3} onclick={() => jumpToScene(3)}>
              04 SHIFT
            </button>
          </div>

          <div class="player-controls">
            <button class="ctrl-icon-btn font-pixel" onclick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
            </button>
            <button class="ctrl-icon-btn font-pixel" onclick={replay} title="Replay 10s Promo">
              🔄 REPLAY
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Promo Pitch Details Strip -->
    <footer class="promo-footer">
      <div class="pitch-col font-data">
        <span class="pitch-title font-pixel">💡 10-SECOND PITCH SCRIPT:</span>
        <p class="pitch-text">
          <em>"When erratic monsoons threaten ancestral farms, NASA satellites deploy 680 km above Earth. 
          Step into Farmer Hari's shoes: match heirloom seeds, conserve aquifers, deploy Iowa buffers, and build Kenyan Zaï pits. 
          Shift the field. Save the harvest."</em>
        </p>
      </div>

      <div class="footer-btn-col">
        <button 
          type="button" 
          class="start-adventure-action font-pixel"
          onclick={() => {
            onClose();
            onPlayGame?.();
          }}
        >
          🎮 ENTER GAME WORLD
        </button>
      </div>
    </footer>
  </div>
</div>

<style>
  .promo-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(4, 8, 6, 0.94);
    backdrop-filter: blur(10px);
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

  .promo-modal {
    width: 100%;
    max-width: 860px;
    background: #09130D;
    border: 3px solid #00FF66;
    border-radius: 8px;
    box-shadow: 0 0 32px rgba(0, 255, 102, 0.4), 0 16px 48px rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #FFFFFF;
  }

  .promo-header {
    background: #060D08;
    border-bottom: 2px solid #1C3D26;
    padding: 10px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .promo-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #00FF66;
  }

  .rec-dot {
    color: #FF4D4D;
    font-size: 14px;
  }

  .rec-dot.pulsing {
    animation: recBlink 0.6s infinite alternate;
  }

  @keyframes recBlink {
    from { opacity: 0.2; }
    to { opacity: 1; text-shadow: 0 0 8px #FF4D4D; }
  }

  .timer-badge {
    background: #0E2214;
    border: 1px solid #00FF66;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .time-readout {
    color: #FFD166;
  }

  .rem-readout {
    color: #88B896;
    font-size: 10px;
  }

  .promo-close {
    background: #2E1515;
    border: 1px solid #FF5A5A;
    color: #FF8585;
    font-size: 11px;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .promo-close:hover {
    background: #FF5A5A;
    color: #000;
  }

  .cinematic-stage {
    position: relative;
    background: #000000;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    max-height: 480px;
    display: flex;
    flex-direction: column;
  }

  .promo-timeline-bar {
    position: relative;
    height: 6px;
    background: #18281E;
    width: 100%;
    z-index: 10;
  }

  .timeline-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF4D4D 0%, #00E5FF 50%, #00FF66 100%);
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.7);
    transition: width 0.03s linear;
  }

  .timeline-marker {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.4);
  }

  .m1 { left: 0%; }
  .m2 { left: 25%; }
  .m3 { left: 50%; }
  .m4 { left: 75%; }

  .cinematic-viewport {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  .cinematic-letterbox {
    background: rgba(0, 0, 0, 0.85);
    padding: 6px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }

  .cinematic-letterbox.top {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .cinematic-letterbox.bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .mission-watermark {
    font-size: 9px;
    color: #88A896;
    letter-spacing: 0.5px;
  }

  .live-clock {
    font-size: 10px;
    color: #00FF66;
  }

  .scene-frame {
    position: absolute;
    inset: 30px 0 38px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 32px;
    text-align: center;
    animation: zoomCut 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }

  @keyframes zoomCut {
    from { transform: scale(0.94); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .scene-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    max-width: 680px;
  }

  .eyebrow-alert {
    font-size: 10px;
    padding: 3px 8px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  .scene-headline {
    font-size: 20px;
    line-height: 1.3;
    margin: 2px 0;
    text-shadow: 0 0 16px rgba(0, 0, 0, 0.8);
  }

  .scene-subtext {
    font-size: 13px;
    line-height: 1.5;
    color: #D6E8DC;
    max-width: 580px;
  }

  .text-danger { color: #FF4D4D; text-shadow: 0 0 16px rgba(255, 77, 77, 0.6); }
  .text-cyan { color: #00E5FF; text-shadow: 0 0 16px rgba(0, 229, 255, 0.6); }
  .text-gold { color: #FFD166; text-shadow: 0 0 16px rgba(255, 209, 102, 0.6); }

  /* Scene 0 Styling */
  .scene-crisis {
    background: radial-gradient(circle at center, #3B1212 0%, #170707 60%, #080303 100%);
  }

  .urgent-stats-strip {
    display: flex;
    gap: 10px;
    margin-top: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .stat-pill {
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid;
  }

  .stat-pill.red { background: #3B0E0E; border-color: #FF4D4D; color: #FF4D4D; }
  .stat-pill.amber { background: #3B2B0E; border-color: #FFB703; color: #FFB703; }
  .stat-pill.cyan { background: #0A283D; border-color: #00E5FF; color: #00E5FF; }
  .stat-pill.blue { background: #0D1C38; border-color: #2F6FED; color: #7CA8FF; }
  .stat-pill.green { background: #0E331B; border-color: #00FF66; color: #00FF66; }

  /* Scene 1 Styling */
  .scene-satellite {
    background: radial-gradient(circle at center, #0B243B 0%, #061421 60%, #02070D 100%);
  }

  .satellite-sweep-cone {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 20%, rgba(0, 229, 255, 0.25) 0%, transparent 65%);
    animation: pulseBeam 1.2s infinite alternate;
  }

  @keyframes pulseBeam {
    from { opacity: 0.5; transform: scaleY(0.95); }
    to { opacity: 1; transform: scaleY(1.05); }
  }

  .telemetry-badges-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 6px;
  }

  /* Scene 2 Styling */
  .scene-alliance {
    background: radial-gradient(circle at center, #1E3320 0%, #0E1C12 60%, #050B07 100%);
  }

  .heroes-lineup {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin: 8px 0;
    width: 100%;
    max-width: 580px;
  }

  .hero-chip {
    background: #0E1F14;
    border: 1.5px solid #2F5D3A;
    border-radius: 6px;
    padding: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hero-icon {
    font-size: 22px;
  }

  .hero-text {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .h-name {
    font-size: 9px;
    color: #FFD166;
  }

  .h-loc {
    font-size: 8px;
    color: #92BFA0;
  }

  .action-mantra {
    font-size: 11px;
    color: #00FF66;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  /* Scene 3 Styling */
  .scene-splash {
    background: radial-gradient(circle at center, #0F3B1E 0%, #071D0E 60%, #030C06 100%);
  }

  .splash-sunburst {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(0, 255, 102, 0.25) 0%, transparent 70%);
  }

  .final-badge {
    font-size: 10px;
    color: #FFD166;
    background: #1C2E20;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid #3FA34D;
  }

  .game-logo {
    font-size: 32px;
    color: #00FF66;
    text-shadow: 0 0 24px rgba(0, 255, 102, 0.7), 0 0 40px rgba(0, 255, 102, 0.3);
    letter-spacing: 2px;
    margin: 4px 0 2px 0;
  }

  .game-tagline {
    font-size: 12px;
    color: #A0D8B4;
    letter-spacing: 1px;
  }

  .final-cta-row {
    margin: 8px 0 4px 0;
  }

  .promo-play-btn {
    background: #00FF66;
    color: #000000;
    font-size: 13px;
    padding: 12px 28px;
    border-radius: 6px;
    border: 2px solid #FFFFFF;
    box-shadow: 0 0 20px rgba(0, 255, 102, 0.6);
    cursor: pointer;
    transition: all 0.15s ease;
    animation: btnPulse 1.2s infinite alternate;
  }

  @keyframes btnPulse {
    from { transform: scale(1); box-shadow: 0 0 16px rgba(0, 255, 102, 0.5); }
    to { transform: scale(1.05); box-shadow: 0 0 28px rgba(0, 255, 102, 0.9); }
  }

  .accreditation {
    font-size: 10px;
    color: #729E80;
  }

  /* Bottom Controls Bar */
  .scene-stepper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .step-btn {
    background: none;
    border: none;
    color: #729E80;
    font-size: 9px;
    cursor: pointer;
    padding: 2px 4px;
    transition: all 0.15s ease;
  }

  .step-btn.active, .step-btn:hover {
    color: #00FF66;
    text-shadow: 0 0 6px #00FF66;
  }

  .step-divider {
    color: #385240;
    font-size: 9px;
  }

  .player-controls {
    display: flex;
    gap: 8px;
  }

  .ctrl-icon-btn {
    background: #14281B;
    border: 1px solid #2F5D3A;
    color: #D6E8DC;
    font-size: 9px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .ctrl-icon-btn:hover {
    background: #00FF66;
    color: #000000;
  }

  /* Footer Details */
  .promo-footer {
    background: #060D08;
    border-top: 2px solid #1C3D26;
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .pitch-col {
    flex: 1;
    min-width: 260px;
  }

  .pitch-title {
    font-size: 10px;
    color: #FFD166;
    display: block;
    margin-bottom: 3px;
  }

  .pitch-text {
    font-size: 11px;
    color: #C2DEC9;
    line-height: 1.45;
  }

  .start-adventure-action {
    background: #00FF66;
    color: #000000;
    font-size: 11px;
    padding: 10px 18px;
    border-radius: 6px;
    border: 2px solid #52B788;
    cursor: pointer;
    box-shadow: 0 0 12px rgba(0, 255, 102, 0.4);
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .start-adventure-action:hover {
    background: #25FF7B;
    transform: translateY(-2px);
  }
</style>
