<script lang="ts">
  import Button from '../common/Button.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onSelectHariJourney: () => void;
    onSelectMissionConquest: () => void;
    onBack: () => void;
  }

  let { onSelectHariJourney, onSelectMissionConquest, onBack }: Props = $props();
</script>

<div class="overworld-select-container">
  <div class="overworld-select-card">
    <div class="card-header">
      <div class="tag font-data">OVERWORLD EXPEDITIONS</div>
      <h1 class="screen-title font-display">CHOOSE OVERWORLD PATH</h1>
      <p class="screen-desc font-body">Select how you would like to explore the overworld and regional missions.</p>
    </div>

    <BlockPrintBorder height={12} variant="phulkari" />

    <div class="options-grid">
      <!-- Option 1: Hari's Journey -->
      <button type="button" class="mode-card journey-card" onclick={onSelectHariJourney}>
        <div class="card-badge font-data">5-ACT STORY EXPEDITION</div>
        
        <div class="mode-icon-circle" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 2 15 8 12 14 9 8" fill="var(--journal-gold, #E5A93C)" stroke="var(--journal-ink, #1B2B1F)" />
            <polygon points="12 22 9 16 12 10 15 16" fill="var(--journal-forest, #1F3825)" stroke="var(--journal-ink, #1B2B1F)" />
          </svg>
        </div>

        <h2 class="mode-title font-display">Hari's Journey</h2>
        
        <p class="mode-details font-body">
          Follow Hari's 5-Act global journey across Karnataka, Punjab, Iowa, and the Sahel. Tackle real-time crisis scenarios, calibrate soil moisture drills, and unite international farmers.
        </p>

        <ul class="features-list font-data">
          <li>• 5 Regional Narrative Acts</li>
          <li>• Interactive Crisis Drill Games</li>
          <li>• Global Agronomic Summit Climax</li>
        </ul>

        <div class="mode-action-pill font-data">
          Begin Hari's Journey →
        </div>
      </button>

      <!-- Option 2: Mission Conquest -->
      <button type="button" class="mode-card conquest-card" onclick={onSelectMissionConquest}>
        <div class="card-badge font-data">2D RPG OVERWORLD</div>

        <div class="mode-icon-circle" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="6" width="20" height="12" rx="4" fill="none" stroke="var(--journal-ink, #1B2B1F)" />
            <line x1="6" y1="12" x2="10" y2="12" stroke="var(--journal-ink, #1B2B1F)" stroke-linecap="round" />
            <line x1="8" y1="10" x2="8" y2="14" stroke="var(--journal-ink, #1B2B1F)" stroke-linecap="round" />
            <circle cx="16" cy="10" r="1.5" fill="var(--journal-gold, #E5A93C)" />
            <circle cx="18" cy="13" r="1.5" fill="var(--journal-forest, #1F3825)" />
          </svg>
        </div>

        <h2 class="mode-title font-display">Mission Conquest</h2>

        <p class="mode-details font-body">
          Explore Amma's farm in a free-roaming 2D GBA world. Walk through crop terraces, inspect tubewells, and conquer all 4 interactive missions across the valley.
        </p>

        <ul class="features-list font-data">
          <li>• M1: Heirloom Seed Matrix with Amma</li>
          <li>• M2: 3-Crop Rotation Council at Banyan</li>
          <li>• M3: Iowa Satellite Weather Phone Link</li>
          <li>• M4: Kenya Solar Video Zaï Pit Shield</li>
        </ul>

        <div class="mode-action-pill font-data highlight">
          Enter Mission Conquest →
        </div>
      </button>
    </div>

    <div class="footer-actions">
      <Button variant="secondary" size="md" onclick={onBack}>
        ← Back to Playmode
      </Button>
    </div>
  </div>
</div>

<style>
  .overworld-select-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
    padding: 32px 16px;
    background: radial-gradient(circle at center, #1E3324 0%, #111A13 100%);
  }

  .overworld-select-card {
    max-width: 860px;
    width: 100%;
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .card-header {
    text-align: center;
  }

  .tag {
    font-size: 0.78rem;
    color: var(--journal-sage, #4E7C5A);
    font-weight: bold;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  .screen-title {
    font-size: 2.2rem;
    color: var(--journal-forest, #1F3825);
    margin: 0 0 6px 0;
  }

  .screen-desc {
    font-size: 1rem;
    color: var(--journal-ink-soft, #2D4233);
    margin: 0;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 10px;
  }

  @media (max-width: 720px) {
    .options-grid {
      grid-template-columns: 1fr;
    }
  }

  .mode-card {
    background-color: #FFFFFF;
    border: 2.5px solid var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 4px 0 var(--journal-ink, #1B2B1F);
    transition: transform var(--fast, 130ms) ease, box-shadow var(--fast, 130ms) ease, border-color var(--fast, 130ms) ease;
    position: relative;
  }

  .mode-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-color: var(--journal-forest, #1F3825);
  }

  .card-badge {
    position: absolute;
    top: -12px;
    background: var(--journal-forest, #1F3825);
    color: #FAF6ED;
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: bold;
    letter-spacing: 0.04em;
  }

  .mode-icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #F4EEDF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    margin-top: 6px;
    color: var(--journal-forest, #1F3825);
  }

  .mode-title {
    font-size: 1.45rem;
    color: var(--journal-ink, #1B2B1F);
    margin: 0 0 10px 0;
  }

  .mode-details {
    font-size: 0.9rem;
    color: var(--journal-ink-soft, #2D4233);
    line-height: 1.45;
    margin: 0 0 16px 0;
    flex: 1;
  }

  .features-list {
    list-style: none;
    padding: 0;
    margin: 0 0 18px 0;
    width: 100%;
    text-align: left;
    background: #FAF6ED;
    border: 1px solid #DFD7C2;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 0.76rem;
    color: var(--journal-ink, #1B2B1F);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mode-action-pill {
    width: 100%;
    padding: 10px 16px;
    border-radius: 6px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    background: #FAF6ED;
    color: var(--journal-ink, #1B2B1F);
    font-weight: bold;
    font-size: 0.88rem;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
    transition: background-color 0.15s;
  }

  .mode-action-pill.highlight {
    background: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
  }

  .mode-card:hover .mode-action-pill {
    background: var(--journal-forest, #1F3825);
    color: #FAF6ED;
  }

  .footer-actions {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
</style>
