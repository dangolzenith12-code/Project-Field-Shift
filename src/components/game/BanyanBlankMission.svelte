<script lang="ts">
  import confetti from 'canvas-confetti';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
    onClose: () => void;
  }

  let { onComplete, onClose }: Props = $props();

  interface BlankSlot {
    id: string;
    label: string;
    correctOptionId: string;
    hint: string;
    nasaCitation: string;
  }

  interface OptionItem {
    id: string;
    text: string;
    category: 'rotation' | 'nasa' | 'nitrogen' | 'cover';
    icon: string;
  }

  const SLOTS: BlankSlot[] = [
    {
      id: 'blank_1',
      label: 'Strategy Blueprint',
      correctOptionId: 'opt_rotation',
      hint: 'Amma advocates alternating deep-rooted millets with legumes instead of single-crop paddy.',
      nasaCitation: 'NASA SMAP / Sentinel-2: Crop diversification reduces root-zone water stress by 38%.'
    },
    {
      id: 'blank_2',
      label: 'Aquifer Threat',
      correctOptionId: 'opt_grace',
      hint: 'Twin gravity satellites detect deep underground mass loss across northwestern India.',
      nasaCitation: 'NASA GRACE-FO: Shows −3.2 cm/yr equivalent water thickness anomaly in unmetered aquifers.'
    },
    {
      id: 'blank_3',
      label: 'Natural Fertilizer',
      correctOptionId: 'opt_legume',
      hint: 'Rhizobium bacteria in pulse root nodules pull nitrogen directly out of atmospheric pore space.',
      nasaCitation: 'Soil Biology: Injects 35-45 kg biological nitrogen per hectare into exhausted soil.'
    },
    {
      id: 'blank_4',
      label: 'Soil Bio-Shield',
      correctOptionId: 'opt_mulch',
      hint: 'A carpet of stubble and rye shields delicate topsoil from direct 42°C blazing solar insolation.',
      nasaCitation: 'NASA POWER: MERRA-2 all-sky solar flux shows 42% drop in evaporative moisture deficit.'
    }
  ];

  const OPTIONS: OptionItem[] = [
    {
      id: 'opt_rotation',
      text: '3-Crop Regenerative Rotation',
      category: 'rotation',
      icon: '🔄'
    },
    {
      id: 'opt_monoculture',
      text: 'Single-Crop Flooded Monoculture',
      category: 'rotation',
      icon: '⚠️'
    },
    {
      id: 'opt_grace',
      text: '−3.2 cm/yr Groundwater Depletion',
      category: 'nasa',
      icon: '📡'
    },
    {
      id: 'opt_infinite',
      text: 'Endless Free Aquifer Recharge',
      category: 'nasa',
      icon: '❌'
    },
    {
      id: 'opt_legume',
      text: 'Desi Chickpeas & Legumes',
      category: 'nitrogen',
      icon: '🌱'
    },
    {
      id: 'opt_chemicals',
      text: 'Double Chemical Urea Fertilizer',
      category: 'nitrogen',
      icon: '🧪'
    },
    {
      id: 'opt_mulch',
      text: '42% Soil Moisture Evaporation Loss',
      category: 'cover',
      icon: '🛡️'
    },
    {
      id: 'opt_bare_soil',
      text: 'Zero-Shade Bare Soil Cracking',
      category: 'cover',
      icon: '🏜️'
    }
  ];

  // User slot assignments: slotId -> optionId
  let slotAssignments = $state<Record<string, string>>({});
  let activeSelectedSlot = $state<string>('blank_1');
  let checked = $state(false);
  let validationResult = $state<{ correctCount: number; allCorrect: boolean } | null>(null);

  // Find which option is currently in a slot
  function getOptionInSlot(slotId: string): OptionItem | undefined {
    const optId = slotAssignments[slotId];
    return OPTIONS.find(o => o.id === optId);
  }

  // Check if an option is currently slotted anywhere
  function isOptionPlaced(optId: string): boolean {
    return Object.values(slotAssignments).includes(optId);
  }

  function handleSelectSlot(slotId: string) {
    sfx.playSelect();
    activeSelectedSlot = slotId;
    checked = false;
  }

  function handleAssignOption(optId: string) {
    sfx.playSelect();
    checked = false;

    // If this option is already placed in another slot, clear it from there
    const existingSlot = Object.keys(slotAssignments).find(k => slotAssignments[k] === optId);
    if (existingSlot) {
      delete slotAssignments[existingSlot];
    }

    // Assign to active selected slot
    slotAssignments[activeSelectedSlot] = optId;

    // Auto-advance to next empty slot if available
    const nextEmpty = SLOTS.find(s => !slotAssignments[s.id] && s.id !== activeSelectedSlot);
    if (nextEmpty) {
      activeSelectedSlot = nextEmpty.id;
    }
  }

  function handleClearSlot(slotId: string) {
    sfx.playSelect();
    checked = false;
    delete slotAssignments[slotId];
    activeSelectedSlot = slotId;
  }

  function handleCheckAnswers() {
    let correct = 0;
    for (const slot of SLOTS) {
      if (slotAssignments[slot.id] === slot.correctOptionId) {
        correct++;
      }
    }
    const all = correct === SLOTS.length;
    validationResult = { correctCount: correct, allCorrect: all };
    checked = true;

    if (all) {
      sfx.playSuccess();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 }
        });
      } catch {}
    } else {
      sfx.playErosion();
    }
  }

  function handleClaimReward() {
    sfx.playSuccess();
    onComplete();
  }
</script>

<div class="mission-backdrop" role="presentation" onclick={onClose}>
  <div 
    class="mission-modal" 
    role="dialog" 
    tabindex="-1"
    onclick={(e) => e.stopPropagation()} 
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Modal Header -->
    <header class="modal-header">
      <div class="header-left">
        <span class="mission-badge font-pixel">◆ OVERWORLD MISSION 02 ◆</span>
        <h2 class="mission-title font-pixel">🌳 Banyan Tree Council: Fill-in-the-Blanks</h2>
        <span class="sub-title font-body">Dr. Rao's 3-Crop Rotation & NASA GRACE Aquifer Blueprint</span>
      </div>
      <button class="close-x-btn" onclick={onClose} aria-label="Close modal">✕</button>
    </header>

    <!-- Mission Briefing Callout -->
    <div class="story-briefing">
      <div class="agronomist-avatar">
        <span class="avatar-icon">👨‍🔬</span>
        <span class="avatar-tag font-pixel">DR. RAO</span>
      </div>
      <div class="brief-text font-body">
        <p>
          <em>"Namaskara, Hari!</em> Under this 200-year-old sacred banyan, our elders mapped the seasons. 
          To protect our village from the sinking water table, place the correct agronomic and 
          <strong>NASA satellite concepts</strong> into our strategic rotation charter below!"
        </p>
      </div>
    </div>

    <!-- Main Fill-in-the-Blanks Document -->
    <div class="document-container">
      <div class="scroll-banner font-pixel">
        📜 VILLAGE REGENERATIVE ROTATION MANIFESTO
      </div>

      <div class="sentence-list">
        <!-- Sentence 1 -->
        <div class="sentence-card" class:active-card={activeSelectedSlot === 'blank_1'}>
          <div class="sentence-number font-pixel">01</div>
          <div class="sentence-body font-body">
            <span>To escape the deadly cycle of seasonal drought, Amma replaces continuous water-heavy paddy with a</span>
            
            <div 
              class="blank-drop-target"
              role="button"
              tabindex="0"
              class:empty={!slotAssignments['blank_1']}
              class:filled={!!slotAssignments['blank_1']}
              class:is-active={activeSelectedSlot === 'blank_1'}
              class:correct={checked && slotAssignments['blank_1'] === SLOTS[0].correctOptionId}
              class:wrong={checked && slotAssignments['blank_1'] && slotAssignments['blank_1'] !== SLOTS[0].correctOptionId}
              onclick={() => handleSelectSlot('blank_1')}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleSelectSlot('blank_1'); } }}
            >
              {#if slotAssignments['blank_1']}
                <span class="slotted-text font-pixel">
                  {getOptionInSlot('blank_1')?.icon} {getOptionInSlot('blank_1')?.text}
                </span>
                <button type="button" class="clear-icon" onclick={(e) => { e.stopPropagation(); handleClearSlot('blank_1'); }} aria-label="Clear blank 1">✕</button>
              {:else}
                <span class="placeholder-text font-pixel">[ BLANK 1: CLICK TO ASSIGN ]</span>
              {/if}
            </div>

            <span>which balances soil microbial life across all four seasons.</span>
          </div>

          <div class="nasa-note font-data">
            <span class="sci-tag">NASA DATA:</span> {SLOTS[0].nasaCitation}
          </div>
        </div>

        <!-- Sentence 2 -->
        <div class="sentence-card" class:active-card={activeSelectedSlot === 'blank_2'}>
          <div class="sentence-number font-pixel">02</div>
          <div class="sentence-body font-body">
            <span>Our village borewell telemetry chips linked with NASA GRACE-FO gravity mapping warn that uncontrolled diesel pumps cause a severe</span>

            <div 
              class="blank-drop-target"
              role="button"
              tabindex="0"
              class:empty={!slotAssignments['blank_2']}
              class:filled={!!slotAssignments['blank_2']}
              class:is-active={activeSelectedSlot === 'blank_2'}
              class:correct={checked && slotAssignments['blank_2'] === SLOTS[1].correctOptionId}
              class:wrong={checked && slotAssignments['blank_2'] && slotAssignments['blank_2'] !== SLOTS[1].correctOptionId}
              onclick={() => handleSelectSlot('blank_2')}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleSelectSlot('blank_2'); } }}
            >
              {#if slotAssignments['blank_2']}
                <span class="slotted-text font-pixel">
                  {getOptionInSlot('blank_2')?.icon} {getOptionInSlot('blank_2')?.text}
                </span>
                <button type="button" class="clear-icon" onclick={(e) => { e.stopPropagation(); handleClearSlot('blank_2'); }} aria-label="Clear blank 2">✕</button>
              {:else}
                <span class="placeholder-text font-pixel">[ BLANK 2: CLICK TO ASSIGN ]</span>
              {/if}
            </div>

            <span>in our deep subterranean water reserve.</span>
          </div>

          <div class="nasa-note font-data">
            <span class="sci-tag">NASA DATA:</span> {SLOTS[1].nasaCitation}
          </div>
        </div>

        <!-- Sentence 3 -->
        <div class="sentence-card" class:active-card={activeSelectedSlot === 'blank_3'}>
          <div class="sentence-number font-pixel">03</div>
          <div class="sentence-body font-body">
            <span>Instead of buying synthetic bags of commercial ammonium nitrate, we intercrop pearl millet alongside</span>

            <div 
              class="blank-drop-target"
              role="button"
              tabindex="0"
              class:empty={!slotAssignments['blank_3']}
              class:filled={!!slotAssignments['blank_3']}
              class:is-active={activeSelectedSlot === 'blank_3'}
              class:correct={checked && slotAssignments['blank_3'] === SLOTS[2].correctOptionId}
              class:wrong={checked && slotAssignments['blank_3'] && slotAssignments['blank_3'] !== SLOTS[2].correctOptionId}
              onclick={() => handleSelectSlot('blank_3')}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleSelectSlot('blank_3'); } }}
            >
              {#if slotAssignments['blank_3']}
                <span class="slotted-text font-pixel">
                  {getOptionInSlot('blank_3')?.icon} {getOptionInSlot('blank_3')?.text}
                </span>
                <button type="button" class="clear-icon" onclick={(e) => { e.stopPropagation(); handleClearSlot('blank_3'); }} aria-label="Clear blank 3">✕</button>
              {:else}
                <span class="placeholder-text font-pixel">[ BLANK 3: CLICK TO ASSIGN ]</span>
              {/if}
            </div>

            <span>whose root nodules inject pure biological nitrogen back into the topsoil.</span>
          </div>

          <div class="nasa-note font-data">
            <span class="sci-tag">NASA DATA:</span> {SLOTS[2].nasaCitation}
          </div>
        </div>

        <!-- Sentence 4 -->
        <div class="sentence-card" class:active-card={activeSelectedSlot === 'blank_4'}>
          <div class="sentence-number font-pixel">04</div>
          <div class="sentence-body font-body">
            <span>Spreading living bio-mulch and winter rye across exposed furrows protects our soil carbon and prevents up to</span>

            <div 
              class="blank-drop-target"
              role="button"
              tabindex="0"
              class:empty={!slotAssignments['blank_4']}
              class:filled={!!slotAssignments['blank_4']}
              class:is-active={activeSelectedSlot === 'blank_4'}
              class:correct={checked && slotAssignments['blank_4'] === SLOTS[3].correctOptionId}
              class:wrong={checked && slotAssignments['blank_4'] && slotAssignments['blank_4'] !== SLOTS[3].correctOptionId}
              onclick={() => handleSelectSlot('blank_4')}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleSelectSlot('blank_4'); } }}
            >
              {#if slotAssignments['blank_4']}
                <span class="slotted-text font-pixel">
                  {getOptionInSlot('blank_4')?.icon} {getOptionInSlot('blank_4')?.text}
                </span>
                <button type="button" class="clear-icon" onclick={(e) => { e.stopPropagation(); handleClearSlot('blank_4'); }} aria-label="Clear blank 4">✕</button>
              {:else}
                <span class="placeholder-text font-pixel">[ BLANK 4: CLICK TO ASSIGN ]</span>
              {/if}
            </div>

            <span>during intense 40°C pre-monsoon heatwaves.</span>
          </div>

          <div class="nasa-note font-data">
            <span class="sci-tag">NASA DATA:</span> {SLOTS[3].nasaCitation}
          </div>
        </div>
      </div>
    </div>

    <!-- Available Options Bank -->
    <div class="options-bank-section">
      <div class="bank-header">
        <span class="bank-title font-pixel">🧩 AVAILABLE OPTIONS (CLICK TO SLOT INTO ACTIVE BLANK):</span>
        <span class="active-slot-indicator font-data">
          Active Target: <strong>{SLOTS.find(s => s.id === activeSelectedSlot)?.label}</strong>
        </span>
      </div>

      <div class="options-grid">
        {#each OPTIONS as option}
          {@const isPlaced = isOptionPlaced(option.id)}
          <button
            type="button"
            class="option-pill font-pixel"
            class:placed={isPlaced}
            disabled={isPlaced}
            onclick={() => handleAssignOption(option.id)}
          >
            <span class="opt-icon">{option.icon}</span>
            <span class="opt-text">{option.text}</span>
            {#if isPlaced}
              <span class="placed-badge font-data">✓ PLACED</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Validation and Action Footer -->
    <footer class="modal-footer">
      <div class="footer-status font-data">
        {#if checked && validationResult}
          {#if validationResult.allCorrect}
            <div class="status-msg success font-pixel">
              🎉 EXCELLENT! ALL 4 BLANKS ACCURATELY COMPLETED WITH NASA & AGRONOMIC EVIDENCE!
            </div>
          {:else}
            <div class="status-msg error font-pixel">
              ⚠️ {validationResult.correctCount} of 4 correct. Review the red highlighted blanks and retry!
            </div>
          {/if}
        {:else}
          <div class="status-hint">
            💡 Select each blank above, then click the correct option pill from the bank to lock it in.
          </div>
        {/if}
      </div>

      <div class="footer-actions">
        {#if checked && validationResult?.allCorrect}
          <button class="action-btn claim-btn font-pixel" onclick={handleClaimReward}>
            🌟 CLAIM MISSION REWARD (+25 SOIL HEALTH & AGRONOMIST SEAL)
          </button>
        {:else}
          <button 
            class="action-btn verify-btn font-pixel" 
            onclick={handleCheckAnswers}
            disabled={Object.keys(slotAssignments).length < 4}
          >
            🔍 VERIFY 4 BLANKS WITH DR. RAO
          </button>
        {/if}
      </div>
    </footer>
  </div>
</div>

<style>
  .mission-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(10, 15, 12, 0.88);
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

  .mission-modal {
    width: 100%;
    max-width: 860px;
    max-height: 92vh;
    overflow-y: auto;
    background: #1B241E;
    border: 3px solid #3FA34D;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(63, 163, 77, 0.2);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    color: #F8F9FA;
  }

  .modal-header {
    background: #111A13;
    border-bottom: 2px solid #2D3E32;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .mission-badge {
    display: inline-block;
    font-size: 11px;
    background: #2D5A27;
    color: #B7E4C7;
    padding: 3px 8px;
    border-radius: 4px;
    margin-bottom: 4px;
  }

  .mission-title {
    font-size: 19px;
    color: #FFD166;
    margin: 4px 0 2px 0;
  }

  .sub-title {
    font-size: 13px;
    color: #A3B899;
  }

  .close-x-btn {
    background: #2B1B12;
    border: 2px solid #C05C46;
    color: #FFB703;
    font-size: 16px;
    font-weight: bold;
    width: 34px;
    height: 34px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .close-x-btn:hover {
    background: #C05C46;
    color: #FFFFFF;
    transform: scale(1.08);
  }

  .story-briefing {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 20px;
    background: rgba(45, 90, 39, 0.25);
    border-bottom: 1px solid #2D3E32;
  }

  .agronomist-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 70px;
  }

  .avatar-icon {
    font-size: 32px;
  }

  .avatar-tag {
    font-size: 10px;
    color: #52B788;
    margin-top: 2px;
  }

  .brief-text {
    font-size: 13px;
    line-height: 1.5;
    color: #D8F3DC;
  }

  .document-container {
    padding: 16px 20px;
    background: #141B16;
  }

  .scroll-banner {
    font-size: 12px;
    color: #FFB703;
    text-align: center;
    padding: 6px 12px;
    background: #0E1410;
    border: 1px dashed #52B788;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .sentence-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .sentence-card {
    background: #1A231C;
    border: 2px solid #2B3A2E;
    border-radius: 6px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .sentence-card.active-card {
    border-color: #52B788;
    box-shadow: 0 0 12px rgba(82, 183, 136, 0.3);
  }

  .sentence-number {
    font-size: 11px;
    color: #74C69D;
    background: #0E1611;
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    width: fit-content;
  }

  .sentence-body {
    font-size: 14px;
    line-height: 1.8;
    color: #E8F5E9;
  }

  .blank-drop-target {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    vertical-align: middle;
    margin: 0 6px;
    padding: 5px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    transition: all 0.15s ease;
  }

  .blank-drop-target.empty {
    background: #0E1611;
    border: 2px dashed #74C69D;
    color: #74C69D;
  }

  .blank-drop-target.empty:hover,
  .blank-drop-target.empty.is-active {
    background: #1E3324;
    border-color: #FFD166;
    color: #FFD166;
    transform: translateY(-1px);
  }

  .blank-drop-target.filled {
    background: #2D5A27;
    border: 2px solid #52B788;
    color: #FFFFFF;
  }

  .blank-drop-target.correct {
    background: #1B4D2B;
    border-color: #00FF66;
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.4);
  }

  .blank-drop-target.wrong {
    background: #4D1B1B;
    border-color: #FF4D4D;
    box-shadow: 0 0 10px rgba(255, 77, 77, 0.4);
  }

  .clear-icon {
    font-size: 10px;
    padding: 2px 4px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 3px;
  }

  .clear-icon:hover {
    background: #FF4D4D;
  }

  .nasa-note {
    font-size: 11px;
    color: #A0C4AB;
    background: #0D140F;
    padding: 4px 8px;
    border-left: 3px solid #52B788;
    border-radius: 0 4px 4px 0;
  }

  .sci-tag {
    color: #52B788;
    font-weight: bold;
    margin-right: 4px;
  }

  .options-bank-section {
    padding: 16px 20px;
    background: #111A13;
    border-top: 2px solid #2D3E32;
    border-bottom: 2px solid #2D3E32;
  }

  .bank-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .bank-title {
    font-size: 12px;
    color: #FFD166;
  }

  .active-slot-indicator {
    font-size: 12px;
    color: #74C69D;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }

  .option-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #1E2B21;
    border: 2px solid #3D5A43;
    border-radius: 6px;
    color: #FFFFFF;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .option-pill:hover:not(:disabled) {
    background: #2E4534;
    border-color: #52B788;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .option-pill.placed {
    opacity: 0.45;
    cursor: not-allowed;
    background: #141C16;
    border-color: #243327;
  }

  .opt-icon {
    font-size: 16px;
  }

  .placed-badge {
    margin-left: auto;
    font-size: 10px;
    color: #74C69D;
  }

  .modal-footer {
    background: #111A13;
    padding: 16px 20px;
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
    color: #A3B899;
  }

  .status-msg.success {
    color: #00FF66;
    font-size: 12px;
  }

  .status-msg.error {
    color: #FF6B6B;
    font-size: 12px;
  }

  .action-btn {
    padding: 10px 18px;
    font-size: 13px;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .verify-btn {
    background: #FFB703;
    color: #1A1A1A;
    border: 2px solid #FFA000;
  }

  .verify-btn:hover:not(:disabled) {
    background: #FFC107;
    transform: scale(1.03);
  }

  .verify-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .claim-btn {
    background: #00FF66;
    color: #0A2612;
    border: 2px solid #52B788;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.4);
    animation: pulseGlow 1.5s infinite alternate;
  }

  @keyframes pulseGlow {
    from { box-shadow: 0 0 10px rgba(0, 255, 102, 0.3); }
    to { box-shadow: 0 0 20px rgba(0, 255, 102, 0.8); }
  }
</style>
