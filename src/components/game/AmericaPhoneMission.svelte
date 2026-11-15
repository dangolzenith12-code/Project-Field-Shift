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
    }, 1000);
  }

  function handleChooseTactic(index: number) {
    sfx.playSelect();
    selectedTactic = index;
  }

  function handleExecuteTactic() {
    if (selectedTactic === 0) {
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
        <span class="channel-title font-data">
          {callPhase === 'ringing' ? 'INCOMING TRANSATLANTIC SATELLITE CALL' : 'ENCRYPTED SATELLITE RELAY LINK ACTIVE'}
        </span>
      </div>
      <div class="satellite-tag font-data">
        [NASA GPM & SWOT ORBITAL UPLINK]
      </div>
      <button type="button" class="terminal-close font-data" onclick={onClose}>✕ CLOSE</button>
    </header>

    <!-- Caller Information Card -->
    <div class="caller-card">
      <div class="caller-avatar">
        <div class="avatar-badge font-data">SARAH</div>
        <span class="caller-badge font-data">CALLER ID: VERIFIED</span>
      </div>

      <div class="caller-meta font-data">
        <div class="caller-name font-display">SARAH MITCHELL</div>
        <div class="caller-loc">Corn & Soybean Belt | Story County, Iowa, USA</div>
        <div class="caller-coord font-data">Geo: 42.034° N, 93.582° W | Elevation: 295m</div>
        <div class="gpm-status font-data">
          NASA GPM PRECIPITATION RADAR: <span class="highlight">92 mm/hr CLOUDBURST ALERT</span>
        </div>
      </div>

      <!-- Oscilloscope Audio Waveform -->
      <div class="waveform-box">
        <div class="wave-label font-data">VOICE WAVEFORM:</div>
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
            <div class="phone-icon-box font-data">[INCOMING]</div>
            <div class="ripple-ring r1"></div>
            <div class="ripple-ring r2"></div>
            <div class="ripple-ring r3"></div>
          </div>
          <h3 class="ring-status font-display">INCOMING TRANSMISSION FROM IOWA, USA...</h3>
          <p class="ring-desc font-body">
            Village Weather Station antenna is receiving a high-priority agricultural distress transmission over NASA's GPM satellite network.
          </p>
          <button type="button" class="accept-call-btn font-data" onclick={handleAcceptCall}>
            [PICK UP RECEIVER & ANSWER CALL]
          </button>
        </div>

      {:else if callPhase === 'connected'}
        <div class="connecting-view">
          <div class="terminal-spinner"></div>
          <span class="font-data">DECODING VOIP OVER NASA TDRS RELAY... STAND BY</span>
        </div>

      {:else if callPhase === 'crisis'}
        <div class="crisis-view">
          <div class="transcript-speech-bubble font-body">
            <div class="speaker-tag font-display">SARAH (IOWA):</div>
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
            <div class="intel-header">
              <span>NASA GPM (GLOBAL PRECIPITATION MEASUREMENT) TELEMETRY</span>
              <span class="intel-id">IMERG-V07B</span>
            </div>
            <div class="intel-stats">
              <div class="stat-col">
                <span class="stat-lbl">Instantaneous Rain Rate:</span>
                <span class="stat-val text-warn">92.4 mm/hr</span>
              </div>
              <div class="stat-col">
                <span class="stat-lbl">Soil Shear Threshold:</span>
                <span class="stat-val text-danger">EXCEEDED (High Slaking)</span>
              </div>
              <div class="stat-col">
                <span class="stat-lbl">Runoff Attenuation:</span>
                <span class="stat-val text-accent">NEEDED IMMEDIATELY</span>
              </div>
            </div>
          </div>

          <!-- Hari's Tactical Advice Choices -->
          <div class="tactics-section">
            <div class="tactics-prompt font-display">
              CHOOSE YOUR EMERGENCY ADVICE FOR FARMER SARAH:
            </div>

            <div class="tactics-list">
              <!-- Option 0: Correct -->
              <button 
                type="button"
                class="tactic-option {selectedTactic === 0 ? 'selected' : ''}"
                onclick={() => handleChooseTactic(0)}
              >
                <div class="tactic-radio font-data">{selectedTactic === 0 ? '[X]' : '[ ]'}</div>
                <div class="tactic-details">
                  <div class="tactic-title font-display">
                    Deploy Dense Winter Rye Vegetative Buffer Strips & Contour Swales
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
                class="tactic-option {selectedTactic === 1 ? 'selected' : ''}"
                onclick={() => handleChooseTactic(1)}
              >
                <div class="tactic-radio font-data">{selectedTactic === 1 ? '[X]' : '[ ]'}</div>
                <div class="tactic-details">
                  <div class="tactic-title font-display text-warn">
                    Deeply Bulldoze Straight Trenches to Flush Floodwater Away Rapidly
                  </div>
                  <div class="tactic-desc font-body">
                    Ditch straight channels so water leaves the farm at maximum speed before it ponds.
                  </div>
                  <div class="tactic-proof font-data text-danger">
                    [FATAL ERROR] High-velocity channelized water carves massive canyon gullies and strips fertile loam.
                  </div>
                </div>
              </button>

              <!-- Option 2: Incorrect -->
              <button 
                type="button"
                class="tactic-option {selectedTactic === 2 ? 'selected' : ''}"
                onclick={() => handleChooseTactic(2)}
              >
                <div class="tactic-radio font-data">{selectedTactic === 2 ? '[X]' : '[ ]'}</div>
                <div class="tactic-details">
                  <div class="tactic-title font-display text-warn">
                    Spray Petroleum Synthetic Polymer Dust-Sealant Over Bare Soil
                  </div>
                  <div class="tactic-desc font-body">
                    Coat the surface with artificial chemical crusting agent to glue particles together.
                  </div>
                  <div class="tactic-proof font-data text-danger">
                    [FATAL ERROR] Expensive, toxic to soil microbes, and washes into watersheds during extreme storms.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

      {:else if callPhase === 'resolved'}
        <div class="resolved-view">
          <div class="success-banner font-display">
            TRANSATLANTIC REGENERATIVE VICTORY!
          </div>

          <div class="transcript-speech-bubble font-body">
            <div class="speaker-tag font-display">SARAH (IOWA):</div>
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
            <div class="reward-header font-display">
              <span>TRANSATLANTIC MISSION REWARDS</span>
            </div>
            <div class="rewards-grid font-data">
              <div class="reward-item">
                <span class="rew-tag font-data">[COINS]</span>
                <span class="rew-text">+30 Global Farm Coins</span>
              </div>
              <div class="reward-item">
                <span class="rew-tag font-data">[SHIELD]</span>
                <span class="rew-text">+15% Erosion Resistance</span>
              </div>
              <div class="reward-item">
                <span class="rew-tag font-data">[BADGE]</span>
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
          type="button"
          class="submit-advice-btn font-data"
          disabled={selectedTactic === null}
          onclick={handleExecuteTactic}
        >
          TRANSMIT EMERGENCY ADVICE TO IOWA OVER SATELLITE →
        </button>
      {:else if callPhase === 'resolved'}
        <button type="button" class="complete-mission-btn font-data" onclick={handleFinishMission}>
          CLOSE CALL & LOG REGENERATIVE SUCCESS (+30 COINS) →
        </button>
      {:else}
        <div class="standby-text font-data">
          Waiting for satellite connection response...
        </div>
      {/if}
    </footer>
  </div>
</div>

<style>
  .phone-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 25, 18, 0.85);
    backdrop-filter: blur(4px);
    z-index: 2500;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .phone-terminal-modal {
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    max-width: 900px;
    width: 100%;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: var(--journal-ink, #1B2B1F);
  }

  .terminal-header {
    background: var(--journal-forest, #1F3825);
    color: #FAF6ED;
    border-bottom: 2.5px solid var(--journal-gold, #E5A93C);
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .blinking-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--journal-gold, #E5A93C);
    animation: blink 1s infinite alternate;
  }

  .blinking-dot.connected {
    background: #4E7C5A;
  }

  @keyframes blink {
    from { opacity: 0.3; }
    to { opacity: 1; }
  }

  .channel-title {
    font-size: 0.78rem;
    font-weight: bold;
    color: #FAF6ED;
  }

  .satellite-tag {
    font-size: 0.72rem;
    color: var(--journal-gold, #E5A93C);
    font-weight: bold;
  }

  .terminal-close {
    background: #FAF6ED;
    color: var(--journal-ink, #1B2B1F);
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
    padding: 4px 10px;
    font-size: 0.78rem;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
  }

  .caller-card {
    padding: 12px 18px;
    background: #F4EEDF;
    border-bottom: 1.5px solid #DFD7C2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .caller-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .avatar-badge {
    background: var(--journal-forest, #1F3825);
    color: #FAF6ED;
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.8rem;
  }

  .caller-badge {
    font-size: 0.65rem;
    color: var(--journal-sage, #4E7C5A);
    font-weight: bold;
  }

  .caller-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .caller-name {
    font-size: 1.15rem;
    color: var(--journal-forest, #1F3825);
  }

  .caller-loc, .caller-coord {
    font-size: 0.78rem;
    color: var(--journal-ink-soft, #2D4233);
  }

  .gpm-status {
    font-size: 0.78rem;
    color: var(--journal-monsoon, #2B69A3);
    margin-top: 2px;
  }

  .highlight {
    color: var(--journal-madder, #B83827);
    font-weight: bold;
  }

  .waveform-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .wave-label {
    font-size: 0.68rem;
    color: var(--journal-ink-muted, #556E5C);
  }

  .wave-bars {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 36px;
    padding: 4px;
    background: #EAE3D2;
    border-radius: 4px;
    border: 1px solid var(--journal-ink, #1B2B1F);
  }

  .wave-bar {
    width: 4px;
    background: var(--journal-forest, #1F3825);
    border-radius: 2px;
    transition: height 0.08s;
  }

  .terminal-body {
    padding: 16px 18px;
    overflow-y: auto;
    flex: 1;
  }

  .ring-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 14px;
    padding: 24px 0;
  }

  .phone-icon-box {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--journal-forest, #1F3825);
    background: var(--journal-gold, #E5A93C);
    padding: 8px 16px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
  }

  .ring-status {
    font-size: 1.2rem;
    color: var(--journal-forest, #1F3825);
  }

  .ring-desc {
    max-width: 540px;
    font-size: 0.92rem;
    color: var(--journal-ink-soft, #2D4233);
    line-height: 1.45;
  }

  .accept-call-btn {
    padding: 12px 24px;
    background: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
    border: 2.5px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 4px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    font-weight: bold;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.12s ease;
  }

  .accept-call-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 var(--journal-ink, #1B2B1F);
  }

  .connecting-view {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px;
    color: var(--journal-forest, #1F3825);
    font-weight: bold;
  }

  .transcript-speech-bubble {
    background: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 14px 18px;
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    line-height: 1.5;
    margin-bottom: 14px;
  }

  .speaker-tag {
    font-size: 1.05rem;
    color: var(--journal-forest, #1F3825);
    margin-bottom: 6px;
  }

  .nasa-intel-card {
    background: #F0F5FA;
    border: 1.5px solid var(--journal-monsoon, #2B69A3);
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 16px;
  }

  .intel-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.76rem;
    font-weight: bold;
    color: var(--journal-monsoon, #2B69A3);
    margin-bottom: 6px;
  }

  .intel-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
    font-size: 0.78rem;
  }

  .stat-col {
    display: flex;
    flex-direction: column;
  }

  .stat-lbl {
    color: var(--journal-ink-muted, #556E5C);
  }

  .stat-val {
    font-weight: bold;
  }

  .text-warn {
    color: var(--journal-gold, #E5A93C);
  }

  .text-danger {
    color: var(--journal-madder, #B83827);
  }

  .text-accent {
    color: var(--journal-forest, #1F3825);
  }

  .tactics-prompt {
    font-size: 1.05rem;
    color: var(--journal-forest, #1F3825);
    margin-bottom: 10px;
  }

  .tactics-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tactic-option {
    background: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 12px 14px;
    display: flex;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    transition: all 0.12s ease;
  }

  .tactic-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
    border-color: var(--journal-forest, #1F3825);
  }

  .tactic-option.selected {
    border-color: var(--journal-gold, #E5A93C);
    background: #FFFBF2;
    box-shadow: 0 4px 0 var(--journal-gold, #E5A93C);
  }

  .tactic-radio {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--journal-forest, #1F3825);
  }

  .tactic-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tactic-title {
    font-size: 0.98rem;
    color: var(--journal-forest, #1F3825);
  }

  .tactic-desc {
    font-size: 0.86rem;
    color: var(--journal-ink-soft, #2D4233);
  }

  .tactic-proof {
    font-size: 0.78rem;
    margin-top: 2px;
  }

  .success-banner {
    font-size: 1.3rem;
    color: var(--journal-forest, #1F3825);
    margin-bottom: 12px;
    text-align: center;
  }

  .reward-summary-card {
    background: #EDF5EE;
    border: 2px solid var(--journal-forest, #1F3825);
    border-radius: 6px;
    padding: 14px;
    margin-top: 14px;
  }

  .reward-header {
    font-size: 0.9rem;
    color: var(--journal-forest, #1F3825);
    font-weight: bold;
    margin-bottom: 8px;
    text-align: center;
  }

  .rewards-grid {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .reward-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    color: var(--journal-ink, #1B2B1F);
  }

  .rew-tag {
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--journal-forest, #1F3825);
    background: #FAF6ED;
    border: 1px solid var(--journal-ink, #1B2B1F);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .terminal-footer {
    padding: 12px 18px;
    background: #FAF6ED;
    border-top: 2px solid var(--journal-ink, #1B2B1F);
    display: flex;
    justify-content: center;
  }

  .submit-advice-btn, .complete-mission-btn {
    padding: 10px 24px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    font-weight: bold;
    font-size: 0.9rem;
    cursor: pointer;
    background: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
    transition: transform 0.12s, box-shadow 0.12s;
  }

  .submit-advice-btn:hover:not(:disabled), .complete-mission-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
  }

  .submit-advice-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .standby-text {
    font-size: 0.85rem;
    color: var(--journal-ink-muted, #556E5C);
  }
</style>
