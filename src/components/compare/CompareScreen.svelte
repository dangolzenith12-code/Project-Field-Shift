<script lang="ts">
  import type { StrategyOption, FarmerPriorities, ClimateModifiers } from '../../types/game';
  import { STRATEGIES } from '../../data/mockData';
  import StickerCard from '../common/StickerCard.svelte';
  import Button from '../common/Button.svelte';
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
      <h2 class="title font-display">Four Seasons Strategy Compare</h2>
      <p class="subtitle font-body">
        Three crop rotation paths for Amma's field. Adjust your farm priorities below to re-rank outcomes.
      </p>
    </div>
    <div class="header-right">
      <Button variant="secondary" size="sm" onclick={onBack}>← Return to Field</Button>
    </div>
  </div>

  <BlockPrintBorder height={14} />

  <!-- 3 Strategy Cards "Dealt" on the table -->
  <div class="cards-table">
    {#each scoredStrategies as strat, idx (strat.id)}
      {@const isWinner = strat.id === winningId}
      {@const tilt = idx === 0 ? -1 : idx === 1 ? 0.8 : -0.5}

      <div class="strategy-column {isWinner ? 'winner-card-wrap' : ''}">
        <!-- Winning Banner Ribbon -->
        {#if isWinner}
          <div class="winner-ribbon font-display" aria-live="polite">
            🏆 TOP RECOMMENDED MATCH ({strat.currentScore} PTS)
          </div>
        {/if}

        <StickerCard tilt={tilt} class="strategy-card">
          <!-- Card Header -->
          <div class="card-top">
            <span class="rotation-type-tag font-data">PATH 0{idx + 1}</span>
            <span class="score-badge font-data">Score: {strat.currentScore}</span>
          </div>

          <h3 class="strategy-title font-display">{strat.title}</h3>
          <div class="strategy-sub font-body">{strat.subtitle}</div>

          <!-- Crop Sequence Pills -->
          <div class="crop-rotation-flow">
            <div class="flow-label font-data">Rotation Cycle:</div>
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
            <div class="section-label font-data">NASA Satellite Evidence:</div>
            <div class="chips-list">
              {#each strat.nasaEvidenceChips as chip}
                <DataChip note={chip} />
              {/each}
            </div>
          </div>

          <!-- Benefits & Risks -->
          <div class="bullet-grid">
            <div class="benefit-box">
              <span class="box-heading font-data">✓ Key Strengths</span>
              <ul>
                {#each strat.benefits as ben}
                  <li class="font-body">{ben}</li>
                {/each}
              </ul>
            </div>

            <div class="risk-box">
              <span class="box-heading font-data">⚠️ Vulnerabilities & Gaps</span>
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
            <Button 
              variant={isWinner ? 'paddy' : 'primary'} 
              size="md" 
              onclick={() => onSelectStrategy?.(strat)}
            >
              Adopt This Plan →
            </Button>
          </div>
        </StickerCard>
      </div>
    {/each}
  </div>

  <BlockPrintBorder height={14} />

  <!-- Control Panel: Farmer Priorities & Climate Sliders -->
  <div class="control-panel-card sticker-card no-tape">
    <div class="panel-header">
      <h3 class="panel-title font-display">🎛️ Live Sensitivity Control Panel</h3>
      <p class="panel-desc font-body">
        Drag sliders to see how NASA climate projections and your family's personal priorities re-weight the recommendations.
      </p>
    </div>

    <div class="sliders-grid">
      <!-- Farmer Priorities Column -->
      <div class="slider-group">
        <h4 class="group-title font-display">Farmer Priorities (Live Re-Weighting)</h4>
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
        <h4 class="group-title font-display">NASA Climate Scenario Stress-Test</h4>
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

        <div class="panel-info-box">
          <span class="info-icon">ℹ️</span>
          <span class="font-body">
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
    gap: var(--space-3);
    padding: var(--space-4) var(--space-2);
    max-width: 1280px;
    margin: 0 auto;
  }

  .compare-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
  }

  .title {
    font-size: 1.85rem;
    color: var(--ink);
    transform: rotate(-1deg);
  }

  .subtitle {
    font-size: 1rem;
    color: var(--ink);
    max-width: 650px;
  }

  /* 3 Cards Table */
  .cards-table {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-4);
    align-items: start;
    margin: var(--space-2) 0;
  }

  .strategy-column {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .winner-ribbon {
    background-color: var(--paddy);
    color: var(--paper);
    border: var(--outline-thin);
    border-radius: var(--radius-sm);
    padding: 6px 14px;
    font-size: 0.88rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
    margin-bottom: -10px;
    z-index: 5;
    animation: ribbon-slide 300ms var(--spring) forwards;
  }

  @keyframes ribbon-slide {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rotation-type-tag {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--ink);
    background-color: color-mix(in srgb, var(--turmeric) 35%, var(--paper));
    border: 1.5px solid var(--ink);
    border-radius: 4px;
    padding: 2px 6px;
  }

  .score-badge {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--paper);
    background-color: var(--ink);
    border-radius: 6px;
    padding: 2px 8px;
  }

  .strategy-title {
    font-size: 1.35rem;
    margin-top: 4px;
    line-height: 1.2;
  }

  .strategy-sub {
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--ink) 80%, transparent);
    font-weight: 500;
  }

  .crop-rotation-flow {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .flow-label {
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--ink);
  }

  .pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .crop-pill {
    font-size: 0.78rem;
    background-color: color-mix(in srgb, var(--paper) 80%, var(--paddy));
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-pill);
    padding: 2px 8px;
  }

  .explanation-box {
    background-color: color-mix(in srgb, var(--paper) 90%, var(--turmeric));
    border-left: 3px solid var(--turmeric);
    padding: 6px 10px;
    border-radius: 0 6px 6px 0;
  }

  .why-text {
    font-size: 0.85rem;
    line-height: 1.35;
  }

  .evidence-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-label {
    font-size: 0.72rem;
    font-weight: bold;
  }

  .chips-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .bullet-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.8rem;
  }

  .benefit-box, .risk-box {
    background-color: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: 8px;
    padding: 8px;
  }

  .box-heading {
    display: block;
    font-size: 0.72rem;
    font-weight: bold;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .benefit-box ul, .risk-box ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .benefit-box li::before {
    content: "• ";
    color: var(--paddy);
    font-weight: bold;
  }

  .risk-box li::before {
    content: "• ";
    color: var(--chili);
    font-weight: bold;
  }

  .data-gap {
    font-style: italic;
    color: color-mix(in srgb, var(--ink) 75%, transparent);
  }

  .stamp-container {
    display: flex;
    justify-content: center;
    padding: 6px 0;
  }

  .card-footer-action {
    display: flex;
    justify-content: stretch;
    margin-top: auto;
  }

  .card-footer-action :global(.vintage-btn) {
    width: 100%;
  }

  /* Control Panel */
  .control-panel-card {
    background-color: var(--paper);
  }

  .panel-header {
    margin-bottom: var(--space-3);
  }

  .panel-title {
    font-size: 1.3rem;
  }

  .panel-desc {
    font-size: 0.92rem;
    color: var(--ink);
  }

  .sliders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-5);
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .group-title {
    font-size: 1rem;
    color: var(--ink);
    border-bottom: 2px solid var(--ink);
    padding-bottom: 4px;
  }

  .panel-info-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background-color: color-mix(in srgb, var(--monsoon) 12%, var(--paper));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 10px;
    font-size: 0.82rem;
    line-height: 1.35;
  }

  .info-icon {
    font-size: 1.1rem;
  }
</style>
