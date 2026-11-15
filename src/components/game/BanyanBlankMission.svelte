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
    tag: string;
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
      tag: '[ROTATION]'
    },
    {
      id: 'opt_monoculture',
      text: 'Single-Crop Flooded Monoculture',
      category: 'rotation',
      tag: '[RISK]'
    },
    {
      id: 'opt_grace',
      text: '−3.2 cm/yr Groundwater Depletion',
      category: 'nasa',
      tag: '[GRACE]'
    },
    {
      id: 'opt_infinite',
      text: 'Endless Free Aquifer Recharge',
      category: 'nasa',
      tag: '[MYTH]'
    },
    {
      id: 'opt_legume',
      text: 'Desi Chickpeas & Legumes',
      category: 'nitrogen',
      tag: '[BIO-N]'
    },
    {
      id: 'opt_chemicals',
      text: 'Double Chemical Urea Fertilizer',
      category: 'nitrogen',
      tag: '[SYNTHETIC]'
    },
    {
      id: 'opt_mulch',
      text: '42% Soil Moisture Evaporation Loss',
      category: 'cover',
      tag: '[SHIELD]'
    },
    {
      id: 'opt_bare_soil',
      text: 'Zero-Shade Bare Soil Cracking',
      category: 'cover',
      tag: '[EXPOSED]'
    }
  ];

  let slotAssignments = $state<Record<string, string>>({});
  let activeSelectedSlot = $state<string>('blank_1');
  let checked = $state(false);
  let validationResult = $state<{ correctCount: number; allCorrect: boolean } | null>(null);

  function getOptionInSlot(slotId: string): OptionItem | undefined {
    const optId = slotAssignments[slotId];
    return OPTIONS.find(o => o.id === optId);
  }

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

    const existingSlot = Object.keys(slotAssignments).find(k => slotAssignments[k] === optId);
    if (existingSlot) {
      delete slotAssignments[existingSlot];
    }

    slotAssignments[activeSelectedSlot] = optId;

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
          particleCount: 65,
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
        <span class="mission-badge font-data">[OVERWORLD MISSION 02]</span>
        <h2 class="mission-title font-display">Banyan Tree Council: Fill-in-the-Blanks</h2>
        <span class="sub-title font-body">Dr. Rao's 3-Crop Rotation & NASA GRACE Aquifer Blueprint</span>
      </div>
      <button type="button" class="close-x-btn font-data" onclick={onClose} aria-label="Close modal">✕ CLOSE</button>
    </header>

    <!-- Mission Briefing Callout -->
    <div class="story-briefing">
      <div class="agronomist-avatar">
        <div class="avatar-badge font-data">DR. RAO</div>
        <span class="avatar-tag font-data">VILLAGE AGRONOMIST</span>
      </div>
      <div class="brief-text font-body">
        <p>
          <em>"Namaskara, Hari!</em> Under this 200-year-old sacred banyan, our elders mapped the seasons. 
          To protect our valley from the sinking water table, place the correct agronomic and 
          <strong>NASA satellite concepts</strong> into our strategic rotation charter below!"
        </p>
      </div>
    </div>

    <!-- Main Fill-in-the-Blanks Document -->
    <div class="document-container">
      <div class="scroll-banner font-display">
        VILLAGE REGENERATIVE ROTATION MANIFESTO
      </div>

      <div class="sentence-list">
        <!-- Sentence 1 -->
        <div class="sentence-card" class:active-card={activeSelectedSlot === 'blank_1'}>
          <div class="sentence-number font-data">01</div>
          <div class="sentence-body font-body">
            <span>To escape the deadly cycle of seasonal drought, Amma replaces continuous water-heavy paddy with a</span>
            
            <button 
              type="button"
              class="blank-drop-target"
              class:empty={!slotAssignments['blank_1']}
              class:filled={!!slotAssignments['blank_1']}
              class:is-active={activeSelectedSlot === 'blank_1'}
              class:correct={checked && slotAssignments['blank_1'] === SLOTS[0].correctOptionId}
              class:wrong={checked && slotAssignments['blank_1'] && slotAssignments['blank_1'] !== SLOTS[0].correctOptionId}
              onclick={() => handleSelectSlot('blank_1')}
            >
              {#if slotAssignments['blank_1']}
                <span class="slotted-text font-data">
                  {getOptionInSlot('blank_1')?.tag} {getOptionInSlot('blank_1')?.text}
                </span>
                <span class="clear-icon" onclick={(e) => { e.stopPropagation(); handleClearSlot('blank_1'); }} role="button" tabindex="0" onkeydown={(e) => { if(e.key === 'Enter') handleClearSlot('blank_1'); }}>✕</span>
              {:else}
                <span class="placeholder-text font-data">[ BLANK 1: CLICK TO ASSIGN ]</span>
              {/if}
            </button>

            <span>which balances soil microbial life across all four seasons.</span>
          </div>

          <div class="nasa-note font-data">
            <span class="sci-tag">NASA EVIDENCE:</span> {SLOTS[0].nasaCitation}
          </div>
        </div>

        <!-- Sentence 2 -->
        <div class="sentence-card" class:active-card={activeSelectedSlot === 'blank_2'}>
          <div class="sentence-number font-data">02</div>
          <div class="sentence-body font-body">
            <span>Our village borewell telemetry chips linked with NASA GRACE-FO gravity mapping warn that uncontrolled diesel pumps cause a severe</span>

            <button 
              type="button"
              class="blank-drop-target"
              class:empty={!slotAssignments['blank_2']}
              class:filled={!!slotAssignments['blank_2']}
              class:is-active={activeSelectedSlot === 'blank_2'}
              class:correct={checked && slotAssignments['blank_2'] === SLOTS[1].correctOptionId}
              class:wrong={checked && slotAssignments['blank_2'] && slotAssignments['blank_2'] !== SLOTS[1].correctOptionId}
              onclick={() => handleSelectSlot('blank_2')}
            >
              {#if slotAssignments['blank_2']}
                <span class="slotted-text font-data">
                  {getOptionInSlot('blank_2')?.tag} {getOptionInSlot('blank_2')?.text}
                </span>
                <span class="clear-icon" onclick={(e) => { e.stopPropagation(); handleClearSlot('blank_2'); }} role="button" tabindex="0" onkeydown={(e) => { if(e.key === 'Enter') handleClearSlot('blank_2'); }}>✕</span>
              {:else}
                <span class="placeholder-text font-data">[ BLANK 2: CLICK TO ASSIGN ]</span>
              {/if}
            </button>

            <span>in our deep subterranean water reserve.</span>
          </div>

          <div class="nasa-note font-data">
            <span class="sci-tag">NASA EVIDENCE:</span> {SLOTS[1].nasaCitation}
          </div>
        </div>

        <!-- Sentence 3 -->
        <div class="sentence-card" class:active-card={activeSelectedSlot === 'blank_3'}>
          <div class="sentence-number font-data">03</div>
          <div class="sentence-body font-body">
            <span>Instead of buying synthetic bags of commercial ammonium nitrate, we intercrop pearl millet alongside</span>

            <button 
              type="button"
              class="blank-drop-target"
              class:empty={!slotAssignments['blank_3']}
              class:filled={!!slotAssignments['blank_3']}
              class:is-active={activeSelectedSlot === 'blank_3'}
              class:correct={checked && slotAssignments['blank_3'] === SLOTS[2].correctOptionId}
              class:wrong={checked && slotAssignments['blank_3'] && slotAssignments['blank_3'] !== SLOTS[2].correctOptionId}
              onclick={() => handleSelectSlot('blank_3')}
            >
              {#if slotAssignments['blank_3']}
                <span class="slotted-text font-data">
                  {getOptionInSlot('blank_3')?.tag} {getOptionInSlot('blank_3')?.text}
                </span>
                <span class="clear-icon" onclick={(e) => { e.stopPropagation(); handleClearSlot('blank_3'); }} role="button" tabindex="0" onkeydown={(e) => { if(e.key === 'Enter') handleClearSlot('blank_3'); }}>✕</span>
              {:else}
                <span class="placeholder-text font-data">[ BLANK 3: CLICK TO ASSIGN ]</span>
              {/if}
            </button>

            <span>whose root nodules inject pure biological nitrogen back into the topsoil.</span>
          </div>

          <div class="nasa-note font-data">
            <span class="sci-tag">NASA EVIDENCE:</span> {SLOTS[2].nasaCitation}
          </div>
        </div>

        <!-- Sentence 4 -->
        <div class="sentence-card" class:active-card={activeSelectedSlot === 'blank_4'}>
          <div class="sentence-number font-data">04</div>
          <div class="sentence-body font-body">
            <span>Spreading living bio-mulch and winter rye across exposed furrows protects our soil carbon and prevents up to</span>

            <button 
              type="button"
              class="blank-drop-target"
              class:empty={!slotAssignments['blank_4']}
              class:filled={!!slotAssignments['blank_4']}
              class:is-active={activeSelectedSlot === 'blank_4'}
              class:correct={checked && slotAssignments['blank_4'] === SLOTS[3].correctOptionId}
              class:wrong={checked && slotAssignments['blank_4'] && slotAssignments['blank_4'] !== SLOTS[3].correctOptionId}
              onclick={() => handleSelectSlot('blank_4')}
            >
              {#if slotAssignments['blank_4']}
                <span class="slotted-text font-data">
                  {getOptionInSlot('blank_4')?.tag} {getOptionInSlot('blank_4')?.text}
                </span>
                <span class="clear-icon" onclick={(e) => { e.stopPropagation(); handleClearSlot('blank_4'); }} role="button" tabindex="0" onkeydown={(e) => { if(e.key === 'Enter') handleClearSlot('blank_4'); }}>✕</span>
              {:else}
                <span class="placeholder-text font-data">[ BLANK 4: CLICK TO ASSIGN ]</span>
              {/if}
            </button>

            <span>during intense 40°C pre-monsoon heatwaves.</span>
          </div>

          <div class="nasa-note font-data">
            <span class="sci-tag">NASA EVIDENCE:</span> {SLOTS[3].nasaCitation}
          </div>
        </div>
      </div>
    </div>

    <!-- Available Options Bank -->
    <div class="options-bank-section">
      <div class="bank-header">
        <span class="bank-title font-data">AVAILABLE OPTIONS (CLICK TO SLOT INTO ACTIVE BLANK):</span>
        <span class="active-slot-indicator font-data">
          Target: <strong>{SLOTS.find(s => s.id === activeSelectedSlot)?.label}</strong>
        </span>
      </div>

      <div class="options-grid">
        {#each OPTIONS as option}
          {@const isPlaced = isOptionPlaced(option.id)}
          <button
            type="button"
            class="option-pill font-data"
            class:placed={isPlaced}
            disabled={isPlaced}
            onclick={() => handleAssignOption(option.id)}
          >
            <span class="opt-tag">{option.tag}</span>
            <span class="opt-text">{option.text}</span>
            {#if isPlaced}
              <span class="placed-badge font-data">✓ PLACED</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Action Bar & Validation -->
    <footer class="modal-footer">
      {#if checked && validationResult}
        <div class="validation-status font-display" class:success-text={validationResult.allCorrect}>
          {#if validationResult.allCorrect}
            ALL 4 AGRONOMIC BLANKS ARE VERIFIED BY DR. RAO & NASA GRACE!
          {:else}
            {validationResult.correctCount} / 4 Blanks Correct. Review the highlighted clues and try again!
          {/if}
        </div>
      {/if}

      <div class="footer-buttons">
        {#if checked && validationResult?.allCorrect}
          <button type="button" class="btn-claim font-data" onclick={handleClaimReward}>
            SEAL VILLAGE ROTATION CHARTER (+25 SOM, −45 WATER) →
          </button>
        {:else}
          <button type="button" class="btn-verify font-data" onclick={handleCheckAnswers}>
            VERIFY ANSWERS WITH DR. RAO →
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
    background: rgba(15, 25, 18, 0.82);
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

  .mission-modal {
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    max-width: 920px;
    width: 100%;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: var(--journal-ink, #1B2B1F);
  }

  .modal-header {
    background: var(--journal-forest, #1F3825);
    color: #FAF6ED;
    border-bottom: 2.5px solid var(--journal-gold, #E5A93C);
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mission-badge {
    font-size: 0.72rem;
    color: var(--journal-gold, #E5A93C);
    font-weight: bold;
    letter-spacing: 0.05em;
  }

  .mission-title {
    font-size: 1.2rem;
    margin: 0;
    color: #FAF6ED;
  }

  .sub-title {
    font-size: 0.82rem;
    color: #D2E7D8;
  }

  .close-x-btn {
    background: #FAF6ED;
    color: var(--journal-ink, #1B2B1F);
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    padding: 5px 12px;
    font-size: 0.8rem;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
  }

  .close-x-btn:hover {
    background: #FFFFFF;
  }

  .story-briefing {
    padding: 12px 18px;
    background: #F4EEDF;
    border-bottom: 1.5px solid #DFD7C2;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .agronomist-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #FAF6ED;
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    padding: 6px 10px;
    border-radius: 6px;
  }

  .avatar-badge {
    font-size: 0.82rem;
    font-weight: bold;
    color: var(--journal-forest, #1F3825);
  }

  .avatar-tag {
    font-size: 0.65rem;
    color: var(--journal-sage, #4E7C5A);
  }

  .brief-text {
    font-size: 0.9rem;
    color: var(--journal-ink, #1B2B1F);
    line-height: 1.4;
    margin: 0;
  }

  .document-container {
    padding: 14px 18px;
    overflow-y: auto;
    flex: 1;
    background: var(--journal-paper, #FAF6ED);
  }

  .scroll-banner {
    font-size: 1rem;
    color: var(--journal-forest, #1F3825);
    border-bottom: 2px solid var(--journal-forest, #1F3825);
    padding-bottom: 4px;
    margin-bottom: 12px;
    font-weight: bold;
  }

  .sentence-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sentence-card {
    background: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 12px 14px;
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
    transition: all 0.12s ease;
  }

  .sentence-card.active-card {
    border-color: var(--journal-gold, #E5A93C);
    background: #FFFDF8;
    box-shadow: 0 4px 0 var(--journal-gold, #E5A93C);
  }

  .sentence-number {
    font-size: 0.72rem;
    color: var(--journal-sage, #4E7C5A);
    font-weight: bold;
  }

  .sentence-body {
    font-size: 0.92rem;
    line-height: 1.6;
    color: var(--journal-ink, #1B2B1F);
  }

  .blank-drop-target {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    margin: 0 4px;
    border-radius: 4px;
    border: 2px dashed var(--journal-ink-muted, #556E5C);
    background: #F4EEDF;
    cursor: pointer;
    vertical-align: middle;
    transition: all 0.12s ease;
  }

  .blank-drop-target.empty {
    border-color: var(--journal-gold, #E5A93C);
    background: #FFF9ED;
  }

  .blank-drop-target.is-active {
    border: 2px solid var(--journal-forest, #1F3825);
    background: #EDF5EE;
  }

  .blank-drop-target.correct {
    border: 2px solid var(--journal-forest, #1F3825);
    background: #EDF5EE;
  }

  .blank-drop-target.wrong {
    border: 2px solid var(--journal-madder, #B83827);
    background: #FDF1ED;
  }

  .placeholder-text {
    font-size: 0.75rem;
    color: var(--journal-soil, #7E4A35);
    font-weight: bold;
  }

  .slotted-text {
    font-size: 0.82rem;
    color: var(--journal-ink, #1B2B1F);
    font-weight: bold;
  }

  .clear-icon {
    font-size: 0.75rem;
    color: var(--journal-madder, #B83827);
    cursor: pointer;
    margin-left: 4px;
  }

  .nasa-note {
    font-size: 0.76rem;
    color: var(--journal-monsoon, #2B69A3);
    background: #F0F5FA;
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 4px;
  }

  .sci-tag {
    font-weight: bold;
  }

  .options-bank-section {
    padding: 12px 18px;
    background: #EAE3D2;
    border-top: 2px solid var(--journal-ink, #1B2B1F);
  }

  .bank-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .bank-title {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--journal-forest, #1F3825);
  }

  .active-slot-indicator {
    font-size: 0.75rem;
    color: var(--journal-ink, #1B2B1F);
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
  }

  .option-pill {
    background: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 0.78rem;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    text-align: left;
    transition: all 0.12s ease;
  }

  .option-pill:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 0 var(--journal-ink, #1B2B1F);
    border-color: var(--journal-forest, #1F3825);
  }

  .option-pill.placed {
    opacity: 0.5;
    background: #DFD7C2;
    cursor: default;
    box-shadow: none;
  }

  .opt-tag {
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--journal-sage, #4E7C5A);
  }

  .opt-text {
    flex: 1;
    color: var(--journal-ink, #1B2B1F);
  }

  .placed-badge {
    font-size: 0.65rem;
    color: var(--journal-forest, #1F3825);
    font-weight: bold;
  }

  .modal-footer {
    padding: 12px 18px;
    background: #FAF6ED;
    border-top: 2px solid var(--journal-ink, #1B2B1F);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .validation-status {
    font-size: 0.92rem;
    color: var(--journal-madder, #B83827);
  }

  .validation-status.success-text {
    color: var(--journal-forest, #1F3825);
    font-weight: bold;
  }

  .footer-buttons {
    display: flex;
    gap: 8px;
  }

  .btn-verify, .btn-claim {
    padding: 8px 18px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    font-weight: bold;
    font-size: 0.85rem;
    cursor: pointer;
    transition: transform 0.12s, box-shadow 0.12s;
  }

  .btn-verify {
    background: var(--journal-paper, #FAF6ED);
    color: var(--journal-ink, #1B2B1F);
  }

  .btn-verify:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
  }

  .btn-claim {
    background: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
  }

  .btn-claim:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
  }
</style>
