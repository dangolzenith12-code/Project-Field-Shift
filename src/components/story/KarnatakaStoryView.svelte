<script lang="ts">
  import type { FarmMeters } from '../../types/game';
  import { sfx } from '../../utils/sound';
  import { 
    DECCAN_CROPS, 
    type DeccanCrop, 
    type CatchmentSetup, 
    type WaterSource, 
    type MulchPractice,
    evaluateDeccanIntercrop, 
    evaluateKrishiHondiSetup, 
    evaluateClimateDilemmas,
    DECCAN_INITIAL_METERS 
  } from '../../lib/story/karnataka-rules';

  // High-resolution visual assets
  import bg1990 from '../../assets/bg_punjab_1990.png';
  import bg2026 from '../../assets/bg_punjab_2026.png';
  import bg2040 from '../../assets/bg_punjab_2040.png';
  import char1990 from '../../assets/char_bebe_1990.png';
  import char2026 from '../../assets/char_bebe_hari_2026.png';
  import char2040 from '../../assets/char_dada_grandchildren_2040.png';

  interface Props {
    onBackToRegions: () => void;
    onOpenOverworld?: () => void;
    onOpenJournal?: () => void;
    onOpenStrategies?: () => void;
    onOpenNasa?: () => void;
  }

  let { 
    onBackToRegions, 
    onOpenOverworld, 
    onOpenJournal, 
    onOpenStrategies, 
    onOpenNasa 
  }: Props = $props();

  // Story Game Stages
  type GameStage = 
    | '1990_INTRO_DIALOGUE' 
    | '1990_MINIGAME' 
    | '1990_FAIL_DIALOGUE'
    | '1990_SUCCESS_DIALOGUE'
    | '2026_INTRO_DIALOGUE' 
    | '2026_MINIGAME' 
    | '2026_FAIL_DIALOGUE'
    | '2026_SUCCESS_DIALOGUE'
    | '2040_INTRO_DIALOGUE' 
    | '2040_MINIGAME' 
    | '2040_FAIL_DIALOGUE'
    | '2040_SUCCESS_DIALOGUE'
    | 'FINAL_CHRONICLE';

  let stage = $state<GameStage>('1990_INTRO_DIALOGUE');

  // Narrative Beat Progressions
  let intro1990Beat = $state(0);
  let intro2026Beat = $state(0);
  let intro2040Beat = $state(0);

  // Farm Ecological Indicators (Deccan dryland baseline)
  let meters = $state<FarmMeters>({ ...DECCAN_INITIAL_METERS });

  // =========================================================================
  // ERA 1 (1990): DECCAN DRYLAND INTERCROPPING & STONE BUNDS
  // =========================================================================
  let row1Crop = $state<DeccanCrop>('ragi');
  let row2Crop = $state<DeccanCrop>('togari');
  let row3Crop = $state<DeccanCrop>('ragi');
  let row4Crop = $state<DeccanCrop>('avare');

  const selectedCrops1990 = $derived([row1Crop, row2Crop, row3Crop, row4Crop]);
  const legumeCount1990 = $derived(
    selectedCrops1990.filter(c => c === 'togari' || c === 'avare').length
  );
  const hybridCount1990 = $derived(
    selectedCrops1990.filter(c => c === 'hybrid_maize').length
  );

  const game1NetNitrogen = $derived(
    selectedCrops1990.reduce((acc, c) => acc + DECCAN_CROPS[c].nitrogenDelta, 0)
  );
  const game1TotalWater = $derived(
    selectedCrops1990.reduce((acc, c) => acc + DECCAN_CROPS[c].waterMm, 0)
  );

  // Success Criteria evaluated via pure agronomic engine
  const game1Eval = $derived(evaluateDeccanIntercrop(selectedCrops1990));

  function handleEvaluateGame1() {
    sfx.playSelect();
    if (game1Eval.isSuccess) {
      meters.nitrogen += 14;
      meters.organicMatter += 10;
      meters.soilMoisture += 8;
      meters.erosionRisk = Math.max(10, meters.erosionRisk - 14);
      stage = '1990_SUCCESS_DIALOGUE';
    } else {
      stage = '1990_FAIL_DIALOGUE';
    }
  }

  // =========================================================================
  // ERA 2 (2026): HARD-ROCK BOREWELLS & KRISHI HONDI (FARM POND)
  // =========================================================================
  let catchmentSetup = $state<CatchmentSetup>('bare_channel');
  let waterSource = $state<WaterSource>('deep_borewell_1000ft');
  let mulchPractice = $state<MulchPractice>('bare_exposed');

  const game2AllSelected = $derived(Boolean(catchmentSetup && waterSource && mulchPractice));
  const game2Eval = $derived(evaluateKrishiHondiSetup(catchmentSetup, waterSource, mulchPractice));

  function handleEvaluateGame2() {
    sfx.playSelect();
    if (game2Eval.isSuccess) {
      meters.soilMoisture = 58;
      meters.organicMatter = 54;
      meters.nitrogen = 68;
      meters.erosionRisk = 16;
      stage = '2026_SUCCESS_DIALOGUE';
    } else {
      stage = '2026_FAIL_DIALOGUE';
    }
  }

  // =========================================================================
  // ERA 3 (2040): +2.2°C DRYLAND WARMING & MILLET SOVEREIGNTY
  // =========================================================================
  let k1Answer = $state<number | null>(null);
  let k2Answer = $state<number | null>(null);
  let k3Answer = $state<number | null>(null);

  const game3AllAnswered = $derived(k1Answer !== null && k2Answer !== null && k3Answer !== null);
  const game3Eval = $derived(evaluateClimateDilemmas([k1Answer, k2Answer, k3Answer]));

  function handleEvaluateGame3() {
    sfx.playSelect();
    if (game3Eval.isSuccess) {
      meters.soilMoisture = 65;
      meters.organicMatter = 62;
      meters.nitrogen = 78;
      meters.erosionRisk = 12;
      stage = '2040_SUCCESS_DIALOGUE';
    } else {
      stage = '2040_FAIL_DIALOGUE';
    }
  }

  // Restart Story
  function restartAll() {
    sfx.playSelect();
    stage = '1990_INTRO_DIALOGUE';
    intro1990Beat = 0;
    intro2026Beat = 0;
    intro2040Beat = 0;
    row1Crop = 'ragi';
    row2Crop = 'togari';
    row3Crop = 'ragi';
    row4Crop = 'avare';
    catchmentSetup = 'bare_channel';
    waterSource = 'deep_borewell_1000ft';
    mulchPractice = 'bare_exposed';
    k1Answer = null;
    k2Answer = null;
    k3Answer = null;
    meters = { ...DECCAN_INITIAL_METERS };
  }
</script>

<!-- LITERAL FULLSCREEN EDGE-TO-EDGE VIEWPORT -->
<div class="fullscreen-story-game">
  <!-- Minimalist Top HUD Bar: Strictly Icon-Only Buttons -->
  <div class="game-hud-top">
    <div class="icon-buttons-group">
      <!-- Go Back (Icon only) -->
      <button 
        type="button" 
        class="icon-hud-btn" 
        onclick={onBackToRegions} 
        aria-label="Back"
        title="Exit to Regions"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <!-- Restart (Icon only) -->
      <button 
        type="button" 
        class="icon-hud-btn" 
        onclick={restartAll} 
        aria-label="Restart"
        title="Restart Karnataka Chronicle"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
    </div>

    <!-- Mini Glass Ecological Meter Indicators (STRICTLY NO COINS) -->
    <div class="meters-glass-pill font-data">
      <span>Moisture {meters.soilMoisture}%</span>
      <span class="dot">·</span>
      <span>SOM {meters.organicMatter}%</span>
      <span class="dot">·</span>
      <span>Nitrogen {meters.nitrogen}%</span>
    </div>
  </div>

  <!-- FULLSCREEN HIGH-RES SCENIC BACKGROUND BY ERA WITH DECCAN RED-EARTH WARMTH -->
  <div class="scenic-background-container">
    {#if stage.startsWith('1990')}
      <img src={bg1990} alt="Deccan Plateau 1990 Landscape" class="fullscreen-bg-img karnataka-tint" />
    {:else if stage.startsWith('2026')}
      <img src={bg2026} alt="Deccan Plateau 2026 Dryland Field" class="fullscreen-bg-img karnataka-tint" />
    {:else}
      <img src={bg2040} alt="Deccan Plateau 2040 Millets Ridge" class="fullscreen-bg-img karnataka-tint" />
    {/if}
    <div class="bg-vignette-overlay deccan-overlay"></div>
  </div>

  <!-- GROUNDED CHARACTER SPRITE (CENTERED ON SOIL PLANE, GENTLE BOBBING) -->
  <div class="grounded-character-container" aria-hidden="true">
    {#if stage.startsWith('1990')}
      <img src={char1990} alt="Young Gowri & Ajja Thimmegowda (1990)" class="character-sprite" />
    {:else if stage.startsWith('2026')}
      <img src={char2026} alt="Elder Gowri & Engineer Chetan (2026)" class="character-sprite" />
    {:else}
      <img src={char2040} alt="Ajji Gowri with Ananya and Tejas (2040)" class="character-sprite" />
    {/if}
  </div>

  <!-- ========================================================================= -->
  <!-- 1. 1990 STORY INTRO (AJJA THIMMEGOWDA & THE ANCESTRAL KANAJA SILO) -->
  <!-- ========================================================================= -->
  {#if stage === '1990_INTRO_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Ajja Thimmegowda (1990)</div>

        {#if intro1990Beat === 0}
          <p class="prompt-text font-body">
            “Feel this red gravel between your fingers, Gowri. Our Deccan soil is not like the soft silt of river valleys. It is hot, iron-rich, and thin over basalt rock. When the Mungaru monsoon clouds drift from the Western Ghats, they drop their rain quickly. If you do not hold the water behind our stone bunds, it runs off to the stream before noon.”
          </p>
          <div class="inner-thought font-body">
            *He taps the woven bamboo Kanaja grain silo in the courtyard, sealed with red earth and cow dung. Inside, heirloom Finger Millet (Hallu Ragi) seeds rest cool and dry, protected from weevils by dried neem branches.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro1990Beat = 1; }}
            >
              “Why do the seed merchants tell us to abandon Ragi for hybrid maize, Ajja?” →
            </button>
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro1990Beat = 1; }}
            >
              “How long can Ragi grains sleep inside the Kanaja without spoiling?” →
            </button>
          </div>
        {:else if intro1990Beat === 1}
          <p class="prompt-text font-body">
            “Hybrid maize promises fast paper money from cattle feed mills, but it drinks two seasons of rain in six weeks. If a twenty-day dry spell strikes in August, maize leaves curl like dry cigar wrappers. But Ragi and Togari red gram? Their roots are sisters. Togari drives a taproot six feet deep into bedrock fractures to find subterranean sips, while Ragi weaves a dense net of silica roots that holds the topsoil against flash downpours.”
          </p>
          <div class="inner-thought font-body">
            *He holds out two seeds: a dark crimson pebble of Finger Millet and a plump cream Togari pod. The smell of eucalyptus smoke drifts from the neighboring farm where a new diesel pump chugs.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro1990Beat = 2; }}
            >
              “Show me how to arrange our rows, Ajja.” →
            </button>
          </div>
        {:else}
          <p class="prompt-text font-body">
            “Listen well, child. On our terraced slope, never plant a single crop wall-to-wall. Alternate our rows: for every four lines of Finger Millet, sow one line of deep-rooted Togari or trailing Avare field bean. The legumes catch atmospheric nitrogen from the sky and feed the millet through root exudates. Sow the grid now—and keep chemical monoculture off our ancestral bunds!”
          </p>
          <button 
            type="button" 
            class="start-interactive-btn font-display"
            onclick={() => { sfx.playSuccess(); stage = '1990_MINIGAME'; }}
          >
            Sow the Deccan 4-Row Intercrop Grid →
          </button>
        {/if}
      </div>
    </div>

  <!-- 1990 INTERACTIVE MINIGAME: DECCAN 4-ROW STRIP ALLOCATION -->
  {:else if stage === '1990_MINIGAME'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Tactical Exercise: The 4-Row Deccan Intercrop</div>
        <p class="prompt-instruction font-body">
          Assign each terraced contour row. To pass Ajja's evaluation, include <strong>at least two nitrogen-fixing dryland legumes (Togari or Avare)</strong> and <strong>zero chemical hybrid maize monoculture</strong>.
        </p>
      </div>

      <div class="plots-grid-container">
        <!-- Row 1 -->
        <div class="plot-column-card">
          <div class="plot-label font-display">Row 1 (Upper Ridge)</div>
          <select bind:value={row1Crop} class="crop-select font-body">
            {#each Object.values(DECCAN_CROPS) as crop}
              <option value={crop.id}>{crop.name} ({crop.tag})</option>
            {/each}
          </select>
          <div class="crop-stat-preview font-data">
            <span>Water: {DECCAN_CROPS[row1Crop].waterMm}mm</span>
            <span class={DECCAN_CROPS[row1Crop].nitrogenDelta >= 0 ? 'pos' : 'neg'}>
              N: {DECCAN_CROPS[row1Crop].nitrogenDelta >= 0 ? '+' : ''}{DECCAN_CROPS[row1Crop].nitrogenDelta}
            </span>
          </div>
        </div>

        <!-- Row 2 -->
        <div class="plot-column-card">
          <div class="plot-label font-display">Row 2 (Legume Companion)</div>
          <select bind:value={row2Crop} class="crop-select font-body">
            {#each Object.values(DECCAN_CROPS) as crop}
              <option value={crop.id}>{crop.name} ({crop.tag})</option>
            {/each}
          </select>
          <div class="crop-stat-preview font-data">
            <span>Water: {DECCAN_CROPS[row2Crop].waterMm}mm</span>
            <span class={DECCAN_CROPS[row2Crop].nitrogenDelta >= 0 ? 'pos' : 'neg'}>
              N: {DECCAN_CROPS[row2Crop].nitrogenDelta >= 0 ? '+' : ''}{DECCAN_CROPS[row2Crop].nitrogenDelta}
            </span>
          </div>
        </div>

        <!-- Row 3 -->
        <div class="plot-column-card">
          <div class="plot-label font-display">Row 3 (Contour Swale)</div>
          <select bind:value={row3Crop} class="crop-select font-body">
            {#each Object.values(DECCAN_CROPS) as crop}
              <option value={crop.id}>{crop.name} ({crop.tag})</option>
            {/each}
          </select>
          <div class="crop-stat-preview font-data">
            <span>Water: {DECCAN_CROPS[row3Crop].waterMm}mm</span>
            <span class={DECCAN_CROPS[row3Crop].nitrogenDelta >= 0 ? 'pos' : 'neg'}>
              N: {DECCAN_CROPS[row3Crop].nitrogenDelta >= 0 ? '+' : ''}{DECCAN_CROPS[row3Crop].nitrogenDelta}
            </span>
          </div>
        </div>

        <!-- Row 4 -->
        <div class="plot-column-card">
          <div class="plot-label font-display">Row 4 (Stone Bund Basin)</div>
          <select bind:value={row4Crop} class="crop-select font-body">
            {#each Object.values(DECCAN_CROPS) as crop}
              <option value={crop.id}>{crop.name} ({crop.tag})</option>
            {/each}
          </select>
          <div class="crop-stat-preview font-data">
            <span>Water: {DECCAN_CROPS[row4Crop].waterMm}mm</span>
            <span class={DECCAN_CROPS[row4Crop].nitrogenDelta >= 0 ? 'pos' : 'neg'}>
              N: {DECCAN_CROPS[row4Crop].nitrogenDelta >= 0 ? '+' : ''}{DECCAN_CROPS[row4Crop].nitrogenDelta}
            </span>
          </div>
        </div>
      </div>

      <!-- Live Telemetry Readout -->
      <div class="grid-telemetry-strip font-data">
        <div class="telemetry-chip">
          <span class="label">Legume Companions:</span>
          <span class="val {legumeCount1990 >= 2 ? 'good' : 'warn'}">{legumeCount1990} / 2 required</span>
        </div>
        <div class="telemetry-chip">
          <span class="label">Total Water Demand:</span>
          <span class="val">{game1TotalWater} mm</span>
        </div>
        <div class="telemetry-chip">
          <span class="label">Net Biological Nitrogen:</span>
          <span class="val {game1NetNitrogen >= 20 ? 'good' : 'warn'}">
            {game1NetNitrogen >= 0 ? '+' : ''}{game1NetNitrogen} kg/ha
          </span>
        </div>
      </div>

      <div class="card-action-footer">
        <button 
          type="button" 
          class="submit-allocation-btn font-display"
          onclick={handleEvaluateGame1}
        >
          Confirm Deccan Intercrop Grid →
        </button>
      </div>
    </div>

  <!-- 1990 FAILURE LOOP: AJJA REPRIMANDS PLAYER -->
  {:else if stage === '1990_FAIL_DIALOGUE'}
    <div class="minigame-floating-card reprimand-card">
      <div class="card-prompt-head">
        <div class="speaker-tag fail-tag font-display">Ajja Thimmegowda Halts the Bullock Plow!</div>
        <p class="prompt-text font-body">
          “Gowri! Stop the bullocks right there! Did you hear nothing of what our ancestors carved into these stone terraces? You filled our rows with thirsty commercial maize and left out the Togari and Avare legumes! When the sun bakes this red gravel in August, there will be no deep roots to mine moisture, and the soil will starve for nitrogen. Red earth cannot be bullied with chemical sacks. Reset the rows properly!”
        </p>
        <div class="inner-thought font-body">
          *He points angrily to the clods turning bone-white under the midday sun. Dust blows across the exposed contours where no trailing foliage holds the earth.*
        </div>
        <button 
          type="button" 
          class="try-again-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '1990_MINIGAME'; }}
        >
          Adjust Intercrop Rows →
        </button>
      </div>
    </div>

  <!-- 1990 SUCCESS REFLECTION -->
  {:else if stage === '1990_SUCCESS_DIALOGUE'}
    <div class="minigame-floating-card success-card">
      <div class="card-prompt-head">
        <div class="speaker-tag success-tag font-display">Living Soil Harmony (1990)</div>
        <p class="prompt-text font-body">
          “Look here, child,” Ajja smiles, kneeling down by the third contour furrow. He digs his bare hands six inches into the red loam and breaks open a clod. “Moist and cool, even after twelve rainless days. The Togari taproots have pierced through the shallow stone layer, and look at these tiny root nodules—pink as pomegranate seeds inside. That is living leghemoglobin, drinking atmospheric nitrogen without a single bag of synthetic urea.”
        </p>
        <div class="inner-thought font-body">
          *He pours a handful of red ragi grains back into the woven bamboo Kanaja silo and marks the wooden rim with a sacred turmeric swipe. Thirty-six years will pass before the next great trial.*
        </div>
        <button 
          type="button" 
          class="era-jump-btn font-display"
          onclick={() => { sfx.playSuccess(); stage = '2026_INTRO_DIALOGUE'; }}
        >
          Step Forward to 2026: The Hard-Rock Borewell Crisis →
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 2. 2026 STORY INTRO (CHETAN & THE 1,200-FT BASALT DRILLING CRISIS) -->
  <!-- ========================================================================= -->
  {:else if stage === '2026_INTRO_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Elder Gowri & Adult Chetan (2026)</div>

        {#if intro2026Beat === 0}
          <p class="prompt-text font-body">
            “Chetan, you left for Bangalore to study hydrology, but look at our village today. Three drill rigs are hammering into the granite day and night. The Sharma brothers drilled to nine hundred feet and hit dry sulfur dust. Our ancestral well dried up in 2012. Now, private drillers want forty thousand rupees to punch down to twelve hundred feet into crystalline basalt rock!”
          </p>
          <div class="inner-thought font-body">
            *Chetan unpacks his satellite telemetry receiver on the stone Katte. The display links to NASA GRACE gravimetry satellites and SMAP radiometers, showing deep red groundwater depletion anomalies across the southern peninsula.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2026Beat = 1; }}
            >
              “What does the NASA GRACE satellite show for our district, Chetan?” →
            </button>
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2026Beat = 1; }}
            >
              “Why does 1,200-foot borewell water taste bitter and leave white crust on leaves?” →
            </button>
          </div>
        {:else if intro2026Beat === 1}
          <p class="prompt-text font-body">
            “Amma, NASA GRACE satellite gravimetry confirms that peninsular India’s hard-rock groundwater is depleting at −2.8 cm equivalent water depth every single year. Worse, drilling deeper into fractured basalt leaches toxic fluoride and heavy iron. Deep borewells are not recharge aquifers—they are fossil water pockets that take ten thousand years to replenish. We cannot drill our way out of a drought.”
          </p>
          <div class="inner-thought font-body">
            *He points down the natural valley contour toward an eroded depression where monsoon flash floods carve deep gullies every September, carrying topsoil away to the river.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2026Beat = 2; }}
            >
              “Then what engineering design can save our red soil, Chetan?” →
            </button>
          </div>
        {:else}
          <p class="prompt-text font-body">
            “We revive Ajja’s logic with modern dryland engineering: a Krishi Hondi farm pond! We excavate a catchment pond with a stone silt-trap inlet, dig contour recharge trenches (Varambugalu) along the slopes, and connect gravity micro-drip pipes directly to our ragi roots. When the cloudbursts strike, we trap four lakh liters of clean surface water instead of chasing toxic basalt dust!”
          </p>
          <button 
            type="button" 
            class="start-interactive-btn font-display"
            onclick={() => { sfx.playSuccess(); stage = '2026_MINIGAME'; }}
          >
            Calibrate the Krishi Hondi Catchment System →
          </button>
        {/if}
      </div>
    </div>

  <!-- 2026 INTERACTIVE MINIGAME: KRISHI HONDI & SILT-TRAP CALIBRATION -->
  {:else if stage === '2026_MINIGAME'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Engineering Exercise: Catchment & Irrigation Calibration</div>
        <p class="prompt-instruction font-body">
          Select the correct combination: <strong>Krishi Hondi with Silt-Trap Inlet</strong>, <strong>Pond Gravity Drip</strong>, and <strong>In-Situ Ragi Straw Mulch</strong> to prevent red soil crusting and halt deep borewell cavitation.
        </p>
      </div>

      <div class="calibration-options-grid">
        <!-- 1. Catchment Infrastructure -->
        <div class="calibration-group">
          <span class="group-title font-display">1. Runoff Catchment Infrastructure</span>
          <div class="radio-pill-stack font-body">
            <label class="pill-option {catchmentSetup === 'bare_channel' ? 'selected' : ''}">
              <input type="radio" bind:group={catchmentSetup} value="bare_channel" />
              <span>Bare unlined channel (High silt erosion wash)</span>
            </label>
            <label class="pill-option {catchmentSetup === 'trench_bund' ? 'selected' : ''}">
              <input type="radio" bind:group={catchmentSetup} value="trench_bund" />
              <span>Earthen contour bunds only (No storage basin)</span>
            </label>
            <label class="pill-option {catchmentSetup === 'silt_pond' ? 'selected' : ''}">
              <input type="radio" bind:group={catchmentSetup} value="silt_pond" />
              <span>Krishi Hondi Farm Pond with Stone Silt-Trap Inlet (Recommended)</span>
            </label>
          </div>
        </div>

        <!-- 2. Water Delivery Method -->
        <div class="calibration-group">
          <span class="group-title font-display">2. Irrigation Water Source</span>
          <div class="radio-pill-stack font-body">
            <label class="pill-option {waterSource === 'deep_borewell_1000ft' ? 'selected' : ''}">
              <input type="radio" bind:group={waterSource} value="deep_borewell_1000ft" />
              <span>1,200-ft Deep Basalt Borewell (High fluoride / motor dry-spin risk)</span>
            </label>
            <label class="pill-option {waterSource === 'krishi_hondi_drip' ? 'selected' : ''}">
              <input type="radio" bind:group={waterSource} value="krishi_hondi_drip" />
              <span>Krishi Hondi Gravity Micro-Drip (65% Water Savings, zero power)</span>
            </label>
            <label class="pill-option {waterSource === 'diesel_tanker' ? 'selected' : ''}">
              <input type="radio" bind:group={waterSource} value="diesel_tanker" />
              <span>Commercial Water Tankers on Credit (Heavy recurring debt)</span>
            </label>
          </div>
        </div>

        <!-- 3. Ground Mulching -->
        <div class="calibration-group">
          <span class="group-title font-display">3. Soil Surface Mulch Practice</span>
          <div class="radio-pill-stack font-body">
            <label class="pill-option {mulchPractice === 'bare_exposed' ? 'selected' : ''}">
              <input type="radio" bind:group={mulchPractice} value="bare_exposed" />
              <span>Bare Exposed Red Clods (Subject to severe sun baking)</span>
            </label>
            <label class="pill-option {mulchPractice === 'ragi_straw_mulch' ? 'selected' : ''}">
              <input type="radio" bind:group={mulchPractice} value="ragi_straw_mulch" />
              <span>In-situ Ragi Straw Mulch (Lowers surface temp by 4°C, retains moisture)</span>
            </label>
          </div>
        </div>
      </div>

      <div class="card-action-footer">
        <button 
          type="button" 
          class="submit-allocation-btn font-display"
          onclick={handleEvaluateGame2}
        >
          Deploy Catchment Calibration →
        </button>
      </div>
    </div>

  <!-- 2026 FAILURE LOOP: ELDER GOWRI REPRIMANDS CHETAN -->
  {:else if stage === '2026_FAIL_DIALOGUE'}
    <div class="minigame-floating-card reprimand-card">
      <div class="card-prompt-head">
        <div class="speaker-tag fail-tag font-display">Elder Gowri Halts the Works!</div>
        <p class="prompt-text font-body">
          “Chetan, you brought your engineering degree from Bangalore but left your common sense on the highway! You bypassed the silt trap or tried to rely on that dry twelve-hundred-foot basalt borewell! Now our pond inlet is choking on red gravel silt, the water pump is grinding dry sand, and the topsoil is baking into ceramic tile under the heat. A farm pond without a silt trap is just a mud hole. Go back and calibrate the system properly!”
        </p>
        <div class="inner-thought font-body">
          *The dry summer wind howls across the Deccan ridge. Down in the valley, the neighbor's diesel pump screeches as it draws air and silt.*
        </div>
        <button 
          type="button" 
          class="try-again-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2026_MINIGAME'; }}
        >
          Re-calibrate Farm Pond & Drip →
        </button>
      </div>
    </div>

  <!-- 2026 SUCCESS REFLECTION -->
  {:else if stage === '2026_SUCCESS_DIALOGUE'}
    <div class="minigame-floating-card success-card">
      <div class="card-prompt-head">
        <div class="speaker-tag success-tag font-display">Deccan Catchment Mastered (2026)</div>
        <p class="prompt-text font-body">
          “Look at the silt trap, Chetan,” Elder Gowri whispers with pride. The stone weir has captured forty cartloads of rich fertile sediment while clear rainwater fills the four-lakh-liter Krishi Hondi pond to its brim. Gravity drip tubes feed each row of Finger Millet and Red Gram drop-by-drop without a single drop of diesel burned.
        </p>
        <div class="inner-thought font-body">
          *NASA SMAP telemetry shows root-zone wetness stabilizing at 0.58. Dragonflies skim the clear surface of the farm pond as evening bells chime from the village temple.*
        </div>
        <button 
          type="button" 
          class="era-jump-btn font-display"
          onclick={() => { sfx.playSuccess(); stage = '2040_INTRO_DIALOGUE'; }}
        >
          Step Forward to 2040: The +2.2°C Dryland Anomaly →
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 3. 2040 STORY INTRO (AJJI GOWRI WITH GRANDCHILDREN ANANYA & TEJAS) -->
  <!-- ========================================================================= -->
  {:else if stage === '2040_INTRO_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Ajji Gowri with Grandchildren Ananya & Tejas (2040)</div>

        {#if intro2040Beat === 0}
          <p class="prompt-text font-body">
            “Come sit beside me under this tamarind shade, Ananya, Tejas. Look at our weather station display. NASA POWER shows our regional temperature anomaly has reached +2.2°C above my grandfather’s time. The June monsoon rains that once arrived like clockwork now linger thirty days over the Arabian Sea. But look at our fields—not a single acre is barren.”
          </p>
          <div class="inner-thought font-body">
            *Ten-year-old Ananya cradles a cluster of copper-red Finger Millet ears, examining the plump grain heads. In the valley below, community solar panels hum quietly, powering the village drip grid.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2040Beat = 1; }}
            >
              “Ajji, why did the neighboring corporate farms lose their entire harvest last month?” →
            </button>
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2040Beat = 1; }}
            >
              “How does our community seed bank protect us from 42°C heatwaves?” →
            </button>
          </div>
        {:else if intro2040Beat === 1}
          <p class="prompt-text font-body">
            “The corporate contract farms signed credit agreements for single-use proprietary hybrid seeds that demanded chemical fertilizers and daily watering. When the July heatwave touched forty-two degrees, their hybrid roots shriveled within five days. But our village cooperative preserved indigenous dryland landraces—Hallu Ragi, ML-365, and GPU-28. Our millets have thick waxy leaf coatings and deep silica roots that wait patiently in dry soil until the cloudburst arrives.”
          </p>
          <div class="inner-thought font-body">
            *Tejas points to the village millet mill where solar power grinds fresh ragi flour for direct delivery to schools and cooperative bakeries across the taluk.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2040Beat = 2; }}
            >
              “How do we make our final generational pledge, Ajji?” →
            </button>
          </div>
        {:else}
          <p class="prompt-text font-body">
            “You will take our three final tests of dryland stewardship. An agricultural model must never replace your judgment—it must illuminate the trade-offs so you can stand sovereign on your own soil. Choose with wisdom!”
          </p>
          <button 
            type="button" 
            class="start-interactive-btn font-display"
            onclick={() => { sfx.playSuccess(); stage = '2040_MINIGAME'; }}
          >
            Resolve the 2040 Dryland Sovereignty Dilemmas →
          </button>
        {/if}
      </div>
    </div>

  <!-- 2040 INTERACTIVE MINIGAME: CLIMATE SOVEREIGNTY DILEMMAS -->
  {:else if stage === '2040_MINIGAME'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Generational Wisdom Exercise (2040 Dilemmas)</div>
        <p class="prompt-instruction font-body">
          Resolve the three core dilemmas of dryland climate adaptation. Select the agroecological and sovereign path for each scenario.
        </p>
      </div>

      <div class="dilemmas-stack font-body">
        <!-- Dilemma 1 -->
        <div class="dilemma-card">
          <div class="dilemma-title font-display">1. Delayed Monsoon Sowing Window</div>
          <p class="dilemma-desc">
            NASA POWER forecasts a 35-day monsoon delay. Seed companies urge sowing thirsty high-yield maize immediately on credit.
          </p>
          <div class="dilemma-choices">
            <button 
              type="button" 
              class="dilemma-btn {k1Answer === 0 ? 'selected-wrong' : ''}"
              onclick={() => { sfx.playSelect(); k1Answer = 0; }}
            >
              Sow commercial maize on credit with tanker water (High debt exposure)
            </button>
            <button 
              type="button" 
              class="dilemma-btn {k1Answer === 1 ? 'selected-correct' : ''}"
              onclick={() => { sfx.playSelect(); k1Answer = 1; }}
            >
              Wait for pre-sowing rain and drill indigenous short-duration Ragi (ML-365) + Cowpea
            </button>
          </div>
        </div>

        <!-- Dilemma 2 -->
        <div class="dilemma-card">
          <div class="dilemma-title font-display">2. Community Water Allocation in Dry Spells</div>
          <p class="dilemma-desc">
            A 22-day mid-monsoon dry spell strikes in August. How should the village cooperative ration Krishi Hondi water?
          </p>
          <div class="dilemma-choices">
            <button 
              type="button" 
              class="dilemma-btn {k2Answer === 0 ? 'selected-wrong' : ''}"
              onclick={() => { sfx.playSelect(); k2Answer = 0; }}
            >
              Run full flood irrigation on cash crops until pond is completely empty
            </button>
            <button 
              type="button" 
              class="dilemma-btn {k2Answer === 1 ? 'selected-correct' : ''}"
              onclick={() => { sfx.playSelect(); k2Answer = 1; }}
            >
              Meter solar micro-drip pulses at 2 liters/plant during dawn and twilight only
            </button>
          </div>
        </div>

        <!-- Dilemma 3 -->
        <div class="dilemma-card">
          <div class="dilemma-title font-display">3. Model Ethics & Decision Sovereignty</div>
          <p class="dilemma-desc">
            A commercial AI advisory algorithm commands the village to clear indigenous tamarind trees for solar trackers.
          </p>
          <div class="dilemma-choices">
            <button 
              type="button" 
              class="dilemma-btn {k3Answer === 0 ? 'selected-wrong' : ''}"
              onclick={() => { sfx.playSelect(); k3Answer = 0; }}
            >
              Follow the automated algorithm blindly and clear ancestral shade trees
            </button>
            <button 
              type="button" 
              class="dilemma-btn {k3Answer === 1 ? 'selected-correct' : ''}"
              onclick={() => { sfx.playSelect(); k3Answer = 1; }}
            >
              Uphold principle: 'Field Shift supports farmers, it does not replace their judgment.'
            </button>
          </div>
        </div>
      </div>

      <div class="card-action-footer">
        <button 
          type="button" 
          class="submit-allocation-btn font-display"
          disabled={!game3AllAnswered}
          onclick={handleEvaluateGame3}
        >
          Submit Generational Resolutions →
        </button>
      </div>
    </div>

  <!-- 2040 FAILURE LOOP: AJJI GOWRI REPRIMANDS PLAYER -->
  {:else if stage === '2040_FAIL_DIALOGUE'}
    <div class="minigame-floating-card reprimand-card">
      <div class="card-prompt-head">
        <div class="speaker-tag fail-tag font-display">Ajji Gowri Corrects the Resolutions!</div>
        <p class="prompt-text font-body">
          “Children, listen to the dry wind through the millet heads! If you buy proprietary seeds on credit or empty our farm pond with flood pipes in an August drought, you repeat the very errors that bankrupted our neighbors thirty years ago. And never surrender your judgment to an automated computer screen. The soil is living—consult local knowledge and the satellite evidence together. Try the dilemmas again!”
        </p>
        <button 
          type="button" 
          class="try-again-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2040_MINIGAME'; }}
        >
          Re-evaluate Dilemmas →
        </button>
      </div>
    </div>

  <!-- 2040 SUCCESS DIALOGUE -->
  {:else if stage === '2040_SUCCESS_DIALOGUE'}
    <div class="minigame-floating-card success-card">
      <div class="card-prompt-head">
        <div class="speaker-tag success-tag font-display">The Sovereign Deccan Harvest (2040)</div>
        <p class="prompt-text font-body">
          “You have chosen like true stewards of the red soil,” Ajji Gowri says softly, her eyes shining in the sunset glow. Ananya and Tejas tie two sacred sheaves of golden Finger Millet to the veranda pillar for the birds, following the ancient custom of the Sankranti harvest festival.
        </p>
        <div class="inner-thought font-body">
          *The village farm pond gleams in the evening twilight. The soil organic matter has doubled over fifty years, turning parched red gravel into a living, resilient sponge that breathes with every rain.*
        </div>
        <button 
          type="button" 
          class="era-jump-btn font-display"
          onclick={() => { sfx.playSuccess(); stage = 'FINAL_CHRONICLE'; }}
        >
          View 50-Year Karnataka Agroecological Chronicle →
        </button>
      </div>
    </div>

  <!-- FINAL CHRONICLE SUMMARY -->
  {:else if stage === 'FINAL_CHRONICLE'}
    <div class="minigame-floating-card chronicle-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Fifty Years on the Deccan Plateau (1990–2040)</div>
        <h2 class="chronicle-title font-display">The Red Soil of Amma’s Field</h2>
      </div>

      <div class="chronicle-metrics-grid font-data">
        <div class="metric-box">
          <span class="m-label">Soil Sponge (SOM)</span>
          <span class="m-val highlight">42% → 62%</span>
          <span class="m-sub">+20,000 gal/acre water retention</span>
        </div>
        <div class="metric-box">
          <span class="m-label">Aquifer Protection</span>
          <span class="m-val highlight">Krishi Hondi</span>
          <span class="m-sub">Replaced 1,200ft deep borewells</span>
        </div>
        <div class="metric-box">
          <span class="m-label">Biological Nitrogen</span>
          <span class="m-val highlight">78 kg/ha</span>
          <span class="m-sub">Fixed by Togari & Avare legumes</span>
        </div>
        <div class="metric-box">
          <span class="m-label">Seed Sovereignty</span>
          <span class="m-val highlight">100% Native</span>
          <span class="m-sub">GPU-28 & Hallu Ragi landraces</span>
        </div>
      </div>

      <div class="chronicle-quote font-body">
        “A field holds more than one season. When we listen to indigenous memory and examine satellite observations together, we do not conquer nature—we learn her rhythm.”
      </div>

      <div class="card-action-footer chronicle-actions">
        <button 
          type="button" 
          class="submit-allocation-btn secondary font-display"
          onclick={restartAll}
        >
          ↺ Replay Story & Minigames
        </button>
        {#if onOpenOverworld}
          <button 
            type="button" 
            class="submit-allocation-btn secondary font-display"
            onclick={onOpenOverworld}
          >
            Launch GBA Overworld →
          </button>
        {/if}
        <button 
          type="button" 
          class="submit-allocation-btn font-display"
          onclick={onBackToRegions}
        >
          Return to Region Showcase →
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Edge-to-Edge Fixed Viewport */
  .fullscreen-story-game {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    overflow: hidden;
    background-color: #0F1710;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  }

  /* Top Minimalist Glass HUD */
  .game-hud-top {
    position: absolute;
    top: 14px;
    left: 18px;
    right: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 50;
    pointer-events: auto;
  }

  .icon-buttons-group {
    display: flex;
    gap: 10px;
  }

  .icon-hud-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(15, 23, 16, 0.75);
    border: 1.8px solid rgba(255, 255, 255, 0.35);
    color: #FAF6ED;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: transform var(--fast), background-color var(--fast);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .icon-hud-btn:hover {
    transform: translateY(-2px);
    background: rgba(31, 56, 37, 0.9);
    border-color: #E5A93C;
  }

  .meters-glass-pill {
    background: rgba(15, 23, 16, 0.75);
    border: 1.8px solid rgba(229, 169, 60, 0.5);
    border-radius: 30px;
    padding: 8px 18px;
    color: #FAF6ED;
    font-size: 0.85rem;
    font-weight: 600;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .meters-glass-pill .dot {
    color: #E5A93C;
  }

  /* Scenic Backgrounds */
  .scenic-background-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .fullscreen-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .karnataka-tint {
    filter: sepia(0.2) saturate(1.2) brightness(0.92);
  }

  .bg-vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 35%, rgba(15, 23, 16, 0.75) 100%),
                linear-gradient(to top, rgba(15, 23, 16, 0.9) 0%, transparent 40%);
    pointer-events: none;
  }

  .deccan-overlay {
    background: radial-gradient(circle at center, transparent 30%, rgba(35, 18, 10, 0.7) 100%),
                linear-gradient(to top, rgba(20, 10, 5, 0.9) 0%, transparent 45%);
  }

  /* Grounded Character Placement */
  .grounded-character-container {
    position: absolute;
    bottom: clamp(170px, 30vh, 320px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    pointer-events: none;
    max-height: 48vh;
  }

  .character-sprite {
    max-height: 46vh;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.65));
    animation: gentleBob 3.5s ease-in-out infinite alternate;
  }

  @keyframes gentleBob {
    from { transform: translateY(0); }
    to { transform: translateY(-6px); }
  }

  /* Floating Bottom Narrative & Minigame Card */
  .minigame-floating-card {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: min(860px, 94vw);
    max-height: 52vh;
    overflow-y: auto;
    background: rgba(250, 246, 237, 0.96);
    border: 3.5px solid #1F3825;
    border-radius: var(--radius);
    padding: var(--space-4);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
    z-index: 30;
    color: #0F1710;
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .reprimand-card {
    border-color: #8B261D;
    background: rgba(254, 242, 242, 0.97);
  }

  .success-card {
    border-color: #1F3825;
    background: rgba(240, 253, 244, 0.97);
  }

  .chronicle-card {
    border-color: #E5A93C;
    background: rgba(250, 246, 237, 0.98);
  }

  .speaker-tag {
    font-size: 1.15rem;
    font-weight: bold;
    color: #1F3825;
    margin-bottom: 6px;
    border-bottom: 2px solid #E5A93C;
    padding-bottom: 4px;
    display: inline-block;
  }

  .speaker-tag.fail-tag {
    color: #8B261D;
    border-color: #8B261D;
  }

  .speaker-tag.success-tag {
    color: #166534;
    border-color: #166534;
  }

  .prompt-text {
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 0;
    color: #1A2E20;
  }

  .prompt-instruction {
    font-size: 0.92rem;
    color: #4A5568;
    margin: 4px 0 0 0;
  }

  .inner-thought {
    font-style: italic;
    color: #6B4E38;
    font-size: 0.92rem;
    margin-top: 8px;
    border-left: 3px solid #E5A93C;
    padding-left: 10px;
  }

  .story-choice-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
  }

  .story-reply-btn {
    background: #FAF6ED;
    border: 1.8px solid #1F3825;
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    text-align: left;
    font-size: 0.95rem;
    cursor: pointer;
    color: #0F1710;
    transition: transform var(--fast), background var(--fast);
  }

  .story-reply-btn:hover {
    transform: translateX(4px);
    background: color-mix(in srgb, #E5A93C 30%, #FAF6ED);
    border-color: #E5A93C;
  }

  .start-interactive-btn, .submit-allocation-btn, .try-again-btn, .era-jump-btn {
    background: #E5A93C;
    color: #0F1710;
    border: 2.5px solid #0F1710;
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 0 #0F1710;
    margin-top: 10px;
    align-self: flex-start;
    transition: transform var(--fast);
  }

  .try-again-btn {
    background: #DC2626;
    color: #FAF6ED;
  }

  .submit-allocation-btn.secondary {
    background: #FAF6ED;
    color: #1F3825;
  }

  .chronicle-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .era-jump-btn {
    background: #166534;
    color: #FAF6ED;
  }

  .start-interactive-btn:hover, .submit-allocation-btn:hover, .try-again-btn:hover, .era-jump-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #0F1710;
  }

  .start-interactive-btn:active, .submit-allocation-btn:active, .try-again-btn:active, .era-jump-btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #0F1710;
  }

  /* Plots Grid in Minigame 1 */
  .plots-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
    margin: 8px 0;
  }

  .plot-column-card {
    background: #FFFFFF;
    border: 1.8px solid #1F3825;
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .plot-label {
    font-size: 0.85rem;
    font-weight: bold;
    color: #1F3825;
  }

  .crop-select {
    border: 1.5px solid #1F3825;
    border-radius: 4px;
    padding: 5px;
    font-size: 0.82rem;
    background: #FAF6ED;
    cursor: pointer;
  }

  .crop-stat-preview {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
  }

  .crop-stat-preview .pos { color: #166534; font-weight: bold; }
  .crop-stat-preview .neg { color: #DC2626; font-weight: bold; }

  .grid-telemetry-strip {
    display: flex;
    gap: 12px;
    background: #1F3825;
    color: #FAF6ED;
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .telemetry-chip .val.good { color: #86EFAC; font-weight: bold; }
  .telemetry-chip .val.warn { color: #FCA5A5; font-weight: bold; }

  /* Calibration Options in Minigame 2 */
  .calibration-options-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 8px 0;
  }

  .calibration-group .group-title {
    font-size: 0.95rem;
    font-weight: bold;
    color: #1F3825;
    display: block;
    margin-bottom: 6px;
  }

  .radio-pill-stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .pill-option {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #FFFFFF;
    border: 1.5px solid #CBD5E1;
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 0.88rem;
    cursor: pointer;
    transition: border-color var(--fast), background var(--fast);
  }

  .pill-option.selected {
    border-color: #1F3825;
    background: color-mix(in srgb, #E5A93C 25%, #FFFFFF);
    font-weight: 600;
  }

  /* Dilemmas in Minigame 3 */
  .dilemmas-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 8px 0;
  }

  .dilemma-card {
    background: #FFFFFF;
    border: 1.8px solid #1F3825;
    border-radius: var(--radius-sm);
    padding: 10px 14px;
  }

  .dilemma-title {
    font-size: 0.95rem;
    font-weight: bold;
    color: #1F3825;
    margin-bottom: 4px;
  }

  .dilemma-desc {
    font-size: 0.85rem;
    color: #475569;
    margin: 0 0 8px 0;
  }

  .dilemma-choices {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dilemma-btn {
    background: #FAF6ED;
    border: 1.5px solid #94A3B8;
    border-radius: 4px;
    padding: 8px 12px;
    text-align: left;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background var(--fast);
  }

  .dilemma-btn.selected-correct {
    border-color: #166534;
    background: #DCFCE7;
    font-weight: bold;
  }

  .dilemma-btn.selected-wrong {
    border-color: #DC2626;
    background: #FEE2E2;
  }

  .card-action-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
  }

  /* Final Chronicle Screen */
  .chronicle-title {
    font-size: 1.6rem;
    color: #1F3825;
    margin: 0 0 10px 0;
  }

  .chronicle-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
    margin: 12px 0;
  }

  .metric-box {
    background: #FFFFFF;
    border: 1.8px solid #1F3825;
    border-radius: var(--radius-sm);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric-box .m-label {
    font-size: 0.75rem;
    color: #64748B;
  }

  .metric-box .m-val {
    font-size: 1.25rem;
    font-weight: bold;
    color: #1F3825;
  }

  .metric-box .m-val.highlight {
    color: #B45309;
  }

  .metric-box .m-sub {
    font-size: 0.72rem;
    color: #334155;
  }

  .chronicle-quote {
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #1E293B;
    border-left: 4px solid #E5A93C;
    padding-left: 12px;
    margin: 8px 0;
  }
</style>
