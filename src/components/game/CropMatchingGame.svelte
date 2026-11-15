<script lang="ts">
  import { onMount } from 'svelte';
  import { sfx } from '../../utils/sound';

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  interface SituationCard {
    id: string;
    title: string;
    sub: string;
    iconType: 'co2_l1' | 'co2_l2' | 'no_co2';
    matchedCropId: string;
    explanation: string;
  }

  interface CropCard {
    id: string;
    name: string;
    category: string;
    iconType: 'corn' | 'pulse' | 'rice';
    yieldImpact: string;
  }

  const SITUATIONS: SituationCard[] = [
    {
      id: 'sit_1',
      title: 'CO2, Level 1 Adaptation',
      sub: 'Punjab Basin (High Moisture)',
      iconType: 'co2_l1',
      matchedCropId: 'crop_1',
      explanation: 'Level 1 adaptation with irrigation mitigates heat stress, sustaining cereal yields.'
    },
    {
      id: 'sit_2',
      title: 'CO2, Level 2 Adaptation',
      sub: 'Deccan Plateau (Water Stress)',
      iconType: 'co2_l2',
      matchedCropId: 'crop_2',
      explanation: 'Level 2 regenerative pulse integration preserves soil moisture and boosts protein feed by +11%.'
    },
    {
      id: 'sit_3',
      title: 'No CO2, No Adaptation',
      sub: 'Sahel Fringe (Degraded Sand)',
      iconType: 'no_co2',
      matchedCropId: 'crop_3',
      explanation: 'Without adaptation, wheat drops by -51% and coarse grains drop by -19%.'
    }
  ];

  const CROPS: CropCard[] = [
    {
      id: 'crop_1',
      name: 'Corn & Wheat',
      category: 'Cereal Grain',
      iconType: 'corn',
      yieldImpact: 'Protected by Level 1 moisture management'
    },
    {
      id: 'crop_2',
      name: 'Protein Feed',
      category: 'Chickpea & Legumes',
      iconType: 'pulse',
      yieldImpact: '+11% yield gain under Level 2 adaptation'
    },
    {
      id: 'crop_3',
      name: 'Rice & Grains',
      category: 'Coarse Grains',
      iconType: 'rice',
      yieldImpact: '-36% collapse under zero adaptation'
    }
  ];

  let selectedSitId = $state<string | null>(null);
  let selectedCropId = $state<string | null>(null);
  let matches = $state<Record<string, string>>({}); // sitId -> cropId
  let statusBanner = $state<string | null>(null);

  const allMatched = $derived(Object.keys(matches).length === SITUATIONS.length);

  // Card element references for drawing lines
  let sitRefs: Record<string, HTMLElement> = {};
  let cropRefs: Record<string, HTMLElement> = {};
  let gridContainer: HTMLElement | null = $state(null);

  let lines = $state<Array<{ x1: number; y1: number; x2: number; y2: number; sitId: string }>>([]);

  function updateLines() {
    if (!gridContainer) return;
    const containerRect = gridContainer.getBoundingClientRect();
    const newLines: Array<{ x1: number; y1: number; x2: number; y2: number; sitId: string }> = [];

    for (const [sitId, cropId] of Object.entries(matches)) {
      const sitEl = sitRefs[sitId];
      const cropEl = cropRefs[cropId];
      if (sitEl && cropEl) {
        const sitRect = sitEl.getBoundingClientRect();
        const cropRect = cropEl.getBoundingClientRect();

        const x1 = sitRect.left + sitRect.width / 2 - containerRect.left;
        const y1 = sitRect.bottom - containerRect.top;
        const x2 = cropRect.left + cropRect.width / 2 - containerRect.left;
        const y2 = cropRect.top - containerRect.top;

        newLines.push({ x1, y1, x2, y2, sitId });
      }
    }
    lines = newLines;
  }

  function handleSelectSit(sitId: string) {
    if (matches[sitId]) return;
    sfx.playSelect();
    selectedSitId = sitId;
    checkMatch();
  }

  function handleSelectCrop(cropId: string) {
    if (Object.values(matches).includes(cropId)) return;
    sfx.playSelect();
    selectedCropId = cropId;
    checkMatch();
  }

  function checkMatch() {
    if (selectedSitId && selectedCropId) {
      const sit = SITUATIONS.find(s => s.id === selectedSitId);
      if (sit && sit.matchedCropId === selectedCropId) {
        matches[selectedSitId] = selectedCropId;
        sfx.playSuccess();
        const crop = CROPS.find(c => c.id === selectedCropId);
        statusBanner = `[PAIR MATCHED] ${sit.title} harmonized with ${crop?.name}!`;
        setTimeout(updateLines, 50);
      } else {
        sfx.playAlert();
        statusBanner = `[MISMATCH] Check the Potential Impacts Reference Table on the right.`;
      }
      selectedSitId = null;
      selectedCropId = null;
    }
  }

  function resetGame() {
    matches = {};
    selectedSitId = null;
    selectedCropId = null;
    statusBanner = null;
    lines = [];
  }

  onMount(() => {
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  });
</script>

<div class="matching-screen-layout">
  <!-- Top Title & Subtitle (Image 2 style) -->
  <div class="header-section">
    <button type="button" class="back-link font-pixel" onclick={resetGame}>
      - RESET
    </button>
    <div class="title-stack">
      <h1 class="main-title font-pixel">Water Management Matching Game</h1>
      <p class="sub-instruction font-retro">
        Match the images: Match first row situations with their best fitted crop using the table!
      </p>
    </div>
  </div>

  {#if allMatched}
    <div class="completion-banner font-pixel">
      Congratulations! You completed the matching game!
    </div>
  {:else if statusBanner}
    <div class="status-alert font-retro">
      {statusBanner}
    </div>
  {/if}

  <!-- Split Screen: Left 3x2 Grid with connecting lines, Right Reference Table -->
  <div class="matching-stage-row">
    <!-- Left Column: Interactive 2-Row Matching Grid -->
    <div class="matching-grid-wrapper" bind:this={gridContainer}>
      <!-- Dynamic SVG Connecting Lines Layer -->
      <svg class="connecting-lines-svg">
        <defs>
          <linearGradient id="laserGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#00FF66" />
            <stop offset="100%" stop-color="#38B000" />
          </linearGradient>
        </defs>
        {#each lines as line}
          <line 
            x1={line.x1} 
            y1={line.y1} 
            x2={line.x2} 
            y2={line.y2} 
            stroke="url(#laserGreen)" 
            stroke-width="5" 
            stroke-linecap="round"
          />
          <circle cx={line.x1} cy={line.y1} r="4" fill="#00FF66" />
          <circle cx={line.x2} cy={line.y2} r="4" fill="#38B000" />
        {/each}
      </svg>

      <!-- Row 1: Situations -->
      <div class="grid-row top-row">
        {#each SITUATIONS as sit}
          {@const isMatched = !!matches[sit.id]}
          {@const isSelected = selectedSitId === sit.id}
          <button 
            type="button"
            class="match-box {isMatched ? 'is-matched' : ''} {isSelected ? 'is-selected' : ''}"
            bind:this={sitRefs[sit.id]}
            onclick={() => handleSelectSit(sit.id)}
            disabled={isMatched}
          >
            <!-- Circular Retro Icon Emblem -->
            <div class="emblem-circle {sit.iconType}">
              {#if sit.iconType === 'co2_l1'}
                <div class="emblem-text font-pixel">
                  <span>CO2</span>
                  <span class="sub-emblem">ADAPT<br>LEVEL 1</span>
                </div>
              {:else if sit.iconType === 'co2_l2'}
                <div class="emblem-text font-pixel">
                  <span>CO2</span>
                  <span class="sub-emblem">ADAPT<br>LEVEL 2</span>
                </div>
              {:else}
                <div class="emblem-text font-pixel slash-emblem">
                  <span>CO2</span>
                  <span class="sub-emblem">NO ADAPT</span>
                </div>
              {/if}
            </div>

            <div class="box-label font-retro">{sit.title}</div>
            <div class="box-sub font-data">{sit.sub}</div>
          </button>
        {/each}
      </div>

      <!-- Row 2: Crops -->
      <div class="grid-row bottom-row">
        {#each CROPS as crop}
          {@const isMatched = Object.values(matches).includes(crop.id)}
          {@const isSelected = selectedCropId === crop.id}
          <button 
            type="button"
            class="match-box {isMatched ? 'is-matched-crop' : ''} {isSelected ? 'is-selected' : ''}"
            bind:this={cropRefs[crop.id]}
            onclick={() => handleSelectCrop(crop.id)}
            disabled={isMatched}
          >
            <!-- Pixel Art Crop Icon -->
            <div class="crop-pixel-art">
              {#if crop.iconType === 'corn'}
                <!-- Pixel Art Golden Corn -->
                <svg viewBox="0 0 40 40" width="48" height="48" shape-rendering="crispEdges">
                  <!-- Green Leaves -->
                  <rect x="12" y="22" width="4" height="12" fill="#2E7D32" />
                  <rect x="24" y="22" width="4" height="12" fill="#2E7D32" />
                  <rect x="8" y="26" width="4" height="6" fill="#388E3C" />
                  <rect x="28" y="26" width="4" height="6" fill="#388E3C" />
                  <!-- Yellow Cob -->
                  <rect x="16" y="8" width="8" height="24" fill="#FFB703" />
                  <rect x="14" y="12" width="12" height="16" fill="#FFC72C" />
                  <!-- Kernel Texture -->
                  <rect x="16" y="10" width="3" height="3" fill="#D97706" />
                  <rect x="21" y="14" width="3" height="3" fill="#D97706" />
                  <rect x="16" y="18" width="3" height="3" fill="#D97706" />
                  <rect x="21" y="22" width="3" height="3" fill="#D97706" />
                </svg>
              {:else if crop.iconType === 'pulse'}
                <!-- Pixel Art Protein Feed / Chickpea -->
                <svg viewBox="0 0 40 40" width="48" height="48" shape-rendering="crispEdges">
                  <rect x="18" y="18" width="4" height="18" fill="#4B382A" />
                  <rect x="10" y="12" width="8" height="8" fill="#D4A373" />
                  <rect x="22" y="12" width="8" height="8" fill="#D4A373" />
                  <rect x="16" y="6" width="8" height="8" fill="#E6BA88" />
                  <!-- Pod veins -->
                  <rect x="12" y="14" width="2" height="4" fill="#A47148" />
                  <rect x="24" y="14" width="2" height="4" fill="#A47148" />
                </svg>
              {:else}
                <!-- Pixel Art Basmati Rice / Wheat Sheaf -->
                <svg viewBox="0 0 40 40" width="48" height="48" shape-rendering="crispEdges">
                  <rect x="18" y="16" width="4" height="20" fill="#B08958" />
                  <!-- Grains branching -->
                  <rect x="14" y="8" width="4" height="6" fill="#E9C46A" />
                  <rect x="22" y="10" width="4" height="6" fill="#E9C46A" />
                  <rect x="12" y="14" width="4" height="6" fill="#F4A261" />
                  <rect x="24" y="16" width="4" height="6" fill="#F4A261" />
                  <rect x="18" y="4" width="4" height="6" fill="#E9C46A" />
                </svg>
              {/if}
            </div>

            <div class="box-label font-retro">{crop.name}</div>
            <div class="box-sub font-data">{crop.category}</div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Right Column: Authentic Climate Impacts Data Table (Image 2 style) -->
    <div class="reference-table-card">
      <div class="card-outer-frame">
        <!-- Table Header Banner with Flag Symbol -->
        <div class="table-header-banner">
          <div class="flag-icon" aria-hidden="true">
            <svg viewBox="0 0 24 16" width="24" height="16">
              <rect width="24" height="16" fill="#009B3A" />
              <polygon points="12,2 22,8 12,14 2,8" fill="#FEDF00" />
              <circle cx="12" cy="8" r="3.2" fill="#002776" />
            </svg>
          </div>
          <div class="header-text font-pixel">
            POTENTIAL IMPACTS OF CLIMATE CHANGE ON WORLD FOOD SUPPLY, v1 (1995-2100)
          </div>
        </div>

        <!-- Authentic Pixel Table -->
        <div class="table-content-area">
          <table class="vintage-pixel-table font-retro">
            <thead>
              <tr>
                <th>Adaptation Level</th>
                <th>CO2 effects</th>
                <th>wheat</th>
                <th>rice</th>
                <th>coarse grains</th>
                <th>protein feed</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>No Adaption</td>
                <td>No</td>
                <td class="neg">-51%</td>
                <td class="neg">-36%</td>
                <td class="neg">-19%</td>
                <td class="neg">-35%</td>
              </tr>
              <tr>
                <td>No Adaption</td>
                <td>Yes</td>
                <td class="neg">-41%</td>
                <td class="neg">-33%</td>
                <td class="neg">-20%</td>
                <td class="neg">-36%</td>
              </tr>
              <tr>
                <td>Level 1</td>
                <td>No</td>
                <td class="neg">-8%</td>
                <td class="neg">-8%</td>
                <td class="pos">+1%</td>
                <td class="neg">-17%</td>
              </tr>
              <tr>
                <td>Level 1</td>
                <td>Yes</td>
                <td class="neg">-33%</td>
                <td class="neg">-16%</td>
                <td class="neg">-14%</td>
                <td class="pos">+13%</td>
              </tr>
              <tr class="highlight-row">
                <td>Level 2</td>
                <td>Yes</td>
                <td class="neg">-8%</td>
                <td class="neg">-3%</td>
                <td class="neg">-6%</td>
                <td class="pos">+11%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- NASA Sensor Telemetry Context -->
        <div class="nasa-context-strip font-data">
          <strong>NASA Benchmark:</strong> SMAP root-zone moisture &gt; 0.45 enables Level 1 adaptation. When soil organic carbon drops below 0.4%, Level 2 nitrogen-fixing legumes are essential to prevent food supply collapse.
        </div>
      </div>

      <!-- Action Button to proceed once matched -->
      {#if allMatched}
        <button type="button" class="proceed-btn font-pixel" onclick={onComplete}>
          PROCEED TO FARMING SEASON →
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .matching-screen-layout {
    min-height: 85vh;
    background-color: #1A0D08;
    color: #F8EAD6;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-section {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .back-link {
    background-color: #2E1810;
    color: #D4A373;
    border: 2px solid #8A522A;
    padding: 8px 14px;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .back-link:hover {
    background-color: #4A2818;
    color: #FFF;
  }

  .title-stack {
    text-align: center;
    flex-grow: 1;
  }

  .main-title {
    font-size: 1.2rem;
    color: #E29578;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }

  .sub-instruction {
    font-size: 1.15rem;
    color: #CDB4A2;
  }

  .completion-banner {
    background-color: #8B0000;
    color: #FFF;
    border: 3px solid #E63946;
    padding: 12px;
    text-align: center;
    font-size: 0.95rem;
    box-shadow: 0 4px 0 #000;
  }

  .status-alert {
    background-color: #2E1E14;
    color: #FFB703;
    border: 2px solid #8A522A;
    padding: 8px 14px;
    text-align: center;
    font-size: 1.1rem;
  }

  .matching-stage-row {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 28px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .matching-stage-row {
      grid-template-columns: 1fr;
    }
  }

  /* Left Column Grid */
  .matching-grid-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 48px;
    padding: 10px;
  }

  .connecting-lines-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }

  .grid-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .match-box {
    background-color: #24140D;
    border: 2px solid #6E3B1C;
    border-radius: 4px;
    padding: 14px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-align: center;
    transition: transform 0.15s, border-color 0.15s, background-color 0.2s;
  }

  .match-box:hover:not(:disabled) {
    border-color: #FFB703;
    transform: translateY(-2px);
  }

  .match-box.is-selected {
    border-color: #00FF66;
    box-shadow: 0 0 12px rgba(0, 255, 102, 0.4);
    background-color: #2A382A;
  }

  .match-box.is-matched {
    background-color: #38B000 !important;
    border-color: #00FF66 !important;
    color: #FFFFFF !important;
  }

  .match-box.is-matched-crop {
    border-color: #38B000;
    background-color: #1A281A;
  }

  .emblem-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #555;
    background-color: #3A3A3A;
  }

  .emblem-circle.co2_l1 {
    background-color: #555E55;
    border-color: #889988;
  }

  .emblem-circle.co2_l2 {
    background-color: #2A5A2A;
    border-color: #00FF66;
  }

  .emblem-circle.no_co2 {
    background-color: #4A2020;
    border-color: #E63946;
  }

  .emblem-text {
    font-size: 0.52rem;
    color: #FFF;
    text-align: center;
    line-height: 1.1;
  }

  .sub-emblem {
    font-size: 0.45rem;
    color: #FFD700;
  }

  .box-label {
    font-size: 1.05rem;
    color: #F8EAD6;
    margin-top: 4px;
  }

  .box-sub {
    font-size: 0.65rem;
    color: #A88F78;
  }

  .crop-pixel-art {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Right Column Reference Table */
  .reference-table-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card-outer-frame {
    background-color: #E29578;
    border: 4px solid #8A4B2A;
    box-shadow: 0 4px 0 #000;
    padding: 6px;
  }

  .table-header-banner {
    background-color: #8A4B2A;
    color: #F8EAD6;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-text {
    font-size: 0.68rem;
    line-height: 1.3;
    letter-spacing: 0.5px;
  }

  .table-content-area {
    background-color: #FDF0D5;
    overflow-x: auto;
  }

  .vintage-pixel-table {
    width: 100%;
    border-collapse: collapse;
    color: #2B1B12;
    font-size: 1.1rem;
    text-align: center;
  }

  .vintage-pixel-table th {
    background-color: #EAD0B0;
    border: 1px solid #C49E78;
    padding: 6px 4px;
    font-weight: bold;
    font-size: 1rem;
  }

  .vintage-pixel-table td {
    border: 1px solid #D6BBA0;
    padding: 6px 4px;
  }

  .vintage-pixel-table .neg {
    color: #B22222;
    font-weight: bold;
  }

  .vintage-pixel-table .pos {
    color: #2E7D32;
    font-weight: bold;
  }

  .highlight-row {
    background-color: #D6ECD2;
  }

  .nasa-context-strip {
    background-color: #C89F82;
    color: #2B1B12;
    font-size: 0.72rem;
    padding: 8px 10px;
    line-height: 1.4;
    border-top: 2px solid #8A4B2A;
  }

  .proceed-btn {
    background-color: #00FF66;
    color: #000;
    border: 3px solid #000;
    box-shadow: 0 4px 0 #000;
    padding: 12px 18px;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: center;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .proceed-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #000;
    background-color: #33FF88;
  }
</style>