<script lang="ts">
  interface SoilOption {
    id: string;
    name: string;
    region: string;
    texture: string;
    smapWetness: string;
    waterDeficit: string;
    matchedCropId: string;
  }

  interface CropOption {
    id: string;
    name: string;
    category: string;
    rooting: string;
    waterReq: string;
    trait: string;
  }

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  const SOILS: SoilOption[] = [
    {
      id: 'soil_punjab',
      name: 'Deep Alluvial Silt Loam',
      region: 'Punjab Basin',
      texture: 'Fine loam (Clay 18%, Sand 42%)',
      smapWetness: '0.55 - 0.70 GWETROOT',
      waterDeficit: 'Requires high surface irrigation',
      matchedCropId: 'crop_rice'
    },
    {
      id: 'soil_deccan',
      name: 'Shallow Red Sandy Clay',
      region: 'Deccan Plateau',
      texture: 'Coarse red gravel (Low moisture retention)',
      smapWetness: '0.25 - 0.40 GWETROOT',
      waterDeficit: 'Prone to 20-day dry spells',
      matchedCropId: 'crop_millet'
    },
    {
      id: 'soil_sahel',
      name: 'Crusted Arid Sandy Soil',
      region: 'Sahel / Semi-Arid Fringe',
      texture: 'Arenosol coarse sand (<0.3% Organic Carbon)',
      smapWetness: '0.15 - 0.28 GWETROOT',
      waterDeficit: 'Severe evaporation stress',
      matchedCropId: 'crop_legume'
    }
  ];

  const CROPS: CropOption[] = [
    {
      id: 'crop_rice',
      name: 'Basmati Rice & Wheat',
      category: 'Cereal Grain',
      rooting: 'Shallow surface roots (20-30 cm)',
      waterReq: '1100 - 1300 mm/season',
      trait: 'Best suited for deep alluvial soil with high water availability'
    },
    {
      id: 'crop_millet',
      name: 'Finger Millet (Ragi)',
      category: 'Nutri-Cereal',
      rooting: 'Deep taproot system (>90 cm)',
      waterReq: '350 - 450 mm/season',
      trait: 'Penetrates hard subsoil compaction in drought-prone red gravel'
    },
    {
      id: 'crop_legume',
      name: 'Desi Chickpea & Cowpea',
      category: 'Nitrogen-Fixing Pulse',
      rooting: 'Deep branching roots with Rhizobia',
      waterReq: '250 - 350 mm/season',
      trait: 'Fixes atmospheric nitrogen and rebuilds organic humus in sandy soil'
    }
  ];

  // User selections
  let selectedSoilId = $state<string | null>(null);
  let selectedCropId = $state<string | null>(null);
  let matches = $state<Record<string, string>>({}); // soilId -> cropId
  let feedbackMessage = $state<string | null>(null);

  // Check if all matched
  const allMatched = $derived(Object.keys(matches).length === SOILS.length);

  function handleSelectSoil(soilId: string) {
    selectedSoilId = soilId;
    checkMatch();
  }

  function handleSelectCrop(cropId: string) {
    selectedCropId = cropId;
    checkMatch();
  }

  function checkMatch() {
    if (selectedSoilId && selectedCropId) {
      const soil = SOILS.find(s => s.id === selectedSoilId);
      if (soil && soil.matchedCropId === selectedCropId) {
        matches[selectedSoilId] = selectedCropId;
        const crop = CROPS.find(c => c.id === selectedCropId);
        feedbackMessage = `[CORRECT MATCH] ${soil.name} successfully paired with ${crop?.name}!`;
      } else {
        feedbackMessage = `[MISMATCH] Check the NASA SMAP and water requirement values in the reference table.`;
      }
      selectedSoilId = null;
      selectedCropId = null;
    }
  }

  function resetMatching() {
    matches = {};
    selectedSoilId = null;
    selectedCropId = null;
    feedbackMessage = null;
  }
</script>

<div class="matching-game-wrapper">
  <!-- Top Green Arcade Banner -->
  <div class="top-arcade-banner">
    <div class="banner-corn-left" aria-hidden="true">◆ ◆ ◆</div>
    <h2 class="banner-title font-display">SOIL & CROP COMPATIBILITY CHALLENGE</h2>
    <div class="banner-corn-right" aria-hidden="true">◆ ◆ ◆</div>
  </div>

  <div class="challenge-subtitle font-body">
    Consult the NASA Earth Science & SoilGrids benchmarks on the right to match each soil condition with its ideal crop!
  </div>

  {#if feedbackMessage}
    <div class="feedback-alert font-data" class:success={feedbackMessage.includes('CORRECT')}>
      {feedbackMessage}
    </div>
  {/if}

  <!-- Main Split Layout (Matching Board on Left, NASA Table on Right) -->
  <div class="matching-split-grid">
    <!-- Left Column: Interactive Matching Board -->
    <div class="matching-board-panel">
      <div class="panel-tag font-data">STEP 1: SELECT A SOIL CONDITION</div>
      <div class="options-list">
        {#each SOILS as soil}
          {@const isMatched = !!matches[soil.id]}
          {@const isSelected = selectedSoilId === soil.id}
          <button 
            type="button" 
            class="match-card soil-card {isSelected ? 'selected' : ''} {isMatched ? 'matched' : ''}"
            onclick={() => handleSelectSoil(soil.id)}
            disabled={isMatched}
          >
            <div class="card-head">
              <span class="type-indicator font-data">[SOIL]</span>
              <span class="region-label font-data">{soil.region}</span>
            </div>
            <div class="card-name font-display">{soil.name}</div>
            <div class="card-meta font-body">{soil.texture}</div>
            <div class="smap-badge font-data">NASA SMAP: {soil.smapWetness}</div>

            {#if isMatched}
              <div class="matched-badge font-data">◆ COMPATIBLE CROP ASSIGNED ◆</div>
            {/if}
          </button>
        {/each}
      </div>

      <div class="panel-tag font-data" style="margin-top: 14px;">STEP 2: SELECT MATCHING CROP</div>
      <div class="options-list">
        {#each CROPS as crop}
          {@const isMatched = Object.values(matches).includes(crop.id)}
          {@const isSelected = selectedCropId === crop.id}
          <button 
            type="button" 
            class="match-card crop-card {isSelected ? 'selected' : ''} {isMatched ? 'matched' : ''}"
            onclick={() => handleSelectCrop(crop.id)}
            disabled={isMatched}
          >
            <div class="card-head">
              <span class="type-indicator font-data">[CROP]</span>
              <span class="water-need-tag font-data">{crop.waterReq}</span>
            </div>
            <div class="card-name font-display">{crop.name}</div>
            <div class="card-meta font-body">{crop.rooting}</div>
            <div class="trait-desc font-data">{crop.trait}</div>

            {#if isMatched}
              <div class="matched-badge font-data">◆ PAIRED SUCCESSFULLY ◆</div>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Right Column: NASA Earth Observations & SoilGrids Data Table -->
    <div class="nasa-reference-panel">
      <div class="panel-header-badge font-data">
        <span>[NASA EARTH SCIENCE REFERENCE TABLE]</span>
      </div>
      <h3 class="table-title font-display">Soil Hydrology & Crop Suitability Benchmarks</h3>

      <div class="table-scroll-wrap">
        <table class="nasa-data-table font-data">
          <thead>
            <tr>
              <th>Agro-Zone</th>
              <th>SMAP Wetness (GWETROOT)</th>
              <th>ISRIC Organic Carbon</th>
              <th>Water Need (mm)</th>
              <th>Recommended Crop Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Punjab Basin</strong></td>
              <td>0.55 - 0.70</td>
              <td>0.58% (Depleting)</td>
              <td>1200 mm</td>
              <td>Basmati Rice / Wheat (Deep Loam)</td>
            </tr>
            <tr>
              <td><strong>Deccan Plateau</strong></td>
              <td>0.25 - 0.40</td>
              <td>0.45% (Gravelly)</td>
              <td>400 mm</td>
              <td>Finger Millet / Sorghum (Taproots)</td>
            </tr>
            <tr>
              <td><strong>Sahel Fringe</strong></td>
              <td>0.15 - 0.28</td>
              <td>0.25% (Critical)</td>
              <td>300 mm</td>
              <td>Desi Chickpea / Cowpea (N-Fixing)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="scientific-note font-body">
        <strong>NASA Satellite Context:</strong> NASA SMAP measures the dielectric constant of topsoil to calculate root-zone moisture. When values fall below 0.30, shallow-rooted cereals experience vegetative drought wilting.
      </div>

      <!-- Action Completion Footer -->
      <div class="panel-footer">
        {#if allMatched}
          <div class="success-banner font-display">
            ◆ ALL SOILS HARMONIZED! READY TO SOW HARI'S FIELD ◆
          </div>
          <button type="button" class="action-btn-proceed font-display" onclick={onComplete}>
            PROCEED TO HARVEST CYCLE →
          </button>
        {:else}
          <div class="progress-hint font-data">
            Matches Completed: {Object.keys(matches).length} of {SOILS.length}
          </div>
          <button type="button" class="reset-link font-data" onclick={resetMatching}>
            Reset Matches
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .matching-game-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-width: 1080px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-2);
  }

  /* Top Green Arcade Banner */
  .top-arcade-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #0A1C0A;
    border: 3px solid #3FA34D;
    border-radius: var(--radius-sm);
    padding: 10px 18px;
    box-shadow: 0 4px 0 var(--ink);
  }

  .banner-corn-left, .banner-corn-right {
    color: #FFB703;
    font-size: 0.85rem;
    letter-spacing: 2px;
  }

  .banner-title {
    color: #00FF66;
    font-size: clamp(1.1rem, 2.8vw, 1.6rem);
    letter-spacing: 1px;
    text-align: center;
    margin: 0;
  }

  .challenge-subtitle {
    font-size: 0.95rem;
    color: var(--ink);
    text-align: center;
  }

  .feedback-alert {
    padding: 8px 14px;
    border: 2px solid var(--chili);
    background-color: color-mix(in srgb, var(--chili) 15%, var(--paper));
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    color: var(--ink);
    text-align: center;
  }

  .feedback-alert.success {
    border-color: var(--paddy);
    background-color: color-mix(in srgb, var(--paddy) 18%, var(--paper));
    color: var(--ink);
  }

  /* Split Layout */
  .matching-split-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    align-items: start;
  }

  @media (max-width: 820px) {
    .matching-split-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Left Panel */
  .matching-board-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background-color: var(--paper);
    border: 3px solid var(--ink);
    border-radius: var(--radius);
    padding: var(--space-3);
    box-shadow: 0 4px 0 var(--ink);
  }

  .panel-tag {
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--soil);
    letter-spacing: 0.5px;
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .match-card {
    background-color: color-mix(in srgb, var(--paper) 95%, var(--turmeric));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 2px 0 var(--ink);
    transition: transform var(--fast) var(--spring), background-color var(--fast) ease;
  }

  .match-card:hover:not(:disabled) {
    transform: translateY(-2px);
    background-color: color-mix(in srgb, var(--turmeric) 35%, var(--paper));
  }

  .match-card.selected {
    border: 3px solid #00FF66;
    background-color: color-mix(in srgb, var(--paddy) 25%, var(--paper));
    transform: scale(1.02);
  }

  .match-card.matched {
    opacity: 0.85;
    background-color: color-mix(in srgb, var(--paddy) 18%, var(--paper));
    border-color: var(--paddy);
    cursor: default;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.72rem;
    margin-bottom: 2px;
  }

  .type-indicator {
    color: var(--soil);
    font-weight: bold;
  }

  .region-label, .water-need-tag {
    color: var(--monsoon);
    font-weight: bold;
  }

  .card-name {
    font-size: 1.05rem;
    color: var(--ink);
    margin: 2px 0;
  }

  .card-meta {
    font-size: 0.82rem;
    color: var(--ink);
  }

  .smap-badge, .trait-desc {
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--ink) 75%, transparent);
    margin-top: 4px;
  }

  .matched-badge {
    margin-top: 4px;
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--paddy);
    text-align: center;
  }

  /* Right Panel: NASA Table */
  .nasa-reference-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #0E1A12;
    border: 3px solid #3FA34D;
    border-radius: var(--radius);
    padding: var(--space-3);
    color: #E0F2E9;
    box-shadow: 0 4px 0 var(--ink);
  }

  .panel-header-badge {
    font-size: 0.72rem;
    color: #00FF66;
    letter-spacing: 0.5px;
  }

  .table-title {
    font-size: 1.15rem;
    color: #FFFFFF;
    margin: 0;
  }

  .table-scroll-wrap {
    overflow-x: auto;
  }

  .nasa-data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.72rem;
    text-align: left;
  }

  .nasa-data-table th, .nasa-data-table td {
    padding: 6px 8px;
    border-bottom: 1px solid #1E3D24;
  }

  .nasa-data-table th {
    background-color: #162E1D;
    color: #00FF66;
  }

  .nasa-data-table tr:hover {
    background-color: #14281A;
  }

  .scientific-note {
    font-size: 0.8rem;
    line-height: 1.35;
    background-color: #142419;
    border-left: 3px solid #00FF66;
    padding: 8px;
    border-radius: 0 4px 4px 0;
  }

  .panel-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 10px;
  }

  .progress-hint {
    font-size: 0.75rem;
    color: #A0C8AA;
  }

  .reset-link {
    background: none;
    border: none;
    color: #FFB703;
    font-size: 0.72rem;
    cursor: pointer;
    text-decoration: underline;
  }

  .success-banner {
    color: #00FF66;
    font-size: 0.95rem;
    text-align: center;
    animation: flash 1s infinite alternate;
  }

  @keyframes flash {
    from { opacity: 0.8; }
    to { opacity: 1; }
  }

  .action-btn-proceed {
    background-color: #00FF66;
    color: #0A1C0A;
    border: 2px solid var(--ink);
    border-radius: var(--radius-pill);
    padding: 8px 24px;
    font-size: 1.05rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 0 var(--ink);
    transition: transform var(--fast) var(--spring);
  }

  .action-btn-proceed:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 var(--ink);
  }
</style>
