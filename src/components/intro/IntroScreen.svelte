<script lang="ts">
  import { ERAS, AMMA_DIALOGS } from '../../data/mockData';
  import StickerCard from '../common/StickerCard.svelte';
  import Button from '../common/Button.svelte';
  import AmmaBubble from '../common/AmmaBubble.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onStartGame: () => void;
    onViewStyleguide: () => void;
    onViewNasaDocs: () => void;
  }

  let { onStartGame, onViewStyleguide, onViewNasaDocs }: Props = $props();
</script>

<div class="intro-page">
  <!-- Vintage Seed-Packet Hero Card -->
  <div class="hero-packet sticker-card">
    <div class="packet-top-badge font-data">
      <span>AVENOX / NASA SPACE APPS 2026</span>
      <span>VINTAGE ALMANAC EDITION</span>
    </div>

    <div class="packet-header">
      <div class="seed-seal" aria-hidden="true">
        <svg viewBox="0 0 80 80" width="70" height="70">
          <circle cx="40" cy="40" r="36" fill="var(--turmeric)" stroke="var(--ink)" stroke-width="3" />
          <circle cx="40" cy="40" r="30" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="3 3" />
          <path d="M 40 18 Q 45 32 54 40 Q 40 44 40 60 Q 40 44 26 40 Q 35 32 40 18 Z" fill="var(--paddy)" stroke="var(--ink)" stroke-width="2" />
        </svg>
      </div>

      <h1 class="main-title font-display">FIELD SHIFT</h1>
      <div class="tagline font-display">Four Seasons of Amma's Field</div>
      <p class="subtitle font-body">
        A story-driven climate simulation. Inherit an ancestral family farm, witness 45 years of NASA Earth observations, and navigate erratic monsoons across four eras.
      </p>
    </div>

    <BlockPrintBorder height={16} />

    <!-- Amma's Introduction Speech Bubble -->
    <AmmaBubble text={AMMA_DIALOGS.intro} sublabel="Amma's Welcome (1990)" />

    <!-- 4 Eras Timeline Preview -->
    <div class="eras-preview-section">
      <div class="section-title font-display">The Four Eras of Your Journey</div>
      <div class="eras-grid">
        {#each ERAS as era, idx}
          <div class="era-card">
            <div class="era-year font-display">{era.year}</div>
            <div class="era-label font-data">[{era.label}]</div>
            <p class="era-desc font-body">{era.description}</p>
            <div class="era-stat font-data">
              Temp Anomaly: <strong>+{era.tempAnomaly}°C</strong>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Call to Action Buttons -->
    <div class="actions-row">
      <Button variant="primary" size="lg" onclick={onStartGame}>
        Begin Farm Journey (1990) →
      </Button>
      <Button variant="secondary" size="md" onclick={onViewNasaDocs}>
        🛰️ NASA Satellite Sources
      </Button>
      <Button variant="secondary" size="md" onclick={onViewStyleguide}>
        🎨 Design Styleguide
      </Button>
    </div>
  </div>
</div>

<style>
  .intro-page {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-4) var(--space-2);
    min-height: calc(100vh - 40px);
  }

  .hero-packet {
    max-width: 900px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-4);
    background-color: var(--paper);
    border: var(--outline-thick);
  }

  .packet-top-badge {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--ink);
    border-bottom: 2px solid var(--ink);
    padding-bottom: 6px;
    letter-spacing: 0.5px;
  }

  .packet-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-2);
  }

  .main-title {
    font-size: clamp(2.4rem, 6vw, 3.8rem);
    letter-spacing: 1px;
    color: var(--ink);
    transform: rotate(-1.5deg);
    margin: 0;
  }

  .tagline {
    font-size: clamp(1.15rem, 3vw, 1.6rem);
    color: var(--soil);
    margin-top: -6px;
  }

  .subtitle {
    font-size: 1.05rem;
    max-width: 620px;
    color: var(--ink);
    line-height: 1.45;
  }

  .eras-preview-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .section-title {
    font-size: 1.25rem;
    color: var(--ink);
    text-align: center;
  }

  .eras-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-3);
  }

  .era-card {
    background-color: color-mix(in srgb, var(--paper) 85%, var(--turmeric));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .era-year {
    font-size: 1.35rem;
    color: var(--ink);
    line-height: 1;
  }

  .era-label {
    font-size: 0.72rem;
    color: var(--soil);
    font-weight: bold;
  }

  .era-desc {
    font-size: 0.8rem;
    line-height: 1.3;
    color: var(--ink);
    flex-grow: 1;
  }

  .era-stat {
    font-size: 0.72rem;
    color: var(--chili);
    border-top: 1px dashed var(--ink);
    padding-top: 4px;
    margin-top: 4px;
  }

  .actions-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
    padding-top: var(--space-2);
  }
</style>
