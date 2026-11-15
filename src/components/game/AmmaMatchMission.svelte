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
    icon: string;
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
      icon: '🌾',
      color: '#B85840'
    },
    {
      id: 'paddy',
      name: 'Deep-Root Basmati',
      variety: 'Traditional Scented Paddy',
      icon: '🌱',
      color: '#3FA34D'
    },
    {
      id: 'chana',
      name: 'Desi Chickpea (Chana)',
      variety: 'Hardy Rain-Fed Pulse',
      icon: '🌰',
      color: '#D4A359'
    },
    {
      id: 'wheat',
      name: 'Dwarf Winter Wheat',
      variety: 'Alluvial Loam Winter Variety',
      icon: '🌿',
      color: '#E5C158'
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
      // Correct match!
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
      // Incorrect match
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
    <div class="mission-header font-pixel">
      <div class="title-row">
        <span class="mission-tag">[MISSION 1: AMMA'S VERANDA]</span>
        <span class="mission-name">🌾 HEIRLOOM SEED MATCHING MATRIX</span>
      </div>
      <button class="close-btn font-pixel" onclick={onClose} title="Return to Overworld">
        ✕ CLOSE
      </button>
    </div>

    <!-- Instructions & Story Context -->
    <div class="mission-brief font-body">
      <div class="brief-speech">
        <strong style="color: #FFB703;">Amma:</strong> "Hari beta, each heirloom seed has its own soul and soil secret. Match our ancestral crops with their true climate traits using NASA SMAP moisture data!"
      </div>
      {#if errorMessage}
        <div class="error-banner font-pixel">{errorMessage}</div>
      {/if}
    </div>

    <!-- Match Columns Layout -->
    <div class="matching-arena">
      <!-- Left Column: Seeds -->
      <div class="column-block">
        <div class="column-header font-pixel">◆ STEP 1: SELECT HEIRLOOM SEED</div>
        <div class="cards-list">
          {#each SEEDS as seed}
            {@const isMatched = !!matchedPairs[seed.id]}
            {@const isSelected = selectedSeedId === seed.id}
            <button 
              type="button"
              class="seed-card font-pixel {isSelected ? 'selected' : ''} {isMatched ? 'matched' : ''}"
              onclick={() => handleSelectSeed(seed.id)}
              disabled={isMatched}
            >
              <span class="seed-icon">{seed.icon}</span>
              <div class="seed-info">
                <span class="seed-name" style:color={seed.color}>{seed.name}</span>
                <span class="seed-variety font-retro">{seed.variety}</span>
              </div>
              {#if isMatched}
                <span class="match-check">✓ MATCHED</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Right Column: Traits -->
      <div class="column-block">
        <div class="column-header font-pixel">◆ STEP 2: PAIR CLIMATE / NASA TRAIT</div>
        <div class="cards-list">
          {#each TRAITS as trait}
            {@const isMatched = Object.values(matchedPairs).includes(trait.id)}
            <button 
              type="button"
              class="trait-card {isMatched ? 'matched' : ''}"
              onclick={() => handleSelectTrait(trait)}
              disabled={isMatched}
            >
              <div class="trait-title font-pixel">{trait.title}</div>
              <div class="trait-nasa font-data">{trait.nasaEvidence}</div>
              <div class="trait-soil font-retro">{trait.soilRequirement}</div>
              {#if isMatched}
                <span class="trait-check font-pixel">✓ PAIRED</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Victory Footer -->
    {#if isAllMatched}
      <div class="victory-banner">
        <div class="victory-text font-pixel">
          ★ EXCELLENT WORK! ALL 4 HEIRLOOM CROPS HARMONIZED WITH NASA SATELLITE DATA!
        </div>
        <div class="rewards-row font-data">
          <span>REWARDS: <strong style="color: #00FF66;">+15% Soil Moisture Retention</strong></span>
          <span>•</span>
          <span><strong style="color: #FFB703;">+50 Farm Coins</strong></span>
          <span>•</span>
          <span><strong style="color: #00ffff;">Amma's Heirloom Blessing</strong></span>
        </div>
        <button type="button" class="claim-btn font-pixel" onclick={handleClaimReward}>
          [✓ CLAIM AMMA'S BLESSING & RETURN TO FIELD]
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .mission-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(5, 12, 8, 0.88);
    backdrop-filter: blur(6px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 200;
    padding: 16px;
  }

  .mission-card {
    background: linear-gradient(180deg, #122216 0%, #09140c 100%);
    border: 3px solid #00FF66;
    border-radius: 8px;
    box-shadow: 0 0 25px rgba(0, 255, 102, 0.35), 0 12px 36px rgba(0, 0, 0, 0.85);
    max-width: 840px;
    width: 100%;
    max-height: 92vh;
    overflow-y: auto;
    color: #ffffff;
    display: flex;
    flex-direction: column;
  }

  .mission-header {
    background: #081109;
    border-bottom: 2px solid #00FF66;
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mission-tag {
    color: #FFB703;
    font-size: 9px;
  }

  .mission-name {
    color: #00FF66;
    font-size: 11px;
  }

  .close-btn {
    background: #2a1414;
    border: 1px solid #ff4d4d;
    color: #ff8585;
    padding: 4px 8px;
    font-size: 9px;
    cursor: pointer;
  }

  .close-btn:hover {
    background: #ff4d4d;
    color: #000;
  }

  .mission-brief {
    padding: 12px 18px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid #1f3d2b;
  }

  .brief-speech {
    font-size: 0.95rem;
    color: #e5f5eb;
    line-height: 1.4;
  }

  .error-banner {
    margin-top: 8px;
    background: #381212;
    border: 1px solid #ff5a5a;
    color: #ffb4a2;
    padding: 6px 10px;
    font-size: 9px;
  }

  .matching-arena {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 16px;
    padding: 16px 18px;
  }

  @media (max-width: 720px) {
    .matching-arena {
      grid-template-columns: 1fr;
    }
  }

  .column-header {
    font-size: 9px;
    color: #FFB703;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px dashed #2a5a3a;
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .seed-card {
    background: #0d1e13;
    border: 2px solid #1f4229;
    border-radius: 4px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .seed-card:hover:not(:disabled) {
    border-color: #00FF66;
    transform: translateX(4px);
    background: #142a1b;
  }

  .seed-card.selected {
    border-color: #FFB703;
    background: #1f2a14;
    box-shadow: 0 0 12px rgba(255, 183, 3, 0.4);
  }

  .seed-card.matched {
    border-color: #00FF66;
    background: #092012;
    opacity: 0.75;
    cursor: default;
  }

  .seed-icon {
    font-size: 1.5rem;
  }

  .seed-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-grow: 1;
  }

  .seed-name {
    font-size: 10px;
  }

  .seed-variety {
    font-size: 11px;
    color: #88a896;
  }

  .match-check {
    font-size: 8px;
    color: #00FF66;
    border: 1px solid #00FF66;
    padding: 2px 4px;
    border-radius: 2px;
  }

  .trait-card {
    background: #0b1810;
    border: 2px solid #1f3d2b;
    border-radius: 4px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .trait-card:hover:not(:disabled) {
    border-color: #FFB703;
    background: #152417;
    transform: translateX(-4px);
  }

  .trait-card.matched {
    border-color: #00FF66;
    background: #0a2012;
    opacity: 0.75;
    cursor: default;
  }

  .trait-title {
    font-size: 9.5px;
    color: #FFB703;
  }

  .trait-nasa {
    font-size: 11px;
    color: #00e5ff;
    line-height: 1.35;
  }

  .trait-soil {
    font-size: 12px;
    color: #c4d8ca;
  }

  .trait-check {
    align-self: flex-end;
    font-size: 8px;
    color: #00FF66;
    border: 1px solid #00FF66;
    padding: 2px 5px;
    border-radius: 2px;
    margin-top: 4px;
  }

  .victory-banner {
    background: linear-gradient(180deg, #092414 0%, #06150b 100%);
    border-top: 2px solid #00FF66;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
  }

  .victory-text {
    color: #FFB703;
    font-size: 10px;
  }

  .rewards-row {
    font-size: 12px;
    color: #e5f5eb;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .claim-btn {
    background: linear-gradient(180deg, #00FF66 0%, #00b347 100%);
    border: 2px solid #000;
    color: #000;
    padding: 12px 24px;
    font-size: 10px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 0 #000, 0 0 15px rgba(0, 255, 102, 0.5);
    transition: all 0.15s ease;
  }

  .claim-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #000, 0 0 20px rgba(0, 255, 102, 0.7);
  }
</style>
