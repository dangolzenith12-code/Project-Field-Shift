<script lang="ts">
  import Button from '../common/Button.svelte';
  import StickerCard from '../common/StickerCard.svelte';
  import Slider from '../common/Slider.svelte';
  import RubberStamp from '../common/RubberStamp.svelte';
  import DataChip from '../common/DataChip.svelte';
  import AmmaBubble from '../common/AmmaBubble.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';
  import WaterJarMeter from '../meters/WaterJarMeter.svelte';
  import SoilProfileMeter from '../meters/SoilProfileMeter.svelte';
  import ErosionGaugeMeter from '../meters/ErosionGaugeMeter.svelte';
  import CoinStackMeter from '../meters/CoinStackMeter.svelte';
  import SproutMeter from '../meters/SproutMeter.svelte';
  import MonteCarloRibbon from '../compare/MonteCarloRibbon.svelte';
  import { SATELLITE_NOTES } from '../../data/mockData';

  interface Props {
    onBack: () => void;
  }

  let { onBack }: Props = $props();

  // Test state for meters
  let testMoisture = $state(65);
  let testOrganic = $state(52);
  let testNitrogen = $state(70);
  let testErosion = $state(35);
  let testIncome = $state(180);

  // Test slider value
  let testSliderVal = $state(45);

  const tokens = [
    { name: '--ink', hex: '#2B1B12', role: 'All outlines, text, hard shadows' },
    { name: '--paper', hex: '#FFF3D6', role: 'Warm cream page background (never pure white)' },
    { name: '--soil', hex: '#8A4B2A', role: 'Soil, organic matter meter, earthy surfaces' },
    { name: '--turmeric', hex: '#FFB703', role: 'Primary action, coins & income, highlights' },
    { name: '--paddy', hex: '#3FA34D', role: 'Healthy canopy, growth, good outcomes' },
    { name: '--monsoon', hex: '#2F6FED', role: 'Water, rain, soil moisture, NASA data chips' },
    { name: '--chili', hex: '#E63946', role: 'Danger, drought, erosion, risk stamps' },
    { name: '--dusk', hex: '#7B4FA3', role: 'Story and narrator Amma moments (rare, special)' },
    { name: '--sky', hex: '#BDE8F5', role: 'Scene sky, calm background panels' }
  ];
</script>

<div class="styleguide-container">
  <div class="sg-header">
    <div>
      <h2 class="title font-display">Harvest Almanac Arcade Styleguide</h2>
      <p class="subtitle font-body">
        The single source of truth for Field Shift UI. 3px ink outlines, hard offset shadows, cream paper background, and spring motion.
      </p>
    </div>
    <Button variant="secondary" size="md" onclick={onBack}>← Back to Game</Button>
  </div>

  <BlockPrintBorder height={16} />

  <!-- 1. Semantic Color Palette Swatches -->
  <section class="sg-section">
    <h3 class="section-title font-display">1. The 9-Color Semantic Palette</h3>
    <div class="swatches-grid">
      {#each tokens as t}
        <div class="swatch-card sticker-card no-tape">
          <div class="color-preview" style:background-color={t.hex}></div>
          <div class="swatch-meta">
            <span class="token-name font-data">{t.name}</span>
            <span class="token-hex font-data">{t.hex}</span>
            <p class="token-role font-body">{t.role}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- 2. Typography -->
  <section class="sg-section">
    <h3 class="section-title font-display">2. Typography Triad</h3>
    <div class="type-cards-grid">
      <div class="type-card sticker-card no-tape">
        <span class="type-badge font-data">DISPLAY</span>
        <h4 class="font-display type-name">Bagel Fat One</h4>
        <p class="sample-display font-display">Four Seasons of Amma's Field (Tilted −1.5°)</p>
        <span class="font-data type-rule">Used for titles, era banners, button text, rubber stamps.</span>
      </div>

      <div class="type-card sticker-card no-tape">
        <span class="type-badge font-data">BODY</span>
        <h4 class="type-name" style="font-family: var(--font-body); font-weight: bold;">Figtree</h4>
        <p class="sample-body font-body">
          A friendly geometric sans-serif that brings warmth to agricultural storytelling and card descriptions.
        </p>
        <span class="font-data type-rule">Used for Amma's dialogue, card body copy, tooltips.</span>
      </div>

      <div class="type-card sticker-card no-tape">
        <span class="type-badge font-data">DATA / READOUTS</span>
        <h4 class="type-name font-data">Space Mono</h4>
        <p class="sample-data font-data">GWETROOT: 0.68 | T2M: +1.4°C | 1990 - 2026</p>
        <span class="font-data type-rule">Used for telemetry, numbers, satellite dataset tags.</span>
      </div>
    </div>
  </section>

  <!-- 3. Tactile Jar & Gauge Meters (Interactive Demo) -->
  <section class="sg-section">
    <h3 class="section-title font-display">3. Tactile Jars & Gauge Meters</h3>
    <p class="section-desc font-body">
      Move the sliders below to see the custom SVG jars and gauges wobble and update in real time!
    </p>

    <div class="interactive-meters-board sticker-card no-tape">
      <div class="meters-demo-row">
        <WaterJarMeter value={testMoisture} label="Soil Moisture" />
        <SoilProfileMeter value={testOrganic} label="Organic Matter" />
        <SproutMeter value={testNitrogen} label="Nitrogen Bio" />
        <ErosionGaugeMeter value={testErosion} label="Erosion Risk" />
        <CoinStackMeter value={testIncome} label="Farm Income" />
      </div>

      <div class="sliders-debug-strip">
        <Slider label="Moisture Test" bind:value={testMoisture} min={0} max={100} unit="%" />
        <Slider label="Organic Matter Test" bind:value={testOrganic} min={0} max={100} unit="%" />
        <Slider label="Nitrogen Test" bind:value={testNitrogen} min={0} max={100} unit="%" />
        <Slider label="Erosion Test" bind:value={testErosion} min={0} max={100} unit="%" />
        <Slider label="Income Coins Test" bind:value={testIncome} min={20} max={300} unit="🪙" />
      </div>
    </div>
  </section>

  <!-- 4. Interactive Buttons & Controls -->
  <section class="sg-section">
    <h3 class="section-title font-display">4. Buttons & Sliders</h3>
    <div class="buttons-grid">
      <div class="btn-demo-box">
        <Button variant="primary" size="lg">Primary Action (Turmeric)</Button>
        <Button variant="secondary" size="md">Secondary (Paper)</Button>
        <Button variant="paddy" size="md">Success (Paddy Green)</Button>
        <Button variant="chili" size="md">Critical (Chili Red)</Button>
        <Button variant="primary" size="sm" disabled={true}>Disabled State</Button>
      </div>

      <div class="slider-demo-box">
        <Slider label="Demonstration Slider" icon="🌾" bind:value={testSliderVal} min={0} max={100} unit="%" />
      </div>
    </div>
  </section>

  <!-- 5. Signature Elements: Stamps, Chips, Tape & Bubbles -->
  <section class="sg-section">
    <h3 class="section-title font-display">5. Signature Almanac Elements</h3>
    <div class="signature-elements-grid">
      <!-- Rubber Stamp -->
      <div class="sig-card sticker-card">
        <h4 class="font-display">Rubber Stamp</h4>
        <div style="padding: 10px 0;">
          <RubberStamp text="ASK A LOCAL EXPERT" subtext="Supports, doesn't replace farmers" angle={-8} />
        </div>
        <p class="font-body sig-caption">Squash-and-stretch drop animation with double chili border.</p>
      </div>

      <!-- Data Chips with Popovers -->
      <div class="sig-card sticker-card">
        <h4 class="font-display">NASA Data Chips</h4>
        <div class="chips-demo">
          <DataChip note={SATELLITE_NOTES.SMAP_SOIL} value="0.42" />
          <DataChip note={SATELLITE_NOTES.POWER_TEMP} value="+1.8°C" />
          <DataChip note={SATELLITE_NOTES.MODIS_NDVI} value="0.74" />
        </div>
        <p class="font-body sig-caption">Click any chip above to pop up the Satellite Note explanation.</p>
      </div>

      <!-- Monte Carlo Wobbly Ribbon -->
      <div class="sig-card sticker-card" style="grid-column: 1 / -1;">
        <h4 class="font-display">Wobbly Monte Carlo Uncertainty Ribbon</h4>
        <MonteCarloRibbon p10={42} median={68} p90={86} />
        <p class="font-body sig-caption">Communicates that climate projections are a range, not a single false promise.</p>
      </div>

      <!-- Amma Narrator Bubble -->
      <div class="sig-card sticker-card" style="grid-column: 1 / -1;">
        <h4 class="font-display">Amma Narrator Speech Bubble</h4>
        <AmmaBubble 
          text="The soil is thirsty, child. Notice how the cracks spread when the moisture drops below thirty percent? That's what MERRA-2 saw in the summer of 2005." 
          sublabel="Amma's Observation" 
        />
      </div>
    </div>
  </section>
</div>

<style>
  .styleguide-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-4) var(--space-2);
  }

  .sg-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .title {
    font-size: 2rem;
    transform: rotate(-1deg);
  }

  .subtitle {
    font-size: 1rem;
    max-width: 650px;
  }

  .sg-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .section-title {
    font-size: 1.45rem;
    color: var(--ink);
    border-bottom: 2px solid var(--ink);
    padding-bottom: 4px;
  }

  .section-desc {
    font-size: 0.95rem;
  }

  /* Swatches */
  .swatches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-3);
  }

  .swatch-card {
    padding: 0;
    overflow: hidden;
  }

  .color-preview {
    height: 70px;
    width: 100%;
    border-bottom: 2px solid var(--ink);
  }

  .swatch-meta {
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .token-name {
    font-weight: bold;
    font-size: 0.88rem;
  }

  .token-hex {
    font-size: 0.78rem;
    color: color-mix(in srgb, var(--ink) 70%, transparent);
  }

  .token-role {
    font-size: 0.8rem;
    line-height: 1.25;
    margin-top: 4px;
  }

  /* Type Cards */
  .type-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-3);
  }

  .type-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: var(--space-3) var(--space-4);
  }

  .type-badge {
    font-size: 0.7rem;
    color: var(--monsoon);
    font-weight: bold;
  }

  .type-name {
    font-size: 1.3rem;
  }

  .sample-display {
    font-size: 1.25rem;
    color: var(--soil);
  }

  .sample-body {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .sample-data {
    font-size: 0.85rem;
    background-color: color-mix(in srgb, var(--ink) 10%, transparent);
    padding: 6px;
    border-radius: 4px;
  }

  .type-rule {
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--ink) 75%, transparent);
  }

  /* Interactive Meters */
  .interactive-meters-board {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .meters-demo-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: var(--space-3);
    padding-bottom: var(--space-3);
    border-bottom: 2px dashed var(--ink);
  }

  .sliders-debug-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-3);
  }

  /* Buttons & Sliders */
  .buttons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-4);
    align-items: center;
  }

  .btn-demo-box {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  .slider-demo-box {
    background-color: var(--paper);
    border: var(--outline);
    border-radius: var(--radius);
    padding: var(--space-4);
    box-shadow: var(--shadow);
  }

  /* Signature Elements */
  .signature-elements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .sig-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
  }

  .chips-demo {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px 0;
  }

  .sig-caption {
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--ink) 75%, transparent);
  }
</style>
