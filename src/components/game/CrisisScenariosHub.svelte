<script lang="ts">
  import { sfx } from '../../utils/sound';

  interface Props {
    onSelectScenario: (scenarioId: string) => void;
    onBack: () => void;
  }

  let { onSelectScenario, onBack }: Props = $props();

  interface ScenarioItem {
    id: string;
    title: string;
    nasaSensor: string;
    description: string;
  }

  const scenarios: ScenarioItem[] = [
    {
      id: 'heat',
      title: 'Heat',
      nasaSensor: 'NASA MERRA-2',
      description: 'Summer heatwaves exceed +1.6°C, wilting crops during critical flowering and grain-fill.'
    },
    {
      id: 'flood',
      title: 'Flood',
      nasaSensor: 'NASA POWER',
      description: 'Sudden cloudburst rainfall washes away unprotected topsoil and suffocates young root zones.'
    },
    {
      id: 'drought',
      title: 'Drought',
      nasaSensor: 'NASA SMAP L4',
      description: 'Root-zone moisture drops below 0.22 GWETROOT, causing irreversible cereal crop failure.'
    },
    {
      id: 'salinity',
      title: 'Salinized Soil',
      nasaSensor: 'NASA GRACE',
      description: 'Groundwater dropping −3.2 cm/year forces deep tubewells to pump saline, alkaline brackish water.'
    },
    {
      id: 'rotation',
      title: 'Crops Management',
      nasaSensor: '3-Strategy Adaptation',
      description: 'Diverse crop rotations and agroforestry hold moisture, restore carbon, and withstand extremes.'
    }
  ];

  let selectedScenario = $state<ScenarioItem>(scenarios[4]); // Defaults to Crops Management
  let guideStep = $state(0);

  const guideLines = [
    "Crop failure can happen due to various environmental stresses.",
    "Select any crisis above to analyze its NASA satellite observations.",
    "Together, we can adopt a resilient strategy to protect Amma's field."
  ];

  function handleCardClick(sc: ScenarioItem) {
    sfx.playSelect();
    selectedScenario = sc;
  }

  function handleNextGuide() {
    sfx.playSelect();
    if (guideStep < guideLines.length - 1) {
      guideStep++;
    } else {
      onSelectScenario(selectedScenario.id);
    }
  }
</script>

<div class="crisis-hub-screen">
  <!-- Top Neon Green Arcade Banner (Image 1 style) -->
  <div class="top-arcade-banner">
    <div class="corn-glyphs font-pixel">|||</div>
    <div class="banner-title-group">
      <h1 class="banner-title font-pixel">CRISIS SCENARIOS</h1>
      <span class="banner-sub font-retro">A Sensing Adventure</span>
    </div>
    <div class="corn-glyphs font-pixel">|||</div>
  </div>

  <!-- Top Left Back Button -->
  <div class="top-nav-bar">
    <button type="button" class="retro-back-btn font-pixel" onclick={onBack}>
      - BACK
    </button>
  </div>

  <!-- 5 Scenario Cards Grid (Image 1 style: 3 on top, 2 on bottom) -->
  <div class="scenarios-matrix-display">
    <!-- Row 1: Heat, Flood, Drought -->
    <div class="matrix-row top-row">
      <!-- 1. Heat -->
      <button 
        type="button" 
        class="scenario-box {selectedScenario.id === 'heat' ? 'active-card' : ''}"
        onclick={() => handleCardClick(scenarios[0])}
      >
        <div class="pixel-art-canvas">
          <!-- Pixel Sunset Art -->
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
            <!-- Sky Gradient in pixel steps -->
            <rect x="0" y="0" width="100" height="20" fill="#2E1822" />
            <rect x="0" y="20" width="100" height="20" fill="#8A2828" />
            <rect x="0" y="40" width="100" height="20" fill="#D85A20" />
            <rect x="0" y="60" width="100" height="20" fill="#FFA500" />
            <rect x="0" y="80" width="100" height="20" fill="#FFD700" />
            <!-- Glowing Sun -->
            <rect x="36" y="24" width="28" height="28" fill="#FFFBE6" />
            <!-- Horizon Water / Land -->
            <rect x="0" y="68" width="100" height="32" fill="#521212" />
            <!-- Water reflection stripes -->
            <rect x="30" y="72" width="40" height="4" fill="#FFA500" />
            <rect x="24" y="80" width="52" height="4" fill="#FF8C00" />
            <rect x="34" y="88" width="32" height="4" fill="#E65100" />
          </svg>
        </div>
        <span class="card-caption font-retro">Heat</span>
      </button>

      <!-- 2. Flood -->
      <button 
        type="button" 
        class="scenario-box {selectedScenario.id === 'flood' ? 'active-card' : ''}"
        onclick={() => handleCardClick(scenarios[1])}
      >
        <div class="pixel-art-canvas">
          <!-- Pixel Roaring Tidal Wave Art -->
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
            <rect width="100" height="100" fill="#0C1B2A" />
            <!-- Cresting Wave -->
            <rect x="30" y="20" width="50" height="20" fill="#FFFFFF" />
            <rect x="20" y="30" width="70" height="25" fill="#E0F2FE" />
            <rect x="15" y="45" width="80" height="25" fill="#38BDF8" />
            <rect x="0" y="65" width="100" height="35" fill="#0284C7" />
            <!-- Dark ocean base -->
            <rect x="0" y="82" width="100" height="18" fill="#0369A1" />
            <!-- Foam spray dots -->
            <rect x="12" y="24" width="6" height="6" fill="#FFFFFF" />
            <rect x="22" y="16" width="6" height="6" fill="#FFFFFF" />
            <rect x="82" y="38" width="6" height="6" fill="#BAE6FD" />
          </svg>
        </div>
        <span class="card-caption font-retro">Flood</span>
      </button>

      <!-- 3. Drought -->
      <button 
        type="button" 
        class="scenario-box {selectedScenario.id === 'drought' ? 'active-card' : ''}"
        onclick={() => handleCardClick(scenarios[2])}
      >
        <div class="pixel-art-canvas">
          <!-- Pixel Parched Golden Wheat & Dry Earth -->
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
            <!-- Sky -->
            <rect x="0" y="0" width="100" height="40" fill="#E8D5B5" />
            <!-- Sun-scorched wheat field -->
            <rect x="0" y="30" width="100" height="45" fill="#D4A373" />
            <!-- Dense wheat stalks -->
            {#each [5, 15, 25, 35, 45, 55, 65, 75, 85, 95] as x}
              <rect x={x} y="22" width="3" height="35" fill="#B07D46" />
              <rect x={x-2} y="18" width="7" height="10" fill="#E9C46A" />
            {/each}
            <!-- Parched dry dirt foreground -->
            <rect x="0" y="70" width="100" height="30" fill="#8C5832" />
            <rect x="20" y="78" width="16" height="3" fill="#5A3418" />
            <rect x="56" y="84" width="24" height="3" fill="#5A3418" />
          </svg>
        </div>
        <span class="card-caption font-retro">Drought</span>
      </button>
    </div>

    <!-- Row 2: Salinized Soil, Crops Management -->
    <div class="matrix-row bottom-row">
      <!-- 4. Salinized Soil -->
      <button 
        type="button" 
        class="scenario-box {selectedScenario.id === 'salinity' ? 'active-card' : ''}"
        onclick={() => handleCardClick(scenarios[3])}
      >
        <div class="pixel-art-canvas" style="background-color: #A3C9A8;">
          <!-- Watering can over green sprout on saline soil -->
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
            <!-- Pale alkaline soil platform -->
            <rect x="25" y="72" width="50" height="10" fill="#EAE2B7" />
            <rect x="22" y="76" width="56" height="8" fill="#846E56" />
            <!-- Little green seedling -->
            <rect x="48" y="58" width="4" height="16" fill="#3FA34D" />
            <rect x="42" y="56" width="6" height="6" fill="#64B860" />
            <rect x="52" y="54" width="6" height="6" fill="#64B860" />
            <!-- Watering Can -->
            <rect x="36" y="24" width="16" height="14" fill="#8E9AAF" />
            <rect x="52" y="28" width="14" height="4" fill="#8E9AAF" />
            <rect x="66" y="32" width="4" height="8" fill="#6C757D" />
            <!-- Water Drops -->
            <rect x="62" y="44" width="2" height="4" fill="#64B5F6" />
            <rect x="56" y="48" width="2" height="4" fill="#64B5F6" />
          </svg>
        </div>
        <span class="card-caption font-retro">Salinized Soil</span>
      </button>

      <!-- 5. Crops Management -->
      <button 
        type="button" 
        class="scenario-box {selectedScenario.id === 'rotation' ? 'active-card' : ''}"
        onclick={() => handleCardClick(scenarios[4])}
      >
        <div class="pixel-art-canvas">
          <!-- Pixel Farm Overview Map -->
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
            <rect width="100" height="100" fill="#52B788" />
            <!-- Blue river pond -->
            <rect x="20" y="25" width="45" height="35" fill="#38BDF8" />
            <rect x="25" y="30" width="35" height="25" fill="#0284C7" />
            <!-- Cultivated crop beds -->
            <rect x="70" y="15" width="20" height="30" fill="#74C69D" />
            <rect x="70" y="55" width="22" height="35" fill="#95D5B2" />
            <!-- Sandy Farm Path -->
            <rect x="0" y="65" width="70" height="15" fill="#D4A373" />
            <!-- Amma's house roof -->
            <rect x="8" y="10" width="22" height="18" fill="#E76F51" />
          </svg>
        </div>
        <span class="card-caption font-retro">Crops Management</span>
      </button>
    </div>
  </div>

  <!-- Bottom Guide Section (Image 1 style: Sprite on left, Guide Dialog on right) -->
  <div class="bottom-guide-section">
    <!-- Pixel Farmer Sprite -->
    <div class="farmer-sprite-wrapper">
      <svg viewBox="0 0 64 64" width="80" height="80" shape-rendering="crispEdges">
        <!-- Straw Hat -->
        <rect x="18" y="14" width="28" height="6" fill="#FBBF24" />
        <rect x="22" y="8" width="20" height="8" fill="#F59E0B" />
        <rect x="22" y="12" width="20" height="3" fill="#92400E" />
        <!-- Face & Hair -->
        <rect x="24" y="16" width="16" height="12" fill="#D29A72" />
        <rect x="26" y="20" width="3" height="3" fill="#1C1917" />
        <rect x="35" y="20" width="3" height="3" fill="#1C1917" />
        <rect x="28" y="24" width="8" height="2" fill="#78350F" />
        <!-- Overalls & Tunic -->
        <rect x="20" y="28" width="24" height="18" fill="#22C55E" />
        <rect x="24" y="30" width="16" height="16" fill="#2563EB" />
        <rect x="25" y="32" width="2" height="2" fill="#FDE047" />
        <rect x="37" y="32" width="2" height="2" fill="#FDE047" />
        <!-- Vegetable in Hand -->
        <rect x="14" y="36" width="6" height="6" fill="#4ADE80" />
        <rect x="16" y="42" width="4" height="4" fill="#F97316" />
        <!-- Boots -->
        <rect x="24" y="46" width="6" height="8" fill="#78350F" />
        <rect x="34" y="46" width="6" height="8" fill="#78350F" />
      </svg>
    </div>

    <!-- Green CRT Dialogue Box -->
    <div class="guide-dialogue-box">
      <div class="guide-title-tag font-pixel">GUIDE</div>
      <p class="guide-text font-retro">
        {selectedScenario.description}
      </p>

      <div class="dialogue-actions">
        <button type="button" class="click-continue-btn font-pixel" onclick={handleNextGuide}>
          ▼ CLICK TO CONTINUE ▼
        </button>
        <button type="button" class="action-matrix-btn font-pixel" onclick={() => onSelectScenario(selectedScenario.id)}>
          EXPLORE 3-STRATEGY ADAPTATION MATRIX →
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .crisis-hub-screen {
    min-height: 90vh;
    background-color: #160C08;
    color: #F8EAD6;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* Top Arcade Banner */
  .top-arcade-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #0A140A;
    border: 3px solid #00FF66;
    border-radius: 4px;
    padding: 10px 18px;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.3), 0 4px 0 #000;
  }

  .banner-title-group {
    text-align: center;
  }

  .banner-title {
    color: #00FF66;
    font-size: 1.25rem;
    letter-spacing: 1.5px;
    margin-bottom: 2px;
  }

  .banner-sub {
    font-size: 0.95rem;
    color: #52B788;
  }

  .corn-glyphs {
    color: #FFB703;
    font-size: 1rem;
    letter-spacing: 4px;
  }

  .top-nav-bar {
    display: flex;
  }

  .retro-back-btn {
    background-color: #2E1810;
    color: #D4A373;
    border: 2px solid #8A4B2A;
    padding: 8px 16px;
    font-size: 0.72rem;
    cursor: pointer;
  }

  .retro-back-btn:hover {
    background-color: #4A2818;
    color: #FFF;
  }

  /* Matrix Layout (Image 1 style) */
  .scenarios-matrix-display {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 10px 0;
  }

  .matrix-row {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .scenario-box {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 0;
    transition: transform 0.15s;
  }

  .scenario-box:hover {
    transform: translateY(-4px);
  }

  .pixel-art-canvas {
    width: 140px;
    height: 120px;
    border: 3px solid #8A4B2A;
    border-radius: 2px;
    overflow: hidden;
    background-color: #000;
    box-shadow: 0 4px 0 #000;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .scenario-box:hover .pixel-art-canvas,
  .scenario-box.active-card .pixel-art-canvas {
    border-color: #00FF66;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.6), 0 4px 0 #000;
  }

  .card-caption {
    font-size: 1.15rem;
    color: #D4A373;
    letter-spacing: 0.5px;
  }

  .scenario-box.active-card .card-caption {
    color: #00FF66;
    font-weight: bold;
  }

  /* Bottom Guide Section */
  .bottom-guide-section {
    display: flex;
    align-items: flex-end;
    gap: 20px;
    margin-top: auto;
  }

  .farmer-sprite-wrapper {
    flex-shrink: 0;
    animation: bobbing 2s infinite ease-in-out;
  }

  @keyframes bobbing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  .guide-dialogue-box {
    flex-grow: 1;
    background-color: #0C160C;
    border: 3px solid #00FF66;
    box-shadow: 0 0 14px rgba(0, 255, 102, 0.25), 0 4px 0 #000;
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .guide-title-tag {
    color: #00FF66;
    font-size: 0.72rem;
    letter-spacing: 1px;
  }

  .guide-text {
    font-size: 1.25rem;
    color: #E0EAE0;
    line-height: 1.35;
  }

  .dialogue-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  .click-continue-btn {
    background: none;
    border: none;
    color: #FFB703;
    font-size: 0.68rem;
    cursor: pointer;
    animation: blinkText 1.5s infinite;
  }

  @keyframes blinkText {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .action-matrix-btn {
    background-color: #00FF66;
    color: #000;
    border: 2px solid #000;
    padding: 8px 14px;
    font-size: 0.7rem;
    cursor: pointer;
    box-shadow: 0 3px 0 #000;
  }

  .action-matrix-btn:hover {
    background-color: #33FF88;
  }
</style>