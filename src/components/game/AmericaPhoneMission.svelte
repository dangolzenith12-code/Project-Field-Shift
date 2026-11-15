<script lang="ts">
  import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
    onClose: () => void;
  }

  let { onComplete, onClose }: Props = $props();

  let callPhase = $state<'ringing' | 'connected' | 'crisis' | 'decision' | 'resolved'>('ringing');
  let selectedTactic = $state<number | null>(null);
  let audioBeep = $state(true);

  // Animated Audio Waveform ticks
  let waveformBars = $state<number[]>(Array(24).fill(12));
  let animId: number;

  onMount(() => {
    sfx.playSelect();
    let tick = 0;
    const animateWaveform = () => {
      tick++;
      if (callPhase === 'connected' || callPhase === 'crisis') {
        waveformBars = waveformBars.map((_, i) => {
          const val = 8 + Math.abs(Math.sin((tick * 0.15) + (i * 0.35)) * 26) + (Math.random() * 8);
          return Math.round(val);
        });
      } else if (callPhase === 'ringing') {
        const ring = Math.sin(tick * 0.2) > 0 ? 18 : 4;
        waveformBars = waveformBars.map(() => ring);
      } else {
        waveformBars = waveformBars.map(() => 6);
      }
      animId = requestAnimationFrame(animateWaveform);
    };
    animId = requestAnimationFrame(animateWaveform);

    return () => {
      cancelAnimationFrame(animId);
    };
  });

  function handleAcceptCall() {
    sfx.playTelemetry();
    callPhase = 'connected';
    setTimeout(() => {
      callPhase = 'crisis';
    }, 1200);
  }

  function handleChooseTactic(index: number) {
    sfx.playSelect();
    selectedTactic = index;
  }

  function handleExecuteTactic() {
    if (selectedTactic === 0) {
      // Correct choice: Winter Rye Buffers & Swale Infiltration
      sfx.playSuccess();
      try {
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.55 }
        });
      } catch {}
      callPhase = 'resolved';
    } else {
      // Wrong choice
      sfx.playErosion();
    }
  }

  function handleFinishMission() {
    sfx.playSuccess();
    onComplete();
  }
</script>

<div class="phone-backdrop" role="presentation" onclick={onClose}>
  <div 
    class="phone-terminal-modal"
    role="dialog"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Top Retro Communication Header -->
    <header class="terminal-header">
      <div class="status-indicator">
        <span class="blinking-dot" class:connected={callPhase !== 'ringing'}></span>
        <span class="channel-title font-pixel">
          {callPhase === 'ringing' ? 'INCOMING TRANSATLANTIC SATELLITE CALL' : 'ENCRYPTED SATELLITE RELAY LINK ACTIVE'}
        </span>
      </div>
      <div class="satellite-tag font-pixel">
        🛰️ NASA GPM & SWOT ORBITAL UPLINK
      </div>
      <button class="terminal-close font-pixel" onclick={onClose}>✕</button>
    </header>

    <!-- Caller Information Card -->
    <div class="caller-card">
      <div class="caller-avatar">
        <div class="avatar-ring">
          <span class="avatar-img">👩‍🌾</span>
        </div>
        <span class="caller-badge font-pixel">CALLER ID: VERIFIED</span>
      </div>

      <div class="caller-meta font-data">
        <div class="caller-name font-pixel">SARAH MITCHELL</div>
        <div class="caller-loc">Corn & Soybean Belt | Story County, Iowa, USA</div>
        <div class="caller-coord">Geo: 42.034° N, 93.582° W | Elevation: 295m</div>
        <div class="gpm-status font-pixel">
          📡 NASA GPM PRECIPITATION RADAR: <span class="highlight">92 mm/hr CLOUDBURST ALERT</span>
        </div>
      </div>

      <!-- Oscilloscope Audio Waveform -->
      <div class="waveform-box">
        <div class="wave-label font-pixel">VOICE WAVEFORM:</div>
        <div class="wave-bars">
          {#each waveformBars as height}
            <div class="wave-bar" style:height="{height}px"></div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Main Dialogue / Crisis Feed Area -->
    <div class="terminal-body">
      {#if callPhase === 'ringing'}
        <div class="ring-view">
          <div class="phone-ring-anim">
            <span class="phone-icon">📞</span>
            <div class="ripple-ring r1"></div>
            <div class="ripple-ring r2"></div>
            <div class="ripple-ring r3"></div>
          </div>
          <h3 class="ring-status font-pixel">INCOMING TRANSMISSION FROM IOWA, USA...</h3>
          <p class="ring-desc font-body">
            Village Weather Station antenna is receiving a high-priority agricultural distress transmission over NASA's GPM satellite network.
          </p>
          <button class="accept-call-btn font-pixel" onclick={handleAcceptCall}>
            📲 [PICK UP RECEIVER & ANSWER CALL]
          </button>
        </div>

      {:else if callPhase === 'connected'}
        <div class="connecting-view">
          <div class="terminal-spinner"></div>
          <span class="font-pixel">DECODING VOIP OVER NASA TDRS RELAY... STAND BY</span>
        </div>

      {:else if callPhase === 'crisis'}
        <div class="crisis-view">
          <div class="transcript-speech-bubble font-body">
            <div class="speaker-tag font-pixel">👩‍🌾 SARAH (IOWA):</div>
            <p>
              <em>"Hari! Can you hear me through the static?</em> Our NASA GPM weather feed just flared crimson. 
              A supercell convective thunderstorm is bearing down on Story County within 30 minutes!
            </p>
            <p>
              We have 350 acres of newly seeded topsoil. If 92 millimeters of torrential rain pounds bare dirt, 
              the runoff will carve 4-foot gullies and wash 18 tons of black topsoil per acre straight into the Skunk River! 
              I saw your village's regenerative contours on the global farmer network. 
              <strong>What emergency defense should we deploy immediately before the rain hits?!"</strong>
            </p>
          </div>

          <!-- NASA Scientific Insight Card -->
          <div class="nasa-intel-card font-data">
            <div class="intel-header font-pixel">
              <span>🛰️ NASA GPM (GLOBAL PRECIPITATION MEASUREMENT) TELEMETRY</span>
              <span class="intel-id">IMERG-V07B</span>
            </div>
            <div class="intel-stats">
              <div class="stat-col">
                <span class="stat-lbl">Instantaneous Rain Rate:</span>
                <span class="stat-val font-pixel text-warn">92.4 mm/hr</span>
              </div>
              <div class="stat-col">
                <span class="stat-lbl">Soil Shear Threshold:</span>
                <span class="stat-val font-pixel text-danger">EXCEEDED (High Slaking)</span>
              </div>
              <div class="stat-col">
                <span class="stat-lbl">Runoff Attenuation Buffer:</span>
                <span class="stat-val font-pixel text-accent">NEEDED IMMEDIATELY</span>
              </div>
            </div>
          </div>

          <!-- Hari's Tactical Advice Choices -->
          <div class="tactics-section">
            <div class="tactics-prompt font-pixel">
              ⚡ CHOOSE YOUR ADVICE FOR FARMER SARAH:
            </div>

            <div class="tactics-list">
              <!-- Option 0: Correct -->
              <button 
                type="button"
                class="tactic-option"
                class:selected={selectedTactic === 0}
                onclick={() => handleChooseTactic(0)}
              >
                <div class="tactic-radio font-pixel">{selectedTactic === 0 ? '●' : '○'}</div>
                <div class="tactic-details">
                  <div class="tactic-title font-pixel">
                    🛡️ Deploy Dense Winter Rye Vegetative Buffer Strips & Contour Swales
                  </div>
                  <div class="tactic-desc font-body">
                    Rye roots anchor the topsoil and intercept 65% of raindrop kinetic velocity; swales slow runoff speed into gentle infiltration.
                  </div>
                  <div class="tactic-proof font-data text-accent">
                    ✓ USDA NRCS & NASA GPM proven: Slashes field gully erosion by up to 88%.
                  </div>
                </div>
              </button>

              <!-- Option 1: Incorrect -->
              <button 
                type="button"
                class="tactic-option"
                class:selected={selectedTactic === 1}
                onclick={() => handleChooseTactic(1)}
              >
                <div class="tactic-radio font-pixel">{selectedTactic === 1 ? '●' : '○'}</div>
                <div class="tactic-details">
                  <div class="tactic-title font-pixel text-warn">
                    🚜 Deeply Bulldoze Straight Trenches to Flush Floodwater Away Rapidly
                  </div>
                  <div class="tactic-desc font-body">
                    Ditch straight channels so water leaves the farm at maximum speed before it ponds.
                  </div>
                  <div class="tactic-proof font-data text-danger">
                    ⚠️ Fatal Error: High-velocity channelized water carves massive canyon gullies and strips fertile loam.
                  </div>
                </div>
              </button>

              <!-- Option 2: Incorrect -->
              <button 
                type="button"
                class="tactic-option"
                class:selected={selectedTactic === 2}
                onclick={() => handleChooseTactic(2)}
              >
                <div class="tactic-radio font-pixel">{selectedTactic === 2 ? '●' : '○'}</div>
                <div class="tactic-details">
                  <div class="tactic-title font-pixel text-warn">
                    🧪 Spray Petroleum Synthetic Polymer Dust-Sealant Over Bare Soil
                  </div>
                  <div class="tactic-desc font-body">
                    Coat the surface with artificial chemical crusting agent to glue particles together.
                  </div>
                  <div class="tactic-proof font-data text-danger">
                    ⚠️ Fatal Error: Expensive, toxic to soil microbes, and washes into watersheds during extreme storms.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

      {:else if callPhase === 'resolved'}
        <div class="resolved-view">
          <div class="success-banner font-pixel">
            🏆 TRANSATLANTIC REGENERATIVE VICTORY!
          </div>

          <div class="transcript-speech-bubble font-body">
            <div class="speaker-tag font-pixel">👩‍🌾 SARAH (IOWA):</div>
            <p>
              <em>"Hari, you saved our farm!</em> The cloudburst hit with devastating ferocity—sheets of water for 45 minutes straight. 
              Because we dropped the vegetative buffer rolls along our contours and redirected runoff through the rye swales, 
              <strong>the soil held firm!</strong> The water soaked into our subsoil instead of washing away!
            </p>
            <p>
              Our local watershed council measured zero sediment runoff into the river. 
              The connection between Indian precision water harvesting and Iowa contour buffering proves that 
              farmers worldwide share the same Earth and the same sky!"
            </p>
          </div>

          <div class="reward-summary-card">
            <div class="reward-header font-pixel">
              <span>🌟 TRANSATLANTIC MISSION REWARDS</span>
            </div>
            <div class="rewards-grid font-data">
              <div class="reward-item">
                <span class="rew-icon">🪙</span>
                <span class="rew-text">+30 Global Farm Coins</span>
              </div>
              <div class="reward-item">
                <span class="rew-icon">🛡️</span>
                <span class="rew-text">+15% Erosion Resistance</span>
              </div>
              <div class="reward-item">
                <span class="rew-icon">🛰️</span>
                <span class="rew-text">NASA GPM Satellite Liaison Badge</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Terminal Footer -->
    <footer class="terminal-footer">
      {#if callPhase === 'crisis'}
        <button 
          class="submit-advice-btn font-pixel"
          disabled={selectedTactic === null}
          onclick={handleExecuteTactic}
        >
          📡 TRANSMIT EMERGENCY ADVICE TO IOWA OVER SATELLITE
        </button>
      {:else if callPhase === 'resolved'}
        <button class="complete-mission-btn font-pixel" onclick={handleFinishMission}>
          🌟 CLOSE CALL & LOG REGENERATIVE SUCCESS (+30 COINS)
        </button>
      {:else}
        <div class="standby-text font-data">
          Waiting for user connection response...
        </div>
      {/if}
    </footer>
  </div>
</div>

<style>
  .phone-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(5, 10, 15, 0.9);
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

  .phone-terminal-modal {
    width: 100%;
    max-width: 820px;
    max-height: 92vh;
    overflow-y: auto;
    background: #0B131E;
    border: 3px solid #2F6FED;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8), inset 0 0 24px rgba(47, 111, 237, 0.25);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    color: #F0F4F8;
  }

  .terminal-header {
    background: #060B12;
    border-bottom: 2px solid #1E3354;
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .blinking-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #FF4D4D;
    box-shadow: 0 0 8px #FF4D4D;
    animation: blink 0.8s infinite alternate;
  }

  .blinking-dot.connected {
    background: #00FF66;
    box-shadow: 0 0 8px #00FF66;
  }

  @keyframes blink {
    from { opacity: 0.3; }
    to { opacity: 1; }
  }

  .channel-title {
    font-size: 12px;
    color: #A0C0E8;
  }

  .satellite-tag {
    font-size: 11px;
    color: #FFD166;
    background: #102138;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #2F6FED;
  }

  .terminal-close {
    background: #1B2B42;
    border: 1px solid #4A6B94;
    color: #FFD166;
    font-size: 14px;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .terminal-close:hover {
    background: #FF4D4D;
    color: #FFFFFF;
  }

  .caller-card {
    background: #0E1A2B;
    border-bottom: 2px solid #1E3354;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .caller-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .avatar-ring {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    border: 2px solid #2F6FED;
    background: #152740;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-img {
    font-size: 28px;
  }

  .caller-badge {
    font-size: 9px;
    color: #52B788;
    margin-top: 4px;
  }

  .caller-meta {
    flex: 1;
    min-width: 220px;
  }

  .caller-name {
    font-size: 15px;
    color: #FFD166;
  }

  .caller-loc {
    font-size: 12px;
    color: #B0C8E8;
  }

  .caller-coord {
    font-size: 11px;
    color: #7090B8;
  }

  .gpm-status {
    font-size: 11px;
    color: #A0C0E8;
    margin-top: 4px;
  }

  .highlight {
    color: #FF5A5A;
    font-weight: bold;
  }

  .waveform-box {
    background: #070D16;
    border: 1px solid #1A2F4C;
    border-radius: 6px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .wave-label {
    font-size: 9px;
    color: #52B788;
  }

  .wave-bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 36px;
    width: 140px;
  }

  .wave-bar {
    width: 3px;
    background: #00E5FF;
    border-radius: 1px;
    transition: height 0.08s ease;
  }

  .terminal-body {
    padding: 20px;
    background: #0B131E;
    flex: 1;
  }

  .ring-view {
    text-align: center;
    padding: 30px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .phone-ring-anim {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .phone-icon {
    font-size: 40px;
    z-index: 2;
  }

  .ripple-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid #00E5FF;
    animation: ripple 2s infinite ease-out;
  }

  .r2 { animation-delay: 0.6s; }
  .r3 { animation-delay: 1.2s; }

  @keyframes ripple {
    0% { transform: scale(0.6); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  .ring-status {
    font-size: 16px;
    color: #FFD166;
    margin-bottom: 8px;
  }

  .ring-desc {
    font-size: 14px;
    color: #A0C0E8;
    max-width: 520px;
    line-height: 1.5;
    margin-bottom: 24px;
  }

  .accept-call-btn {
    background: #00FF66;
    color: #052611;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: 6px;
    border: 2px solid #52B788;
    cursor: pointer;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.4);
    transition: all 0.15s ease;
  }

  .accept-call-btn:hover {
    transform: scale(1.05);
    background: #25FF7B;
  }

  .connecting-view {
    text-align: center;
    padding: 60px 20px;
    color: #00E5FF;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .terminal-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #1E3354;
    border-top-color: #00E5FF;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .transcript-speech-bubble {
    background: #111E30;
    border: 2px solid #233D60;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    line-height: 1.6;
    font-size: 14px;
    color: #E2ECF7;
  }

  .speaker-tag {
    font-size: 11px;
    color: #FFD166;
    margin-bottom: 6px;
  }

  .nasa-intel-card {
    background: #070E18;
    border: 1px solid #1E3B66;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 18px;
  }

  .intel-header {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #00E5FF;
    margin-bottom: 8px;
  }

  .intel-id {
    color: #FFD166;
  }

  .intel-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .stat-col {
    display: flex;
    flex-direction: column;
  }

  .stat-lbl {
    font-size: 11px;
    color: #7D9DC2;
  }

  .stat-val {
    font-size: 13px;
    margin-top: 2px;
  }

  .text-warn { color: #FFB703; }
  .text-danger { color: #FF4D4D; }
  .text-accent { color: #00FF66; }

  .tactics-prompt {
    font-size: 13px;
    color: #FFD166;
    margin-bottom: 10px;
  }

  .tactics-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tactic-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #101F33;
    border: 2px solid #223A5C;
    border-radius: 6px;
    padding: 12px 14px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .tactic-option:hover {
    background: #172B47;
    border-color: #2F6FED;
    transform: translateY(-1px);
  }

  .tactic-option.selected {
    border-color: #00E5FF;
    background: #163052;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
  }

  .tactic-radio {
    font-size: 16px;
    color: #00E5FF;
    margin-top: 2px;
  }

  .tactic-details {
    flex: 1;
  }

  .tactic-title {
    font-size: 13px;
    color: #FFFFFF;
    margin-bottom: 4px;
  }

  .tactic-desc {
    font-size: 12px;
    color: #C0D4EC;
    line-height: 1.4;
    margin-bottom: 4px;
  }

  .tactic-proof {
    font-size: 11px;
  }

  .resolved-view {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .success-banner {
    background: #0E3B20;
    border: 2px solid #00FF66;
    color: #00FF66;
    font-size: 14px;
    padding: 10px;
    border-radius: 6px;
    text-align: center;
  }

  .reward-summary-card {
    background: #08111D;
    border: 1px solid #233D60;
    border-radius: 6px;
    padding: 12px 16px;
  }

  .reward-header {
    font-size: 12px;
    color: #FFD166;
    margin-bottom: 8px;
  }

  .rewards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }

  .reward-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #B0D0F5;
  }

  .terminal-footer {
    background: #060B12;
    border-top: 2px solid #1E3354;
    padding: 14px 18px;
    display: flex;
    justify-content: flex-end;
  }

  .submit-advice-btn {
    background: #2F6FED;
    color: #FFFFFF;
    font-size: 13px;
    padding: 10px 18px;
    border-radius: 6px;
    border: 2px solid #4D8EFF;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .submit-advice-btn:hover:not(:disabled) {
    background: #4A8CFF;
    transform: scale(1.03);
  }

  .submit-advice-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .complete-mission-btn {
    background: #00FF66;
    color: #052611;
    font-size: 13px;
    padding: 10px 20px;
    border-radius: 6px;
    border: 2px solid #52B788;
    cursor: pointer;
    box-shadow: 0 0 14px rgba(0, 255, 102, 0.4);
    animation: pulse 1.5s infinite alternate;
  }

  @keyframes pulse {
    from { transform: scale(1); }
    to { transform: scale(1.03); }
  }

  .standby-text {
    font-size: 12px;
    color: #6080A8;
  }
</style>
