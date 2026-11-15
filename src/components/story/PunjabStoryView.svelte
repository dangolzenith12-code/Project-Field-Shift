<script lang="ts">
  import type { FarmMeters } from '../../types/game';
  import { sfx } from '../../utils/sound';

  // High-resolution user-supplied assets
  import bgPrologue from '../../assets/bg_punjab_prologue_attic.png';
  import bg1990 from '../../assets/bg_punjab_1990.png';
  import bg2005 from '../../assets/bg_punjab_2005.png';
  import bg2026 from '../../assets/bg_punjab_2026.png';
  import bg2040 from '../../assets/bg_punjab_2040.png';
  import bgGhostVillage from '../../assets/bg_punjab_ghost_village_2040.png';

  // Characters
  import charYoungHari1990 from '../../assets/char_young_hari_1990.png';
  import charBebe1990 from '../../assets/char_bebe_1990.png';
  import charHariGurpreet2005 from '../../assets/char_hari_gurpreet_2005.png';
  import charMeenaKaur from '../../assets/char_meena_kaur.png';
  import charBebeHari2026 from '../../assets/char_bebe_hari_2026.png';
  import charSimranKaur from '../../assets/char_simran_kaur.png';
  import charSalesman from '../../assets/char_salesman.png';
  import charDadaGrandchildren2040 from '../../assets/char_dada_grandchildren_2040.png';

  // Items
  import itemBeejPatra from '../../assets/item_beej_patra_brass_urn.png';
  import itemRootNodules from '../../assets/item_moong_root_nodules.png';
  import itemSeedsSheet from '../../assets/item_traditional_seeds_sheet.png';

  interface Props {
    onBackToRegions: () => void;
    onOpenOverworld?: () => void;
    onOpenJournal?: () => void;
    onOpenStrategies?: () => void;
    onOpenNasa?: () => void;
  }

  let { onBackToRegions }: Props = $props();

  // Master Generational Stages (Prologue -> 1990 -> 2005 -> 2026 -> 2040 -> Final Chronicle)
  type GameStage = 
    | 'PROLOGUE_DIALOGUE'
    | 'PROLOGUE_TITLE'
    | '1990_SCENE1_WELL'
    | '1990_FARM_EXPLORE'
    | '1990_SCENE2_URN'
    | '1990_MINIGAME_SEED_SORTING'
    | '1990_SCENE3_SALESMAN'
    | '1990_MINIGAME_SOIL_SYSTEM'
    | '1990_SCENE4_HARVEST'
    | '2005_SCENE1_CHANGING_VILLAGE'
    | '2005_VILLAGE_EXPLORE'
    | '2005_SCENE2_TUBEWELL_RACE'
    | '2005_MINIGAME_TUBEWELL_ASSEMBLY'
    | '2005_SCENE3_PADDY_REVOLUTION'
    | '2005_SCENE4_FIRST_WARNING'
    | '2005_MINIGAME_IRRIGATION_CONTROL'
    | '2005_SCENE5_VILLAGE_MEETING'
    | '2005_CHAPTER_ENDING'
    | '2026_SCENE1_SCREECHING_MOTOR'
    | '2026_FARM_INVESTIGATION'
    | '2026_SCENE2_FAMILY_DEBT'
    | '2026_SCENE3_SATELLITE_GRACE'
    | '2026_MINIGAME_AQUIFER_DETECTIVE'
    | '2026_SCENE6_HAPPY_SEEDER'
    | '2026_MINIGAME_STUBBLE_SIM'
    | '2026_CHAPTER_ENDING'
    | '2040_SCENE1_EMERGENCY_SIREN'
    | '2040_SCENE2_GHOST_VILLAGE'
    | '2040_MINIGAME_WHAT_WENT_WRONG'
    | '2040_SCENE4_COOPERATIVE_SOLAR'
    | '2040_MINIGAME_SOLAR_DRIP_NETWORK'
    | '2040_SCENE6_PASSING_URN'
    | 'FINAL_50_YEAR_CHRONICLE';

  let stage = $state<GameStage>('PROLOGUE_DIALOGUE');

  // Multi-beat dialogues
  let prologueBeat = $state(0);
  let dialogueBeat1990_1 = $state(0);
  let dialogueBeat1990_3 = $state(0);
  let dialogueBeat2005_1 = $state(0);
  let dialogueBeat2026_1 = $state(0);

  // Regional Telemetry HUD
  let meters = $state<FarmMeters>({
    soilMoisture: 45,
    organicMatter: 35,
    nitrogen: 65,
    erosionRisk: 25,
    income: 200,
    waterUse: 580
  });

  // =========================================================================
  // 1990 DISCOVERY TRACKER
  // =========================================================================
  let hasFoundSoil = $state(false);
  let hasFoundNodules = $state(false);
  let hasFoundUrn = $state(false);
  let hasFoundWellWater = $state(false);
  let activeDiscoveryPopup = $state<'soil' | 'nodules' | 'urn' | 'well' | null>(null);

  const farm1990DiscoveryComplete = $derived(hasFoundSoil && hasFoundNodules && hasFoundUrn);

  // =========================================================================
  // 1990 GRAPHICAL SEED SORTING TABLE
  // =========================================================================
  interface GraphicalSeed {
    id: number;
    visualType: 'moong' | 'millet' | 'damaged_hole' | 'damaged_mold';
    correctDestination: 'moong' | 'millet' | 'discard';
    title: string;
    inspectionHint: string;
    botanicalNote: string;
    sortedTo: 'moong' | 'millet' | 'discard' | null;
  }

  let seedCollection = $state<GraphicalSeed[]>([
    { id: 1, visualType: 'moong', correctDestination: 'moong', title: 'Seed #1 (Olive Pulse)', inspectionHint: 'Smooth olive-green pulse coat, prominent white hilum ridge, plump and firm.', botanicalNote: 'Desi Moong (Vigna radiata). Inoculated with symbiotic nitrogen bacteria.', sortedTo: null },
    { id: 2, visualType: 'damaged_hole', correctDestination: 'discard', title: 'Seed #2 (Bored Grain)', inspectionHint: 'Darkened seed coat with a hollow tunnel and tiny circular weevil exit bore-hole.', botanicalNote: 'Infested by pulse beetle (Callosobruchus maculatus). Will spoil storage if not removed.', sortedTo: null },
    { id: 3, visualType: 'millet', correctDestination: 'millet', title: 'Seed #3 (Mottled Pearl)', inspectionHint: 'Hard mottled slate-grey spherical grain, drought-hardy seed shell intact.', botanicalNote: 'Pearl Millet / Bajra (Pennisetum glaucum). Tolerates +42°C summer heat.', sortedTo: null },
    { id: 4, visualType: 'moong', correctDestination: 'moong', title: 'Seed #4 (Olive Pulse)', inspectionHint: 'Dense olive-green pulse seed, heavy in palm, intact biological embryo.', botanicalNote: 'Desi Moong. Fixes up to 35 kg biological nitrogen per hectare.', sortedTo: null },
    { id: 5, visualType: 'damaged_mold', correctDestination: 'discard', title: 'Seed #5 (Moldy Kernel)', inspectionHint: 'Cracked seed kernel covered in white powdery mold filaments and fungal decay.', botanicalNote: 'Fungal contamination (Aspergillus). High humidity damage; must be culled.', sortedTo: null },
    { id: 6, visualType: 'millet', correctDestination: 'millet', title: 'Seed #6 (Mottled Pearl)', inspectionHint: 'Small round speckled bajra pearl grain, resilient dry-season variety.', botanicalNote: 'Pearl Millet. 1.2m deep taproots break through compact subsoil layers.', sortedTo: null },
    { id: 7, visualType: 'moong', correctDestination: 'moong', title: 'Seed #7 (Olive Pulse)', inspectionHint: 'Clean desi pulse, cool to touch, ready to host nitrogen-fixing nodules.', botanicalNote: 'Desi Moong. Enriches topsoil carbon sponge.', sortedTo: null },
    { id: 8, visualType: 'millet', correctDestination: 'millet', title: 'Seed #8 (Mottled Pearl)', inspectionHint: 'Mottled pearl millet seed, intact protective husk, zero pest damage.', botanicalNote: 'Pearl Millet. Preserved through 1947 Partition crossing.', sortedTo: null },
  ]);

  let selectedSeedForInspection = $state<GraphicalSeed | null>(seedCollection[0]);
  let seedSortFeedbackMsg = $state('');

  const countSortedMoong = $derived(seedCollection.filter(s => s.sortedTo === 'moong').length);
  const countSortedMillet = $derived(seedCollection.filter(s => s.sortedTo === 'millet').length);
  const countDiscarded = $derived(seedCollection.filter(s => s.sortedTo === 'discard').length);
  const seedSortingGameWon = $derived(
    seedCollection.every(s => s.sortedTo === s.correctDestination)
  );

  function placeSelectedSeedInto(destination: 'moong' | 'millet' | 'discard') {
    if (!selectedSeedForInspection) return;
    sfx.playSelect();
    const seed = selectedSeedForInspection;
    if (seed.correctDestination === destination) {
      sfx.playSuccess();
      seed.sortedTo = destination;
      seedSortFeedbackMsg = destination === 'discard' 
        ? 'Pest-damaged seed safely removed from family batch.' 
        : `Seed #${seed.id} safely stored in the ancestral ${destination === 'moong' ? 'moong jar' : 'millet urn'}.`;
      const nextUnsorted = seedCollection.find(s => s.sortedTo === null);
      selectedSeedForInspection = nextUnsorted || null;
    } else {
      sfx.playAlert();
      seedSortFeedbackMsg = destination === 'discard'
        ? 'Wait, that seed is viable and healthy! Do not discard good stock.'
        : 'Careful! Examine the seed coat again under the loupe before placing it.';
    }
  }

  // =========================================================================
  // 1990 GRAPHICAL LIVING SOIL SYSTEM
  // =========================================================================
  type CropType = 'moong' | 'millet' | 'mustard' | 'paddy';
  interface CropOption {
    id: CropType;
    name: string;
    botanicalName: string;
    tag: string;
    nitrogenDelta: number;
    somDelta: number;
    waterMm: number;
    headerBg: string;
    accentColor: string;
    description: string;
    visualRoot: string;
  }
  const CROP_DATABASE: Record<CropType, CropOption> = {
    moong: {
      id: 'moong',
      name: 'Desi Moong Pulse',
      botanicalName: 'Vigna radiata',
      tag: 'Nitrogen-Fixing Legume',
      nitrogenDelta: +16,
      somDelta: +8,
      waterMm: 220,
      headerBg: '#1B4D24', // Deep high-contrast green
      accentColor: '#2E7D32',
      description: 'Symbiotic Rhizobium nodules trap dinitrogen directly from atmospheric air.',
      visualRoot: 'Clusters of pinkish-red leghemoglobin nodules producing +35 kg/ha bio-nitrogen.'
    },
    millet: {
      id: 'millet',
      name: 'Pearl Millet / Bajra',
      botanicalName: 'Pennisetum glaucum',
      tag: 'Deep-Rooted Coarse Grain',
      nitrogenDelta: +6,
      somDelta: +7,
      waterMm: 260,
      headerBg: '#8C4D00', // Deep high-contrast amber
      accentColor: '#BF6600',
      description: 'Extensive 1.2m taproots aerate subsoil and resist extreme summer heat.',
      visualRoot: 'Dense fibrous taproots penetrating the plow pan, drought-tolerant.'
    },
    mustard: {
      id: 'mustard',
      name: 'Winter Mustard / Sarson',
      botanicalName: 'Brassica juncea',
      tag: 'Biomass Cover Crop',
      nitrogenDelta: +8,
      somDelta: +10,
      waterMm: 240,
      headerBg: '#7A5800', // Deep high-contrast mustard
      accentColor: '#A07500',
      description: 'Dense winter pollinator canopy suppresses weeds and adds rich organic carbon mulch.',
      visualRoot: 'Plow-pan buster taproot aerating subsoil with dense fungal mycorrhizae.'
    },
    paddy: {
      id: 'paddy',
      name: 'Flooded Basmati',
      botanicalName: 'Oryza sativa',
      tag: 'Water-Intensive Rice',
      nitrogenDelta: -14,
      somDelta: -6,
      waterMm: 850,
      headerBg: '#0D47A1', // Deep high-contrast blue
      accentColor: '#1565C0',
      description: 'Continuous 5cm standing floodwater exhausts soil nitrogen and drains the aquifer.',
      visualRoot: 'Shallow anaerobic root mat with sulfur decay and zero legume aeration.'
    }
  };

  let plot1Crop = $state<CropType>('moong');
  let plot2Crop = $state<CropType>('paddy');
  let plot3Crop = $state<CropType>('millet');
  let plot4Crop = $state<CropType>('mustard');

  const game1NetNitrogen = $derived(
    CROP_DATABASE[plot1Crop].nitrogenDelta +
    CROP_DATABASE[plot2Crop].nitrogenDelta +
    CROP_DATABASE[plot3Crop].nitrogenDelta +
    CROP_DATABASE[plot4Crop].nitrogenDelta
  );
  const game1NetSom = $derived(
    CROP_DATABASE[plot1Crop].somDelta +
    CROP_DATABASE[plot2Crop].somDelta +
    CROP_DATABASE[plot3Crop].somDelta +
    CROP_DATABASE[plot4Crop].somDelta
  );
  const game1TotalWater = $derived(
    CROP_DATABASE[plot1Crop].waterMm +
    CROP_DATABASE[plot2Crop].waterMm +
    CROP_DATABASE[plot3Crop].waterMm +
    CROP_DATABASE[plot4Crop].waterMm
  );
  const game1IsBalanced = $derived(game1NetNitrogen >= 16 && game1TotalWater <= 1800);

  function cyclePlotCrop(plotNumber: 1 | 2 | 3 | 4) {
    sfx.playSelect();
    const cropOrder: CropType[] = ['moong', 'millet', 'mustard', 'paddy'];
    if (plotNumber === 1) plot1Crop = cropOrder[(cropOrder.indexOf(plot1Crop) + 1) % cropOrder.length];
    if (plotNumber === 2) plot2Crop = cropOrder[(cropOrder.indexOf(plot2Crop) + 1) % cropOrder.length];
    if (plotNumber === 3) plot3Crop = cropOrder[(cropOrder.indexOf(plot3Crop) + 1) % cropOrder.length];
    if (plotNumber === 4) plot4Crop = cropOrder[(cropOrder.indexOf(plot4Crop) + 1) % cropOrder.length];
  }

  // =========================================================================
  // 2005 VILLAGE EXPLORATION & WORKBENCHES
  // =========================================================================
  let visitedVillage2005 = $state<string[]>([]);
  let activeVillagePopup2005 = $state<string | null>(null);

  function inspectVillageSite(id: string) {
    sfx.playSelect();
    if (!visitedVillage2005.includes(id)) {
      visitedVillage2005 = [...visitedVillage2005, id];
    }
    activeVillagePopup2005 = id;
  }

  // 2005 Tubewell Assembly Workbench
  let partPipe = $state(false);
  let partImpeller = $state(false);
  let partFilter = $state(false);
  let partMotor = $state(false);
  let partGasket = $state(false);
  let tubewellStarted = $state(false);
  let waterTableMeters2005 = $state(22);

  const tubewellComplete = $derived(
    partPipe && partImpeller && partFilter && partMotor && partGasket
  );

  function fireTubewellMotor() {
    sfx.playSelect();
    tubewellStarted = true;
    sfx.playSuccess();
    waterTableMeters2005 = 39;
  }

  // 2005 Sluice Gate Control
  let mainSluiceOpen = $state(true);
  let northGateRaised = $state(true);
  let southGateRaised = $state(false);
  let mudLeakSealed = $state(false);
  const irrigationSolved = $derived(mainSluiceOpen && !northGateRaised && southGateRaised && mudLeakSealed);

  // 2005 Consensus
  let consensusWater = $state(false);
  let consensusTrials = $state(false);
  let consensusCanal = $state(false);
  let consensusSoil = $state(false);
  const meetingConsensusReady = $derived(
    consensusWater && consensusTrials && consensusCanal && consensusSoil
  );

  // =========================================================================
  // 2026 EVIDENCE & STRATA
  // =========================================================================
  let inspectedEvidence = $state<string[]>([]);
  let activeCrisisPopup = $state<string | null>(null);

  function inspectCrisis(id: string) {
    sfx.playSelect();
    if (!inspectedEvidence.includes(id)) {
      inspectedEvidence = [...inspectedEvidence, id];
    }
    activeCrisisPopup = id;
  }

  let strataDepthSlider = $state(82); // meters
  const pumpStatus2026 = $derived.by(() => {
    if (strataDepthSlider > 75) return { status: 'Critical Cavitation Risk', color: '#D32F2F', desc: 'Pumping straight sand and air pockets at 82m. Impeller screeching violently!' };
    if (strataDepthSlider > 45) return { status: 'Heavy Drawdown Level', color: '#F57C00', desc: 'High diesel fuel draw, ancient unconfined regional groundwater depleting.' };
    return { status: 'Historical Sweet Level', color: '#1B5E20', desc: '1920 brick well level (8-25m). Clean Himalayan snowmelt water.' };
  });

  let seederSpeedDial = $state(3.5); // km/h
  let seederDepthKnob = $state(5); // cm
  let seederRunDone = $state(false);
  const seederCalibrated = $derived(seederSpeedDial === 3.5 && seederDepthKnob === 5);

  function executeSeederRun() {
    sfx.playSelect();
    if (seederCalibrated) {
      sfx.playSuccess();
      seederRunDone = true;
      meters.organicMatter = 58;
      meters.soilMoisture = 65;
    } else {
      sfx.playAlert();
    }
  }

  // =========================================================================
  // 2040 GHOST VILLAGE TIMELINE & SOLAR NETWORK
  // =========================================================================
  interface HistoryPolaroid {
    id: number;
    visualScene: string;
    description: string;
  }
  const polaroids: HistoryPolaroid[] = [
    { id: 1, visualScene: 'High-power 100hp borewell pump installed on subsidized electricity', description: 'Deep pumping race starts across Village Kalan without extraction limits.' },
    { id: 2, visualScene: 'Water table plunges past 100 meters; shallow wells run completely dry', description: 'Farmers drill deeper boreholes with heavy steel extension casings.' },
    { id: 3, visualScene: '160-meter deep boreholes hit fossil geological saltwater strata', description: 'Saline aquifer water is pumped to the surface for irrigation.' },
    { id: 4, visualScene: 'Evaporation deposits gleaming white sodium crust across topsoil', description: 'Soil salinization poisons wheat and basmati roots; fields wither.' },
    { id: 5, visualScene: 'Padlocked brick houses, rusting abandoned tractors, and deserted land', description: 'Bankrupted families migrate to city slums; village outpost abandoned.' },
  ];

  let timelineSequence = $state<number[]>([]);
  function addPolaroidToSequence(id: number) {
    sfx.playSelect();
    if (!timelineSequence.includes(id)) {
      timelineSequence = [...timelineSequence, id];
    }
  }
  function clearTimeline() {
    sfx.playSelect();
    timelineSequence = [];
  }
  const timelineIsCorrect = $derived.by(() => {
    if (timelineSequence.length !== 5) return false;
    for (let i = 0; i < 5; i++) {
      if (timelineSequence[i] !== i + 1) return false;
    }
    return true;
  });

  // 2040 Solar Network
  let wireSolarPanels = $state(false);
  let wireController = $state(false);
  let pipeHeaderTank = $state(false);
  let layDripLines = $state(false);
  let openSmartValves = $state(false);
  const solarGridReady = $derived(
    wireSolarPanels && wireController && pipeHeaderTank && layDripLines && openSmartValves
  );

  // 2040 Seed Inoculation & Beej Patra Climax
  let inoculationStep = $state(0);

  function restartAll() {
    sfx.playSelect();
    stage = 'PROLOGUE_DIALOGUE';
    prologueBeat = 0;
    dialogueBeat1990_1 = 0;
    dialogueBeat1990_3 = 0;
    dialogueBeat2005_1 = 0;
    dialogueBeat2026_1 = 0;
    hasFoundWellWater = false;
    hasFoundSoil = false;
    hasFoundNodules = false;
    hasFoundUrn = false;
    activeDiscoveryPopup = null;
    seedCollection.forEach(s => s.sortedTo = null);
    selectedSeedForInspection = seedCollection[0];
    seedSortFeedbackMsg = '';
    plot1Crop = 'moong';
    plot2Crop = 'paddy';
    plot3Crop = 'millet';
    plot4Crop = 'mustard';
    visitedVillage2005 = [];
    activeVillagePopup2005 = null;
    partPipe = false;
    partImpeller = false;
    partFilter = false;
    partMotor = false;
    partGasket = false;
    tubewellStarted = false;
    waterTableMeters2005 = 22;
    mainSluiceOpen = true;
    northGateRaised = true;
    southGateRaised = false;
    mudLeakSealed = false;
    consensusWater = false;
    consensusTrials = false;
    consensusCanal = false;
    consensusSoil = false;
    inspectedEvidence = [];
    activeCrisisPopup = null;
    strataDepthSlider = 82;
    seederSpeedDial = 3.5;
    seederDepthKnob = 5;
    seederRunDone = false;
    timelineSequence = [];
    wireSolarPanels = false;
    wireController = false;
    pipeHeaderTank = false;
    layDripLines = false;
    openSmartValves = false;
    inoculationStep = 0;
    meters = {
      soilMoisture: 45,
      organicMatter: 35,
      nitrogen: 65,
      erosionRisk: 25,
      income: 200,
      waterUse: 580
    };
  }
</script>


<div class="fullscreen-story-game">
  <!-- Minimalist Top HUD Bar: Icons only + Ecological Status Pill -->
  <div class="game-hud-top">
    <div class="icon-buttons-group">
      <button 
        type="button" 
        class="icon-hud-btn" 
        onclick={onBackToRegions} 
        aria-label="Back to Regions"
        title="Exit to Regions"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <button 
        type="button" 
        class="icon-hud-btn" 
        onclick={restartAll} 
        aria-label="Restart Story"
        title="Restart Story"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
    </div>

    <!-- Mini Glass Ecological Meter Indicators (Crisp, High Contrast) -->
    <div class="meters-glass-pill font-data">
      <span>Soil Moisture {meters.soilMoisture}%</span>
      <span class="dot">|</span>
      <span>Organic Carbon {meters.organicMatter}%</span>
      <span class="dot">|</span>
      <span>Bio-Nitrogen {meters.nitrogen}%</span>
      <span class="dot">|</span>
      <span>Water Draw {meters.waterUse}mm</span>
    </div>
  </div>

  <!-- Dynamic Scenic Background by Era -->
  <div class="scenic-background-container">
    {#if stage.startsWith('PROLOGUE')}
      <img src={bgPrologue} alt="Ancestral Farmhouse Attic 2040" class="fullscreen-bg-img" />
    {:else if stage.startsWith('1990')}
      <img src={bg1990} alt="Punjab Farm 1990" class="fullscreen-bg-img" />
    {:else if stage.startsWith('2005')}
      <img src={bg2005} alt="Punjab Farm 2005 Green Revolution" class="fullscreen-bg-img" />
    {:else if stage.startsWith('2026')}
      <img src={bg2026} alt="Punjab Farm 2026 Climate Boiling Point" class="fullscreen-bg-img" />
    {:else if stage === '2040_SCENE2_GHOST_VILLAGE' || stage === '2040_MINIGAME_WHAT_WENT_WRONG'}
      <img src={bgGhostVillage} alt="Punjab Ghost Village Outpost 2040" class="fullscreen-bg-img" />
    {:else}
      <img src={bg2040} alt="Punjab Farm 2040 Regenerative Horizon" class="fullscreen-bg-img" />
    {/if}
  </div>

  <!-- Character Sprites Staging -->
  <div class="character-stage-container">
    {#if stage.startsWith('PROLOGUE')}
      <img src={charDadaGrandchildren2040} alt="Dada Hari, Kabir and Rani" class="character-sprite centered" />
    {:else if stage.startsWith('1990')}
      {#if stage === '1990_SCENE3_SALESMAN'}
        <img src={charSalesman} alt="Agricultural Salesman" class="character-sprite right" />
        <img src={charBebe1990} alt="Young Bebe Amarjit" class="character-sprite left" />
      {:else if stage === '1990_FARM_EXPLORE' || stage === '1990_SCENE1_WELL'}
        <img src={charYoungHari1990} alt="Young Hari" class="character-sprite small" />
        <img src={charBebe1990} alt="Young Bebe Amarjit" class="character-sprite" />
      {:else}
        <img src={charBebe1990} alt="Young Bebe Amarjit" class="character-sprite" />
      {/if}
    {:else if stage.startsWith('2005')}
      {#if stage === '2005_SCENE5_VILLAGE_MEETING' || stage === '2005_MINIGAME_TUBEWELL_ASSEMBLY'}
        <img src={charMeenaKaur} alt="Extension Officer Meena Kaur" class="character-sprite right" />
        <img src={charHariGurpreet2005} alt="Hari and Gurpreet" class="character-sprite left" />
      {:else}
        <img src={charHariGurpreet2005} alt="Hari and Gurpreet 2005" class="character-sprite" />
      {/if}
    {:else if stage.startsWith('2026')}
      <img src={charBebeHari2026} alt="Elder Bebe and Adult Hari 2026" class="character-sprite" />
    {:else if stage.startsWith('2040')}
      {#if stage === '2040_SCENE4_COOPERATIVE_SOLAR'}
        <img src={charSimranKaur} alt="Agronomist Simran Kaur" class="character-sprite right" />
        <img src={charDadaGrandchildren2040} alt="Dada Hari and Grandchildren" class="character-sprite left" />
      {:else}
        <img src={charDadaGrandchildren2040} alt="Dada Hari and Grandchildren" class="character-sprite centered" />
      {/if}
    {/if}
  </div>

  <!-- PROLOGUE — 2040: THE LAST SEED -->
  {#if stage === 'PROLOGUE_DIALOGUE'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">
          {prologueBeat === 0 ? 'Rani (Age 9, Year 2040)' : prologueBeat === 1 ? 'Kabir (Age 12, Year 2040)' : 'Elder Dada Hari (Year 2040)'}
        </div>
        {#if prologueBeat === 0}
          <p class="prompt-text font-body">
            “Dada, why do you keep that old brass pot wrapped in red cloth? It doesn’t even look valuable.”
          </p>
          <div class="inner-thought font-body">
            *Rain taps against the farmhouse roof in Kalan village. An old man sits beside an ancient wooden chest.*
          </div>
        {:else if prologueBeat === 1}
          <p class="prompt-text font-body">
            “Valuable? This little pot has fed four generations of our family.”<br>
            <strong>Kabir:</strong> “How? They're just dried seeds inside.”
          </p>
          <div class="inner-thought font-body">
            *Hari places a single dried, mottled seed in Kabir’s open palm.*
          </div>
        {:else}
          <p class="prompt-text font-body">
            “That’s what everyone thinks until the day they have nothing left to plant. Your great-grandmother carried these across the border in 1947. Our family inherited this land, but we only borrowed it from you.”
          </p>
          <div class="inner-thought font-body">
            *The attic fades into the golden memory of 1990.*
          </div>
        {/if}
      </div>

      <div class="game-actions-row">
        {#if prologueBeat < 2}
          <button 
            type="button" 
            class="continue-btn font-display"
            onclick={() => { sfx.playSelect(); prologueBeat++; }}
          >
            Listen Further →
          </button>
        {:else}
          <button 
            type="button" 
            class="continue-btn font-display"
            onclick={() => { sfx.playSuccess(); stage = 'PROLOGUE_TITLE'; }}
          >
            Journey to the Beginning (1990) →
          </button>
        {/if}
      </div>
    </div>

  {:else if stage === 'PROLOGUE_TITLE'}
    <div class="title-card-overlay">
      <div class="title-box">
        <span class="title-sub font-data">FIELD SHIFT PRESENTS</span>
        <h1 class="title-main font-display">Four Generations, One Farm</h1>
        <p class="title-desc font-body">
          Chapter One: The Seeds of Yesterday (Year 1990)
        </p>
        <button 
          type="button" 
          class="continue-btn font-display"
          style="margin-top: 10px;"
          onclick={() => { sfx.playSelect(); stage = '1990_SCENE1_WELL'; }}
        >
          Wake Up in Kalan Village, 1990 →
        </button>
      </div>
    </div>

  <!-- CHAPTER ONE — 1990: THE SEEDS OF YESTERDAY -->
  {:else if stage === '1990_SCENE1_WELL'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Young Bebe Amarjit (1990)</div>
        {#if dialogueBeat1990_1 === 0}
          <p class="prompt-text font-body">
            “Oye Hari! Wake up, puttar! Today you will learn something far more important than school books: how to keep this ancestral land alive.”
          </p>
          <div class="inner-thought font-body">
            *Roosters crow across the courtyard. Bullocks shift lazily near the wooden plow.*
          </div>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSelect(); dialogueBeat1990_1 = 1; }}
            >
              “Who built this brick well, Bebe?” →
            </button>
          </div>
        {:else}
          <p class="prompt-text font-body">
            “Your great-great-grandfather dug this well in 1920 with bullocks, hemp ropes, and his bare hands. He had no satellite machine to tell him when soil was thirsty. He touched the earth. He smelled the leaves. He listened to the land.”
          </p>
          <div class="inner-thought font-body">
            *Bebe points across the courtyard. She asks Hari to explore the farm and bring back three essential tokens of living soil.*
          </div>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSelect(); stage = '1990_FARM_EXPLORE'; }}
            >
              Explore the 1990 Farmstead →
            </button>
          </div>
        {/if}
      </div>
    </div>

  <!-- GRAPHICAL 1990 FARMSTEAD DISCOVERY (BEAUTIFIED BOTANICAL FIELD LAB) -->
  {:else if stage === '1990_FARM_EXPLORE'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            1990 Farmstead Living Tokens Investigation
          </div>
          <span class="badge-tokens font-data">{hasFoundSoil && hasFoundNodules && hasFoundUrn ? '3/3 SECURED' : `${(hasFoundSoil?1:0) + (hasFoundNodules?1:0) + (hasFoundUrn?1:0)}/3 TOKENS`}</span>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Explore the ancestral farmstead below. Click each illustrated location to examine biological evidence and retrieve Bebe's three living tokens:
          </p>

          <!-- 4 Visual Handcrafted Farmstead Hotspots -->
          <div class="farmstead-visual-grid">
            <!-- 1. Brick Well -->
            <button 
              type="button" 
              class="farmstead-node {hasFoundWellWater ? 'done' : ''}"
              onclick={() => { sfx.playSelect(); hasFoundWellWater = true; activeDiscoveryPopup = 'well'; }}
            >
              <div class="node-icon-box well-box">
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="24" cy="24" r="18" stroke="#004D40" fill="#E0F2F1"/>
                  <path d="M14 18h20v14H14z" fill="#B2DFDB" stroke="#004D40"/>
                  <line x1="24" y1="8" x2="24" y2="18" stroke="#004D40" stroke-width="3"/>
                  <path d="M18 25c2-2 4-2 6 0s4 2 6 0" stroke="#00796B" stroke-width="2"/>
                </svg>
              </div>
              <strong class="node-name font-display">1920 Brick Well</strong>
              <span class="status-pill font-data {hasFoundWellWater ? 'secured' : ''}">
                {hasFoundWellWater ? '[INSPECTED: 8m DEPTH]' : '[CLICK TO EXAMINE]'}
              </span>
            </button>

            <!-- 2. Compost Heap -->
            <button 
              type="button" 
              class="farmstead-node {hasFoundSoil ? 'done' : ''}"
              onclick={() => { sfx.playSuccess(); hasFoundSoil = true; activeDiscoveryPopup = 'soil'; }}
            >
              <div class="node-icon-box soil-box">
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M8 36c4-14 12-20 16-20s12 6 16 20H8z" fill="#D7CCC8" stroke="#4E342E"/>
                  <circle cx="24" cy="24" r="3" fill="#3E2723"/>
                  <circle cx="18" cy="28" r="2.5" fill="#3E2723"/>
                  <circle cx="30" cy="28" r="2.5" fill="#3E2723"/>
                  <path d="M24 16v-6M20 13l4-3 4 3" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
              <strong class="node-name font-display">Compost & Dung Heap</strong>
              <span class="status-pill font-data {hasFoundSoil ? 'secured' : ''}">
                {hasFoundSoil ? '[TOKEN 1: LIVING HUMUS]' : '[CLICK TO DIG]'}
              </span>
            </button>

            <!-- 3. Pulse Field Ridge -->
            <button 
              type="button" 
              class="farmstead-node {hasFoundNodules ? 'done' : ''}"
              onclick={() => { sfx.playSuccess(); hasFoundNodules = true; activeDiscoveryPopup = 'nodules'; }}
            >
              <div class="node-icon-box plant-box">
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M24 8v30" stroke="#1B5E20" stroke-width="2.5"/>
                  <path d="M24 14c-6-4-10 0-10 6 6 0 10-6 10-6zM24 20c6-4 10 0 10 6-6 0-10-6-10-6z" fill="#A5D6A7" stroke="#1B5E20"/>
                  <circle cx="21" cy="32" r="3" fill="#D81B60" stroke="#880E4F"/>
                  <circle cx="27" cy="34" r="3.5" fill="#D81B60" stroke="#880E4F"/>
                  <circle cx="23" cy="37" r="2.5" fill="#D81B60" stroke="#880E4F"/>
                </svg>
              </div>
              <strong class="node-name font-display">Pulse Field Ridge</strong>
              <span class="status-pill font-data {hasFoundNodules ? 'secured' : ''}">
                {hasFoundNodules ? '[TOKEN 2: ROOT NODULES]' : '[EXAMINE LEGUME ROOTS]'}
              </span>
            </button>

            <!-- 4. Veranda Seed Nook -->
            <button 
              type="button" 
              class="farmstead-node {hasFoundUrn ? 'done' : ''}"
              onclick={() => { sfx.playSuccess(); hasFoundUrn = true; activeDiscoveryPopup = 'urn'; }}
            >
              <div class="node-icon-box urn-box">
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M16 16h16v22a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V16z" fill="#FFE082" stroke="#E65100"/>
                  <path d="M20 10h8v6h-8z" fill="#C62828" stroke="#B71C1C"/>
                  <line x1="12" y1="16" x2="36" y2="16" stroke="#E65100" stroke-width="3"/>
                  <circle cx="24" cy="28" r="4" fill="#FFB300" stroke="#E65100"/>
                </svg>
              </div>
              <strong class="node-name font-display">Veranda Seed Nook</strong>
              <span class="status-pill font-data {hasFoundUrn ? 'secured' : ''}">
                {hasFoundUrn ? '[TOKEN 3: BEEJ PATRA]' : '[LOCATE BRASS URN]'}
              </span>
            </button>
          </div>

          <!-- High-Contrast Botanical Inspection Plate -->
          {#if activeDiscoveryPopup === 'nodules'}
            <div class="botanical-inspection-plate">
              <img src={itemRootNodules} alt="Living Rhizobia Nodules" class="plate-illustration-img" />
              <div class="plate-details-text">
                <span class="plate-tag font-data">BOTANICAL EVIDENCE: BIOLOGICAL NITROGEN</span>
                <strong class="plate-title font-display">Living Symbiotic Nodules (Rhizobium leguminosarum)</strong>
                <p class="plate-desc font-body">
                  Plump, pinkish-red nodules cluster along the desi moong pulse taproots. Break one open to reveal red leghemoglobin—proof that beneficial bacteria are fixing dinitrogen directly from atmospheric air into living plant food, without synthetic urea bags!
                </p>
              </div>
            </div>
          {:else if activeDiscoveryPopup === 'urn'}
            <div class="botanical-inspection-plate">
              <img src={itemBeejPatra} alt="Ancestral Brass Seed Urn" class="plate-illustration-img" />
              <div class="plate-details-text">
                <span class="plate-tag font-data">FAMILY HEIRLOOM: ANCESTRAL SEED COLLECTION</span>
                <strong class="plate-title font-display">The Beej Patra (Ancestral Seed Urn)</strong>
                <p class="plate-desc font-body">
                  The heavy brass urn darkened by decades of family touch. Sealed with dry cow-dung ash and dried neem leaves to ward off weevils, it holds the unbroken genetic lineage of desi pulses and millets saved during the 1947 Partition crossing.
                </p>
              </div>
            </div>
          {:else if activeDiscoveryPopup === 'soil'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle soil">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#2E7D32" stroke-width="2">
                  <path d="M12 2C8 6 4 11 4 16a8 8 0 0 0 16 0c0-5-4-10-8-14z"/>
                  <path d="M12 12v6M9 15h6"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">SOIL HEALTH: ORGANIC MATTER</span>
                <strong class="plate-title font-display">Living Humus & Composted Topsoil</strong>
                <p class="plate-desc font-body">
                  Crumbly, dark brown loam smelling of forest floor and monsoon rain. Rich in organic carbon and mycorrhizae, this spongy soil absorbs 40% more storm rainfall than bare chemical earth.
                </p>
              </div>
            </div>
          {:else if activeDiscoveryPopup === 'well'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle well">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#0288D1" stroke-width="2">
                  <circle cx="12" cy="12" r="9"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">HYDROLOGY: 1920 WATER TABLE</span>
                <strong class="plate-title font-display">The Ancestral Kiln-Brick Well</strong>
                <p class="plate-desc font-body">
                  Dug in 1920 with bullocks and hemp ropes. In 1990, the shallow water table sits only 8 meters below the ground surface. Himalayan snowmelt flows through the aquifer, sweet and pure enough to brew morning chai.
                </p>
              </div>
            </div>
          {/if}
        </div>

        <div class="arcade-window-footer">
          {#if farm1990DiscoveryComplete}
            <div class="footer-callout font-body">
              All three living tokens secured! Bebe is waiting at the veranda table.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '1990_SCENE2_URN'; }}
            >
              Present Tokens to Bebe →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Locate all 3 tokens: Living Humus, Pulse Root Nodules, and the Brass Urn.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '1990_SCENE2_URN'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Young Bebe Amarjit (1990)</div>
        <p class="prompt-text font-body">
          “You found them all! These desi moong and pearl millet seeds survived Partition in 1947. Money can buy grain today, puttar, but seeds can grow food tomorrow.”
        </p>
        <div class="inner-thought font-body">
          *Item Unlocked: THE BEEJ PATRA — Family Seed Collection.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 8px;">
          “Now sit down at the sorting table. The seeds are mixed together—some are healthy, but some are damaged by weevils or mold. Inspect each seed visually and separate them into the correct containers!”
        </p>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '1990_MINIGAME_SEED_SORTING'; }}
        >
          Open Seed Sorting Workbench →
        </button>
      </div>
    </div>

  <!-- GRAPHICAL 1990 SEED SORTING TABLE (BEAUTIFIED BOTANICAL WORKBENCH) -->
  {:else if stage === '1990_MINIGAME_SEED_SORTING'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Traditional Seed Sorting Workbench (1990)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Moong Jar: {countSortedMoong}/3</span>
            <span class="dot">|</span>
            <span>Bajra Urn: {countSortedMillet}/3</span>
            <span class="dot">|</span>
            <span>Discard: {countDiscarded}/2</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Examine each seed under the magnifying loupe. Identify whether it is a healthy <strong>Desi Moong pulse</strong>, a drought-hardy <strong>Pearl Millet grain</strong>, or a <strong>Damaged/Pest-decayed kernel</strong>, then place it in the correct vessel:
          </p>

          <div class="seed-sorting-workbench-layout">
            <!-- Left: Scatter Table of Unsorted Visual Seeds -->
            <div class="seed-tray-table">
              <div class="tray-header-bar font-data">
                <span>UNSORTED SEEDS ON TABLE</span>
                <span>8 SPECIMENS</span>
              </div>

              <div class="visual-seeds-scatter">
                {#each seedCollection as seed}
                  <button 
                    type="button" 
                    class="visual-seed-token {seed.sortedTo ? 'sorted' : ''} {selectedSeedForInspection?.id === seed.id ? 'active-inspected' : ''}"
                    onclick={() => { sfx.playSelect(); selectedSeedForInspection = seed; }}
                    disabled={seed.sortedTo !== null}
                  >
                    <!-- High-Res Botanical SVG Seed Drawing -->
                    {#if seed.visualType === 'moong'}
                      <svg viewBox="0 0 48 48" width="44" height="44">
                        <ellipse cx="24" cy="24" rx="17" ry="12" fill="#2E7D32" stroke="#1B5E20" stroke-width="2.5"/>
                        <ellipse cx="24" cy="24" rx="14" ry="9" fill="#388E3C"/>
                        <line x1="16" y1="24" x2="32" y2="24" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    {:else if seed.visualType === 'millet'}
                      <svg viewBox="0 0 48 48" width="44" height="44">
                        <circle cx="24" cy="24" r="14" fill="#BF6600" stroke="#8C4D00" stroke-width="2.5"/>
                        <circle cx="24" cy="24" r="11" fill="#E67E22"/>
                        <circle cx="20" cy="20" r="2.5" fill="#FAD7A0"/>
                        <circle cx="27" cy="26" r="2" fill="#FAD7A0"/>
                      </svg>
                    {:else if seed.visualType === 'damaged_hole'}
                      <svg viewBox="0 0 48 48" width="44" height="44">
                        <ellipse cx="24" cy="24" rx="16" ry="12" fill="#5D4037" stroke="#3E2723" stroke-width="2.5"/>
                        <circle cx="28" cy="22" r="5" fill="#1A1A1A" stroke="#000000" stroke-width="1.5"/>
                        <circle cx="29" cy="23" r="2" fill="#000000"/>
                      </svg>
                    {:else}
                      <svg viewBox="0 0 48 48" width="44" height="44">
                        <path d="M14 18 Q24 10 34 18 Q36 30 24 34 Q12 30 14 18 Z" fill="#6D4C41" stroke="#3E2723" stroke-width="2.5"/>
                        <path d="M18 20 l6 4 M28 18 l4 5 M22 28 l6 3" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
                      </svg>
                    {/if}
                    <span class="seed-number-tag font-data">Seed #{seed.id}</span>
                  </button>
                {/each}
              </div>
            </div>

            <!-- Right: Magnifying Loupe & Storage Containers -->
            <div class="seed-inspection-panel">
              {#if selectedSeedForInspection && selectedSeedForInspection.sortedTo === null}
                <div class="loupe-card">
                  <div class="loupe-header font-data">
                    MAGNIFYING LOUPE &mdash; SPECIMEN #{selectedSeedForInspection.id}
                  </div>

                  <div class="loupe-zoom-view">
                    {#if selectedSeedForInspection.visualType === 'moong'}
                      <svg viewBox="0 0 80 80" width="80" height="80">
                        <ellipse cx="40" cy="40" rx="30" ry="21" fill="#2E7D32" stroke="#1B5E20" stroke-width="3.5"/>
                        <ellipse cx="40" cy="40" rx="25" ry="16" fill="#388E3C"/>
                        <line x1="26" y1="40" x2="54" y2="40" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
                      </svg>
                    {:else if selectedSeedForInspection.visualType === 'millet'}
                      <svg viewBox="0 0 80 80" width="80" height="80">
                        <circle cx="40" cy="40" r="26" fill="#BF6600" stroke="#8C4D00" stroke-width="3.5"/>
                        <circle cx="40" cy="40" r="21" fill="#E67E22"/>
                        <circle cx="34" cy="34" r="4" fill="#FAD7A0"/>
                        <circle cx="46" cy="44" r="3.5" fill="#FAD7A0"/>
                      </svg>
                    {:else if selectedSeedForInspection.visualType === 'damaged_hole'}
                      <svg viewBox="0 0 80 80" width="80" height="80">
                        <ellipse cx="40" cy="40" rx="28" ry="21" fill="#5D4037" stroke="#3E2723" stroke-width="3.5"/>
                        <circle cx="48" cy="36" r="9" fill="#1A1A1A" stroke="#000000" stroke-width="2"/>
                        <circle cx="49" cy="37" r="4" fill="#000000"/>
                      </svg>
                    {:else}
                      <svg viewBox="0 0 80 80" width="80" height="80">
                        <path d="M22 26 Q40 14 58 26 Q62 48 40 56 Q18 48 22 26 Z" fill="#6D4C41" stroke="#3E2723" stroke-width="3.5"/>
                        <path d="M28 30 l8 5 M46 26 l6 7 M34 42 l10 4" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
                      </svg>
                    {/if}
                  </div>

                  <div class="loupe-text-block">
                    <p class="loupe-hint font-body"><strong>Visual Characteristics:</strong> {selectedSeedForInspection.inspectionHint}</p>
                    <p class="loupe-botany font-body"><strong>Agronomic Note:</strong> {selectedSeedForInspection.botanicalNote}</p>
                  </div>

                  <!-- 3 Storage Vessels with Vector Glyphs -->
                  <div class="sorting-destinations-row">
                    <!-- Moong Jar -->
                    <button 
                      type="button" 
                      class="jar-target-btn jar-moong" 
                      onclick={() => placeSelectedSeedInto('moong')}
                    >
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M7 8h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z"/>
                        <ellipse cx="12" cy="5" rx="5" ry="2"/>
                      </svg>
                      <strong class="font-display">Moong Pulse Jar</strong>
                      <span class="font-data">Save In Earthen Jar</span>
                    </button>

                    <!-- Millet Jar -->
                    <button 
                      type="button" 
                      class="jar-target-btn jar-millet" 
                      onclick={() => placeSelectedSeedInto('millet')}
                    >
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z"/>
                        <circle cx="12" cy="5" r="3"/>
                      </svg>
                      <strong class="font-display">Pearl Millet Urn</strong>
                      <span class="font-data">Save In Brass Pot</span>
                    </button>

                    <!-- Discard Tray -->
                    <button 
                      type="button" 
                      class="jar-target-btn jar-discard" 
                      onclick={() => placeSelectedSeedInto('discard')}
                    >
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      <strong class="font-display">Discard Tray</strong>
                      <span class="font-data">Remove Pest Seed</span>
                    </button>
                  </div>
                </div>
              {:else}
                <div class="loupe-card empty">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#2E7D32" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <strong class="font-display" style="font-size: 1.15rem; color: #1B5E20; margin-top: 8px;">All 8 Seeds Classified!</strong>
                  <p class="font-body" style="color: #142417; line-height: 1.4;">
                    Every viable pulse and grain is sealed in family storage jars. Damaged and weevil-decayed seeds have been culled to preserve batch health.
                  </p>
                </div>
              {/if}

              {#if seedSortFeedbackMsg}
                <div class="workbench-feedback font-body">{seedSortFeedbackMsg}</div>
              {/if}
            </div>
          </div>
        </div>

        <div class="arcade-window-footer">
          {#if seedSortingGameWon}
            <div class="footer-callout font-body">
              Seed sorting complete! The family seed stock is clean and ready for sowing.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '1990_SCENE3_SALESMAN'; }}
            >
              Advance to the 1990 Field Plots →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Select an unsorted seed on the left, inspect its coat under the loupe, and place it in the correct vessel.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '1990_SCENE3_SALESMAN'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Agricultural Salesman & Bebe (1990)</div>
        {#if dialogueBeat1990_3 === 0}
          <p class="prompt-text font-body">
            “Amarjit ji! Namaste! Look what the government jeep brought today: Urea! 46% nitrogen white pearls! Why waste your summer cultivating pulse weeds when chemical salts give you three times the crop volume overnight?”
          </p>
          <div class="inner-thought font-body">
            *Salesmen stack heavy burlap sacks smelling of sharp ammonia in the courtyard.*
          </div>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSelect(); dialogueBeat1990_3 = 1; }}
            >
              Hear Bebe’s Reply →
            </button>
          </div>
        {:else}
          <p class="prompt-text font-body">
            <strong>Bebe Amarjit:</strong> “Bigger leaves do not always mean healthier land, babuji. When you feed a plant chemical salt, it forgets how to reach deep into the earth. What happens to the soil when the salt stops coming?”<br>
            <strong>Hari:</strong> “Bebe, how do our fields feed themselves without bags?”<br>
            <strong>Bebe:</strong> “Come to the plots. Let me show you how living roots work beneath the soil.”
          </p>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSelect(); stage = '1990_MINIGAME_SOIL_SYSTEM'; }}
            >
              Open Living Soil System Workbench →
            </button>
          </div>
        {/if}
      </div>
    </div>

  <!-- GRAPHICAL 1990 LIVING SOIL SYSTEM WORKBENCH -->
  {:else if stage === '1990_MINIGAME_SOIL_SYSTEM'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            4-Plot Living Soil System & Biological Root Simulator (1990)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Net Bio-Nitrogen: {game1NetNitrogen >= 16 ? '+' : ''}{game1NetNitrogen} kg/ha</span>
            <span class="dot">|</span>
            <span>Water Demand: {game1TotalWater} mm</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Tap any of the 4 plots to rotate its crop. Observe how legume nodules synthesize biological nitrogen and taproots protect water resources:
          </p>

          <!-- Visual 4-Plot Farm Matrix with High-Contrast Typography -->
          <div class="graphical-plots-canvas">
            <!-- Plot 1 -->
            <button type="button" class="graphical-plot-tile" onclick={() => cyclePlotCrop(1)}>
              <div class="plot-surface-banner" style="background-color: {CROP_DATABASE[plot1Crop].headerBg};">
                <span class="plot-location-label font-data">PLOT 1 &bull; CANAL BEND</span>
                <strong class="plot-crop-heading font-display">{CROP_DATABASE[plot1Crop].name}</strong>
                <em class="plot-botanical font-body">{CROP_DATABASE[plot1Crop].botanicalName}</em>
              </div>

              <div class="plot-subsoil-view">
                <span class="tag-badge font-data">{CROP_DATABASE[plot1Crop].tag}</span>
                <p class="root-desc font-body"><strong>Subsoil Biology:</strong> {CROP_DATABASE[plot1Crop].visualRoot}</p>
                
                <div class="plot-stats-row font-data">
                  <span class="stat-n {CROP_DATABASE[plot1Crop].nitrogenDelta > 0 ? 'pos' : 'neg'}">
                    Nitrogen: {CROP_DATABASE[plot1Crop].nitrogenDelta > 0 ? '+' : ''}{CROP_DATABASE[plot1Crop].nitrogenDelta} kg/ha
                  </span>
                  <span class="stat-water">
                    Water: {CROP_DATABASE[plot1Crop].waterMm} mm
                  </span>
                </div>
              </div>

              <div class="click-rotate-bar font-data">
                Click to Rotate Crop &rarr;
              </div>
            </button>

            <!-- Plot 2 -->
            <button type="button" class="graphical-plot-tile" onclick={() => cyclePlotCrop(2)}>
              <div class="plot-surface-banner" style="background-color: {CROP_DATABASE[plot2Crop].headerBg};">
                <span class="plot-location-label font-data">PLOT 2 &bull; WELLHEAD</span>
                <strong class="plot-crop-heading font-display">{CROP_DATABASE[plot2Crop].name}</strong>
                <em class="plot-botanical font-body">{CROP_DATABASE[plot2Crop].botanicalName}</em>
              </div>

              <div class="plot-subsoil-view">
                <span class="tag-badge font-data">{CROP_DATABASE[plot2Crop].tag}</span>
                <p class="root-desc font-body"><strong>Subsoil Biology:</strong> {CROP_DATABASE[plot2Crop].visualRoot}</p>
                
                <div class="plot-stats-row font-data">
                  <span class="stat-n {CROP_DATABASE[plot2Crop].nitrogenDelta > 0 ? 'pos' : 'neg'}">
                    Nitrogen: {CROP_DATABASE[plot2Crop].nitrogenDelta > 0 ? '+' : ''}{CROP_DATABASE[plot2Crop].nitrogenDelta} kg/ha
                  </span>
                  <span class="stat-water">
                    Water: {CROP_DATABASE[plot2Crop].waterMm} mm
                  </span>
                </div>
              </div>

              <div class="click-rotate-bar font-data">
                Click to Rotate Crop &rarr;
              </div>
            </button>

            <!-- Plot 3 -->
            <button type="button" class="graphical-plot-tile" onclick={() => cyclePlotCrop(3)}>
              <div class="plot-surface-banner" style="background-color: {CROP_DATABASE[plot3Crop].headerBg};">
                <span class="plot-location-label font-data">PLOT 3 &bull; NORTH RIDGE</span>
                <strong class="plot-crop-heading font-display">{CROP_DATABASE[plot3Crop].name}</strong>
                <em class="plot-botanical font-body">{CROP_DATABASE[plot3Crop].botanicalName}</em>
              </div>

              <div class="plot-subsoil-view">
                <span class="tag-badge font-data">{CROP_DATABASE[plot3Crop].tag}</span>
                <p class="root-desc font-body"><strong>Subsoil Biology:</strong> {CROP_DATABASE[plot3Crop].visualRoot}</p>
                
                <div class="plot-stats-row font-data">
                  <span class="stat-n {CROP_DATABASE[plot3Crop].nitrogenDelta > 0 ? 'pos' : 'neg'}">
                    Nitrogen: {CROP_DATABASE[plot3Crop].nitrogenDelta > 0 ? '+' : ''}{CROP_DATABASE[plot3Crop].nitrogenDelta} kg/ha
                  </span>
                  <span class="stat-water">
                    Water: {CROP_DATABASE[plot3Crop].waterMm} mm
                  </span>
                </div>
              </div>

              <div class="click-rotate-bar font-data">
                Click to Rotate Crop &rarr;
              </div>
            </button>

            <!-- Plot 4 -->
            <button type="button" class="graphical-plot-tile" onclick={() => cyclePlotCrop(4)}>
              <div class="plot-surface-banner" style="background-color: {CROP_DATABASE[plot4Crop].headerBg};">
                <span class="plot-location-label font-data">PLOT 4 &bull; PASTURE EDGE</span>
                <strong class="plot-crop-heading font-display">{CROP_DATABASE[plot4Crop].name}</strong>
                <em class="plot-botanical font-body">{CROP_DATABASE[plot4Crop].botanicalName}</em>
              </div>

              <div class="plot-subsoil-view">
                <span class="tag-badge font-data">{CROP_DATABASE[plot4Crop].tag}</span>
                <p class="root-desc font-body"><strong>Subsoil Biology:</strong> {CROP_DATABASE[plot4Crop].visualRoot}</p>
                
                <div class="plot-stats-row font-data">
                  <span class="stat-n {CROP_DATABASE[plot4Crop].nitrogenDelta > 0 ? 'pos' : 'neg'}">
                    Nitrogen: {CROP_DATABASE[plot4Crop].nitrogenDelta > 0 ? '+' : ''}{CROP_DATABASE[plot4Crop].nitrogenDelta} kg/ha
                  </span>
                  <span class="stat-water">
                    Water: {CROP_DATABASE[plot4Crop].waterMm} mm
                  </span>
                </div>
              </div>

              <div class="click-rotate-bar font-data">
                Click to Rotate Crop &rarr;
              </div>
            </button>
          </div>

          <!-- High-Contrast Real-Time Telemetry Bar -->
          <div class="telemetry-bar">
            <div class="telemetry-item">
              <span class="tel-label font-data">BIOLOGICAL NITROGEN BALANCE</span>
              <span class="tel-value font-display {game1NetNitrogen >= 16 ? 'positive' : 'negative'}">
                {game1NetNitrogen > 0 ? '+' : ''}{game1NetNitrogen} kg/ha
              </span>
              <span class="tel-target font-data">Target: &ge; +16 kg/ha</span>
            </div>

            <div class="telemetry-item">
              <span class="tel-label font-data">ORGANIC CARBON ACCUMULATION</span>
              <span class="tel-value font-display {game1NetSom > 0 ? 'positive' : 'negative'}">
                {game1NetSom > 0 ? '+' : ''}{game1NetSom}% SOM
              </span>
              <span class="tel-target font-data">Builds Spongy Humus</span>
            </div>

            <div class="telemetry-item">
              <span class="tel-label font-data">TOTAL WATER DEMAND</span>
              <span class="tel-value font-display {game1TotalWater <= 1800 ? 'positive' : 'negative'}">
                {game1TotalWater} mm
              </span>
              <span class="tel-target font-data">Budget: &le; 1800 mm</span>
            </div>
          </div>
        </div>

        <div class="arcade-window-footer">
          {#if game1IsBalanced}
            <div class="footer-callout font-body">
              Agroecological balance achieved! Living soil biology feeds the crops while preserving canal water.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '1990_SCENE4_HARVEST'; }}
            >
              Advance to the 1990 Autumn Harvest →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Rotate crops: add nitrogen-fixing pulses (Moong) or taproots (Mustard) and avoid flooding too many plots with Basmati.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '1990_SCENE4_HARVEST'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Young Bebe Amarjit (1990 Harvest)</div>
        <p class="prompt-text font-body">
          “Look at the grain bins, Hari! The pulse roots fed the wheat, the well is full, and we owe the money-lender not a single rupee. Remember this: harvest is not the only thing that matters. What you leave behind beneath the ground matters just as much.”
        </p>
        <div class="inner-thought font-body">
          *Hari carefully seals the Beej Patra with dried neem leaves and sets it in the family alcove.*
        </div>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSuccess(); stage = '2005_SCENE1_CHANGING_VILLAGE'; }}
        >
          Fifteen Years Pass: Fast Forward to 2005 →
        </button>
      </div>
    </div>


  <!-- CHAPTER TWO — 2005: THE PRICE OF PROGRESS -->
  {:else if stage === '2005_SCENE1_CHANGING_VILLAGE'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Gurpreet Singh & Bebe (2005)</div>
        {#if dialogueBeat2005_1 === 0}
          <p class="prompt-text font-body">
            “Hari! Welcome back from the agricultural university! Look at my new machine—a 75-horsepower submersible tubewell! One push of a button and a river comes out of the earth!”
          </p>
          <div class="inner-thought font-body">
            *High-voltage electrical poles now cross the fields. Diesel tractors rumble where bullock carts once walked.*
          </div>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSelect(); dialogueBeat2005_1 = 1; }}
            >
              Ask About Electricity Costs →
            </button>
          </div>
        {:else}
          <p class="prompt-text font-body">
            <strong>Hari:</strong> “What about the power bill for seventy-five horsepower?”<br>
            <strong>Gurpreet:</strong> “Are you crazy? The state government made farm electricity free! Why worry about water when power costs nothing?”<br>
            <strong>Bebe Amarjit:</strong> “Free electricity does not mean free water, puttar. The ground beneath your feet does not replenish as fast as your electric motors spin.”
          </p>
          <div class="inner-thought font-body">
            *Gurpreet laughs and gestures towards the new agricultural extension office down the road.*
          </div>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSelect(); stage = '2005_VILLAGE_EXPLORE'; }}
            >
              Explore Changing Kalan Village →
            </button>
          </div>
        {/if}
      </div>
    </div>

  <!-- 2005 VILLAGE EXPLORATION WORKBENCH -->
  {:else if stage === '2005_VILLAGE_EXPLORE'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Kalan Village Survey: The Technological Shift (2005)
          </div>
          <span class="badge-tokens font-data">{visitedVillage2005.length}/4 SITES SURVEYED</span>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Survey the 4 transformed locations of Kalan village. Inspect the economic and hydrological forces driving farmers to abandon traditional crop rotations:
          </p>

          <!-- 4 Visual Village Hotspots -->
          <div class="farmstead-visual-grid">
            <!-- 1. Gurpreet's Farm -->
            <button 
              type="button" 
              class="farmstead-node {visitedVillage2005.includes('tubewell') ? 'done' : ''}"
              onclick={() => inspectVillageSite('tubewell')}
            >
              <div class="node-icon-box" style="background-color: #E3F2FD;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#1565C0" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <strong class="node-name font-display">Gurpreet's Farm</strong>
              <span class="status-pill font-data {visitedVillage2005.includes('tubewell') ? 'secured' : ''}">
                {visitedVillage2005.includes('tubewell') ? '[75-HP TUBEWELL SURVEYED]' : '[INSPECT BOREWELL]'}
              </span>
            </button>

            <!-- 2. Extension Office -->
            <button 
              type="button" 
              class="farmstead-node {visitedVillage2005.includes('meena') ? 'done' : ''}"
              onclick={() => inspectVillageSite('meena')}
            >
              <div class="node-icon-box" style="background-color: #E8F5E9;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#2E7D32" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <strong class="node-name font-display">Extension Office</strong>
              <span class="status-pill font-data {visitedVillage2005.includes('meena') ? 'secured' : ''}">
                {visitedVillage2005.includes('meena') ? '[MEENA KAUR BRIEFING]' : '[CONSULT OFFICER]'}
              </span>
            </button>

            <!-- 3. Village Canal -->
            <button 
              type="button" 
              class="farmstead-node {visitedVillage2005.includes('canal') ? 'done' : ''}"
              onclick={() => inspectVillageSite('canal')}
            >
              <div class="node-icon-box" style="background-color: #E0F2F1;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#00796B" stroke-width="2">
                  <path d="M2 12h20M2 6h20M2 18h20"/>
                </svg>
              </div>
              <strong class="node-name font-display">Village Canal Branch</strong>
              <span class="status-pill font-data {visitedVillage2005.includes('canal') ? 'secured' : ''}">
                {visitedVillage2005.includes('canal') ? '[CANAL SILT SURVEYED]' : '[CHECK WATER LEVEL]'}
              </span>
            </button>

            <!-- 4. Ancestral Well -->
            <button 
              type="button" 
              class="farmstead-node {visitedVillage2005.includes('well') ? 'done' : ''}"
              onclick={() => inspectVillageSite('well')}
            >
              <div class="node-icon-box" style="background-color: #FFF3E0;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#E65100" stroke-width="2">
                  <circle cx="12" cy="12" r="9"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <strong class="node-name font-display">1920 Ancestral Well</strong>
              <span class="status-pill font-data {visitedVillage2005.includes('well') ? 'secured' : ''}">
                {visitedVillage2005.includes('well') ? '[WATER DROPPED: 22m]' : '[MEASURE WATER LEVEL]'}
              </span>
            </button>
          </div>

          <!-- Botanical / Agronomic Inspection Plate -->
          {#if activeVillagePopup2005 === 'tubewell'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle" style="background: #E3F2FD; border-color: #1565C0;">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#1565C0" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">TECHNOLOGY: 75-HP BOREWELL</span>
                <strong class="plate-title font-display">Subsidized Power & Deep Extraction</strong>
                <p class="plate-desc font-body">
                  Subsidized free electricity has triggered a competitive race. Gurpreet's new 75-HP pump pulls 60 liters of water per second directly from the unconfined aquifer, encouraging non-stop flooding of water-intensive paddy fields.
                </p>
              </div>
            </div>
          {:else if activeVillagePopup2005 === 'meena'}
            <div class="botanical-inspection-plate">
              <img src={charMeenaKaur} alt="Meena Kaur" class="plate-illustration-img" />
              <div class="plate-details-text">
                <span class="plate-tag font-data">EXTENSION SERVICE: AGRONOMIC POLICY</span>
                <strong class="plate-title font-display">Meena Kaur’s Hydrogeological Warning</strong>
                <p class="plate-desc font-body">
                  “The government procurement price for basmati and wheat guarantees cash flow, while pulses receive zero price support. Farmers aren’t greedy—they are trapped in an economic policy that rewards depleting their own groundwater!”
                </p>
              </div>
            </div>
          {:else if activeVillagePopup2005 === 'canal'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle" style="background: #E0F2F1; border-color: #00796B;">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#00796B" stroke-width="2">
                  <path d="M2 12h20M2 6h20M2 18h20"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">HYDROLOGY: SURFACE WATER NEGLECT</span>
                <strong class="plate-title font-display">Canal Siltation & Sluice Disrepair</strong>
                <p class="plate-desc font-body">
                  Because electric tubewells run at the flip of a switch, the village collective canal maintenance has stalled. The canal bed is choking with Himalayan silt, causing tail-end farms to abandon surface irrigation altogether.
                </p>
              </div>
            </div>
          {:else if activeVillagePopup2005 === 'well'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle" style="background: #FFF3E0; border-color: #E65100;">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#E65100" stroke-width="2">
                  <circle cx="12" cy="12" r="9"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">AQUIFER TELEMETRY: 15-YEAR DRAWDOWN</span>
                <strong class="plate-title font-display">The Ancestral Brick Well at 22 Meters</strong>
                <p class="plate-desc font-body">
                  Hari lowers the hemp rope bucket. It strikes bottom with a dull, hollow thud. The water table, which rested at 8 meters in 1990, has dropped 14 meters in just fifteen years. The brick well is beginning to starve.
                </p>
              </div>
            </div>
          {/if}
        </div>

        <div class="arcade-window-footer">
          {#if visitedVillage2005.length >= 2}
            <div class="footer-callout font-body">
              Village survey complete. Gurpreet is calling Hari over to help assemble his new pump!
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '2005_SCENE2_TUBEWELL_RACE'; }}
            >
              Advance to the Tubewell Race →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Survey at least two locations in Kalan village to observe the changes.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '2005_SCENE2_TUBEWELL_RACE'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Gurpreet Singh (2005)</div>
        <p class="prompt-text font-body">
          “Help me bolt together the final stages of the pump shaft, Hari! The borewell drillers finished casing the hole at 45 meters. Once we assemble the impeller and connect the three-phase terminals, we’ll see real water!”
        </p>
        <div class="inner-thought font-body">
          *Heavy wrenches, bronze impellers, and galvanized steel column pipes lie arranged on wooden grease skids.*
        </div>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2005_MINIGAME_TUBEWELL_ASSEMBLY'; }}
        >
          Open Tubewell Assembly Workbench →
        </button>
      </div>
    </div>

  <!-- GRAPHICAL 2005 TUBEWELL BLUEPRINT WORKBENCH -->
  {:else if stage === '2005_MINIGAME_TUBEWELL_ASSEMBLY'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            75-HP Submersible Tubewell Assembly Workbench (2005)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Mounted: {(partPipe?1:0)+(partImpeller?1:0)+(partFilter?1:0)+(partMotor?1:0)+(partGasket?1:0)}/5 Parts</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Assemble Gurpreet's new heavy extraction tubewell. Mount all 5 precision mechanical parts onto the borehole drive column to seal the suction head:
          </p>

          <div class="tubewell-blueprint-canvas-grid">
            <!-- Left: Visual Vertical Borehole Blueprint Diagram (SVG) -->
            <div class="borehole-schematic-column">
              <div class="schematic-header-bar font-data">
                BOREHOLE CASING CUTAWAY &bull; 45m EXTRACTION DEPTH
              </div>
              <svg viewBox="0 0 280 400" class="borehole-svg-blueprint">
                <!-- Soil Surface Line -->
                <rect x="10" y="20" width="260" height="8" fill="#8D6E63" rx="2" />
                <text x="20" y="16" class="svg-schematic-label font-data" fill="#142417">Surface Grade (0m)</text>

                <!-- Outer Steel Casing Pipe -->
                <rect x="90" y="28" width="100" height="340" fill="#37474F" stroke="#263238" stroke-width="2" rx="4" />
                
                <!-- Delivery Flange Head -->
                <rect x="70" y="26" width="140" height="16" fill="#546E7A" stroke="#263238" stroke-width="2" rx="3" />
                
                <!-- Internal Column Pipe (Part 1) -->
                {#if partPipe}
                  <rect x="120" y="42" width="40" height="150" fill="#78909C" stroke="#37474F" stroke-width="2" />
                  <line x1="140" y1="42" x2="140" y2="192" stroke="#455A64" stroke-width="3" stroke-dasharray="6,4" />
                  <text x="170" y="100" class="svg-part-tag font-data" fill="#1B5E20">Riser Column [OK]</text>
                {:else}
                  <rect x="120" y="42" width="40" height="150" fill="none" stroke="#E5A93C" stroke-width="2" stroke-dasharray="5,5" />
                  <text x="170" y="100" class="svg-part-tag font-data" fill="#8C4D00">Slot 1: Riser Column</text>
                {/if}

                <!-- O-Ring Seal (Part 5) -->
                {#if partGasket}
                  <ellipse cx="140" cy="196" rx="24" ry="6" fill="#212121" stroke="#FF5722" stroke-width="2" />
                  <text x="170" y="198" class="svg-part-tag font-data" fill="#1B5E20">Nitrile Seal [OK]</text>
                {:else}
                  <ellipse cx="140" cy="196" rx="24" ry="6" fill="none" stroke="#E5A93C" stroke-width="2" stroke-dasharray="4,3" />
                  <text x="170" y="198" class="svg-part-tag font-data" fill="#8C4D00">Slot 2: O-Ring Gasket</text>
                {/if}

                <!-- Centrifugal Impeller (Part 2) -->
                {#if partImpeller}
                  <rect x="105" y="206" width="70" height="34" fill="#BF6600" stroke="#8C4D00" stroke-width="2" rx="4" />
                  <circle cx="140" cy="223" r="10" fill="#F57C00" />
                  <path d="M135 223 Q140 215 145 223" stroke="#FFF" stroke-width="2" />
                  <text x="180" y="226" class="svg-part-tag font-data" fill="#1B5E20">Impeller Stage [OK]</text>
                {:else}
                  <rect x="105" y="206" width="70" height="34" fill="none" stroke="#E5A93C" stroke-width="2" stroke-dasharray="5,5" rx="4" />
                  <text x="180" y="226" class="svg-part-tag font-data" fill="#8C4D00">Slot 3: Impeller Bowl</text>
                {/if}

                <!-- Sand Strainer Mesh (Part 3) -->
                {#if partFilter}
                  <rect x="110" y="246" width="60" height="42" fill="#B0BEC5" stroke="#455A64" stroke-width="2" />
                  <line x1="110" y1="254" x2="170" y2="254" stroke="#37474F" stroke-width="1.5" stroke-dasharray="3,2" />
                  <line x1="110" y1="262" x2="170" y2="262" stroke="#37474F" stroke-width="1.5" stroke-dasharray="3,2" />
                  <line x1="110" y1="270" x2="170" y2="270" stroke="#37474F" stroke-width="1.5" stroke-dasharray="3,2" />
                  <line x1="110" y1="278" x2="170" y2="278" stroke="#37474F" stroke-width="1.5" stroke-dasharray="3,2" />
                  <text x="175" y="270" class="svg-part-tag font-data" fill="#1B5E20">Sand Screen [OK]</text>
                {:else}
                  <rect x="110" y="246" width="60" height="42" fill="none" stroke="#E5A93C" stroke-width="2" stroke-dasharray="5,5" />
                  <text x="175" y="270" class="svg-part-tag font-data" fill="#8C4D00">Slot 4: Sand Screen</text>
                {/if}

                <!-- 440V Submersible Induction Motor (Part 4) -->
                {#if partMotor}
                  <rect x="112" y="294" width="56" height="66" fill="#1565C0" stroke="#0D47A1" stroke-width="2.5" rx="5" />
                  <line x1="120" y1="310" x2="160" y2="310" stroke="#FFD54F" stroke-width="2" />
                  <line x1="120" y1="325" x2="160" y2="325" stroke="#FFD54F" stroke-width="2" />
                  <line x1="120" y1="340" x2="160" y2="340" stroke="#FFD54F" stroke-width="2" />
                  <text x="175" y="332" class="svg-part-tag font-data" fill="#1B5E20">440V Stator [OK]</text>
                {:else}
                  <rect x="112" y="294" width="56" height="66" fill="none" stroke="#E5A93C" stroke-width="2" stroke-dasharray="5,5" rx="5" />
                  <text x="175" y="332" class="svg-part-tag font-data" fill="#8C4D00">Slot 5: 3-Phase Stator</text>
                {/if}

                <!-- Dynamic Water Flow Effect when Running -->
                {#if tubewellStarted}
                  <path d="M70 34 Q30 34 20 60 L20 180" stroke="#0288D1" stroke-width="12" fill="none" stroke-linecap="round" />
                  <circle cx="20" cy="180" r="14" fill="#03A9F4" />
                {/if}
              </svg>
            </div>

            <!-- Right: 5 Interactive Mechanical Component Cards -->
            <div class="mechanical-inventory-column">
              <div class="tray-header-bar font-data">
                DISASSEMBLED MECHANICAL COMPONENTS &bull; CLICK TO FIT
              </div>

              <!-- Component 1 -->
              <button 
                type="button" 
                class="mechanical-part-tile {partPipe ? 'fitted' : ''}"
                onclick={() => { sfx.playSelect(); partPipe = !partPipe; }}
              >
                <div class="part-tile-icon-box">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="8" y="2" width="8" height="20" rx="1" />
                    <line x1="4" y1="2" x2="20" y2="2" stroke-width="3"/>
                    <line x1="4" y1="22" x2="20" y2="22" stroke-width="3"/>
                  </svg>
                </div>
                <div class="part-tile-info">
                  <strong class="font-display">4-Inch Galvanized Column Riser Pipe</strong>
                  <span class="part-spec font-data">100mm Flange &bull; 16 Bar Working Pressure</span>
                  <p class="part-desc font-body">Carries heavy pressurized groundwater from the deep pump stage to the surface delivery elbow.</p>
                </div>
                <span class="part-status-badge font-data {partPipe ? 'mounted' : ''}">
                  {partPipe ? '[SEATED ON FLANGE]' : '[CLICK TO FIT]'}
                </span>
              </button>

              <!-- Component 2 -->
              <button 
                type="button" 
                class="mechanical-part-tile {partGasket ? 'fitted' : ''}"
                onclick={() => { sfx.playSelect(); partGasket = !partGasket; }}
              >
                <div class="part-tile-icon-box">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" stroke-dasharray="3,2" />
                  </svg>
                </div>
                <div class="part-tile-info">
                  <strong class="font-display">Reinforced Nitrile O-Ring Gasket</strong>
                  <span class="part-spec font-data">Shore A 75 &bull; Hermetic Suction Seal</span>
                  <p class="part-desc font-body">Prevents high-vacuum air leakage between the pump intake bowl and discharge casing to avoid cavitation.</p>
                </div>
                <span class="part-status-badge font-data {partGasket ? 'mounted' : ''}">
                  {partGasket ? '[GASKET COMPRESSED]' : '[CLICK TO FIT]'}
                </span>
              </button>

              <!-- Component 3 -->
              <button 
                type="button" 
                class="mechanical-part-tile {partImpeller ? 'fitted' : ''}"
                onclick={() => { sfx.playSelect(); partImpeller = !partImpeller; }}
              >
                <div class="part-tile-icon-box">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 3a9 9 0 0 1 9 9M12 21a9 9 0 0 1-9-9M3 12a9 9 0 0 1 9-9"/>
                  </svg>
                </div>
                <div class="part-tile-info">
                  <strong class="font-display">Centrifugal Bronze Impeller</strong>
                  <span class="part-spec font-data">2800 RPM &bull; 60 Liters/sec Hydraulic Head</span>
                  <p class="part-desc font-body">Machined dynamic bronze vanes key-locked to the central drive shaft to accelerate water upward.</p>
                </div>
                <span class="part-status-badge font-data {partImpeller ? 'mounted' : ''}">
                  {partImpeller ? '[LOCKED TO KEYWAY]' : '[CLICK TO FIT]'}
                </span>
              </button>

              <!-- Component 4 -->
              <button 
                type="button" 
                class="mechanical-part-tile {partFilter ? 'fitted' : ''}"
                onclick={() => { sfx.playSelect(); partFilter = !partFilter; }}
              >
                <div class="part-tile-icon-box">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="5" y="4" width="14" height="16" rx="2"/>
                    <line x1="5" y1="8" x2="19" y2="8"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <line x1="5" y1="16" x2="19" y2="16"/>
                  </svg>
                </div>
                <div class="part-tile-info">
                  <strong class="font-display">Stainless Slotted Sand Strainer</strong>
                  <span class="part-spec font-data">0.5mm Continuous Slot &bull; AISI 316 Stainless</span>
                  <p class="part-desc font-body">Filters coarse sand particles from the alluvial aquifer bed before they scour the bronze impeller vanes.</p>
                </div>
                <span class="part-status-badge font-data {partFilter ? 'mounted' : ''}">
                  {partFilter ? '[STRAINER SLEEVED]' : '[CLICK TO FIT]'}
                </span>
              </button>

              <!-- Component 5 -->
              <button 
                type="button" 
                class="mechanical-part-tile {partMotor ? 'fitted' : ''}"
                onclick={() => { sfx.playSelect(); partMotor = !partMotor; }}
              >
                <div class="part-tile-icon-box">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="3" width="12" height="18" rx="3"/>
                    <path d="M9 7h6M9 12h6M9 17h6"/>
                    <circle cx="12" cy="2" r="1"/>
                  </svg>
                </div>
                <div class="part-tile-info">
                  <strong class="font-display">440V 3-Phase Submersible Stator Motor</strong>
                  <span class="part-spec font-data">75 HP / 55 kW &bull; Copper Windings &bull; 440V</span>
                  <p class="part-desc font-body">Heavy sealed induction motor that anchors the base of the pump column, drawing subsidized electricity.</p>
                </div>
                <span class="part-status-badge font-data {partMotor ? 'mounted' : ''}">
                  {partMotor ? '[TERMINALS BOLTED]' : '[CLICK TO FIT]'}
                </span>
              </button>
            </div>
          </div>

          <!-- Knife Switch Trigger Area -->
          {#if tubewellComplete && !tubewellStarted}
            <div class="switch-activation-panel">
              <div class="switch-lead font-body">
                All 5 components seated and sealed on the drive shaft! Pull the heavy brass knife-switch to connect subsidized 3-phase grid power and begin groundwater pumping:
              </div>
              <button type="button" class="knife-switch-btn font-display" onclick={fireTubewellMotor}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Throw Knife-Switch (Start 75-HP Tubewell)
              </button>
            </div>
          {:else if tubewellStarted}
            <!-- Real-Time Groundwater Telemetry & Impact Card -->
            <div class="pump-active-flow-card">
              <div class="flow-header font-display">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                High-Pressure Groundwater Discharge: 60 Liters/Second
              </div>

              <!-- Dynamic Telemetry Readout -->
              <div class="telemetry-bar">
                <div class="telemetry-item">
                  <span class="tel-label font-data">DISCHARGE FLOW</span>
                  <span class="tel-value font-display positive">3,600 L / min</span>
                  <span class="tel-target font-data">Floods furrow in seconds</span>
                </div>
                <div class="telemetry-item">
                  <span class="tel-label font-data">GRID POWER DRAW</span>
                  <span class="tel-value font-display negative">55.0 kW (440V)</span>
                  <span class="tel-target font-data">Subsidized Zero Tariff</span>
                </div>
                <div class="telemetry-item">
                  <span class="tel-label font-data">BOREHOLE WATER TABLE</span>
                  <span class="tel-value font-display negative">{waterTableMeters2005}m Depth</span>
                  <span class="tel-target font-data">Dropped from 22m instantly!</span>
                </div>
              </div>

              <div class="character-reaction-dual">
                <div class="quote-bubble gurpreet font-body">
                  <strong>Gurpreet:</strong> “Look at that pressure, Hari! One switch and the whole field is underwater! Who cares about the water table when the government gives electricity for free?”
                </div>
                <div class="quote-bubble meena font-body">
                  <strong>Meena Kaur (Extension Officer):</strong> “The pump works with terrifying power. But notice the aquifer meter: you just pulled down the local water cone by 17 meters in three minutes. Pumping faster does not mean the underground aquifer recovers faster!”
                </div>
              </div>
            </div>
          {/if}
        </div>

        <div class="arcade-window-footer">
          {#if tubewellStarted}
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '2005_SCENE3_PADDY_REVOLUTION'; }}
            >
              Inspect Village Canal Sluice Gates →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Mount all 5 mechanical components onto the borehole blueprint to activate the starter switch.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '2005_SCENE3_PADDY_REVOLUTION'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">The Paddy Dilemma (2005)</div>
        <p class="prompt-text font-body">
          Throughout Kalan, every farmer is planting basmati rice. Government mandis guarantee high prices for paddy and wheat, but offer nothing for moong or millets. Hari’s neighbours urge him to convert all his plots to rice.<br>
          “Hari, your pulses are foolish! Plant rice! The water comes free from the ground!”
        </p>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2005_SCENE4_FIRST_WARNING'; }}
        >
          Check the Ancestral Well →
        </button>
      </div>
    </div>

  {:else if stage === '2005_SCENE4_FIRST_WARNING'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">The First Warning (Summer 2005)</div>
        <p class="prompt-text font-body">
          A scorching afternoon. Hari visits the brick well dug in 1920. He lowers the bucket down the dark shaft—and it hits mud with a dry, hollow clatter.<br>
          <strong>Hari:</strong> “Bebe... the well is dry. It was never dry in my childhood.”<br>
          <strong>Bebe Amarjit:</strong> “When twenty engines suck water from the same subterranean pool day and night, even the rivers under the earth go silent. Now run to the canal before the sluice overflows the pulses!”
        </p>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2005_MINIGAME_IRRIGATION_CONTROL'; }}
        >
          Open Irrigation Canal Control Gate →
        </button>
      </div>
    </div>

  <!-- GRAPHICAL 2005 IRRIGATION CANAL CONTROL PUZZLE -->
  {:else if stage === '2005_MINIGAME_IRRIGATION_CONTROL'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Precision Canal Sluice & Embankment Control (2005)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Delivery Efficiency: {irrigationSolved ? '94%' : '42%'}</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Manage the village canal flow into the farm. Close flooded plots, route water to parched pulse patches, and plug the embankment mud breach:
          </p>

          <!-- Visual Top-Down Canal Simulation Canvas (SVG) -->
          <div class="canal-schematic-canvas">
            <svg viewBox="0 0 600 240" class="canal-svg-map">
              <!-- Main Canal Bed (Horizontal) -->
              <rect x="0" y="30" width="600" height="40" fill="#90CAF9" stroke="#1565C0" stroke-width="3"/>
              <line x1="0" y1="50" x2="600" y2="50" stroke="#1976D2" stroke-width="2" stroke-dasharray="10,8" />
              <text x="15" y="24" class="svg-schematic-label font-data" fill="#0D47A1">Bhakra Main Village Branch Canal</text>

              <!-- Branch 1: North Furrow (to Basmati) -->
              <rect x="120" y="70" width="30" height="90" fill={northGateRaised ? '#64B5F6' : '#CFD8DC'} stroke="#37474F" stroke-width="2"/>
              <rect x="70" y="160" width="130" height="70" fill={northGateRaised ? '#42A5F5' : '#E0F2F1'} stroke="#1B5E20" stroke-width="2" rx="4"/>
              <text x="80" y="185" class="svg-crop-label font-display" fill="#142417">Plot 1: Basmati</text>
              <text x="80" y="205" class="svg-crop-sub font-data" fill={northGateRaised ? '#B71C1C' : '#1B5E20'}>
                {northGateRaised ? 'ALERT: WATERLOGGED' : 'Safe Field Moisture'}
              </text>

              <!-- Branch 2: South Furrow (to Moong) -->
              <rect x="420" y="70" width="30" height="90" fill={southGateRaised ? '#64B5F6' : '#CFD8DC'} stroke="#37474F" stroke-width="2"/>
              <rect x="370" y="160" width="130" height="70" fill={southGateRaised ? '#C8E6C9' : '#FFE0B2'} stroke="#E65100" stroke-width="2" rx="4"/>
              <text x="380" y="185" class="svg-crop-label font-display" fill="#142417">Plot 2: Moong Pulse</text>
              <text x="380" y="205" class="svg-crop-sub font-data" fill={southGateRaised ? '#1B5E20' : '#B71C1C'}>
                {southGateRaised ? 'OPTIMAL HYDRATION' : 'ALERT: PARCHED SOIL'}
              </text>

              <!-- Embankment Breach Leak Area -->
              <rect x="250" y="68" width="80" height="18" fill={mudLeakSealed ? '#8D6E63' : '#FFCDD2'} stroke={mudLeakSealed ? '#4E342E' : '#D32F2F'} stroke-width="2" rx="3"/>
              <text x="255" y="81" class="svg-part-tag font-data" fill={mudLeakSealed ? '#FAF6ED' : '#B71C1C'}>
                {mudLeakSealed ? 'SEALED [OK]' : 'BREACH LEAK!'}
              </text>
            </svg>
          </div>

          <!-- 4 Interactive Hydrologic Control Cards -->
          <div class="canal-controls-grid">
            <!-- Main Sluice -->
            <button 
              type="button" 
              class="canal-gate-card {mainSluiceOpen ? 'safe' : 'danger'}"
              onclick={() => { sfx.playSelect(); mainSluiceOpen = !mainSluiceOpen; }}
            >
              <div class="gate-icon-box">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M5 12h14"/>
                </svg>
              </div>
              <div class="gate-info">
                <strong class="font-display">Main Intake Sluice Winch</strong>
                <p class="font-body">Regulates overall inflow from the government brick canal into the farm head ditch.</p>
              </div>
              <span class="status-pill font-data {mainSluiceOpen ? 'secured' : ''}">
                {mainSluiceOpen ? '[FLOW: 120 L/s ACTIVE]' : '[SLUICE SHUT - ZERO FLOW]'}
              </span>
            </button>

            <!-- North Gate (Basmati) -->
            <button 
              type="button" 
              class="canal-gate-card {!northGateRaised ? 'safe' : 'danger'}"
              onclick={() => { sfx.playSelect(); northGateRaised = !northGateRaised; }}
            >
              <div class="gate-icon-box">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                </svg>
              </div>
              <div class="gate-info">
                <strong class="font-display">Plot 1 Sluice (Basmati Rice)</strong>
                <p class="font-body">Field is already submerged 7cm. Excess water causes anaerobic root rot and exhausts nitrogen.</p>
              </div>
              <span class="status-pill font-data {!northGateRaised ? 'secured' : ''}">
                {northGateRaised ? '[ALERT: OPEN - WATERLOGGING]' : '[SHUT: ROOTZONE PROTECTED]'}
              </span>
            </button>

            <!-- South Gate (Moong) -->
            <button 
              type="button" 
              class="canal-gate-card {southGateRaised ? 'safe' : 'danger'}"
              onclick={() => { sfx.playSelect(); southGateRaised = !southGateRaised; }}
            >
              <div class="gate-icon-box">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div class="gate-info">
                <strong class="font-display">Plot 2 Sluice (Desi Moong Pulses)</strong>
                <p class="font-body">Flowering pulse plants need a single light furrow irrigation to activate symbiotic nodule bacteria.</p>
              </div>
              <span class="status-pill font-data {southGateRaised ? 'secured' : ''}">
                {southGateRaised ? '[DIVERTED: MOISTURE BALANCED]' : '[ALERT: SHUT - SOIL PARCHED]'}
              </span>
            </button>

            <!-- Mud Breach -->
            <button 
              type="button" 
              class="canal-gate-card {mudLeakSealed ? 'safe' : 'danger'}"
              onclick={() => { sfx.playSelect(); mudLeakSealed = !mudLeakSealed; }}
            >
              <div class="gate-icon-box">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div class="gate-info">
                <strong class="font-display">Canal Clay Embankment Wall</strong>
                <p class="font-body">Gopher hole breach leaking 30 Liters/sec into roadside ditch. Tamp with straw and wet alluvial clay.</p>
              </div>
              <span class="status-pill font-data {mudLeakSealed ? 'secured' : ''}">
                {mudLeakSealed ? '[TAMPED WITH CLAY & STRAW]' : '[ALERT: ACTIVE SEEPAGE LEAK]'}
              </span>
            </button>
          </div>

          <!-- Real-Time Telemetry Bar -->
          <div class="telemetry-bar">
            <div class="telemetry-item">
              <span class="tel-label font-data">CANAL DELIVERY EFFICIENCY</span>
              <span class="tel-value font-display {irrigationSolved ? 'positive' : 'negative'}">
                {irrigationSolved ? '94%' : '42%'}
              </span>
              <span class="tel-target font-data">Target: &ge; 90%</span>
            </div>
            <div class="telemetry-item">
              <span class="tel-label font-data">TUBEWELL PUMPING OFFSET</span>
              <span class="tel-value font-display positive">
                {irrigationSolved ? '140 mm Water Saved' : '0 mm Saved'}
              </span>
              <span class="tel-target font-data">Preserves Deep Aquifer</span>
            </div>
            <div class="telemetry-item">
              <span class="tel-label font-data">ROOTZONE AERATION</span>
              <span class="tel-value font-display {irrigationSolved ? 'positive' : 'negative'}">
                {irrigationSolved ? 'Optimal Aerobic' : 'Anaerobic Rot Hazard'}
              </span>
              <span class="tel-target font-data">Protects Soil Bacteria</span>
            </div>
          </div>
        </div>

        <div class="arcade-window-footer">
          {#if irrigationSolved}
            <div class="footer-callout font-body">
              Optimal precision irrigation achieved! Both fields receive target moisture with zero canal loss or root-zone waterlogging.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '2005_SCENE5_VILLAGE_MEETING'; }}
            >
              Advance to Village Banyan Tree Meeting →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Close the over-flooded Basmati gate, raise the Moong gate, and tamp the embankment leak with clay.
            </div>
          {/if}
        </div>
      </div>
    </div>

  <!-- 2005 VILLAGE MEETING UNDER THE BANYAN TREE -->
  {:else if stage === '2005_SCENE5_VILLAGE_MEETING'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Village Panchayat Groundwater Consensus (2005)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Ratified: {(consensusWater?1:0)+(consensusTrials?1:0)+(consensusCanal?1:0)+(consensusSoil?1:0)}/4 Pillars</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Farmers gather under the village banyan tree. Extension Officer Meena displays hydrologic hydrographs showing rapid water table drops. Ratify all 4 cooperative pillars to forge the 2005 Village Groundwater Accord:
          </p>

          <div class="charter-pillars-grid">
            <!-- Pillar 1 -->
            <button 
              type="button" 
              class="pillar-charter-tile {consensusWater ? 'ratified' : ''}"
              onclick={() => { sfx.playSelect(); consensusWater = !consensusWater; }}
            >
              <div class="pillar-icon-box">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 3"/>
                </svg>
              </div>
              <div class="pillar-content">
                <strong class="font-display">Shared Well Extraction Ceilings</strong>
                <span class="pillar-tag font-data">POLICY PILLAR 1 &bull; HYDROLOGY</span>
                <p class="font-body">Install mechanical water meters on high-power tubewells. Limit pumping hours during peak summer draw to prevent aquifer collapse.</p>
              </div>
              <span class="stamp-badge font-data {consensusWater ? 'stamped' : ''}">
                {consensusWater ? '[RATIFIED BY PANCHAYAT]' : '[CLICK TO RATIFY]'}
              </span>
            </button>

            <!-- Pillar 2 -->
            <button 
              type="button" 
              class="pillar-charter-tile {consensusTrials ? 'ratified' : ''}"
              onclick={() => { sfx.playSelect(); consensusTrials = !consensusTrials; }}
            >
              <div class="pillar-icon-box">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div class="pillar-content">
                <strong class="font-display">20% Crop Diversification to Desi Pulses</strong>
                <span class="pillar-tag font-data">POLICY PILLAR 2 &bull; AGRONOMY</span>
                <p class="font-body">Guarantee minimum procurement for Moong and Pearl Millet to break the continuous water-exhaustive Rice-Wheat monoculture.</p>
              </div>
              <span class="stamp-badge font-data {consensusTrials ? 'stamped' : ''}">
                {consensusTrials ? '[RATIFIED BY PANCHAYAT]' : '[CLICK TO RATIFY]'}
              </span>
            </button>

            <!-- Pillar 3 -->
            <button 
              type="button" 
              class="pillar-charter-tile {consensusCanal ? 'ratified' : ''}"
              onclick={() => { sfx.playSelect(); consensusCanal = !consensusCanal; }}
            >
              <div class="pillar-icon-box">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div class="pillar-content">
                <strong class="font-display">Community Canal Desilting (Shramdaan)</strong>
                <span class="pillar-tag font-data">POLICY PILLAR 3 &bull; INFRASTRUCTURE</span>
                <p class="font-body">Organize joint village labor before every monsoon to dredge silt from delivery distributaries and restore gravity canal reach.</p>
              </div>
              <span class="stamp-badge font-data {consensusCanal ? 'stamped' : ''}">
                {consensusCanal ? '[RATIFIED BY PANCHAYAT]' : '[CLICK TO RATIFY]'}
              </span>
            </button>

            <!-- Pillar 4 -->
            <button 
              type="button" 
              class="pillar-charter-tile {consensusSoil ? 'ratified' : ''}"
              onclick={() => { sfx.playSelect(); consensusSoil = !consensusSoil; }}
            >
              <div class="pillar-icon-box">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2C8 6 4 11 4 16a8 8 0 0 0 16 0c0-5-4-10-8-14z"/>
                </svg>
              </div>
              <div class="pillar-content">
                <strong class="font-display">Soil Organic Carbon & Stubble Mulch</strong>
                <span class="pillar-tag font-data">POLICY PILLAR 4 &bull; BIOLOGY</span>
                <p class="font-body">Incentivize in-situ residue incorporation over matchstick burning. Monitor village topsoil humus to maintain minimum 1.5% SOM.</p>
              </div>
              <span class="stamp-badge font-data {consensusSoil ? 'stamped' : ''}">
                {consensusSoil ? '[RATIFIED BY PANCHAYAT]' : '[CLICK TO RATIFY]'}
              </span>
            </button>
          </div>
        </div>

        <div class="arcade-window-footer">
          {#if meetingConsensusReady}
            <div class="footer-callout font-body">
              All 4 cooperative pillars ratified! The village has an ecological charter to guide the coming decades.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '2005_CHAPTER_ENDING'; }}
            >
              Seal 2005 Village Charter & Advance to 2026 →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Click each of the 4 policy pillars to stamp the official Panchayat seal.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '2005_CHAPTER_ENDING'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Hari’s Field Journal (2005)</div>
        <p class="prompt-text font-body">
          “We kept the pulse seeds alive on our land, but around us, the tubewells multiply every month. Electricity remains free. Gurpreet pumps day and night. The water table has already plunged 14 meters. How long can a river hide under the ground before it is sucked dry?”
        </p>
        <div class="inner-thought font-body">
          *Twenty-one years pass. The climate crisis accelerates. The year becomes 2026.*
        </div>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSuccess(); stage = '2026_SCENE1_SCREECHING_MOTOR'; }}
        >
          Fast Forward to 2026: The Boiling Point →
        </button>
      </div>
    </div>


  <!-- CHAPTER THREE — 2026: THE BOILING POINT -->
  {:else if stage === '2026_SCENE1_SCREECHING_MOTOR'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Hari & Elder Bebe Amarjit (2026)</div>
        <p class="prompt-text font-body">
          A horrific metallic screeching shakes the pump shed. Adult Hari (age 48) kills the master circuit breaker. The discharge pipe spits boiling muddy slurry and coarse grey sand.<br>
          <strong>Hari:</strong> “The impeller is destroyed again. We are pumping from 82 meters down, Bebe. We’ve hit the deep sand barrier.”
        </p>
        <div class="inner-thought font-body">
          *Elder Bebe Amarjit, now frail, leans heavily on her wooden walking staff.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 6px;">
          <strong>Bebe Amarjit:</strong> “The machine is crying because the earth has nothing left to give it. Look across the village, Hari. Look what we have done to our home.”
        </p>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2026_FARM_INVESTIGATION'; }}
        >
          Investigate the 2026 Crisis Hotspots →
        </button>
      </div>
    </div>

  <!-- 2026 CRISIS INVESTIGATION WORKBENCH -->
  {:else if stage === '2026_FARM_INVESTIGATION'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Forensic Field Investigation: The Boiling Point (2026)
          </div>
          <span class="badge-tokens font-data">{inspectedEvidence.length}/4 SITES INVESTIGATED</span>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Examine the 4 environmental breakdown points across Kalan village. Discover why deeper drilling and stubble burning have trapped the community in debt:
          </p>

          <!-- 4 Visual Crisis Hotspots -->
          <div class="farmstead-visual-grid">
            <!-- 1. Sand Cavitation Pump -->
            <button 
              type="button" 
              class="farmstead-node {inspectedEvidence.includes('sand_pump') ? 'done' : ''}"
              onclick={() => inspectCrisis('sand_pump')}
            >
              <div class="node-icon-box" style="background-color: #FFEBEE;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#D32F2F" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <strong class="node-name font-display">82m Screeching Pump</strong>
              <span class="status-pill font-data {inspectedEvidence.includes('sand_pump') ? 'secured' : ''}">
                {inspectedEvidence.includes('sand_pump') ? '[SAND CAVITATION CONFIRMED]' : '[INSPECT MOTOR]'}
              </span>
            </button>

            <!-- 2. Dry Brick Well -->
            <button 
              type="button" 
              class="farmstead-node {inspectedEvidence.includes('dry_well') ? 'done' : ''}"
              onclick={() => inspectCrisis('dry_well')}
            >
              <div class="node-icon-box" style="background-color: #EFEBE9;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#5D4037" stroke-width="2">
                  <circle cx="12" cy="12" r="9"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <strong class="node-name font-display">1920 Well Head</strong>
              <span class="status-pill font-data {inspectedEvidence.includes('dry_well') ? 'secured' : ''}">
                {inspectedEvidence.includes('dry_well') ? '[DEPTH 42m: BONE DRY]' : '[CHECK ANCESTRAL WELL]'}
              </span>
            </button>

            <!-- 3. Stubble Smoke Haze -->
            <button 
              type="button" 
              class="farmstead-node {inspectedEvidence.includes('stubble_smoke') ? 'done' : ''}"
              onclick={() => inspectCrisis('stubble_smoke')}
            >
              <div class="node-icon-box" style="background-color: #FFF8E1;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#FF8F00" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <strong class="node-name font-display">Stubble Smoke Haze</strong>
              <span class="status-pill font-data {inspectedEvidence.includes('stubble_smoke') ? 'secured' : ''}">
                {inspectedEvidence.includes('stubble_smoke') ? '[PM2.5: 680 µg/m³ HAZARDOUS]' : '[ANALYZE SMOKE]'}
              </span>
            </button>

            <!-- 4. Bank Foreclosure Notice -->
            <button 
              type="button" 
              class="farmstead-node {inspectedEvidence.includes('bank_debt') ? 'done' : ''}"
              onclick={() => inspectCrisis('bank_debt')}
            >
              <div class="node-icon-box" style="background-color: #EDE7F6;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#512DA8" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <strong class="node-name font-display">Bank Loan Notice</strong>
              <span class="status-pill font-data {inspectedEvidence.includes('bank_debt') ? 'secured' : ''}">
                {inspectedEvidence.includes('bank_debt') ? '[₹12 LAKH DEBT RECORD]' : '[READ LEGAL NOTICE]'}
              </span>
            </button>
          </div>

          <!-- Crisis Inspection Plate -->
          {#if activeCrisisPopup === 'sand_pump'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle" style="background: #FFEBEE; border-color: #D32F2F;">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#D32F2F" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">HYDROLOGY CRASH: 82-METER BOREHOLE</span>
                <strong class="plate-title font-display">Impeller Erosion & Cavitation Slurry</strong>
                <p class="plate-desc font-body">
                  The shallow aquifer is completely empty. Boreholes have pushed past the dense clay confining bed into ancient alluvial sand. Pumping at 82 meters pulls high-velocity grit that shreds bronze impellers in weeks, requiring ₹45,000 in emergency repairs.
                </p>
              </div>
            </div>
          {:else if activeCrisisPopup === 'dry_well'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle" style="background: #EFEBE9; border-color: #5D4037;">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#5D4037" stroke-width="2">
                  <circle cx="12" cy="12" r="9"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">AQUIFER DEPLETION: 1920 WELL SILENT</span>
                <strong class="plate-title font-display">Cobwebs at 42 Meters</strong>
                <p class="plate-desc font-body">
                  The brick well built by Hari’s great-great-grandfather is bone dry to the bottom. For 80 years it provided clean drinking water. Now its brick walls are cracked and dry, an empty vertical tomb reflecting 25 years of extraction madness.
                </p>
              </div>
            </div>
          {:else if activeCrisisPopup === 'stubble_smoke'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle" style="background: #FFF8E1; border-color: #FF8F00;">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#FF8F00" stroke-width="2">
                  <path d="M12 2C8 6 4 11 4 16a8 8 0 0 0 16 0c0-5-4-10-8-14z"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">ATMOSPHERIC POLLUTION: STUBBLE HAZE</span>
                <strong class="plate-title font-display">Severe Autumn Smoke Smog (PM2.5: 680 µg/m³)</strong>
                <p class="plate-desc font-body">
                  Because farmers have only 10 days between paddy harvest and wheat sowing, millions of hectares of rice residue are torched with matchsticks. The smoke blackens the northern sky, while burning destroys valuable topsoil organic carbon.
                </p>
              </div>
            </div>
          {:else if activeCrisisPopup === 'bank_debt'}
            <div class="botanical-inspection-plate">
              <div class="plate-badge-circle" style="background: #EDE7F6; border-color: #512DA8;">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#512DA8" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                </svg>
              </div>
              <div class="plate-details-text">
                <span class="plate-tag font-data">AGRARIAN CRISIS: SPIRALING DEBT</span>
                <strong class="plate-title font-display">Foreclosure Notice: ₹12 Lakh Borewell Debt</strong>
                <p class="plate-desc font-body">
                  Gurpreet’s family has taken three successive bank loans to deepen their tubewells from 40m to 70m to 95m. With diesel costs and failing pumps, the farm now owes more than the entire value of the land.
                </p>
              </div>
            </div>
          {/if}
        </div>

        <div class="arcade-window-footer">
          {#if inspectedEvidence.length >= 2}
            <div class="footer-callout font-body">
              Investigation complete! Extension Officer Meena is reviewing satellite data with Gurpreet.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '2026_SCENE2_FAMILY_DEBT'; }}
            >
              Advance to the Standoff with Gurpreet →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Investigate at least two crisis points to reveal the full scope of the emergency.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '2026_SCENE2_FAMILY_DEBT'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Gurpreet & Bebe Amarjit (2026)</div>
        <p class="prompt-text font-body">
          Gurpreet slumps on a burlap sack, his hands trembling: “The bank sent a final recovery notice, Hari. Twelve lakh rupees. The borewell company wants three lakhs to drill down to 120 meters. If I don’t drill, my paddy dies. If I drill, I lose the farm!”<br>
          <strong>Bebe Amarjit:</strong> “You drilled into the earth looking for water, puttar, but all you found was debt. The earth does not have a secret river that will forgive our greed.”
        </p>
        <p class="prompt-text font-body" style="font-weight: 600; color: #BF360C; margin-top: 8px;">
          Extension Officer Meena arrives with a laptop displaying orbital radar readings: “Look at this NASA data. You are not alone—the entire state’s gravity signature has collapsed!”
        </p>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2026_SCENE3_SATELLITE_GRACE'; }}
        >
          View NASA GRACE Satellite Data →
        </button>
      </div>
    </div>

  {:else if stage === '2026_SCENE3_SATELLITE_GRACE'}
    <div class="story-floating-card scrollable-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">NASA GRACE Satellite Briefing (2026)</div>
        <p class="prompt-text font-body">
          Meena displays color-coded satellite radar maps: “NASA’s GRACE satellites track Earth’s mass changes by measuring micro-variations in gravitational pull. Between 2002 and 2026, northern India lost over <strong>54 billion cubic meters of groundwater</strong>. The satellite sees a massive red deficit zone centered directly over our district!”
        </p>
        <div class="inner-thought font-body">
          *The orbital data proves that deep tubewells are not pulling replenished rain, but draining irreplaceable prehistoric fossil water.*
        </div>
      </div>

      <div class="telemetry-bar" style="margin-top: 14px;">
        <div class="telemetry-item">
          <span class="tel-label font-data">REGIONAL MASS LOSS</span>
          <span class="tel-value font-display negative">-28 cm / year</span>
          <span class="tel-target font-data">Equivalent Water Thickness</span>
        </div>
        <div class="telemetry-item">
          <span class="tel-label font-data">RECHARGE DEFICIT</span>
          <span class="tel-value font-display negative">400% Extraction</span>
          <span class="tel-target font-data">Pumping 4x Monsoon Recharge</span>
        </div>
        <div class="telemetry-item">
          <span class="tel-label font-data">DATA SOURCE</span>
          <span class="tel-value font-display positive">NASA GRACE-FO Orbit</span>
          <span class="tel-target font-data">Twin Gravimetry Satellites</span>
        </div>
      </div>

      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2026_MINIGAME_AQUIFER_DETECTIVE'; }}
        >
          Open Aquifer Detective Strata Cross-Section →
        </button>
      </div>
    </div>

  <!-- GRAPHICAL 2026 AQUIFER DETECTIVE STRATA CROSS-SECTION -->
  {:else if stage === '2026_MINIGAME_AQUIFER_DETECTIVE'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="2" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            Deep Geological Strata & Borehole Drill Probe (2026)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Depth: {strataDepthSlider}m &bull; {pumpStatus2026.status}</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Drag the drill casing slider down through the Indo-Gangetic alluvial basin strata. Observe where freshwater gives way to toxic lacustrine cavitation:
          </p>

          <div class="strata-workbench-canvas-grid">
            <!-- Left: Full Geological Cutaway SVG -->
            <div class="strata-cutaway-diagram">
              <svg viewBox="0 0 340 360" class="geology-svg-view">
                <!-- Surface 0-2m -->
                <rect x="10" y="10" width="320" height="35" fill="#A1887F" stroke="#4E342E" stroke-width="2"/>
                <text x="20" y="32" class="svg-layer-title font-display" fill="#FFFFFF">0–2m: Topsoil Humus (0.6% SOM Fallow Crust)</text>

                <!-- 8-25m Alluvial Sand Horizon (Depleted) -->
                <rect x="10" y="47" width="320" height="70" fill="#FFE082" stroke="#FF8F00" stroke-width="2"/>
                <text x="20" y="70" class="svg-layer-title font-display" fill="#3E2723">8–25m: Upper Unconfined Alluvial Sand</text>
                <text x="20" y="90" class="svg-layer-sub font-data" fill="#5D4037">Historical 1920 Brick Well Head [BONE DRY SINCE 2012]</text>

                <!-- 25-70m Dense Lacustrine Clay Aquitard -->
                <rect x="10" y="119" width="320" height="110" fill="#78909C" stroke="#37474F" stroke-width="2"/>
                <text x="20" y="145" class="svg-layer-title font-display" fill="#FFFFFF">25–70m: Impermeable Lacustrine Clay Bed</text>
                <text x="20" y="165" class="svg-layer-sub font-data" fill="#ECEFF1">Geological Aquitard Hardpan &bull; Blocks Surface Recharge</text>

                <!-- 70-120m Deep Confined Fossil Aquifer -->
                <rect x="10" y="231" width="320" height="120" fill="#3E2723" stroke="#B71C1C" stroke-width="2"/>
                <text x="20" y="260" class="svg-layer-title font-display" fill="#FFCDD2">70–120m: Ancient Confined Fossil Aquifer</text>
                <text x="20" y="280" class="svg-layer-sub font-data" fill="#FFEBEE">Pumping Sand Cavitation &bull; Salinity & Fluoride Zone</text>

                <!-- Dynamic Drill Rig Casing Line -->
                <rect x="160" y="10" width="16" height={Math.min(330, (strataDepthSlider / 110) * 330)} fill="#263238" stroke="#ECEFF1" stroke-width="2" rx="3"/>
                <circle cx="168" cy={Math.min(335, (strataDepthSlider / 110) * 330 + 10)} r="7" fill={pumpStatus2026.color} stroke="#FFFFFF" stroke-width="2"/>
                <line x1="175" y1={Math.min(335, (strataDepthSlider / 110) * 330 + 10)} x2="220" y2={Math.min(335, (strataDepthSlider / 110) * 330 + 10)} stroke={pumpStatus2026.color} stroke-width="2"/>
                <text x="225" y={Math.min(335, (strataDepthSlider / 110) * 330 + 14)} class="svg-depth-indicator font-data" fill={pumpStatus2026.color}>
                  Probe: {strataDepthSlider}m
                </text>
              </svg>
            </div>

            <!-- Right: Interactive Probe Controls & Telemetry -->
            <div class="strata-controls-panel">
              <div class="slider-control-card">
                <label class="slider-head font-display" for="depth-range">
                  BOREHOLE PROBE CASING DEPTH
                </label>
                <div class="depth-number-display font-data">
                  <span class="depth-meters">{strataDepthSlider}</span> <span class="depth-unit">METERS UNDERGROUND</span>
                </div>
                <input 
                  id="depth-range"
                  type="range" 
                  min="10" 
                  max="110" 
                  bind:value={strataDepthSlider} 
                  class="depth-slider"
                />
                <div class="slider-ticks-row font-data">
                  <span>10m (1920 Well)</span>
                  <span>45m (2005 Level)</span>
                  <span>82m (2026 Cavitation)</span>
                  <span>110m (Fossil)</span>
                </div>
              </div>

              <!-- Dynamic Water Chemistry Card -->
              <div class="strata-status-card" style="border-left: 5px solid {pumpStatus2026.color};">
                <span class="status-tag font-data" style="color: {pumpStatus2026.color};">
                  HYDROGEOLOGICAL STATUS: {pumpStatus2026.status.toUpperCase()}
                </span>
                <p class="status-explanation font-body">{pumpStatus2026.desc}</p>
              </div>

              <!-- NASA GRACE Satellite Observation Pill -->
              <div class="nasa-satellite-briefing-box">
                <div class="satellite-head font-data">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  NASA GRACE SATELLITE GRAVIMETRY BRIEFING
                </div>
                <p class="font-body">
                  Twin satellites measuring Earth's gravity field detect an unprecedented <strong>-28 cm/year equivalent groundwater loss</strong> across northern India. Over 54 billion cubic meters of ancient water have been depleted in 20 years.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="arcade-window-footer">
          <button 
            type="button" 
            class="continue-btn font-display"
            onclick={() => { sfx.playSuccess(); stage = '2026_SCENE6_HAPPY_SEEDER'; }}
          >
            Advance to Happy Seeder Machine Simulator →
          </button>
        </div>
      </div>
    </div>

  {:else if stage === '2026_SCENE6_HAPPY_SEEDER'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Stubble Burning Dilemma (Autumn 2026)</div>
        <p class="prompt-text font-body">
          Gurpreet holds a match to his paddy stubble: “What else can I do, Hari? I have 10 days to sow wheat!”<br>
          Hari gestures to the Happy Seeder implement hitched to his tractor: “Cut the straw and mulch it directly into the topsoil! It cools the earth by 4°C, traps moisture, and adds organic carbon without setting Punjab on fire!”
        </p>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2026_MINIGAME_STUBBLE_SIM'; }}
        >
          Open Happy Seeder Machine Simulator →
        </button>
      </div>
    </div>

  <!-- GRAPHICAL 2026 HAPPY SEEDER SIMULATOR -->
  {:else if stage === '2026_MINIGAME_STUBBLE_SIM'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Happy Seeder Tractor Mulching & Residue Simulator (2026)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Air Quality PM2.5: {seederRunDone ? '35 µg/m³ (Clean)' : '680 µg/m³ (Hazardous Smoke)'}</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Calibrate the tractor’s PTO speed and coulter working depth. Slice through standing paddy stubble and lay down an even 10cm straw mulch blanket to sow wheat without burning:
          </p>

          <!-- Visual Tractor Implement Schematic (SVG) -->
          <div class="seeder-visual-canvas">
            <svg viewBox="0 0 600 200" class="seeder-svg-schematic">
              <!-- Soil Ground Level -->
              <rect x="0" y="110" width="600" height="90" fill="#6D4C41" stroke="#3E2723" stroke-width="2"/>
              <text x="15" y="130" class="svg-schematic-label font-data" fill="#D7CCC8">Topsoil Bed (Sowing Wheat Furrows)</text>

              <!-- Standing Stubble (Left) -->
              <line x1="40" y1="70" x2="40" y2="110" stroke="#FFE082" stroke-width="4"/>
              <line x1="60" y1="65" x2="60" y2="110" stroke="#FFE082" stroke-width="4"/>
              <line x1="80" y1="72" x2="80" y2="110" stroke="#FFE082" stroke-width="4"/>
              <line x1="100" y1="68" x2="100" y2="110" stroke="#FFE082" stroke-width="4"/>
              <line x1="120" y1="70" x2="120" y2="110" stroke="#FFE082" stroke-width="4"/>
              <line x1="140" y1="65" x2="140" y2="110" stroke="#FFE082" stroke-width="4"/>

              <!-- Rotating Flail Cylinder (Center) -->
              <circle cx="240" cy="85" r="35" fill="#455A64" stroke="#263238" stroke-width="3"/>
              <circle cx="240" cy="85" r="8" fill="#ECEFF1"/>
              <path d="M220 85 L260 85 M240 65 L240 105" stroke="#FFF" stroke-width="3"/>
              <text x="210" y="40" class="svg-crop-sub font-data" fill="#142417">Flail Rotor (1800 RPM)</text>

              <!-- Coulter Boot (Furrow Opener) -->
              <polygon points="320,80 340,80 330,135" fill="#37474F" stroke="#212121" stroke-width="2"/>
              <line x1="330" y1="80" x2="330" y2="140" stroke="#FF5722" stroke-width="3" stroke-dasharray="3,2"/>
              <text x="310" y="160" class="svg-depth-indicator font-data" fill="#FF5722">Depth: {seederDepthKnob}cm</text>

              <!-- Mulched Golden Blanket (Right) -->
              <rect x="350" y="100" width="250" height="15" fill="#FFD54F" stroke="#FFA000" stroke-width="1.5" rx="3"/>
              <text x="380" y="95" class="svg-part-tag font-data" fill="#E65100">Uniform 10cm Straw Mulch Blanket</text>
              
              <!-- Wheat Seeds Placed in Furrow -->
              <circle cx="380" cy="125" r="3.5" fill="#4CAF50"/>
              <circle cx="430" cy="125" r="3.5" fill="#4CAF50"/>
              <circle cx="480" cy="125" r="3.5" fill="#4CAF50"/>
              <circle cx="530" cy="125" r="3.5" fill="#4CAF50"/>
              <circle cx="580" cy="125" r="3.5" fill="#4CAF50"/>
            </svg>
          </div>

          <!-- Cockpit Controls: Coulter Depth & Speed -->
          <div class="seeder-controls-cluster">
            <div class="toggle-card">
              <span class="toggle-label font-data">COULTER WORKING DEPTH: {seederDepthKnob} CM</span>
              <div class="segmented-control">
                <button 
                  type="button" 
                  class="seg-btn {seederDepthKnob === 2 ? 'active' : ''}" 
                  onclick={() => { seederDepthKnob = 2; sfx.playSelect(); }}
                >
                  2cm (Shallow - Seed Exposed)
                </button>
                <button 
                  type="button" 
                  class="seg-btn {seederDepthKnob === 5 ? 'active' : ''}" 
                  onclick={() => { seederDepthKnob = 5; sfx.playSelect(); }}
                >
                  5cm (Optimal Furrow Depth)
                </button>
                <button 
                  type="button" 
                  class="seg-btn {seederDepthKnob === 8 ? 'active' : ''}" 
                  onclick={() => { seederDepthKnob = 8; sfx.playSelect(); }}
                >
                  8cm (Excess Drag / Engine Stall)
                </button>
              </div>
            </div>

            <div class="toggle-card">
              <span class="toggle-label font-data">TRACTOR GROUND SPEED: {seederSpeedDial} KM/H</span>
              <div class="segmented-control">
                <button 
                  type="button" 
                  class="seg-btn {seederSpeedDial === 1.5 ? 'active' : ''}" 
                  onclick={() => { seederSpeedDial = 1.5; sfx.playSelect(); }}
                >
                  1.5 km/h (Sluggish / Clogging)
                </button>
                <button 
                  type="button" 
                  class="seg-btn {seederSpeedDial === 3.5 ? 'active' : ''}" 
                  onclick={() => { seederSpeedDial = 3.5; sfx.playSelect(); }}
                >
                  3.5 km/h (Balanced Residue Throw)
                </button>
                <button 
                  type="button" 
                  class="seg-btn {seederSpeedDial === 6.0 ? 'active' : ''}" 
                  onclick={() => { seederSpeedDial = 6.0; sfx.playSelect(); }}
                >
                  6.0 km/h (Overspeed / Choking Chute)
                </button>
              </div>
            </div>
          </div>

          <!-- Execution Action -->
          <div class="seeder-action-strip">
            <button 
              type="button" 
              class="calibrate-run-btn font-display {seederCalibrated ? 'ready' : ''}"
              onclick={executeSeederRun}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              Engage PTO & Run Happy Seeder Pass
            </button>
          </div>

          <!-- Real-Time Telemetry Bar -->
          <div class="telemetry-bar">
            <div class="telemetry-item">
              <span class="tel-label font-data">TOPSOIL MICROCLIMATE</span>
              <span class="tel-value font-display positive">
                {seederRunDone ? '32°C (Protected)' : '54°C (Scorched)'}
              </span>
              <span class="tel-target font-data">Mulch Blanket Cooling</span>
            </div>
            <div class="telemetry-item">
              <span class="tel-label font-data">MOISTURE RETENTION</span>
              <span class="tel-value font-display positive">
                {seederRunDone ? '+42% Preserved' : 'Rapid Soil Desiccation'}
              </span>
              <span class="tel-target font-data">Cuts 1 Irrigation Cycle</span>
            </div>
            <div class="telemetry-item">
              <span class="tel-label font-data">AIR QUALITY INDEX (PM2.5)</span>
              <span class="tel-value font-display {seederRunDone ? 'positive' : 'negative'}">
                {seederRunDone ? '35 µg/m³ (Clean)' : '680 µg/m³ (Toxic Smoke)'}
              </span>
              <span class="tel-target font-data">Target: &le; 60 µg/m³</span>
            </div>
          </div>
        </div>

        <div class="arcade-window-footer">
          {#if seederRunDone}
            <div class="footer-callout font-body">
              Happy Seeder pass complete! Clean wheat furrows sown beneath a protective 10cm straw blanket without burning a single match.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '2026_CHAPTER_ENDING'; }}
            >
              Advance to 2026 Autumn Transition →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Select optimal depth (5cm) and balanced speed (3.5 km/h), then engage the tractor PTO pass.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '2026_CHAPTER_ENDING'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">A Tribute at the Dry Well (2026)</div>
        <p class="prompt-text font-body">
          That winter, Bebe Amarjit passed away peacefully on the veranda. Hari stood beside the dry brick well she loved so dearly.<br>
          “You were right, Bebe. We dug until the earth bled sand. But I swear on this land: your seeds will not die with this generation.”
        </p>
        <div class="inner-thought font-body">
          *Fourteen years pass. The final chapter opens in the year 2040.*
        </div>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSuccess(); stage = '2040_SCENE1_EMERGENCY_SIREN'; }}
        >
          Travel to 2040: The Inheritance & Regeneration →
        </button>
      </div>
    </div>


  <!-- CHAPTER FOUR — 2040: THE INHERITANCE -->
  {:else if stage === '2040_SCENE1_EMERGENCY_SIREN'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Kabir, Rani & Dada Hari (2040)</div>
        <p class="prompt-text font-body">
          A distant thermal siren wails across the district. Outside, a hot 45°C wind sweeps across the cracked, abandoned fields. Dust rattles against the shuttered windows.<br>
          <strong>Rani:</strong> “Dada, why did everyone leave Village Kalan? Why are so many houses locked with iron chains?”
        </p>
        <div class="inner-thought font-body">
          *Elder Hari (age 62) looks out towards the ghost outpost of Kalan.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 6px;">
          <strong>Hari:</strong> “Because when you take everything from the earth and put nothing back, the earth eventually asks you to leave. Come with me to the village square. Look at the history left behind.”
        </p>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2040_SCENE2_GHOST_VILLAGE'; }}
        >
          Walk into the Ghost Outpost of Kalan →
        </button>
      </div>
    </div>

  {:else if stage === '2040_SCENE2_GHOST_VILLAGE'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">The Ghost Outpost of Kalan (2040)</div>
        <p class="prompt-text font-body">
          Rusting tractor chassis sit half-buried in blowing loess sand. The village primary school is shuttered. Broken plastic pipes litter the dry canal bed.<br>
          Inside the abandoned Panchayat office, archival logbooks, bank notices, and field records are scattered across the floor.
        </p>
        <div class="inner-thought font-body">
          *Can you reconstruct the historical chain of events that transformed a prosperous agricultural village into an abandoned desert?*
        </div>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2040_MINIGAME_WHAT_WENT_WRONG'; }}
        >
          Open Forensic Timeline Investigation →
        </button>
      </div>
    </div>

  <!-- GRAPHICAL 2040 GHOST VILLAGE FORENSIC TIMELINE INVESTIGATION -->
  {:else if stage === '2040_MINIGAME_WHAT_WENT_WRONG'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            Forensic Investigation: The 50-Year Fall of Village Kalan (2040)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Timeline: {timelineSequence.length}/5 Events Ordered</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Examine the 5 archival evidence cards found in the abandoned panchayat office. Click them in their exact chronological cause-and-effect order to uncover how Village Kalan became a ghost outpost:
          </p>

          <!-- 5 Archival Evidence Polaroids (NO SPOILED NUMBERS!) -->
          <div class="forensic-polaroids-grid">
            {#each polaroids as p}
              <button 
                type="button" 
                class="forensic-card {timelineSequence.includes(p.id) ? 'placed' : ''}"
                onclick={() => addPolaroidToSequence(p.id)}
                disabled={timelineSequence.includes(p.id)}
              >
                <div class="polaroid-header-bar font-data">
                  <span>HISTORICAL EVIDENCE CARD</span>
                  {#if timelineSequence.includes(p.id)}
                    <span class="placed-seq-tag">STEP #{timelineSequence.indexOf(p.id) + 1}</span>
                  {:else}
                    <span class="unplaced-seq-tag">CLICK TO PLACE</span>
                  {/if}
                </div>

                <div class="polaroid-card-body">
                  <strong class="polaroid-visual-title font-display">{p.visualScene}</strong>
                  <p class="polaroid-text-desc font-body">{p.description}</p>
                </div>
              </button>
            {/each}
          </div>

          <!-- Interactive Placement Tray -->
          <div class="timeline-chronology-tray">
            <div class="tray-title font-data">DEDUCED CAUSAL CHRONOLOGY:</div>
            <div class="tray-slots-row">
              {#each [1, 2, 3, 4, 5] as slotIndex}
                <div class="timeline-slot-box font-data {timelineSequence.length >= slotIndex ? 'filled' : ''}">
                  <span class="slot-number font-display">#{slotIndex}</span>
                  {#if timelineSequence[slotIndex - 1]}
                    <span class="slot-text font-body">
                      {polaroids.find(p => p.id === timelineSequence[slotIndex - 1])?.visualScene.substring(0, 36)}...
                    </span>
                  {:else}
                    <span class="slot-empty font-data">[EMPTY SLOT]</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>

        <div class="arcade-window-footer">
          <button type="button" class="action-btn secondary font-display" onclick={clearTimeline}>
            Reset Sequence
          </button>

          {#if timelineIsCorrect}
            <div class="footer-callout font-body">
              Historical timeline verified! The unbroken chain from chemical rush to aquifer exhaustion is laid bare.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '2040_SCENE4_COOPERATIVE_SOLAR'; }}
            >
              Timeline Reconstructed! Meet Simran Kaur →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Place all 5 events in chronological cause-and-effect order.
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if stage === '2040_SCENE4_COOPERATIVE_SOLAR'}
    <div class="story-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Simran Kaur & Dada Hari (2040)</div>
        <p class="prompt-text font-body">
          Young Agronomist Simran Kaur (Gurpreet’s granddaughter) walks into the courtyard carrying a digital solar flow sensor: “Dada Hari! We don’t have to run away. If every farmer buys another diesel engine, we all go bankrupt. But if we pool our land into a community solar micro-drip network, water goes straight to the roots with zero diesel!”
        </p>
        <div class="inner-thought font-body">
          *The children’s eyes light up. A new cooperative beginning is taking root in Kalan.*
        </div>
      </div>
      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={() => { sfx.playSelect(); stage = '2040_MINIGAME_SOLAR_DRIP_NETWORK'; }}
        >
          Open Solar Drip Grid Workbench →
        </button>
      </div>
    </div>

  <!-- GRAPHICAL 2040 SOLAR MICRO-IRRIGATION NETWORK BUILDER -->
  {:else if stage === '2040_MINIGAME_SOLAR_DRIP_NETWORK'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
            Village Cooperative Solar Micro-Drip Network Builder (2040)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Connected: {(wireSolarPanels?1:0)+(wireController?1:0)+(pipeHeaderTank?1:0)+(layDripLines?1:0)+(openSmartValves?1:0)}/5 Nodes</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Connect all 5 components of the renewable micro-irrigation system from sunlight to plant root-zones. Build the community water grid that frees the village from diesel debt:
          </p>

          <!-- Visual Micro-Grid Circuit (SVG) -->
          <div class="solar-grid-schematic-canvas">
            <svg viewBox="0 0 600 180" class="solar-svg-diagram">
              <!-- Solar Array (Node 1) -->
              <rect x="20" y="40" width="80" height="60" fill={wireSolarPanels ? '#1976D2' : '#CFD8DC'} stroke="#0D47A1" stroke-width="2" rx="4"/>
              <line x1="20" y1="70" x2="100" y2="70" stroke="#FFF" stroke-width="1.5"/>
              <line x1="60" y1="40" x2="60" y2="100" stroke="#FFF" stroke-width="1.5"/>
              <text x="25" y="125" class="svg-part-tag font-data" fill="#0D47A1">5kW Solar PV</text>

              <!-- VFD Controller (Node 2) -->
              <rect x="140" y="50" width="60" height="40" fill={wireController ? '#388E3C' : '#CFD8DC'} stroke="#1B5E20" stroke-width="2" rx="4"/>
              <circle cx="170" cy="70" r="10" fill="#FFF"/>
              <text x="140" y="125" class="svg-part-tag font-data" fill="#1B5E20">VFD Inverter</text>

              <!-- Connecting Wire -->
              <line x1="100" y1="70" x2="140" y2="70" stroke={wireSolarPanels && wireController ? '#4CAF50' : '#B0BEC5'} stroke-width="3" stroke-dasharray="4,2"/>

              <!-- Header Tank (Node 3) -->
              <rect x="240" y="30" width="70" height="70" fill={pipeHeaderTank ? '#0288D1' : '#CFD8DC'} stroke="#01579B" stroke-width="2" rx="6"/>
              <line x1="240" y1="55" x2="310" y2="55" stroke="#E1F5FE" stroke-width="2"/>
              <text x="240" y="125" class="svg-part-tag font-data" fill="#01579B">20kL Tank</text>

              <!-- Connecting Pipe -->
              <line x1="200" y1="70" x2="240" y2="70" stroke={wireController && pipeHeaderTank ? '#03A9F4' : '#B0BEC5'} stroke-width="4"/>

              <!-- Drip Tubing (Node 4) -->
              <rect x="350" y="55" width="80" height="30" fill={layDripLines ? '#795548' : '#CFD8DC'} stroke="#4E342E" stroke-width="2" rx="3"/>
              <circle cx="370" cy="70" r="3" fill="#03A9F4"/>
              <circle cx="390" cy="70" r="3" fill="#03A9F4"/>
              <circle cx="410" cy="70" r="3" fill="#03A9F4"/>
              <text x="350" y="125" class="svg-part-tag font-data" fill="#4E342E">Drip Tubing</text>

              <!-- Keyline Bioswale (Node 5) -->
              <rect x="470" y="45" width="110" height="50" fill={openSmartValves ? '#81C784' : '#CFD8DC'} stroke="#2E7D32" stroke-width="2" rx="5"/>
              <path d="M480 70 Q525 85 570 70" stroke="#1B5E20" stroke-width="3" fill="none"/>
              <text x="475" y="125" class="svg-part-tag font-data" fill="#2E7D32">Bioswale Recharge</text>
            </svg>
          </div>

          <!-- 5 Interactive Component Tiles -->
          <div class="solar-nodes-grid">
            <!-- Node 1 -->
            <button 
              type="button" 
              class="mechanical-part-tile {wireSolarPanels ? 'fitted' : ''}"
              onclick={() => { sfx.playSelect(); wireSolarPanels = !wireSolarPanels; }}
            >
              <div class="part-tile-icon-box">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <div class="part-tile-info">
                <strong class="font-display">5kW Bifacial Solar PV Array</strong>
                <span class="part-spec font-data">Bifacial Silicon &bull; Dual-Sided Generation</span>
                <p class="part-desc font-body">Captures direct sunlight and ground albedo reflection to generate clean pumping power with zero diesel exhaust.</p>
              </div>
              <span class="part-status-badge font-data {wireSolarPanels ? 'mounted' : ''}">
                {wireSolarPanels ? '[ARRAY ACTIVE]' : '[CLICK TO MOUNT]'}
              </span>
            </button>

            <!-- Node 2 -->
            <button 
              type="button" 
              class="mechanical-part-tile {wireController ? 'fitted' : ''}"
              onclick={() => { sfx.playSelect(); wireController = !wireController; }}
            >
              <div class="part-tile-icon-box">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                  <path d="M9 9h6M9 15h6"/>
                </svg>
              </div>
              <div class="part-tile-info">
                <strong class="font-display">DC Variable-Speed Controller (VFD)</strong>
                <span class="part-spec font-data">MPPT Algorithm &bull; Direct Solar Modulation</span>
                <p class="part-desc font-body">Modulates water delivery directly to match solar intensity without costly battery degradation.</p>
              </div>
              <span class="part-status-badge font-data {wireController ? 'mounted' : ''}">
                {wireController ? '[VFD SYNCED]' : '[CLICK TO WIRE]'}
              </span>
            </button>

            <!-- Node 3 -->
            <button 
              type="button" 
              class="mechanical-part-tile {pipeHeaderTank ? 'fitted' : ''}"
              onclick={() => { sfx.playSelect(); pipeHeaderTank = !pipeHeaderTank; }}
            >
              <div class="part-tile-icon-box">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="part-tile-info">
                <strong class="font-display">Elevated 20,000L Header Tank</strong>
                <span class="part-spec font-data">Gravity Equalizer &bull; 1.2 Bar Pressure</span>
                <p class="part-desc font-body">Pumps during midday sun, stores gravity head for evening irrigation at low friction loss.</p>
              </div>
              <span class="part-status-badge font-data {pipeHeaderTank ? 'mounted' : ''}">
                {pipeHeaderTank ? '[TANK PLUMBED]' : '[CLICK TO PIPE]'}
              </span>
            </button>

            <!-- Node 4 -->
            <button 
              type="button" 
              class="mechanical-part-tile {layDripLines ? 'fitted' : ''}"
              onclick={() => { sfx.playSelect(); layDripLines = !layDripLines; }}
            >
              <div class="part-tile-icon-box">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <circle cx="6" cy="12" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="18" cy="12" r="2"/>
                </svg>
              </div>
              <div class="part-tile-info">
                <strong class="font-display">Pressure-Compensating Drip Tubing</strong>
                <span class="part-spec font-data">2.2 L/hr Emitters &bull; Subsurface Root Zone</span>
                <p class="part-desc font-body">Delivers precise micro-droplets directly to legume rootzones with zero evaporative surface loss.</p>
              </div>
              <span class="part-status-badge font-data {layDripLines ? 'mounted' : ''}">
                {layDripLines ? '[TUBING LAID]' : '[CLICK TO INSTALL]'}
              </span>
            </button>

            <!-- Node 5 -->
            <button 
              type="button" 
              class="mechanical-part-tile {openSmartValves ? 'fitted' : ''}"
              onclick={() => { sfx.playSelect(); openSmartValves = !openSmartValves; }}
            >
              <div class="part-tile-icon-box">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2C8 6 4 11 4 16a8 8 0 0 0 16 0c0-5-4-10-8-14z"/>
                </svg>
              </div>
              <div class="part-tile-info">
                <strong class="font-display">Keyline Bioswale & Monsoon Recharge Sump</strong>
                <span class="part-spec font-data">Biological Swale &bull; +120mm Aquifer Recharge</span>
                <p class="part-desc font-body">Earth contour trenches filled with woodchips and straw mulch that capture monsoon deluge to recharge the water table.</p>
              </div>
              <span class="part-status-badge font-data {openSmartValves ? 'mounted' : ''}">
                {openSmartValves ? '[BIOSWALE OPEN]' : '[CLICK TO ACTIVATE]'}
              </span>
            </button>
          </div>

          <!-- Real-Time Telemetry Bar -->
          <div class="telemetry-bar">
            <div class="telemetry-item">
              <span class="tel-label font-data">WATER SAVINGS EFFICIENCY</span>
              <span class="tel-value font-display positive">
                {solarGridReady ? '+85% Water Saved' : 'Conventional Flood'}
              </span>
              <span class="tel-target font-data">Direct Root Delivery</span>
            </div>
            <div class="telemetry-item">
              <span class="tel-label font-data">DIESEL FUEL EXPENSE</span>
              <span class="tel-value font-display positive">
                {solarGridReady ? '₹0 / year (Saved ₹95k)' : '₹95,000 / year'}
              </span>
              <span class="tel-target font-data">Zero Carbon Footprint</span>
            </div>
            <div class="telemetry-item">
              <span class="tel-label font-data">AQUIFER NET BALANCE</span>
              <span class="tel-value font-display positive">
                {solarGridReady ? '+120 mm/yr Positive' : '-850 mm Depletion'}
              </span>
              <span class="tel-target font-data">Living Soil Sponge</span>
            </div>
          </div>
        </div>

        <div class="arcade-window-footer">
          {#if solarGridReady}
            <div class="footer-callout font-body">
              Cooperative solar micro-drip network energized! The farm now grows abundant food while replenishing the aquifer.
            </div>
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = '2040_SCENE6_PASSING_URN'; }}
            >
              Advance to Passing the Beej Patra →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Connect all 5 nodes of the renewable solar micro-drip network.
            </div>
          {/if}
        </div>
      </div>
    </div>

  <!-- 2040 SCENE 6: PASSING THE BEEJ PATRA & HEIRLOOM SEED INOCULATION -->
  {:else if stage === '2040_SCENE6_PASSING_URN'}
    <div class="arcade-modal-backdrop">
      <div class="arcade-popup-window wide">
        <div class="arcade-window-header">
          <div class="window-title font-display">
            <svg class="header-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            The Beej Patra: Passing the Seeds of 1947 (2040)
          </div>
          <div class="sorting-meters-chip font-data">
            <span>Generational Cycle: 4th Generation Stewardship</span>
          </div>
        </div>

        <div class="arcade-window-body">
          <p class="instruction-lead font-body">
            Elder Dada Hari sits beside Rani and Kabir on the veranda. He unwraps the old red cloth from the ancestral brass urn:
          </p>

          <div class="inoculation-workbench-grid">
            <!-- Visual Urn & Seed Plate -->
            <div class="urn-visual-box">
              <img src={itemBeejPatra} alt="The Sacred Beej Patra Urn" class="urn-illustration-big" />
              <strong class="font-display" style="color: #142417; font-size: 1.15rem; margin-top: 10px;">The Beej Patra (Saved in 1947)</strong>
              <p class="font-body" style="font-size: 0.92rem; color: #334436; text-align: center;">
                “These seeds crossed the Partition border inside your great-grandmother’s bundle. They survived 100-degree heat, floods, and droughts because nature bred them for resilience.”
              </p>
            </div>

            <!-- Interactive Inoculation Steps -->
            <div class="inoculation-steps-column">
              <div class="step-card {inoculationStep >= 1 ? 'done' : 'active'}">
                <span class="step-num font-data">ACTION STEP 1</span>
                <strong class="font-display">Examine the Desi Moong Heirloom Seeds</strong>
                <p class="font-body">Firm, olive-green seeds protected with dried neem leaves and dry cow-dung ash.</p>
                {#if inoculationStep === 0}
                  <button type="button" class="action-btn font-display" onclick={() => { sfx.playSelect(); inoculationStep = 1; }}>
                    Open Urn & Examine Seeds
                  </button>
                {:else}
                  <span class="completed-check font-data">[EXAMINED: HEIRLOOM SEEDS VIABLE]</span>
                {/if}
              </div>

              <div class="step-card {inoculationStep >= 2 ? 'done' : inoculationStep === 1 ? 'active' : 'locked'}">
                <span class="step-num font-data">ACTION STEP 2</span>
                <strong class="font-display">Bio-Inoculate with Symbiotic Rhizobia</strong>
                <p class="font-body">Coat the heirloom seeds with liquid leguminous bio-inoculant to activate nitrogen-fixing root bacteria.</p>
                {#if inoculationStep === 1}
                  <button type="button" class="action-btn font-display" onclick={() => { sfx.playSelect(); inoculationStep = 2; }}>
                    Apply Rhizobium Bio-Inoculant
                  </button>
                {:else if inoculationStep > 1}
                  <span class="completed-check font-data">[INOCULATED: SYMBIOTIC BACTERIA PRIMED]</span>
                {/if}
              </div>

              <div class="step-card {inoculationStep >= 3 ? 'done' : inoculationStep === 2 ? 'active' : 'locked'}">
                <span class="step-num font-data">ACTION STEP 3</span>
                <strong class="font-display">Plant into Restored Keyline Bioswales</strong>
                <p class="font-body">Sow the seeds into the moist, mulched sponge of composted topsoil under the solar micro-drip emitters.</p>
                {#if inoculationStep === 2}
                  <button type="button" class="action-btn font-display" onclick={() => { sfx.playSuccess(); inoculationStep = 3; }}>
                    Sow Seeds with Rani & Kabir
                  </button>
                {:else if inoculationStep >= 3}
                  <span class="completed-check font-data">[SOWN: EMBRYOS AWAKENING IN SOIL]</span>
                {/if}
              </div>
            </div>
          </div>

          {#if inoculationStep === 3}
            <div class="botanical-inspection-plate" style="margin-top: 10px;">
              <img src={itemRootNodules} alt="Living Rhizobia Nodules" class="plate-illustration-img" />
              <div class="plate-details-text">
                <span class="plate-tag font-data">THE 50-YEAR REGENERATION COMPLETE</span>
                <strong class="plate-title font-display">Living Symbiosis Reborn in Kalan Soil</strong>
                <p class="plate-desc font-body">
                  Within 48 hours, the heirloom seeds germinate. Taproots reach downward, drinking from the replenished solar swales. Red leghemoglobin nodules bloom along the roots, fixing natural atmospheric nitrogen once more without chemical fertilizer bags. Four generations have passed—and the land is alive.
                </p>
              </div>
            </div>
          {/if}
        </div>

        <div class="arcade-window-footer">
          {#if inoculationStep === 3}
            <button 
              type="button" 
              class="continue-btn font-display"
              onclick={() => { sfx.playSuccess(); stage = 'FINAL_50_YEAR_CHRONICLE'; }}
            >
              View 50-Year Farm Chronicle (1990–2040) →
            </button>
          {:else}
            <div class="footer-hint font-body">
              Complete the 3 seed stewardship steps to plant the heirloom seeds.
            </div>
          {/if}
        </div>
      </div>
    </div>

  <!-- FINAL 50-YEAR CHRONICLE -->
  {:else if stage === 'FINAL_50_YEAR_CHRONICLE'}
    <div class="story-floating-card scrollable-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">50-Year Farm Stewardship Chronicle (1990–2040)</div>
        <p class="prompt-text font-body">
          Across half a century, the ancestral farm of Kalan village bore witness to the full arc of the agricultural revolution—from synthetic enthusiasm to environmental collapse, and finally back to biological harmony.
        </p>
      </div>

      <div class="chronicle-generations-grid">
        <!-- 1990 -->
        <div class="generation-card">
          <span class="era-year font-data">ERA 1 &bull; 1990</span>
          <strong class="font-display">Young Hari & Bebe Amarjit</strong>
          <p class="font-body">Desi moong, pearl millet, 1920 brick well (8m depth). Bebe saves the partition seeds and refuses to surrender living soil to chemical bags.</p>
          <div class="card-stat-pill font-data">Water: 8m &bull; SOM: 3.5% &bull; N: Biological</div>
        </div>

        <!-- 2005 -->
        <div class="generation-card">
          <span class="era-year font-data">ERA 2 &bull; 2005</span>
          <strong class="font-display">Adult Hari & Gurpreet Singh</strong>
          <p class="font-body">Subsidized electricity, 75-HP tubewells, continuous basmati rice. Deep pumping drops the aquifer to 22m, starving the ancestral brick well.</p>
          <div class="card-stat-pill font-data" style="color: #BF360C;">Water: 22m &bull; SOM: 1.8% &bull; N: Chemical</div>
        </div>

        <!-- 2026 -->
        <div class="generation-card">
          <span class="era-year font-data">ERA 3 &bull; 2026</span>
          <strong class="font-display">The Climate Boiling Point</strong>
          <p class="font-body">Boreholes hit 82m sand cavitation. NASA GRACE satellites detect northern India’s gravity collapse. Hari introduces the Happy Seeder to end stubble smoke.</p>
          <div class="card-stat-pill font-data" style="color: #D32F2F;">Water: 82m &bull; SOM: 0.8% &bull; Air: 680 PM2.5</div>
        </div>

        <!-- 2040 -->
        <div class="generation-card highlight">
          <span class="era-year font-data" style="color: #1B5E20;">ERA 4 &bull; 2040</span>
          <strong class="font-display">Dada Hari, Simran, Rani & Kabir</strong>
          <p class="font-body">Community solar micro-drip network, keyline bioswales, passing of the 1947 Beej Patra. Biological symbiosis restores the Punjab soil.</p>
          <div class="card-stat-pill font-data" style="color: #1B5E20; background: #C8E6C9;">Water: +120mm &bull; SOM: 4.2% &bull; Solar Drip</div>
        </div>
      </div>

      <div class="final-bebe-proverb font-body">
        “The land was never truly ours to own. We only held it in trust for the children who come after us.”
      </div>

      <div class="game-actions-row">
        <button 
          type="button" 
          class="action-btn secondary font-display"
          onclick={restartAll}
        >
          Replay 50-Year Journey
        </button>

        <button 
          type="button" 
          class="continue-btn font-display"
          onclick={onBackToRegions}
        >
          Return to Regional World Map →
        </button>
      </div>
    </div>
  {/if}
</div>


<style>
  /* ========================================================================= */
  /* MASTER LAYOUT & TOP HUD                                                   */
  /* ========================================================================= */
  .fullscreen-story-game {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #0E1710;
    color: #142417;
    user-select: none;
    font-family: var(--font-body, "Figtree", sans-serif);
  }

  .game-hud-top {
    position: fixed;
    top: 16px;
    left: 20px;
    right: 20px;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
  }

  .icon-buttons-group {
    display: flex;
    gap: 10px;
    pointer-events: auto;
  }

  .icon-hud-btn {
    background-color: rgba(18, 36, 22, 0.95);
    backdrop-filter: blur(8px);
    border: 2px solid #E5A93C;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    color: #FAF6ED;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
    transition: transform 0.15s, background-color 0.15s;
  }

  .icon-hud-btn:hover {
    transform: scale(1.08);
    background-color: #1F3825;
    border-color: #FFFFFF;
  }

  .meters-glass-pill {
    pointer-events: auto;
    background-color: rgba(14, 28, 17, 0.95);
    backdrop-filter: blur(8px);
    border: 1.5px solid #E5A93C;
    border-radius: 999px;
    padding: 7px 18px;
    color: #FAF6ED;
    font-size: 0.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
  }

  .dot {
    color: #E5A93C;
    font-weight: 900;
  }

  /* Scenic Background */
  .scenic-background-container {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: hidden;
  }

  .fullscreen-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    animation: fadeIn 0.4s ease-out;
  }

  /* Character Staging */
  .character-stage-container {
    position: fixed;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 90px;
  }

  .character-sprite {
    max-height: 58vh;
    max-width: 44vw;
    object-fit: contain;
    filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.7));
    transition: transform 0.3s ease-out;
  }

  .character-sprite.small {
    max-height: 48vh;
  }

  .character-sprite.left {
    transform: translateX(-18%);
  }

  .character-sprite.right {
    transform: translateX(18%);
  }

  .character-sprite.centered {
    transform: none;
  }

  /* Floating Story Dialogue Card */
  .story-floating-card {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    max-width: 900px;
    margin: 0 auto;
    z-index: 50;
    background-color: #FAF6ED;
    color: #142417;
    border: 3px solid #142417;
    border-radius: 12px;
    padding: 22px 26px;
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.75);
    max-height: 54vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .story-floating-card.scrollable-card {
    max-height: 75vh;
    overflow-y: auto;
  }

  .speaker-tag {
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #0E3816;
    border-bottom: 2.5px solid #E5A93C;
    padding-bottom: 4px;
    display: inline-block;
  }

  .prompt-text {
    font-size: 1.02rem;
    line-height: 1.55;
    margin: 0;
    color: #142417;
    font-weight: 500;
  }

  .inner-thought {
    font-size: 0.92rem;
    font-style: italic;
    color: #334436;
    margin: 6px 0;
  }

  .game-actions-row {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px dashed rgba(20, 36, 23, 0.25);
  }

  .continue-btn {
    background-color: #142417;
    color: #FAF6ED;
    border: 2px solid #E5A93C;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 3px 3px 0 #000;
    transition: transform 0.1s;
  }

  .continue-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #000;
    background-color: #1F3825;
  }

  .action-btn {
    background-color: #E5A93C;
    color: #142417;
    border: 2px solid #142417;
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 3px 3px 0 #142417;
  }

  .action-btn.secondary {
    background-color: #FFFFFF;
  }

  /* Title Card */
  .title-card-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background-color: rgba(10, 17, 11, 0.92);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .title-box {
    background-color: #FAF6ED;
    border: 4px solid #142417;
    border-radius: 14px;
    padding: 38px 44px;
    text-align: center;
    max-width: 600px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
  }

  .title-sub {
    font-size: 0.88rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: #BF360C;
    display: block;
    margin-bottom: 8px;
  }

  .title-main {
    font-size: 3rem;
    margin: 0 0 12px 0;
    color: #142417;
    line-height: 1.1;
  }

  .title-desc {
    font-size: 1.1rem;
    color: #142417;
    margin-bottom: 26px;
    font-weight: 600;
  }

  /* ========================================================================= */
  /* ARCADE POPUP WORKBENCH MODAL SYSTEM                                       */
  /* ========================================================================= */
  .arcade-modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(10, 18, 12, 0.82);
    backdrop-filter: blur(8px);
    z-index: 120;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
  }

  .arcade-popup-window {
    width: 94vw;
    max-width: 860px;
    max-height: 88vh;
    background-color: #FAF6ED;
    border: 3.5px solid #142417;
    border-radius: 14px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .arcade-popup-window.wide {
    max-width: 1000px;
  }

  .arcade-window-header {
    background-color: #142417;
    color: #FAF6ED;
    padding: 13px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2.5px solid #E5A93C;
  }

  .window-title {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #FAF6ED;
    font-weight: 800;
  }

  .badge-tokens,
  .sorting-meters-chip {
    background-color: rgba(229, 169, 60, 0.25);
    border: 1.5px solid #E5A93C;
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 0.82rem;
    font-weight: 800;
    color: #F7C361;
    letter-spacing: 0.05em;
  }

  .arcade-window-body {
    padding: 18px 22px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background-color: #FAF6ED;
  }

  .instruction-lead {
    font-size: 0.98rem;
    color: #142417;
    margin: 0;
    line-height: 1.5;
    font-weight: 600;
  }

  .arcade-window-footer {
    background-color: #EDE8DC;
    border-top: 2px solid #142417;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .footer-callout {
    font-size: 0.96rem;
    font-weight: 800;
    color: #0E3816;
  }

  .footer-hint {
    font-size: 0.9rem;
    color: #334436;
    font-style: italic;
    font-weight: 600;
  }

  /* High-Contrast Telemetry Bar */
  .telemetry-bar {
    display: flex;
    justify-content: space-around;
    background-color: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 8px;
    padding: 12px 10px;
    margin-top: 10px;
    box-shadow: 2px 2px 0 #142417;
  }

  .telemetry-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .tel-label {
    font-size: 0.74rem;
    font-weight: 900;
    color: #142417;
    letter-spacing: 0.06em;
  }

  .tel-value {
    font-size: 1.25rem;
    font-weight: 900;
  }

  .tel-value.positive { color: #1B5E20; }
  .tel-value.negative { color: #B71C1C; }

  .tel-target {
    font-size: 0.74rem;
    font-weight: 700;
    color: #4A5B4E;
  }

  /* ========================================================================= */
  /* 1990 GAME 1: FARMSTEAD DISCOVERY HOTSPOTS                                 */
  /* ========================================================================= */
  .farmstead-visual-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
  }

  .farmstead-node {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    cursor: pointer;
    box-shadow: 2px 3px 0 #142417;
    transition: transform 0.1s;
  }

  .farmstead-node:hover {
    transform: translate(-1px, -2px);
    background-color: #F8F3E6;
  }

  .farmstead-node.done {
    background-color: #E8F5E9;
    border-color: #1B5E20;
  }

  .node-icon-box {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #142417;
  }

  .well-box { background-color: #E0F2F1; }
  .soil-box { background-color: #EFEBE9; }
  .plant-box { background-color: #E8F5E9; }
  .urn-box { background-color: #FFF8E1; }

  .node-name {
    font-size: 1rem;
    color: #142417;
    font-weight: 800;
  }

  .status-pill {
    font-size: 0.76rem;
    font-weight: 800;
    border-radius: 4px;
    padding: 3px 8px;
    background: #EAE6DB;
    color: #142417;
    border: 1px solid #C5BFB0;
  }

  .status-pill.secured {
    background: #C8E6C9;
    color: #0E3816;
    border-color: #2E7D32;
  }

  /* Botanical Inspection Plate */
  .botanical-inspection-plate {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 2px 3px 0 #142417;
    animation: fadeIn 0.25s ease-out;
  }

  .plate-illustration-img {
    width: 90px;
    height: 90px;
    object-fit: contain;
    border-radius: 8px;
    border: 2px solid #142417;
    background: #FAFAFA;
  }

  .plate-badge-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2.5px solid #142417;
  }

  .plate-badge-circle.soil { background: #E8F5E9; }
  .plate-badge-circle.well { background: #E0F2F1; }

  .plate-details-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .plate-tag {
    font-size: 0.74rem;
    font-weight: 900;
    color: #8C4D00;
    letter-spacing: 0.08em;
  }

  .plate-title {
    font-size: 1.15rem;
    color: #142417;
    font-weight: 800;
  }

  .plate-desc {
    font-size: 0.94rem;
    color: #142417;
    line-height: 1.45;
    margin: 0;
  }

  /* ========================================================================= */
  /* 1990 GAME 2: SEED SORTING TABLE WORKBENCH                                  */
  /* ========================================================================= */
  .seed-sorting-workbench-layout {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 16px;
  }

  .seed-tray-table {
    background: #EFE8DA;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 2px 2px 0 #142417;
  }

  .tray-header-bar {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    font-weight: 900;
    color: #142417;
    border-bottom: 2px solid #C4B9A3;
    padding-bottom: 4px;
  }

  .visual-seeds-scatter {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .visual-seed-token {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 8px;
    padding: 10px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    box-shadow: 2px 2px 0 #142417;
    transition: transform 0.1s;
  }

  .visual-seed-token:hover:not(:disabled) {
    transform: scale(1.08);
    background-color: #FFFDE7;
  }

  .visual-seed-token.active-inspected {
    border-color: #D84315;
    box-shadow: 0 0 0 3px #FFA000;
    background-color: #FFF8E1;
  }

  .visual-seed-token.sorted {
    opacity: 0.2;
    background: #D7CCC8;
    border-color: #8D6E63;
    box-shadow: none;
    cursor: default;
  }

  .seed-number-tag {
    font-size: 0.74rem;
    color: #142417;
    font-weight: 800;
  }

  .seed-inspection-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .loupe-card {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    box-shadow: 2px 2px 0 #142417;
  }

  .loupe-card.empty {
    padding: 32px;
    background: #E8F5E9;
  }

  .loupe-header {
    font-size: 0.78rem;
    font-weight: 900;
    color: #142417;
    letter-spacing: 0.08em;
  }

  .loupe-zoom-view {
    padding: 12px;
    background: radial-gradient(circle, #FFFFFF 50%, #ECEFF1 100%);
    border-radius: 50%;
    border: 3px solid #142417;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  .loupe-text-block {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  .loupe-hint {
    font-size: 0.94rem;
    color: #142417;
    line-height: 1.4;
    margin: 0;
  }

  .loupe-botany {
    font-size: 0.86rem;
    color: #2D3E31;
    line-height: 1.35;
    margin: 0;
  }

  .sorting-destinations-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    width: 100%;
    margin-top: 6px;
  }

  .jar-target-btn {
    border: 2px solid #142417;
    border-radius: 8px;
    padding: 10px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    box-shadow: 2px 2px 0 #142417;
    transition: transform 0.1s;
  }

  .jar-target-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #142417;
  }

  .jar-moong { background-color: #E8F5E9; color: #0E3816; }
  .jar-millet { background-color: #FFF8E1; color: #8C4D00; }
  .jar-discard { background-color: #FFEBEE; color: #B71C1C; }

  .jar-target-btn strong {
    font-size: 0.88rem;
    font-weight: 800;
  }

  .jar-target-btn span {
    font-size: 0.72rem;
    font-weight: 700;
    color: inherit;
  }

  .workbench-feedback {
    background: #E8F5E9;
    border: 2px solid #2E7D32;
    border-radius: 6px;
    padding: 9px 12px;
    font-size: 0.92rem;
    font-weight: 700;
    color: #0E3816;
  }

  /* ========================================================================= */
  /* 1990 GAME 3: LIVING SOIL SYSTEM (4-PLOT BEAUTIFIED)                       */
  /* ========================================================================= */
  .graphical-plots-canvas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .graphical-plot-tile {
    background: #FFFFFF;
    border: 3px solid #142417;
    border-radius: 10px;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-align: left;
    cursor: pointer;
    box-shadow: 3px 3px 0 #142417;
    transition: transform 0.1s;
  }

  .graphical-plot-tile:hover {
    transform: translate(-1px, -2px);
    box-shadow: 4px 5px 0 #142417;
  }

  .plot-surface-banner {
    padding: 10px 14px;
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-bottom: 2px solid #142417;
  }

  .plot-location-label {
    font-size: 0.74rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #FAF6ED;
    opacity: 0.95;
  }

  .plot-crop-heading {
    font-size: 1.18rem;
    color: #FFFFFF;
    font-weight: 800;
  }

  .plot-botanical {
    font-size: 0.82rem;
    color: #FAF6ED;
    opacity: 0.9;
  }

  .plot-subsoil-view {
    padding: 12px 14px;
    background: #FAF6ED;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .tag-badge {
    align-self: flex-start;
    font-size: 0.75rem;
    font-weight: 800;
    color: #142417;
    background: #E8E1D1;
    border: 1px solid #142417;
    border-radius: 4px;
    padding: 2px 7px;
  }

  .root-desc {
    font-size: 0.88rem;
    color: #142417;
    margin: 0;
    line-height: 1.4;
  }

  .plot-stats-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    font-weight: 800;
    padding-top: 6px;
    border-top: 1.5px dashed #D0C7B4;
    color: #142417;
  }

  .stat-n.pos { color: #1B5E20; }
  .stat-n.neg { color: #B71C1C; }
  .stat-water { color: #0D47A1; }

  .click-rotate-bar {
    background: #142417;
    color: #FAF6ED;
    text-align: center;
    padding: 6px;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  /* ========================================================================= */
  /* 2005 GAME 1: TUBEWELL ASSEMBLY WORKBENCH                                   */
  /* ========================================================================= */
  .tubewell-blueprint-canvas-grid {
    display: grid;
    grid-template-columns: 1fr 1.35fr;
    gap: 16px;
  }

  .borehole-schematic-column {
    background: #263238;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .schematic-header-bar {
    font-size: 0.74rem;
    font-weight: 900;
    color: #ECEFF1;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
    text-align: center;
  }

  .borehole-svg-blueprint {
    width: 100%;
    max-height: 380px;
  }

  .svg-schematic-label {
    font-size: 11px;
    font-weight: 800;
  }

  .svg-part-tag {
    font-size: 10px;
    font-weight: 900;
  }

  .mechanical-inventory-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mechanical-part-tile {
    background: #FFFFFF;
    border: 2px solid #142417;
    border-radius: 8px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    box-shadow: 2px 2px 0 #142417;
    transition: transform 0.1s;
  }

  .mechanical-part-tile:hover {
    transform: translate(-1px, -1px);
    background-color: #FFFDE7;
  }

  .mechanical-part-tile.fitted {
    background-color: #E8F5E9;
    border-color: #1B5E20;
  }

  .part-tile-icon-box {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: #FAF6ED;
    border: 1.5px solid #142417;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .part-tile-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .part-tile-info strong {
    font-size: 0.95rem;
    color: #142417;
    font-weight: 800;
  }

  .part-spec {
    font-size: 0.72rem;
    color: #8C4D00;
    font-weight: 900;
  }

  .part-desc {
    font-size: 0.84rem;
    color: #2D3E31;
    line-height: 1.3;
    margin: 0;
  }

  .part-status-badge {
    font-size: 0.74rem;
    font-weight: 900;
    padding: 4px 8px;
    border-radius: 4px;
    background: #EAE6DB;
    color: #142417;
    border: 1px solid #142417;
    flex-shrink: 0;
  }

  .part-status-badge.mounted {
    background: #C8E6C9;
    color: #0E3816;
    border-color: #1B5E20;
  }

  .switch-activation-panel {
    background: #FFF8E1;
    border: 2.5px solid #FF8F00;
    border-radius: 10px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 10px;
  }

  .switch-lead {
    font-size: 0.94rem;
    color: #8C4D00;
    font-weight: 700;
    line-height: 1.4;
    flex: 1;
  }

  .knife-switch-btn {
    background-color: #D84315;
    color: #FFFFFF;
    border: 2px solid #BF360C;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 3px 3px 0 #000;
    animation: pulse 1.2s infinite;
  }

  .knife-switch-btn:hover {
    background-color: #BF360C;
    transform: scale(1.03);
  }

  .pump-active-flow-card {
    background: #E8F5E9;
    border: 2.5px solid #1B5E20;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 10px;
  }

  .flow-header {
    font-size: 1.15rem;
    color: #0E3816;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .character-reaction-dual {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 12px;
  }

  .quote-bubble {
    background: #FFFFFF;
    border: 2px solid #142417;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #142417;
  }

  .quote-bubble.meena {
    border-left: 4px solid #1B5E20;
  }

  .quote-bubble.gurpreet {
    border-left: 4px solid #D84315;
  }

  /* ========================================================================= */
  /* 2005 GAME 2: CANAL SLUICE & EMBANKMENT                                    */
  /* ========================================================================= */
  .canal-schematic-canvas {
    background: #EFEBE9;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 10px;
  }

  .canal-svg-map {
    width: 100%;
    max-height: 220px;
  }

  .svg-crop-label {
    font-size: 13px;
    font-weight: 800;
  }

  .svg-crop-sub {
    font-size: 10px;
    font-weight: 900;
  }

  .canal-controls-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .canal-gate-card {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    box-shadow: 2px 2px 0 #142417;
    transition: transform 0.1s;
  }

  .canal-gate-card:hover {
    transform: translate(-1px, -1px);
  }

  .canal-gate-card.safe {
    background: #E8F5E9;
    border-color: #1B5E20;
  }

  .canal-gate-card.danger {
    background: #FFEBEE;
    border-color: #B71C1C;
  }

  .gate-icon-box {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    background: #FAF6ED;
    border: 1.5px solid #142417;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .gate-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .gate-info strong {
    font-size: 0.94rem;
    color: #142417;
    font-weight: 800;
  }

  .gate-info p {
    font-size: 0.82rem;
    color: #2D3E31;
    margin: 0;
    line-height: 1.3;
  }

  /* ========================================================================= */
  /* 2005 GAME 3: BANYAN TREE CHARTER CONSENSUS                                */
  /* ========================================================================= */
  .charter-pillars-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .pillar-charter-tile {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: pointer;
    text-align: left;
    box-shadow: 2px 3px 0 #142417;
    transition: transform 0.1s;
  }

  .pillar-charter-tile:hover {
    transform: translate(-1px, -2px);
    background-color: #F8F3E6;
  }

  .pillar-charter-tile.ratified {
    background: #E8F5E9;
    border-color: #1B5E20;
  }

  .pillar-icon-box {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #FAF6ED;
    border: 2px solid #142417;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pillar-content strong {
    font-size: 1.05rem;
    color: #142417;
    font-weight: 800;
  }

  .pillar-tag {
    font-size: 0.72rem;
    font-weight: 900;
    color: #8C4D00;
    display: block;
    margin: 2px 0;
  }

  .pillar-content p {
    font-size: 0.88rem;
    color: #2D3E31;
    line-height: 1.4;
    margin: 0;
  }

  .stamp-badge {
    align-self: flex-start;
    font-size: 0.76rem;
    font-weight: 900;
    padding: 3px 8px;
    border-radius: 4px;
    background: #EAE6DB;
    color: #142417;
    border: 1px solid #142417;
  }

  .stamp-badge.stamped {
    background: #C8E6C9;
    color: #0E3816;
    border-color: #1B5E20;
  }

  /* ========================================================================= */
  /* 2026 GAME 1: GEOLOGICAL STRATA & DRILL PROBE                              */
  /* ========================================================================= */
  .strata-workbench-canvas-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 16px;
  }

  .strata-cutaway-diagram {
    background: #212121;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 12px;
  }

  .geology-svg-view {
    width: 100%;
    max-height: 380px;
  }

  .svg-layer-title {
    font-size: 12px;
    font-weight: 800;
  }

  .svg-layer-sub {
    font-size: 10px;
    font-weight: 700;
  }

  .svg-depth-indicator {
    font-size: 11px;
    font-weight: 900;
  }

  .strata-controls-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
  }

  .slider-control-card {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slider-head {
    font-size: 0.88rem;
    font-weight: 900;
    color: #142417;
    letter-spacing: 0.06em;
  }

  .depth-number-display {
    font-size: 1.4rem;
    font-weight: 900;
    color: #B71C1C;
  }

  .depth-unit {
    font-size: 0.8rem;
    color: #142417;
    font-weight: 700;
  }

  .depth-slider {
    width: 100%;
    accent-color: #B71C1C;
    height: 8px;
    cursor: pointer;
  }

  .slider-ticks-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.68rem;
    font-weight: 700;
    color: #4A5B4E;
  }

  .strata-status-card {
    background: #FAF6ED;
    border: 2px solid #142417;
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .status-tag {
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0.06em;
  }

  .status-explanation {
    font-size: 0.88rem;
    color: #142417;
    line-height: 1.4;
    margin: 0;
  }

  .nasa-satellite-briefing-box {
    background: #E8EAF6;
    border: 2px solid #3F51B5;
    border-radius: 8px;
    padding: 12px 14px;
  }

  .satellite-head {
    font-size: 0.76rem;
    font-weight: 900;
    color: #1A237E;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .nasa-satellite-briefing-box p {
    font-size: 0.84rem;
    color: #1A237E;
    line-height: 1.35;
    margin: 0;
  }

  /* ========================================================================= */
  /* 2026 GAME 2: HAPPY SEEDER SIMULATOR                                       */
  /* ========================================================================= */
  .seeder-visual-canvas {
    background: #EFEBE9;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 10px;
  }

  .seeder-svg-schematic {
    width: 100%;
    max-height: 190px;
  }

  .seeder-controls-cluster {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .toggle-card {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .toggle-label {
    font-size: 0.82rem;
    font-weight: 900;
    color: #142417;
    letter-spacing: 0.05em;
  }

  .segmented-control {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .seg-btn {
    background: #FAF6ED;
    border: 1.5px solid #142417;
    border-radius: 6px;
    padding: 7px 10px;
    font-size: 0.82rem;
    font-weight: 700;
    color: #142417;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .seg-btn.active {
    background: #142417;
    color: #FAF6ED;
    border-color: #142417;
  }

  .seeder-action-strip {
    display: flex;
    justify-content: center;
    margin-top: 4px;
  }

  .calibrate-run-btn {
    background-color: #2E7D32;
    color: #FFFFFF;
    border: 2.5px solid #1B5E20;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 3px 3px 0 #142417;
  }

  .calibrate-run-btn:hover {
    background-color: #1B5E20;
    transform: translate(-1px, -1px);
  }

  /* ========================================================================= */
  /* 2040 GAME 1: FORENSIC TIMELINE INVESTIGATION                              */
  /* ========================================================================= */
  .forensic-polaroids-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
  }

  .forensic-card {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    box-shadow: 2px 2px 0 #142417;
    text-align: left;
    transition: transform 0.1s;
  }

  .forensic-card:hover:not(:disabled) {
    transform: translate(-1px, -2px);
    background-color: #FFFDE7;
  }

  .forensic-card.placed {
    background-color: #E8F5E9;
    border-color: #1B5E20;
    opacity: 0.65;
    cursor: default;
  }

  .polaroid-header-bar {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    font-weight: 900;
    color: #8C4D00;
    border-bottom: 1.5px solid #EAE6DB;
    padding-bottom: 4px;
  }

  .placed-seq-tag {
    color: #1B5E20;
    font-weight: 900;
  }

  .unplaced-seq-tag {
    color: #0D47A1;
  }

  .polaroid-visual-title {
    font-size: 0.94rem;
    color: #142417;
    font-weight: 800;
    line-height: 1.35;
  }

  .polaroid-text-desc {
    font-size: 0.82rem;
    color: #334436;
    margin: 0;
    line-height: 1.35;
  }

  .timeline-chronology-tray {
    background: #EFE8DA;
    border: 2.5px solid #142417;
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tray-title {
    font-size: 0.78rem;
    font-weight: 900;
    color: #142417;
    letter-spacing: 0.08em;
  }

  .tray-slots-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .timeline-slot-box {
    background: #FFFFFF;
    border: 2px dashed #8D6E63;
    border-radius: 6px;
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
    min-height: 60px;
  }

  .timeline-slot-box.filled {
    border-style: solid;
    border-color: #1B5E20;
    background: #E8F5E9;
  }

  .slot-number {
    font-size: 0.84rem;
    font-weight: 900;
    color: #142417;
  }

  .slot-text {
    font-size: 0.72rem;
    color: #0E3816;
    line-height: 1.25;
  }

  .slot-empty {
    font-size: 0.68rem;
    color: #8D6E63;
  }

  /* ========================================================================= */
  /* 2040 GAME 2: SOLAR MICRO-DRIP NETWORK                                     */
  /* ========================================================================= */
  .solar-grid-schematic-canvas {
    background: #ECEFF1;
    border: 2.5px solid #142417;
    border-radius: 10px;
    padding: 10px;
  }

  .solar-svg-diagram {
    width: 100%;
    max-height: 180px;
  }

  .solar-nodes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 10px;
  }

  /* ========================================================================= */
  /* 2040 CLIMAX: SEED INOCULATION & BEEJ PATRA                                */
  /* ========================================================================= */
  .inoculation-workbench-grid {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 16px;
    align-items: center;
  }

  .urn-visual-box {
    background: #FFF8E1;
    border: 2.5px solid #E5A93C;
    border-radius: 10px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .urn-illustration-big {
    width: 130px;
    height: 130px;
    object-fit: contain;
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.4));
  }

  .inoculation-steps-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .step-card {
    background: #FFFFFF;
    border: 2px solid #142417;
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .step-card.active {
    border-color: #E5A93C;
    box-shadow: 0 0 0 2px #E5A93C;
    background: #FFFDE7;
  }

  .step-card.done {
    background: #E8F5E9;
    border-color: #1B5E20;
  }

  .step-card.locked {
    opacity: 0.5;
  }

  .step-num {
    font-size: 0.72rem;
    font-weight: 900;
    color: #8C4D00;
  }

  .step-card strong {
    font-size: 0.95rem;
    color: #142417;
    font-weight: 800;
  }

  .step-card p {
    font-size: 0.84rem;
    color: #334436;
    margin: 0;
    line-height: 1.3;
  }

  .completed-check {
    font-size: 0.76rem;
    font-weight: 900;
    color: #1B5E20;
    margin-top: 4px;
  }

  /* ========================================================================= */
  /* FINAL 50-YEAR CHRONICLE CARDS                                             */
  /* ========================================================================= */
  .chronicle-generations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 14px;
  }

  .generation-card {
    background: #FFFFFF;
    border: 2.5px solid #142417;
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: 2px 2px 0 #142417;
  }

  .generation-card.highlight {
    background: #E8F5E9;
    border-color: #1B5E20;
    box-shadow: 3px 3px 0 #1B5E20;
  }

  .era-year {
    font-size: 0.76rem;
    font-weight: 900;
    color: #8C4D00;
    letter-spacing: 0.08em;
  }

  .generation-card strong {
    font-size: 0.98rem;
    color: #142417;
    font-weight: 800;
  }

  .generation-card p {
    font-size: 0.84rem;
    color: #2D3E31;
    line-height: 1.35;
    margin: 0;
  }

  .card-stat-pill {
    margin-top: 6px;
    font-size: 0.74rem;
    font-weight: 800;
    padding: 3px 6px;
    border-radius: 4px;
    background: #F1EADB;
    color: #142417;
    text-align: center;
  }

  .final-bebe-proverb {
    background: #FFF8E1;
    border: 2.5px solid #E5A93C;
    border-radius: 8px;
    padding: 14px 18px;
    font-size: 1.05rem;
    font-weight: 700;
    color: #8C4D00;
    font-style: italic;
    text-align: center;
    margin-top: 14px;
  }

  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .seed-sorting-workbench-layout,
    .tubewell-blueprint-canvas-grid,
    .strata-workbench-canvas-grid,
    .inoculation-workbench-grid,
    .graphical-plots-canvas,
    .canal-controls-grid,
    .charter-pillars-grid,
    .seeder-controls-cluster {
      grid-template-columns: 1fr;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
</style>
