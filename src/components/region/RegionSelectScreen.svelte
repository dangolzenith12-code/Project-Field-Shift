<script lang="ts">
  import { REGIONS } from '../../data/mockData';
  import type { RegionInfo } from '../../types/game';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onSelectRegion: (region: RegionInfo) => void;
    onBack?: () => void;
  }

  let { onSelectRegion, onBack }: Props = $props();

  interface CleanRegion {
    id: string;
    title: string;
    matriarch: string;
    summary: string;
    isAvailable: boolean;
    regionData: RegionInfo;
  }

  const regionsList: CleanRegion[] = [
    {
      id: 'punjab',
      title: 'Punjab',
      matriarch: 'Bebe Amarjit',
      summary: 'Alluvial plains · Generational story through 1990, 2026, and 2040.',
      isAvailable: true,
      regionData: REGIONS.punjab
    },
    {
      id: 'karnataka',
      title: 'Karnataka',
      matriarch: 'Ajji Gowri',
      summary: 'Deccan plateau · Semi-arid ragi millets and dryland stewardship.',
      isAvailable: true,
      regionData: REGIONS.karnataka
    }
  ];
</script>

<div class="region-screen-viewport">
  <div class="region-container">
    <!-- Header -->
    <header class="region-header">
      <h1 class="header-title font-display">CHOOSE REGION</h1>
      <p class="header-sub font-body">Select a region to begin your story.</p>
    </header>

    <BlockPrintBorder height={10} variant="phulkari" />

    <!-- Minimal Clean Cards Grid -->
    <div class="cards-grid">
      {#each regionsList as item}
        <div class="minimal-region-card {item.isAvailable ? 'available' : 'locked'}">
          <div class="card-top">
            <div class="region-emblem" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3C8 7 6 12 6 17c0 3.3 2.7 6 6 6s6-2.7 6-6c0-5-2-10-6-14z" fill="var(--journal-gold, #E5A93C)" stroke="var(--journal-forest, #1F3825)" />
                <path d="M12 9v12" stroke="var(--journal-forest, #1F3825)" />
              </svg>
            </div>
            <span class="matriarch-pill font-data">{item.matriarch}</span>
          </div>

          <h2 class="region-title font-display">{item.title}</h2>
          <p class="region-summary font-body">{item.summary}</p>

          <div class="card-motif-divider">
            <BlockPrintBorder height={6} variant={item.id === 'karnataka' ? 'kasuti' : 'phulkari'} />
          </div>

          <div class="card-footer">
            {#if item.isAvailable}
              <button 
                type="button" 
                class="select-btn font-display" 
                onclick={() => onSelectRegion(item.regionData)}
              >
                Select {item.title} →
              </button>
            {:else}
              <button type="button" class="disabled-btn font-data" disabled>
                Phase 2 · Coming Soon
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Back Button -->
    {#if onBack}
      <div class="back-row">
        <button type="button" class="back-btn font-data" onclick={onBack}>
          ← Back
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .region-screen-viewport {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 65px);
    padding: 32px 16px;
    background: radial-gradient(circle at center, #1E3324 0%, #111A13 100%);
  }

  .region-container {
    max-width: 760px;
    width: 100%;
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .region-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }

  .header-title {
    font-size: 2rem;
    color: var(--journal-forest, #1F3825);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .header-sub {
    font-size: 0.95rem;
    color: var(--journal-soil, #7C4A2D);
    margin: 0;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 4px;
  }

  .minimal-region-card {
    background: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 4px 0 var(--journal-ink, #1B2B1F);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .minimal-region-card.available:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 0 var(--journal-ink, #1B2B1F);
  }

  .minimal-region-card.locked {
    opacity: 0.7;
    background-color: #F8F5EE;
    border-style: dashed;
  }

  .card-motif-divider {
    margin: 4px 0 8px 0;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .region-emblem {
    display: flex;
    align-items: center;
  }

  .matriarch-pill {
    background-color: color-mix(in srgb, var(--journal-gold, #E5A93C) 25%, var(--journal-paper, #FAF6ED));
    border: 1px solid var(--journal-ink, #1B2B1F);
    color: var(--journal-forest, #1F3825);
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .region-title {
    font-size: 1.6rem;
    color: var(--journal-forest, #1F3825);
    margin: 0;
  }

  .region-summary {
    font-size: 0.88rem;
    color: var(--journal-ink, #1B2B1F);
    margin: 0;
    line-height: 1.45;
    flex-grow: 1;
  }

  .card-footer {
    padding-top: 6px;
  }

  .select-btn {
    width: 100%;
    background-color: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 10px 16px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    transition: background-color 0.15s, transform 0.15s;
  }

  .select-btn:hover {
    background-color: #F5B041;
    transform: translateY(-1px);
  }

  .disabled-btn {
    width: 100%;
    background-color: #E0DDD5;
    color: #7A7873;
    border: 1.5px solid #BAB6AE;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: not-allowed;
  }

  .back-row {
    display: flex;
    justify-content: flex-start;
    padding-top: 4px;
  }

  .back-btn {
    background: none;
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 4px;
    padding: 6px 14px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    color: var(--journal-ink, #1B2B1F);
    background-color: #FFFFFF;
    transition: background-color 0.15s;
  }

  .back-btn:hover {
    background-color: #F0EAD6;
  }
</style>
