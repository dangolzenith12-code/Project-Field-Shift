<script lang="ts">
  import type { StrategyOption, FarmerPriorities, ClimateModifiers } from '../../types/game';
  import { STRATEGIES } from '../../data/mockData';
  import Slider from '../common/Slider.svelte';
  import RubberStamp from '../common/RubberStamp.svelte';
  import DataChip from '../common/DataChip.svelte';
  import MonteCarloRibbon from './MonteCarloRibbon.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onSelectStrategy?: (strategy: StrategyOption) => void;
    onBack?: () => void;
  }

  let { onSelectStrategy, onBack }: Props = $props();

  // Farmer Priorities Sliders
  let priorities = $state<FarmerPriorities>({
    water: 75,
    income: 50,
    soilHealth: 80,
    labor: 40
  });

  // Climate What-If Modifiers
  let climate = $state<ClimateModifiers>({
    tempOffset: 1.5,
    rainOffset: -10
  });

  // Calculate dynamic ranking score based on priorities and climate stress
  function calculateScore(strat: StrategyOption, p: FarmerPriorities, c: ClimateModifiers): number {
    // Water conservation bonus (strat.metrics.waterStressDelta is negative for reduction)
    const waterScore = (-strat.metrics.waterStressDelta) * (p.water / 100);
    // Income bonus
    const incomeScore = strat.metrics.incomeReturn * (p.income / 100);
    // Soil health bonus
    const soilScore = strat.metrics.soilCarbonDelta * (p.soilHealth / 100);
    // Labor ease (penalize high extra labor if farmer prioritizes lower labor)
    const laborPenalty = (strat.metrics.laborReqDelta) * (p.labor / 100) * 0.4;
    
    // Climate penalty: higher temperature offsets hurt existing high-water crops more
    const climatePenalty = strat.id === 'strategy_existing' ? (c.tempOffset * 10 - c.rainOffset * 0.5) : (c.tempOffset * 2);

    return Math.round(50 + waterScore + incomeScore + soilScore - laborPenalty - climatePenalty);
  }

  // Live evaluated strategies with score
  const scoredStrategies = $derived(
    STRATEGIES.map(s => ({
      ...s,
      currentScore: calculateScore(s, priorities, climate)
    })).sort((a, b) => b.currentScore - a.currentScore)
  );

  const winningId = $derived(scoredStrategies[0]?.id);
</script>

<div class="compare-container">
  <!-- Screen Header -->
  <div class="compare-header">
    <div class="header-left">
      <h2 class="title font-pixel">Four Seasons Strategy Compare</h2>
      <p class="subtitle font-body">
        Three crop rotation paths for Amma's field. Adjust your farm priorities below to re-rank outcomes.
      </p>
    </div>
    <div class="header-right">
      <button type="button" class="return-field-btn font-pixel" onclick={onBack}>
        ← Return to Field
      </button>
    </div>
  </div>

  <BlockPrintBorder height={14} color="#00FF66" />

  <!-- 3 Strategy Cards on the table -->
  <div class="cards-table">
    {#each scoredStrategies as strat, idx (strat.id)}
      {@const isWinner = strat.id === winningId}

      <div class="strategy-column" class:winner-card-wrap={isWinner}>
        <!-- Winning Banner Ribbon -->
        {#if isWinner}
          <div class="winner-ribbon font-pixel" aria-live="polite">
            🏆 TOP RECOMMENDED MATCH ({strat.currentScore} PTS)
          </div>
        {/if}

        <div class="strategy-card" class:winner-card={isWinner}>
          <!-- Card Header -->
          <div class="card-top">
            <span class="rotation-type-tag font-pixel">PATH 0{idx + 1}</span>
            <span class="score-badge font-pixel">Score: {strat.currentScore}</span>
          </div>

          <h3 class="strategy-title font-pixel">{strat.title}</h3>
          <div class="strategy-sub font-body">{strat.subtitle}</div>

          <!-- Crop Sequence Pills -->
          <div class="crop-rotation-flow">
            <div class="flow-label font-pixel">Rotation Cycle:</div>
            <div class="pills-row">
              {#each strat.cropRotation as crop}
                <span class="crop-pill font-body">{crop}</span>
              {/each}
            </div>
          </div>

          <!-- Why Suggested -->
          <div class="explanation-box">
            <p class="why-text font-body">{strat.whySuggested}</p>
          </div>

          <!-- Monte Carlo Range Ribbon -->
          <MonteCarloRibbon 
            p10={strat.monteCarlo.p10} 
            median={strat.monteCarlo.median} 
            p90={strat.monteCarlo.p90} 
          />

          <!-- Key NASA Satellite Evidence Chips -->
          <div class="evidence-section">
            <div class="section-label font-pixel">🛰️ NASA SATELLITE EVIDENCE:</div>
            <div class="chips-list">
              {#each strat.nasaEvidenceChips as chip}
                <DataChip note={chip} />
              {/each}
            </div>
          </div>

          <!-- Benefits & Risks -->
          <div class="bullet-grid">
            <div class="benefit-box">
              <span class="box-heading font-pixel">✓ Key Strengths</span>
              <ul>
                {#each strat.benefits as ben}
                  <li class="font-body">{ben}</li>
                {/each}
              </ul>
            </div>

            <div class="risk-box">
              <span class="box-heading font-pixel">⚠️ Vulnerabilities & Gaps</span>
              <ul>
                {#each strat.risks as risk}
                  <li class="font-body">{risk}</li>
                {/each}
                {#each strat.dataGaps as gap}
                  <li class="font-body data-gap">Data Gap: {gap}</li>
                {/each}
              </ul>
            </div>
          </div>

          <!-- Rubber Stamp if Expert Advice needed -->
          {#if strat.needsLocalExpert}
            <div class="stamp-container">
              <RubberStamp text="ASK A LOCAL EXPERT" subtext="Supports, doesn't replace farmers" angle={-5} />
            </div>
          {/if}

          <!-- Action Button -->
          <div class="card-footer-action">
            <button 
              type="button"
              class="adopt-btn font-pixel"
              class:winner-btn={isWinner}
              onclick={() => onSelectStrategy?.(strat)}
            >
              {isWinner ? '🌟 ADOPT RECOMMENDED PLAN →' : 'ADOPT THIS PLAN →'}
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <BlockPrintBorder height={14} color="#00FF66" />

  <!-- Control Panel: Farmer Priorities & Climate Sliders -->
  <div class="control-panel-card">
    <div class="panel-header">
      <h3 class="panel-title font-pixel">🎛️ LIVE SENSITIVITY CONTROL PANEL</h3>
      <p class="panel-desc font-body">
        Drag sliders to see how NASA climate projections and your family's personal priorities re-weight the recommendations.
      </p>
    </div>

    <div class="sliders-grid">
      <!-- Farmer Priorities Column -->
      <div class="slider-group">
        <h4 class="group-title font-pixel">Farmer Priorities (Live Re-Weighting)</h4>
        <Slider 
          label="Water Conservation Weight" 
          icon="💧" 
          bind:value={priorities.water} 
          min={0} 
          max={100} 
          unit="%" 
        />
        <Slider 
          label="Immediate Income Weight" 
          icon="🪙" 
          bind:value={priorities.income} 
          min={0} 
          max={100} 
          unit="%" 
        />
        <Slider 
          label="Long-Term Soil Health" 
          icon="🌱" 
          bind:value={priorities.soilHealth} 
          min={0} 
          max={100} 
          unit="%" 
        />
        <Slider 
          label="Labor Availability Weight" 
          icon="🧤" 
          bind:value={priorities.labor} 
          min={0} 
          max={100} 
          unit="%" 
        />
      </div>

      <!-- Climate Stress Modifiers Column -->
      <div class="slider-group">
        <h4 class="group-title font-pixel">NASA Climate Scenario Stress-Test</h4>
        <Slider 
          label="Global Temperature Shift" 
          icon="🌡️" 
          bind:value={climate.tempOffset} 
          min={0} 
          max={3} 
          step={0.1}
          unit="°C" 
          formatValue={(v) => `+${v.toFixed(1)}°C`}
        />
        <Slider 
          label="Monsoon Rainfall Anomaly" 
          icon="🌧️" 
          bind:value={climate.rainOffset} 
          min={-20} 
          max={20} 
          step={1}
          unit="%" 
          formatValue={(v) => `${v > 0 ? '+' : ''}${v}%`}
        />

        <div class="panel-info-box font-data">
          <span class="info-icon">ℹ️</span>
          <span>
            NASA POWER & MERRA-2 models indicate that exceeding +1.5°C doubles heat-stress during summer pod fill. Notice how traditional rotations drop in score under high heat!
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .compare-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 16px;
    max-width: 1280px;
    margin: 0 auto;
    color: #F8F9FA;
  }

  .compare-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .title {
    font-size: 1.55rem;
    color: #FFD166;
    text-shadow: 0 0 12px rgba(255, 209, 102, 0.4);
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: 14px;
    color: #A0C8AA;
    max-width: 650px;
    line-height: 1.5;
  }

  .return-field-btn {
    background: #0E1F14;
    border: 2px solid #00FF66;
    color: #00FF66;
    font-size: 11px;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.25);
    transition: all 0.15s ease;
  }

  .return-field-btn:hover {
    background: #00FF66;
    color: #000000;
    transform: translateY(-2px);
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.5);
  }

  /* 3 Cards Table */
  .cards-table {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
    align-items: stretch;
    margin: 8px 0;
  }

  .strategy-column {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .winner-ribbon {
    background-color: #00FF66;
    color: #051A0C;
    font-size: 11px;
    font-weight: bold;
    border: 2px solid #000000;
    border-radius: 4px;
    padding: 8px 14px;
    text-align: center;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.5);
    margin-bottom: -10px;
    z-index: 5;
    animation: ribbonSlide 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes ribbonSlide {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .strategy-card {
    background: linear-gradient(180deg, #0E1D13 0%, #07100B 100%);
    border: 2px solid #285434;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    color: #FFFFFF;
    transition: all 0.2s ease;
  }

  .strategy-card.winner-card {
    border: 3px solid #00FF66;
    box-shadow: 0 0 24px rgba(0, 255, 102, 0.35), 0 8px 32px rgba(0, 0, 0, 0.85);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rotation-type-tag {
    font-size: 10px;
    color: #A0E8B0;
    background-color: #142E1C;
    border: 1.5px solid #3FA34D;
    border-radius: 4px;
    padding: 3px 8px;
  }

  .score-badge {
    font-size: 11px;
    font-weight: bold;
    color: #000000;
    background-color: #FFB703;
    border-radius: 4px;
    padding: 3px 10px;
    box-shadow: 0 0 8px rgba(255, 183, 3, 0.4);
  }

  .strategy-title {
    font-size: 14px;
    color: #FFFFFF;
    line-height: 1.4;
    margin-top: 2px;
  }

  .strategy-sub {
    font-size: 13px;
    color: #84CCA0;
    line-height: 1.4;
  }

  .crop-rotation-flow {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .flow-label {
    font-size: 10px;
    color: #FFD166;
  }

  .pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .crop-pill {
    font-size: 12px;
    font-weight: 600;
    color: #FFFFFF;
    background-color: #173321;
    border: 1.5px solid #00FF66;
    border-radius: 12px;
    padding: 3px 10px;
  }

  .explanation-box {
    background-color: #15261A;
    border: 1px solid #285434;
    border-left: 4px solid #FFB703;
    padding: 10px 12px;
    border-radius: 4px;
  }

  .why-text {
    font-size: 13px;
    line-height: 1.5;
    color: #FFE699;
    margin: 0;
  }

  .evidence-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-label {
    font-size: 10px;
    color: #00E5FF;
  }

  .chips-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .bullet-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .benefit-box {
    background-color: #0B1C12;
    border: 1.5px solid #00FF66;
    border-radius: 6px;
    padding: 10px 12px;
  }

  .benefit-box .box-heading {
    display: block;
    font-size: 10px;
    color: #00FF66;
    margin-bottom: 6px;
  }

  .benefit-box ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .benefit-box li {
    font-size: 13px;
    color: #FFFFFF;
    line-height: 1.4;
  }

  .benefit-box li::before {
    content: "✓ ";
    color: #00FF66;
    font-weight: bold;
  }

  .risk-box {
    background-color: #200E0E;
    border: 1.5px solid #E63946;
    border-radius: 6px;
    padding: 10px 12px;
  }

  .risk-box .box-heading {
    display: block;
    font-size: 10px;
    color: #FF6B6B;
    margin-bottom: 6px;
  }

  .risk-box ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .risk-box li {
    font-size: 13px;
    color: #FEE2E2;
    line-height: 1.4;
  }

  .risk-box li::before {
    content: "⚠️ ";
    color: #FF6B6B;
  }

  .data-gap {
    font-style: italic;
    color: #FFD166 !important;
  }

  .stamp-container {
    display: flex;
    justify-content: center;
    padding: 6px 0;
  }

  .card-footer-action {
    display: flex;
    margin-top: auto;
    padding-top: 8px;
  }

  .adopt-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 11px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    border: 2px solid #52B788;
    background: #14281B;
    color: #A0E8B0;
  }

  .adopt-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .adopt-btn.winner-btn {
    background: #00FF66;
    color: #000000;
    font-weight: bold;
    border-color: #00FF66;
    box-shadow: 0 0 16px rgba(0, 255, 102, 0.4);
  }

  .adopt-btn.winner-btn:hover {
    background: #25FF7B;
    box-shadow: 0 0 24px rgba(0, 255, 102, 0.7);
  }

  /* Control Panel */
  .control-panel-card {
    background: #0D1C12;
    border: 2px solid #00FF66;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 255, 102, 0.2);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panel-header {
    margin-bottom: 4px;
  }

  .panel-title {
    font-size: 14px;
    color: #FFD166;
    margin-bottom: 4px;
  }

  .panel-desc {
    font-size: 13px;
    color: #A0C8AA;
    line-height: 1.5;
  }

  .sliders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 28px;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .group-title {
    font-size: 11px;
    color: #FFFFFF;
    border-bottom: 2px solid #285434;
    padding-bottom: 6px;
  }

  .panel-info-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background-color: #0A1C2A;
    border: 1.5px solid #00E5FF;
    border-radius: 6px;
    padding: 12px;
    font-size: 12px;
    line-height: 1.45;
    color: #BAE6FD;
  }

  .info-icon {
    font-size: 18px;
  }
</style>
