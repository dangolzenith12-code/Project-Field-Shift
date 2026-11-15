<script lang="ts">
  interface Props {
    onSelectScenario: (scenarioId: string) => void;
    onBack: () => void;
  }

  let { onSelectScenario, onBack }: Props = $props();

  const scenarios = [
    {
      id: 'heat',
      title: 'Heat Anomaly',
      satelliteTag: 'NASA MERRA-2',
      desc: 'Summer heatwaves exceed +1.6°C, wilting crops during pod-fill.',
      color: '#D9534F'
    },
    {
      id: 'flood',
      title: 'Monsoon Cloudburst',
      satelliteTag: 'NASA POWER',
      desc: 'Intense short-duration rainfall washing away unprotected topsoil.',
      color: '#0275D8'
    },
    {
      id: 'drought',
      title: 'Root-Zone Drought',
      satelliteTag: 'NASA SMAP L4',
      desc: 'Topsoil moisture drops below 0.22, stressing shallow cereal roots.',
      color: '#F0AD4E'
    },
    {
      id: 'salinity',
      title: 'Groundwater Drop',
      satelliteTag: 'NASA GRACE',
      desc: 'Aquifers sinking −3.2 cm/yr; tubewells cough sand under stress.',
      color: '#5CB85C'
    },
    {
      id: 'rotation',
      title: 'Crop Rotation Matrix',
      satelliteTag: '3-Strategy Decision',
      desc: 'Compare Traditional vs Resilience vs Commercial 5-year plans!',
      color: '#00FF66',
      isHero: true
    }
  ];

  let selectedScenario = $state(scenarios[4]); // Defaults to Crop Rotation
</script>

<div class="scenarios-hub-container">
  <!-- Top Green Banner -->
  <div class="top-arcade-banner">
    <button type="button" class="back-pill font-data" onclick={onBack}>
      ← BACK
    </button>
    <div class="banner-title font-display">CRISIS SCENARIOS</div>
    <div class="banner-corn font-data">◆ ◆ ◆</div>
  </div>

  <!-- 5 Scenario Cards Grid (Image 1 style) -->
  <div class="scenarios-grid">
    {#each scenarios as sc}
      {@const isSelected = selectedScenario.id === sc.id}
      <button 
        type="button" 
        class="scenario-card {isSelected ? 'selected' : ''} {sc.isHero ? 'hero-card' : ''}"
        onclick={() => { selectedScenario = sc; }}
      >
        <div class="scenario-thumbnail" style:border-color={sc.color}>
          {#if sc.id === 'heat'}
            <!-- Pixel Heat Sunburst -->
            <svg viewBox="0 0 48 48" width="40" height="40">
              <circle cx="24" cy="24" r="14" fill="#FFB703" stroke="#2B1B12" stroke-width="2" />
              <line x1="24" y1="4" x2="24" y2="8" stroke="#E63946" stroke-width="3" />
              <line x1="24" y1="40" x2="24" y2="44" stroke="#E63946" stroke-width="3" />
              <line x1="4" y1="24" x2="8" y2="24" stroke="#E63946" stroke-width="3" />
              <line x1="40" y1="24" x2="44" y2="24" stroke="#E63946" stroke-width="3" />
            </svg>
          {:else if sc.id === 'flood'}
            <!-- Pixel Wave / Cloud -->
            <svg viewBox="0 0 48 48" width="40" height="40">
              <path d="M 8 36 Q 24 16 40 36 Z" fill="#2F6FED" stroke="#2B1B12" stroke-width="2" />
              <line x1="14" y1="20" x2="10" y2="28" stroke="#BDE8F5" stroke-width="2" />
              <line x1="28" y1="18" x2="24" y2="26" stroke="#BDE8F5" stroke-width="2" />
            </svg>
          {:else if sc.id === 'drought'}
            <!-- Pixel Dry Soil & Withered Plant -->
            <svg viewBox="0 0 48 48" width="40" height="40">
              <line x1="24" y1="38" x2="24" y2="18" stroke="#8A4B2A" stroke-width="3" />
              <path d="M 24 18 C 18 12 12 18 20 22" stroke="#FFB703" stroke-width="2" fill="none" />
              <line x1="10" y1="38" x2="38" y2="38" stroke="#8A4B2A" stroke-width="2" />
            </svg>
          {:else if sc.id === 'salinity'}
            <!-- Tubewell Pump Icon -->
            <svg viewBox="0 0 48 48" width="40" height="40">
              <rect x="16" y="20" width="16" height="18" fill="#70889B" stroke="#2B1B12" stroke-width="2" />
              <circle cx="24" cy="28" r="5" fill="#FFB703" stroke="#2B1B12" stroke-width="1.5" />
            </svg>
          {:else}
            <!-- 3-Strategy Matrix Icon -->
            <svg viewBox="0 0 48 48" width="40" height="40">
              <rect x="8" y="10" width="10" height="28" fill="#3FA34D" stroke="#2B1B12" stroke-width="2" />
              <rect x="20" y="10" width="10" height="28" fill="#FFB703" stroke="#2B1B12" stroke-width="2" />
              <rect x="32" y="10" width="10" height="28" fill="#2F6FED" stroke="#2B1B12" stroke-width="2" />
            </svg>
          {/if}
        </div>
        <div class="card-title font-display">{sc.title}</div>
        <div class="satellite-badge font-data">[{sc.satelliteTag}]</div>
      </button>
    {/each}
  </div>

  <!-- Bottom Stage: Hari Guide & Dialogue Box (Image 1 style) -->
  <div class="guide-dialogue-row">
    <!-- Young Hari Sprite -->
    <div class="hari-sprite-box">
      <svg viewBox="0 0 64 64" width="68" height="68">
        <circle cx="32" cy="30" r="14" fill="#D29A72" stroke="#2B1B12" stroke-width="2" />
        <!-- Straw hat / young hair -->
        <rect x="18" y="14" width="28" height="8" fill="#2B1B12" />
        <circle cx="27" cy="28" r="2" fill="#2B1B12" />
        <circle cx="37" cy="28" r="2" fill="#2B1B12" />
        <path d="M 28 35 Q 32 38 36 35" stroke="#2B1B12" stroke-width="2" fill="none" />
        <!-- Green tunic -->
        <path d="M 18 44 C 22 38 42 38 46 44 L 46 60 L 18 60 Z" fill="#3FA34D" stroke="#2B1B12" stroke-width="2" />
      </svg>
    </div>

    <!-- Green Guide Box -->
    <div class="guide-content-box">
      <div class="guide-tag font-data">
        <span>[GUIDE]</span>
        <span class="active-sc-title">{selectedScenario.title}</span>
      </div>
      <p class="guide-text font-body">{selectedScenario.desc}</p>
      
      <div class="guide-action-strip">
        <button 
          type="button" 
          class="launch-strategy-btn font-display" 
          onclick={() => onSelectScenario(selectedScenario.id)}
        >
          {selectedScenario.id === 'rotation' ? 'OPEN 3-STRATEGY COMPARE MATRIX →' : 'INVESTIGATE & ADAPT PLAN →'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .scenarios-hub-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 920px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-2);
  }

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

  .back-pill {
    background-color: #1A3820;
    color: #FFB703;
    border: 1.5px solid #3FA34D;
    border-radius: var(--radius-pill);
    padding: 3px 12px;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .banner-title {
    color: #00FF66;
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    letter-spacing: 1px;
    margin: 0;
  }

  .banner-corn {
    color: #FFB703;
    font-size: 0.85rem;
  }

  /* Grid of Scenarios */
  .scenarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-3);
  }

  .scenario-card {
    background-color: #141414;
    border: 2.5px solid #2B1B12;
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--ink);
    transition: transform var(--fast) var(--spring), border-color var(--fast) ease;
  }

  .scenario-card:hover {
    transform: translateY(-2px);
    border-color: #FFB703;
  }

  .scenario-card.selected {
    border-color: #00FF66;
    background-color: #1A281E;
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.35);
  }

  .scenario-card.hero-card {
    border-color: #00FF66;
  }

  .scenario-thumbnail {
    width: 60px;
    height: 60px;
    border: 2px solid;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #0A0A0A;
  }

  .card-title {
    font-size: 0.95rem;
    color: #FFFFFF;
    text-align: center;
  }

  .satellite-badge {
    font-size: 0.65rem;
    color: #A0C8AA;
  }

  /* Bottom Guide Box */
  .guide-dialogue-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background-color: #0E1A12;
    border: 3px solid #3FA34D;
    border-radius: var(--radius);
    padding: var(--space-3) var(--space-4);
    box-shadow: 0 4px 0 var(--ink);
  }

  .hari-sprite-box {
    flex-shrink: 0;
    border: 2px solid #3FA34D;
    border-radius: 50%;
    background-color: #1A3820;
    padding: 2px;
  }

  .guide-content-box {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .guide-tag {
    display: flex;
    gap: 8px;
    font-size: 0.72rem;
    color: #00FF66;
    font-weight: bold;
  }

  .active-sc-title {
    color: #FFB703;
  }

  .guide-text {
    font-size: 0.95rem;
    line-height: 1.4;
    color: #FFFFFF;
  }

  .guide-action-strip {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
  }

  .launch-strategy-btn {
    background-color: #00FF66;
    color: #0A1C0A;
    border: 2px solid var(--ink);
    border-radius: var(--radius-pill);
    padding: 6px 20px;
    font-size: 0.92rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--ink);
  }

  .launch-strategy-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--ink);
  }
</style>
