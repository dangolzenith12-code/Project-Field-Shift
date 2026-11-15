<script lang="ts">
  import confetti from 'canvas-confetti';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
    onClose: () => void;
  }

  let { onComplete, onClose }: Props = $props();

  interface SeedItem {
    id: string;
    name: string;
    variety: string;
    tag: string;
    color: string;
  }

  interface TraitItem {
    id: string;
    seedId: string;
    title: string;
    nasaEvidence: string;
    soilRequirement: string;
  }

  const SEEDS: SeedItem[] = [
    {
      id: 'ragi',
      name: 'Finger Millet (Ragi)',
      variety: 'Ancestral Heirloom Red Ragi',
      tag: '[RAGI]',
      color: '#A43C25'
    },
    {
      id: 'paddy',
      name: 'Deep-Root Basmati',
      variety: 'Traditional Scented Paddy',
      tag: '[PADDY]',
      color: '#2D6B3B'
    },
    {
      id: 'chana',
      name: 'Desi Chickpea (Chana)',
      variety: 'Hardy Rain-Fed Pulse',
      tag: '[CHANA]',
      color: '#B2762C'
    },
    {
      id: 'wheat',
      name: 'Dwarf Winter Wheat',
      variety: 'Alluvial Loam Winter Variety',
      tag: '[WHEAT]',
      color: '#C88D22'
    }
  ];

  // Shuffled traits
  const TRAITS: TraitItem[] = [
    {
      id: 't_chana',
      seedId: 'chana',
      title: 'Natural Nitrogen Fixation',
      nasaEvidence: 'NASA SMAP: Needs minimal 28-32% moisture; root nodules inject 35 kg/ha natural nitrogen.',
      soilRequirement: 'Zero chemical urea required; enriches soil carbon for the next crop.'
    },
    {
      id: 't_ragi',
      seedId: 'ragi',
      title: 'Drought Champion & Deep Fibrous Roots',
      nasaEvidence: 'NASA SMAP: Germinates in scorched 22% topsoil; fibrous roots hold laterite gravel.',
      soilRequirement: 'Withstands 21-day mid-monsoon dry spells without wilting.'
    },
    {
      id: 't_wheat',
      seedId: 'wheat',
      title: 'Deep Residual Moisture Tapping',
      nasaEvidence: 'NASA SMAP: Drinks deep moisture stored 10-15 cm below surface during winter.',
      soilRequirement: 'Thrives in alluvial cool loam; optimal for winter crop rotation.'
    },
    {
      id: 't_paddy',
      seedId: 'paddy',
      title: 'Aquifer Conservation Aerobic Paddy',
      nasaEvidence: 'NASA GRACE: Alternate wetting and drying saves 40% groundwater vs continuous flooding.',
      soilRequirement: 'Tolerates drying cycles; protects deep tubewell aquifers from collapse.'
    }
  ];

  let selectedSeedId = $state<string | null>(null);
  let matchedPairs = $state<Record<string, string>>({}); // seedId -> traitId
  let errorMessage = $state<string | null>(null);

  const isAllMatched = $derived(Object.keys(matchedPairs).length === SEEDS.length);

  function handleSelectSeed(seedId: string) {
    if (matchedPairs[seedId]) return;
    sfx.playSelect();
    selectedSeedId = seedId;
    errorMessage = null;
  }

  function handleSelectTrait(trait: TraitItem) {
    if (Object.values(matchedPairs).includes(trait.id)) return;
    if (!selectedSeedId) {
      errorMessage = "Select an heirloom crop from the left column first!";
      sfx.playAlert();
      return;
    }

    if (trait.seedId === selectedSeedId) {
      sfx.playSuccess();
      matchedPairs[selectedSeedId] = trait.id;
      selectedSeedId = null;
      errorMessage = null;

      if (Object.keys(matchedPairs).length === SEEDS.length) {
        try {
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    } else {
      sfx.playAlert();
      errorMessage = "Not quite! Look closely at the crop's root depth and NASA moisture requirement.";
    }
  }

  function handleClaimReward() {
    onComplete();
  }
</script>

<div class="mission-modal-backdrop" onclick={onClose} role="presentation">
  <div 
    class="mission-card" 
    role="dialog" 
    tabindex="-1"
    onclick={(e) => e.stopPropagation()} 
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div class="mission-header">
      <div class="title-row">
        <span class="mission-tag font-data">[MISSION 1: AMMA'S VERANDA]</span>
        <h2 class="mission-name font-display">HEIRLOOM SEED MATCHING MATRIX</h2>
      </div>
      <button type="button" class="close-btn font-data" onclick={onClose} title="Return to Overworld">
        ✕ CLOSE
      </button>
    </div>

    <!-- Instructions & Story Context -->
    <div class="mission-brief font-body">
      <div class="brief-speech">
        <strong class="speaker-name font-display">Amma:</strong> "Hari beta, each heirloom seed has its own soul and soil secret. Match our ancestral crops with their true climate traits using NASA SMAP moisture data!"
      </div>
      {#if errorMessage}
        <div class="error-banner font-data">{errorMessage}</div>
      {/if}
    </div>

    <!-- Match Columns Layout -->
    <div class="matching-arena">
      <!-- Left Column: Seeds -->
      <div class="column-block">
        <div class="column-header font-data">STEP 1: SELECT HEIRLOOM SEED</div>
        <div class="cards-list">
          {#each SEEDS as seed}
            {@const isMatched = !!matchedPairs[seed.id]}
            {@const isSelected = selectedSeedId === seed.id}
            <button 
              type="button"
              class="seed-card {isSelected ? 'selected' : ''} {isMatched ? 'matched' : ''}"
              onclick={() => handleSelectSeed(seed.id)}
              disabled={isMatched}
            >
              <span class="seed-badge font-data" style:color={seed.color}>{seed.tag}</span>
              <div class="seed-info">
                <span class="seed-name font-display" style:color={seed.color}>{seed.name}</span>
                <span class="seed-variety font-body">{seed.variety}</span>
              </div>
              {#if isMatched}
                <span class="match-check font-data">✓ MATCHED</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Right Column: Traits -->
      <div class="column-block">
        <div class="column-header font-data">STEP 2: PAIR CLIMATE / NASA TRAIT</div>
        <div class="cards-list">
          {#each TRAITS as trait}
            {@const isMatched = Object.values(matchedPairs).includes(trait.id)}
            <button 
              type="button"
              class="trait-card {isMatched ? 'matched' : ''}"
              onclick={() => handleSelectTrait(trait)}
              disabled={isMatched}
            >
              <div class="trait-title font-display">{trait.title}</div>
              <div class="trait-nasa font-data">{trait.nasaEvidence}</div>
              <div class="trait-soil font-body">{trait.soilRequirement}</div>
              {#if isMatched}
                <span class="trait-check font-data">✓ PAIRED WITH ANCESTRAL SEED</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Victory Footer -->
    {#if isAllMatched}
      <div class="victory-banner">
        <div class="victory-text font-display">
          ALL 4 HEIRLOOM SEEDS SUCCESSFULLY MATCHED WITH NASA SATELLITE PROFILES!
        </div>
        <div class="rewards-row font-data">
          <span>+20% Soil Organic Matter</span>
          <span>•</span>
          <span>+15% Root Moisture Buffer</span>
          <span>•</span>
          <span>+50 Family Coins</span>
        </div>
        <button type="button" class="claim-btn font-data" onclick={handleClaimReward}>
          ACCEPT HARVEST KNOWLEDGE & RETURN TO OVERWORLD →
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .mission-modal-backdrop {
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

  .mission-card {
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: var(--journal-ink, #1B2B1F);
  }

  .mission-header {
    background: var(--journal-forest, #1F3825);
    color: #FAF6ED;
    border-bottom: 2.5px solid var(--journal-gold, #E5A93C);
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mission-tag {
    font-size: 0.72rem;
    color: var(--journal-gold, #E5A93C);
    letter-spacing: 0.05em;
    font-weight: bold;
  }

  .mission-name {
    font-size: 1.15rem;
    margin: 0;
    color: #FAF6ED;
  }

  .close-btn {
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

  .close-btn:hover {
    background: #FFFFFF;
  }

  .mission-brief {
    padding: 14px 18px;
    background: #F4EEDF;
    border-bottom: 1.5px solid #DFD7C2;
  }

  .speaker-name {
    color: var(--journal-forest, #1F3825);
    font-size: 1.05rem;
  }

  .brief-speech {
    font-size: 0.95rem;
    color: var(--journal-ink, #1B2B1F);
    line-height: 1.4;
  }

  .error-banner {
    margin-top: 8px;
    padding: 6px 12px;
    background: #FDF1ED;
    border-left: 3px solid var(--journal-madder, #B83827);
    color: var(--journal-madder, #B83827);
    font-size: 0.82rem;
    font-weight: bold;
  }

  .matching-arena {
    padding: 16px 18px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    overflow-y: auto;
    flex: 1;
  }

  @media (max-width: 680px) {
    .matching-arena {
      grid-template-columns: 1fr;
    }
  }

  .column-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .column-header {
    font-size: 0.76rem;
    font-weight: bold;
    color: var(--journal-sage, #4E7C5A);
    letter-spacing: 0.05em;
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .seed-card {
    background: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.12s ease;
  }

  .seed-card:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
    border-color: var(--journal-forest, #1F3825);
  }

  .seed-card.selected {
    border-color: var(--journal-gold, #E5A93C);
    background: #FFFBF2;
    box-shadow: 0 4px 0 var(--journal-gold, #E5A93C);
  }

  .seed-card.matched {
    opacity: 0.65;
    background: #EDF5EE;
    border-color: var(--journal-sage, #4E7C5A);
    cursor: default;
    box-shadow: none;
  }

  .seed-badge {
    font-size: 0.75rem;
    font-weight: bold;
    padding: 2px 6px;
    background: #F4EEDF;
    border: 1px solid var(--journal-ink, #1B2B1F);
    border-radius: 4px;
  }

  .seed-info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .seed-name {
    font-size: 1rem;
    font-weight: 600;
  }

  .seed-variety {
    font-size: 0.8rem;
    color: var(--journal-ink-muted, #556E5C);
  }

  .match-check {
    font-size: 0.72rem;
    color: var(--journal-forest, #1F3825);
    font-weight: bold;
  }

  .trait-card {
    background: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    text-align: left;
    transition: all 0.12s ease;
  }

  .trait-card:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
    border-color: var(--journal-forest, #1F3825);
  }

  .trait-card.matched {
    opacity: 0.65;
    background: #EDF5EE;
    border-color: var(--journal-sage, #4E7C5A);
    cursor: default;
    box-shadow: none;
  }

  .trait-title {
    font-size: 0.95rem;
    color: var(--journal-forest, #1F3825);
  }

  .trait-nasa {
    font-size: 0.78rem;
    color: var(--journal-monsoon, #2B69A3);
    line-height: 1.35;
  }

  .trait-soil {
    font-size: 0.82rem;
    color: var(--journal-ink-soft, #2D4233);
  }

  .trait-check {
    align-self: flex-end;
    font-size: 0.72rem;
    color: var(--journal-forest, #1F3825);
    font-weight: bold;
    margin-top: 4px;
  }

  .victory-banner {
    background: #EDF5EE;
    border-top: 2px solid var(--journal-forest, #1F3825);
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }

  .victory-text {
    color: var(--journal-forest, #1F3825);
    font-size: 1.05rem;
  }

  .rewards-row {
    font-size: 0.85rem;
    color: var(--journal-ink, #1B2B1F);
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .claim-btn {
    background: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    padding: 10px 22px;
    font-size: 0.88rem;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.12s, box-shadow 0.12s;
  }

  .claim-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
  }
</style>
