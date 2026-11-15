<script lang="ts">
  import { REGIONS } from '../../data/mockData';
  import type { RegionInfo } from '../../types/game';
  import StickerCard from '../common/StickerCard.svelte';
  import Button from '../common/Button.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onSelectRegion: (region: RegionInfo) => void;
    onBack?: () => void;
  }

  let { onSelectRegion, onBack }: Props = $props();

  const regionsList = Object.values(REGIONS);
</script>

<div class="region-select-page">
  <div class="header-section">
    <div class="header-titles">
      <h2 class="page-title font-display">Select Your Farm Region</h2>
      <p class="page-desc font-body">
        Choose an agro-ecological zone to inherit. Each region comes with authentic 45-year NASA POWER climate trends and GRACE groundwater anomalies.
      </p>
    </div>
    {#if onBack}
      <Button variant="secondary" size="sm" onclick={onBack}>← Back to Intro</Button>
    {/if}
  </div>

  <BlockPrintBorder height={14} />

  <div class="regions-grid">
    {#each regionsList as reg, i}
      {@const tilt = i % 2 === 0 ? -1 : 1}
      <StickerCard tilt={tilt} class="region-card">
        <div class="region-top">
          <span class="region-badge font-data">{reg.badge}</span>
          <span class="country-tag font-data">{reg.country}</span>
        </div>

        <h3 class="region-name font-display">{reg.name}</h3>
        <p class="region-desc font-body">{reg.landscapeDescription}</p>

        <div class="challenge-box">
          <div class="box-tag font-data">⚠️ Climate Stress</div>
          <p class="challenge-text font-body">{reg.climateChallenge}</p>
        </div>

        <div class="satellite-callout">
          <div class="callout-tag font-data">🛰️ NASA GRACE Groundwater Observation</div>
          <p class="callout-text font-data">{reg.graceGroundwaterTrend}</p>
        </div>

        <div class="crops-tag-strip">
          <span class="font-data strip-label">Primary Crops:</span>
          {#each reg.primaryCrops as crop}
            <span class="crop-tag font-body">{crop}</span>
          {/each}
        </div>

        <div class="card-action">
          <Button variant="primary" size="md" onclick={() => onSelectRegion(reg)}>
            Farm in {reg.name} →
          </Button>
        </div>
      </StickerCard>
    {/each}
  </div>
</div>

<style>
  .region-select-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 1180px;
    margin: 0 auto;
    padding: var(--space-4) var(--space-2);
  }

  .header-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
  }

  .page-title {
    font-size: 2rem;
    color: var(--ink);
    transform: rotate(-1deg);
  }

  .page-desc {
    font-size: 1rem;
    max-width: 650px;
  }

  .regions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
    gap: var(--space-4);
    align-items: stretch;
  }

  .region-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .region-badge {
    background-color: var(--turmeric);
    color: var(--ink);
    border: 1.5px solid var(--ink);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.72rem;
    font-weight: bold;
  }

  .country-tag {
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--ink) 75%, transparent);
  }

  .region-name {
    font-size: 1.45rem;
    margin: 0;
  }

  .region-desc {
    font-size: 0.88rem;
    line-height: 1.35;
  }

  .challenge-box {
    background-color: color-mix(in srgb, var(--chili) 10%, var(--paper));
    border: 2px solid var(--chili);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
  }

  .box-tag {
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--chili);
    margin-bottom: 2px;
  }

  .challenge-text {
    font-size: 0.82rem;
    line-height: 1.3;
  }

  .satellite-callout {
    background-color: color-mix(in srgb, var(--monsoon) 12%, var(--paper));
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
  }

  .callout-tag {
    font-size: 0.68rem;
    font-weight: bold;
    color: var(--monsoon);
    margin-bottom: 2px;
  }

  .callout-text {
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .crops-tag-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    font-size: 0.75rem;
  }

  .strip-label {
    font-weight: bold;
  }

  .crop-tag {
    background-color: color-mix(in srgb, var(--paddy) 25%, var(--paper));
    border: 1px solid var(--ink);
    border-radius: 4px;
    padding: 1px 6px;
  }

  .card-action {
    margin-top: auto;
    display: flex;
  }

  .card-action :global(.vintage-btn) {
    width: 100%;
  }
</style>
