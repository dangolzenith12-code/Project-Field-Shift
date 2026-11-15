<script lang="ts">
  import MeterBand from '../../lib/components/MeterBand.svelte';
  import WeatherStrip from '../../lib/components/WeatherStrip.svelte';
  import {
    METERS,
    REGIONS,
    crops,
    getMeterBand,
    horizons,
    meterExtents,
    metersAt,
    regionById,
    sims
  } from '../../lib/data';
  import { latestFullYear, loadRegionWeather } from '../../lib/regionalWeather';
  import type { RegionalWeather } from '../../../contracts/weather';
  import type { StrategyId } from '../../../contracts/sim-output';

  type Scene = 'intro' | 'region' | 'season' | 'compare' | 'reflect';
  const scenes: { id: Scene; label: string }[] = [
    { id: 'intro', label: 'The inheritance' },
    { id: 'region', label: 'Choose a region' },
    { id: 'season', label: 'A changing season' },
    { id: 'compare', label: 'Compare paths' },
    { id: 'reflect', label: 'What we leave behind' }
  ];

  const strategyCards: { id: StrategyId; title: string; blurb: string }[] = [
    { id: 'existing_rotation', title: 'Keep the rhythm', blurb: 'Continue the existing rotation. A baseline for comparison, not a recommendation.' },
    { id: 'resilience_rotation', title: 'Build resilience', blurb: 'Explore a rotation that prioritises soil cover and water resilience.' },
    { id: 'income_rotation', title: 'Protect income', blurb: 'Explore a rotation that places greater weight on near-term farm income.' }
  ];

  let active: Scene = $state('intro');
  let regionId = $state('punjab');
  let horizon: number = $state(2040);

  function next() {
    const index = scenes.findIndex((scene) => scene.id === active);
    active = scenes[Math.min(index + 1, scenes.length - 1)].id;
  }

  interface Props {
    onBack?: () => void;
  }
  let { onBack }: Props = $props();

  const region = $derived(regionById(regionId));

  // Lazy per-region weather: only the viewed region's chunk is downloaded.
  let weatherRecords = $state<RegionalWeather | null>(null);
  let weatherState = $state<'loading' | 'ready' | 'missing'>('loading');
  let weatherRequest = 0;

  $effect(() => {
    const id = regionId;
    const token = ++weatherRequest;
    weatherState = 'loading';
    loadRegionWeather(id)
      .then((records) => {
        if (token !== weatherRequest) return;
        weatherRecords = records ? latestFullYear(records) : null;
        weatherState = records ? 'ready' : 'missing';
      })
      .catch(() => {
        if (token !== weatherRequest) return;
        weatherRecords = null;
        weatherState = 'missing';
      });
  });
</script>

<div class="journal-wrapper">
  <main class="shell">
    <header class="topbar">
      <div>
        <span class="wordmark">FIELD SHIFT JOURNAL</span>
        <span class="eyebrow">A farm, across generations</span>
      </div>
      {#if onBack}
        <button type="button" class="back-btn font-body" onclick={onBack}>
          ← Back to Story
        </button>
      {/if}
    </header>
    <nav aria-label="Game scenes" class="scene-nav">
      {#each scenes as scene}
        <button class:current={active === scene.id} onclick={() => active = scene.id}>
          {scene.label}
        </button>
      {/each}
    </nav>
    {#if active === 'intro'}
      <section class="hero">
        <p class="eyebrow">FOUR SEASONS OF AMMA'S FIELD</p>
        <h1>Every season leaves<br />something behind.</h1>
        <p class="lead">A family farm. A changing climate. Decisions that echo beyond one harvest.</p>
        <button class="primary" onclick={next}>Begin the story</button>
      </section>
    {:else if active === 'region'}
      <section class="panel">
        <p class="eyebrow">CHAPTER 01 · PLACE</p>
        <h1>Where does your story begin?</h1>
        <label for="region-select">Choose a demonstration region</label>
        <select id="region-select" bind:value={regionId}>
          {#each REGIONS as r}
            <option value={r.id}>{r.label}</option>
          {/each}
        </select>
        <p class="muted">Demonstration context only, not a farm-specific diagnosis.</p>
        <button class="primary" onclick={next}>Continue</button>
      </section>
    {:else if active === 'season'}
      <section class="panel">
        <p class="eyebrow">CHAPTER 02 · THE FIELD</p>
        <h1>{region.label}</h1>
        <div class="field-art" role="img" aria-label="Illustrative farm plot with rows of crops">
          <svg viewBox="0 0 720 260" aria-hidden="true">
            <rect width="720" height="260" fill={region.sky} />
            <path d="M0 140 Q180 95 360 140 T720 130 V260 H0Z" fill={region.soil} />
            {#each [0,1,2,3,4,5] as n}
              <path d={'M' + (60+n*110) + ' 260 Q' + (90+n*105) + ' 185 ' + (120+n*100) + ' 135'} stroke={region.furrow} stroke-width="16" fill="none" />
              <path d={'M' + (60+n*110) + ' 210 l-18 -25 m18 25 l22 -30'} stroke={region.crop} stroke-width="7" stroke-linecap="round" />
            {/each}
            <circle cx="590" cy="55" r="27" fill={region.sun} />
          </svg>
        </div>
        {#if weatherState === 'ready' && weatherRecords}
          <WeatherStrip records={weatherRecords} source="NASA POWER · precomputed" />
        {:else if weatherState === 'loading'}
          <p class="muted">Loading weekly weather…</p>
        {:else}
          <p class="muted">Weather dataset unavailable for {region.label}.</p>
        {/if}
        <details class="crop-details">
          <summary>The field's crop calendar <span class="muted">{crops.length} crops · cited sources</span></summary>
          <ul class="crop-list">
            {#each crops as c (c.id)}
              <li>
                <span class="crop-head">
                  <strong>{c.name}</strong>
                  <span class="tag">{c.season.join(' / ')}</span>
                </span>
                <span class="crop-facts">
                  {c.waterUse} mm water · roots {c.rootingDepth} cm · cover {c.coverValue.toFixed(2)}{c.nitrogenFixation ? ' · fixes N' : ''}
                </span>
              </li>
            {/each}
          </ul>
        </details>
        <p class="muted">Illustrative plot. Environmental indicators connect in later phases.</p>
        <button class="primary" onclick={next}>See the possible paths</button>
      </section>
    {:else if active === 'compare'}
      <section class="panel">
        <p class="eyebrow">CHAPTER 03 · CHOICES</p>
        <h1>There is more than one way forward.</h1>
        <div class="horizon-toggle" role="group" aria-label="Horizon year">
          {#each horizons as y}
            <button class:current={horizon === y} onclick={() => horizon = y}>{y}</button>
          {/each}
        </div>
        <div class="cards">
          {#each strategyCards as card (card.id)}
            {@const sim = sims[card.id]}
            {@const meters = metersAt(card.id, horizon)}
            <article class="strat">
              <h2>{card.title}</h2>
              <p>{card.blurb}</p>
              <div class="meters">
                {#each METERS as m (m.key)}
                  {@const band = getMeterBand(sim, m.key)}
                  <MeterBand
                    label={m.label}
                    unit={m.unit}
                    digits={m.digits}
                    value={meters[m.key]}
                    lo={band.lo}
                    hi={band.hi}
                    min={meterExtents[m.key].min}
                    max={meterExtents[m.key].max}
                  />
                {/each}
              </div>
            </article>
          {/each}
        </div>
        <p class="muted">Bands show p10–p90 with the most likely value pinned; scales shared across strategies. Synthetic placeholders until the simulation pipeline lands; units provisional.</p>
        <button class="primary" onclick={next}>Reflect</button>
      </section>
    {:else}
      <section class="panel">
        <p class="eyebrow">EPILOGUE · STEWARDSHIP</p>
        <h1>The data can show a pattern.<br />The farmer knows the field.</h1>
        <p class="lead">Field Shift is designed to support farmers and local experts, not replace their judgement.</p>
        <button class="primary" onclick={() => active = 'intro'}>Begin again</button>
      </section>
    {/if}
    <footer>NASA Earth observation data · Decision support, not a yield forecast</footer>
  </main>
</div>

<style>
  .journal-wrapper {
    background-color: var(--journal-paper, #FAF6ED);
    color: var(--journal-ink, #1B2B1F);
    min-height: calc(100vh - 60px);
    padding: 24px 16px;
  }
  .shell {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .topbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px 12px;
    border-bottom: 2px solid var(--journal-ink, #1B2B1F);
    padding-bottom: 12px;
  }
  .back-btn {
    background-color: var(--journal-paper, #FAF6ED);
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
    transition: transform 0.15s;
  }
  .back-btn:hover {
    transform: translateY(-1px);
    background-color: #f0ead6;
  }
  .wordmark {
    font-weight: 700;
    letter-spacing: 1.5px;
    font-family: var(--font-display, 'Fraunces', serif);
    font-size: 1.25rem;
    color: var(--journal-forest, #1F3825);
  }
  .eyebrow {
    margin-left: 10px;
    font-size: 0.78rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--journal-gold, #D98E16);
  }
  .scene-nav {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }
  .scene-nav::-webkit-scrollbar {
    display: none;
  }
  .scene-nav button {
    flex: 0 0 auto;
    white-space: nowrap;
    background: var(--journal-paper, #FAF6ED);
    border: 2px solid var(--journal-ink, #1B2B1F);
    color: var(--journal-ink, #1B2B1F);
    padding: 6px 16px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
    transition: transform 0.15s, background-color 0.15s;
  }
  .scene-nav button:hover {
    transform: translateY(-1px);
    background-color: #f0ead6;
  }
  .scene-nav button.current {
    background-color: var(--journal-forest, #1F3825);
    color: var(--journal-paper, #FAF6ED);
    border-color: var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    font-weight: 700;
  }
  .hero,
  .panel {
    background-color: #ffffff;
    border: 2.5px solid var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    box-shadow: 0 4px 0 var(--journal-ink, #1B2B1F);
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  h1 {
    font-size: 1.8rem;
    line-height: 1.25;
    font-family: var(--font-display, 'Fraunces', serif);
    color: var(--journal-forest, #1F3825);
  }
  .lead {
    font-size: 1.05rem;
    color: var(--journal-ink, #1B2B1F);
    font-family: var(--font-body, 'Figtree', sans-serif);
    max-width: 600px;
    line-height: 1.5;
  }
  .muted {
    font-size: 0.85rem;
    color: color-mix(in srgb, var(--journal-ink) 65%, transparent);
  }
  button.primary {
    align-self: flex-start;
    background-color: var(--journal-forest, #1F3825);
    color: var(--journal-paper, #FAF6ED);
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    padding: 10px 24px;
    border-radius: 999px;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.95rem;
    transition: transform 0.15s, background-color 0.15s;
  }
  button.primary:hover {
    background-color: #2d5237;
    transform: translateY(-1px);
    box-shadow: 0 4px 0 var(--journal-ink, #1B2B1F);
  }
  select {
    padding: 8px 14px;
    border-radius: 6px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    background-color: var(--journal-paper, #FAF6ED);
    color: var(--journal-ink, #1B2B1F);
    font-size: 0.95rem;
    font-weight: 600;
    max-width: 320px;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
  }
  .field-art {
    width: 100%;
    max-width: 640px;
    margin: 4px 0;
  }
  .field-art svg {
    display: block;
    width: 100%;
    max-height: 180px;
    border-radius: 6px;
    border: 2px solid var(--journal-ink, #1B2B1F);
  }
  .crop-details {
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 8px;
    background: var(--journal-paper, #FAF6ED);
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
  }
  .crop-details summary {
    cursor: pointer;
    padding: 10px 14px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--journal-ink, #1B2B1F);
    list-style: none;
  }
  .crop-details summary::-webkit-details-marker {
    display: none;
  }
  .crop-details summary::before {
    content: '▸';
    display: inline-block;
    width: 1.1em;
    color: var(--journal-forest, #1F3825);
  }
  .crop-details[open] summary::before {
    content: '▾';
  }
  .crop-details summary .muted {
    margin-left: 6px;
    font-weight: 400;
  }
  .crop-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 6px;
    padding: 0 12px 12px;
  }
  .crop-list li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: #ffffff;
    border: 1.5px solid color-mix(in srgb, var(--journal-ink) 35%, transparent);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    color: var(--journal-ink-soft, #2D4233);
  }
  .crop-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .crop-head strong {
    color: var(--journal-ink, #1B2B1F);
    font-size: 0.9rem;
  }
  .crop-facts {
    font-size: 0.75rem;
  }
  .crop-list .tag {
    flex: 0 0 auto;
    background-color: var(--journal-forest, #1F3825);
    color: var(--journal-paper, #FAF6ED);
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 0.68rem;
    font-weight: 700;
  }
  .horizon-toggle {
    display: flex;
    gap: 8px;
  }
  .horizon-toggle button {
    background: var(--journal-paper, #FAF6ED);
    border: 2px solid var(--journal-ink, #1B2B1F);
    color: var(--journal-ink, #1B2B1F);
    padding: 4px 14px;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
  }
  .horizon-toggle button.current {
    background-color: var(--journal-gold, #D98E16);
    color: var(--journal-ink, #1B2B1F);
    font-weight: 700;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .strat {
    background: #ffffff;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    border-radius: 8px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .strat h2 {
    font-size: 1.15rem;
    font-family: var(--font-display, 'Fraunces', serif);
    color: var(--journal-forest, #1F3825);
  }
  .meters {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  footer {
    text-align: center;
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--journal-ink) 70%, transparent);
    padding: 16px 0;
  }
  @media (max-width: 560px) {
    h1 {
      font-size: 1.3rem;
    }
    .hero,
    .panel {
      padding: 20px 16px;
    }
    .eyebrow {
      display: block;
      margin-left: 0;
    }
  }
</style>
