<script lang="ts">
  import type { EndingResult, HariDecision } from './storyEngine';
  import type { FarmMeters } from '../../types/game';
  import StickerCard from '../common/StickerCard.svelte';
  import Button from '../common/Button.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';
  import RubberStamp from '../common/RubberStamp.svelte';
  import WaterJarMeter from '../meters/WaterJarMeter.svelte';
  import SoilProfileMeter from '../meters/SoilProfileMeter.svelte';
  import SproutMeter from '../meters/SproutMeter.svelte';
  import ErosionGaugeMeter from '../meters/ErosionGaugeMeter.svelte';
  import CoinStackMeter from '../meters/CoinStackMeter.svelte';

  interface Props {
    ending: EndingResult;
    decisions: HariDecision[];
    finalMeters: FarmMeters;
    onRestart: () => void;
  }

  let { ending, decisions, finalMeters, onRestart }: Props = $props();
</script>

<div class="ending-page">
  <div class="ending-card sticker-card no-tape">
    <div class="ending-header">
      <span class="badge font-data">50-YEAR CHRONICLE OF AMMA’S FIELD</span>
      <div class="rating-box font-display">GRADE {ending.rating}</div>
    </div>

    <h1 class="ending-title font-display">{ending.title}</h1>
    <div class="badge-tag font-display">{ending.badge}</div>

    <BlockPrintBorder height={14} />

    <p class="summary-text font-body">{ending.summary}</p>

    <!-- Final Meters Status -->
    <div class="final-meters-box">
      <div class="box-title font-display">Final Farm State (Year 2040)</div>
      <div class="meters-row">
        <WaterJarMeter value={finalMeters.soilMoisture} label="Soil Moisture" />
        <SoilProfileMeter value={finalMeters.organicMatter} label="Organic Matter" />
        <SproutMeter value={finalMeters.nitrogen} label="Nitrogen Bio" />
        <ErosionGaugeMeter value={finalMeters.erosionRisk} label="Erosion Risk" />
        <CoinStackMeter value={finalMeters.income} label="Vault Coins" />
      </div>
    </div>

    <!-- Decisions Journey Timeline -->
    <div class="decisions-section">
      <div class="section-heading font-display">Hari’s Key Decision Logbook</div>
      <div class="decisions-list">
        {#each decisions as dec}
          <div class="dec-item">
            <span class="dec-year font-display">[{dec.chapterId.slice(3, 7)}]</span>
            <div class="dec-body">
              <strong class="dec-title font-body">{dec.decisionTitle}:</strong>
              <span class="dec-choice font-body">{dec.choiceMade}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- NASA Satellite Assessment Card -->
    <div class="nasa-card sticker-card no-tape">
      <div class="nasa-head">
        <span class="font-data">🛰️ NASA OBSERVATION VERIFICATION</span>
        <RubberStamp text="MISSION COMPLETE" subtext="NASA Space Apps 2026" angle={-4} size="sm" />
      </div>
      <p class="nasa-text font-data">{ending.nasaEvaluation}</p>
    </div>

    <div class="restart-row">
      <Button variant="primary" size="lg" onclick={onRestart}>
        🔄 Play Hari’s Story Again
      </Button>
    </div>
  </div>
</div>

<style>
  .ending-page {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-4) var(--space-2);
    min-height: calc(100vh - 40px);
  }

  .ending-card {
    max-width: 820px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background-color: var(--paper);
    border: var(--outline-thick);
  }

  .ending-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 6px;
  }

  .badge {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--soil);
  }

  .rating-box {
    background-color: var(--turmeric);
    color: var(--ink);
    border: 2.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 4px 12px;
    font-size: 1.15rem;
    box-shadow: 0 2px 0 var(--ink);
  }

  .ending-title {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    color: var(--ink);
    margin: 0;
    transform: rotate(-1deg);
  }

  .badge-tag {
    font-size: 0.92rem;
    color: var(--paddy);
    margin-top: -6px;
  }

  .summary-text {
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--ink);
  }

  .final-meters-box {
    background-color: color-mix(in srgb, var(--paper) 90%, var(--soil));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .box-title {
    font-size: 1rem;
    text-align: center;
  }

  .meters-row {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 8px;
  }

  .decisions-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-heading {
    font-size: 1.15rem;
    color: var(--ink);
  }

  .decisions-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dec-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    box-shadow: 0 1px 0 var(--ink);
  }

  .dec-year {
    font-size: 0.95rem;
    color: var(--turmeric);
    background-color: var(--ink);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .dec-body {
    font-size: 0.88rem;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .nasa-card {
    background-color: color-mix(in srgb, var(--monsoon) 12%, var(--paper));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nasa-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--monsoon);
  }

  .nasa-text {
    font-size: 0.82rem;
    line-height: 1.35;
    color: var(--ink);
  }

  .restart-row {
    display: flex;
    justify-content: center;
    padding-top: var(--space-2);
  }
</style>
