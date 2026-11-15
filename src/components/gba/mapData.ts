import type { CollisionBox, InteractiveEntity, DialogueNode, FloatingBox } from './types';

export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 720;

export const INITIAL_PLAYER_POSITION = {
  x: 480,
  y: 360,
  direction: 'down' as const
};

// Static Collision Obstacles on Amma's Farm
export const COLLISION_OBSTACLES: CollisionBox[] = [
  // Farmhouse Building (Top Right: x: 600, y: 80, w: 260, h: 160)
  { x: 600, y: 80, width: 260, height: 140 },
  // Veranda railing
  { x: 600, y: 220, width: 80, height: 20 },
  { x: 780, y: 220, width: 80, height: 20 },

  // Seed Storage Shed / Solar Kiosk (Top Left: x: 100, y: 90, w: 140, h: 100)
  { x: 100, y: 90, width: 140, height: 100 },

  // Sacred Banyan Tree (Center Top: x: 420, y: 70, w: 120, h: 110)
  { x: 440, y: 110, width: 80, height: 70 },

  // Tubewell Pump Machine (Right Middle: x: 820, y: 380, w: 60, h: 50)
  { x: 820, y: 380, width: 60, height: 50 },

  // Weather Station Anemometer Pole (Left Middle: x: 80, y: 370, w: 50, h: 50)
  { x: 80, y: 370, width: 50, height: 50 },

  // Terracotta Grain Urns (Near House: x: 570, y: 160, w: 40, h: 50)
  { x: 570, y: 160, width: 40, height: 50 },

  // Outer Map Boundaries
  { x: 0, y: 0, width: WORLD_WIDTH, height: 24 }, // North border
  { x: 0, y: WORLD_HEIGHT - 24, width: WORLD_WIDTH, height: 24 }, // South border
  { x: 0, y: 0, width: 24, height: WORLD_HEIGHT }, // West border
  { x: WORLD_WIDTH - 24, y: 0, width: 24, height: WORLD_HEIGHT }, // East border

  // Water Canal Divider (Horizontal canal across center with bridge at x: 440-520)
  { x: 24, y: 470, width: 416, height: 22 },
  { x: 520, y: 470, width: 416, height: 22 }
];

// Interactive Entities on the Overworld - Cleaned up to anchor the 4 key missions
export const INTERACTIVE_ENTITIES: InteractiveEntity[] = [
  {
    id: 'amma',
    type: 'npc_amma',
    name: "Amma's Veranda (Heirloom Seeds)",
    promptText: '[A] Talk to Amma [Mission 1: Match Seeds]',
    x: 710,
    y: 220,
    width: 32,
    height: 40,
    interactionRadius: 65,
    dialogueId: 'amma_greeting'
  },
  {
    id: 'banyan_tree',
    type: 'banyan_tree',
    name: 'Sacred Banyan & Agronomist Council',
    promptText: '[A] Consult Dr. Rao [Mission 2: Fill Blanks]',
    x: 440,
    y: 130,
    width: 80,
    height: 70,
    interactionRadius: 80,
    dialogueId: 'agronomist_consult'
  },
  {
    id: 'weather_station',
    type: 'weather_station',
    name: 'Satellite Weather Post & Relay',
    promptText: '[A] Answer Satellite Call [Mission 3: America]',
    x: 80,
    y: 370,
    width: 50,
    height: 50,
    interactionRadius: 70,
    dialogueId: 'weather_station_inspect'
  },
  {
    id: 'seed_shed',
    type: 'seed_shed',
    name: 'Global Agro-Ecology Solar Kiosk',
    promptText: '[A] Watch Field Broadcast [Mission 4: Kenya]',
    x: 100,
    y: 140,
    width: 140,
    height: 60,
    interactionRadius: 75,
    dialogueId: 'seed_shed_inspect'
  },
  {
    id: 'tubewell',
    type: 'tubewell',
    name: 'Ancestral Tubewell Pump',
    promptText: '[A] Inspect Borewell (NASA GRACE)',
    x: 820,
    y: 380,
    width: 60,
    height: 50,
    interactionRadius: 75,
    dialogueId: 'tubewell_inspect'
  },
  {
    id: 'crop_plot_north',
    type: 'crop_plot_north',
    name: 'North Terraced Field (Paddy/Millet)',
    promptText: '[A] Inspect Soil & Precision Sowing',
    x: 200,
    y: 300,
    width: 180,
    height: 120,
    interactionRadius: 85,
    dialogueId: 'crop_north_inspect'
  },
  {
    id: 'crop_plot_south',
    type: 'crop_plot_south',
    name: 'South Field (Legumes & Pulses)',
    promptText: '[A] Inspect Nitrogen & Heatwave Shield',
    x: 240,
    y: 530,
    width: 200,
    height: 130,
    interactionRadius: 85,
    dialogueId: 'crop_south_inspect'
  }
];

// Cleaned up: Floating boxes removed from overworld per user request
export const FLOATING_BOXES: FloatingBox[] = [];

// Dialogue Graph with portraits and choices for all 4 missions & story lore
export const DIALOGUE_NODES: Record<string, DialogueNode> = {
  amma_greeting: {
    id: 'amma_greeting',
    speaker: 'Amma',
    speakerTitle: 'Farm Matriarch',
    portrait: 'amma_wise',
    text: [
      "Welcome, Hari child! Look closely at the burnished clay jars resting on the veranda.",
      "Before corporate hybrid seeds took over our valley, our family preserved heirloom seeds adapted to withstand erratic monsoons.",
      "NASA's SMAP satellite radiometer measures root-zone wetness from 680 km above. Can you help me match our four ancestral seeds with their climate adaptation superpowers?"
    ],
    choices: [
      { text: "[★ MISSION 1] Match Heirloom Seeds Matrix (NASA SMAP)", action: 'play_amma_match' },
      { text: "What should we sow this season, Amma?", nextDialogueId: 'amma_crop_advice' },
      { text: "How deep is our well water holding up?", nextDialogueId: 'amma_water_worry' },
      { text: "I want to compare our 3 crop rotation options.", action: 'open_compare' },
      { text: "Just checking in on you, Amma.", action: 'close' }
    ]
  },
  amma_crop_advice: {
    id: 'amma_crop_advice',
    speaker: 'Amma',
    speakerTitle: 'Farm Matriarch',
    portrait: 'amma_smile',
    text: [
      "Our neighbors rush to plant water-hungry hybrid rice because grain buyers promise quick cash.",
      "But if you intercrop pearl millet with deep-rooted chickpea, the roots seek moisture four feet down, and the legumes feed nitrogen back into the soil.",
      "Open our rotation almanac and see for yourself how the climate risk shifts."
    ],
    choices: [
      { text: "[★ MISSION 1] Start Heirloom Matching Challenge", action: 'play_amma_match' },
      { text: "[◆ MINI-GAME] Start Precision Sowing Drill (NASA SMAP)", action: 'play_sowing' },
      { text: "Open 3-Rotation Compare Matrix", action: 'open_compare' },
      { text: "Let me inspect the north field first.", action: 'close' }
    ]
  },
  amma_water_worry: {
    id: 'amma_water_worry',
    speaker: 'Amma',
    speakerTitle: 'Farm Matriarch',
    portrait: 'amma_worry',
    text: [
      "In 1990, we struck sweet water at forty feet with a simple bullock pulley.",
      "Today, the diesel borewell hums at three hundred feet, coughing up sand when neighboring villages run their pumps simultaneously.",
      "Go inspect the tubewell pump—the satellite telemetry chips we installed will show you the regional aquifer trend."
    ],
    choices: [
      { text: "[◆ MINI-GAME] Calibrate Tubewell Valves (NASA GRACE)", action: 'play_tubewell' },
      { text: "I'll go check the tubewell pump.", action: 'close' }
    ]
  },
  agronomist_consult: {
    id: 'agronomist_consult',
    speaker: 'Dr. Rao',
    speakerTitle: 'District Extension Agronomist',
    portrait: 'agronomist',
    text: [
      "Namaskara, Hari! I am Dr. Rao, your district extension agronomist, sitting here under our 200-year-old sacred banyan tree.",
      "We are drafting our village's 3-Year Regenerative Rotation Charter to halt aquifer depletion. We need your sharp mind to fill in the missing scientific & NASA satellite blanks!",
      "Complete the charter so we can submit it to the village panchayat for collective water conservation."
    ],
    choices: [
      { text: "[★ MISSION 2] Fill-in-the-Blanks Charter (NASA GRACE)", action: 'play_banyan_blank' },
      { text: "What do you think of climate-smart millets?", nextDialogueId: 'agronomist_millets' },
      { text: "Review 3-Strategy Rotation Matrix", action: 'open_compare' },
      { text: "Thank you, Dr. Rao.", action: 'close' }
    ]
  },
  agronomist_millets: {
    id: 'agronomist_millets',
    speaker: 'Dr. Rao',
    speakerTitle: 'District Extension Agronomist',
    portrait: 'agronomist',
    text: [
      "Millets like Ragi (Finger Millet) and Bajra (Pearl Millet) have silica-reinforced roots that penetrate hardpan compaction layers.",
      "They survive on 350mm of seasonal rain where rice requires 1200mm! Plus, local millet processing mills are offering premium buyback contracts.",
      "I give our 3-crop regenerative rotation my official seal of approval!"
    ],
    choices: [
      { text: "[★ MISSION 2] Fill-in-the-Blanks Blueprint", action: 'play_banyan_blank' },
      { text: "Open Strategy Matrix to see numbers", action: 'open_compare' },
      { text: "Good to know!", action: 'close' }
    ]
  },
  weather_station_inspect: {
    id: 'weather_station_inspect',
    speaker: 'Village Weather Post',
    speakerTitle: 'Satellite Radio Relay Terminal',
    portrait: 'satellite',
    nasaChip: 'GPM_RAIN',
    text: [
      "[ PRIORITY INCOMING SATELLITE TRANSMISSION ]",
      "The radio transceiver is pulsing red! An urgent transatlantic distress signal is being routed over NASA's GPM (Global Precipitation Measurement) satellite network.",
      "Farmer Sarah from Story County, Iowa (USA) is calling. A 92 mm/hr cloudburst convective storm is bearing down on 350 acres of bare tilled topsoil!"
    ],
    choices: [
      { text: "[★ MISSION 3] Answer Satellite Call from America (NASA GPM)", action: 'play_america_phone' },
      { text: "[◆ MINI-GAME] Deploy Sluice Runoff Shield (NASA GPM)", action: 'play_sluice' },
      { text: "Open Full NASA Data Glossary", action: 'open_nasa' },
      { text: "Step away from terminal.", action: 'close' }
    ]
  },
  seed_shed_inspect: {
    id: 'seed_shed_inspect',
    speaker: 'Global Agro-Ecology Kiosk',
    speakerTitle: 'Solar-Powered Village Screen',
    portrait: 'satellite',
    nasaChip: 'MODIS_HEAT',
    text: [
      "[ LIVE SATELLITE FIELD BROADCAST ]",
      "The solar community terminal is tuned to NASA Earth Observatory's Global Farmer Exchange.",
      "A live field video documentary from Machakos County, Kenya is playing: Farmer Amina demonstrates how reviving ancient Zaï pit compost bio-shields saved her village from a 46.4°C scorching heat dome!"
    ],
    choices: [
      { text: "[★ MISSION 4] Watch Kenya Video & Build Zaï Pit Bio-Shield", action: 'play_kenya_video' },
      { text: "Review Heirloom Seed Clay Urns", nextDialogueId: 'seed_urns_detail' },
      { text: "Step away from screen.", action: 'close' }
    ]
  },
  seed_urns_detail: {
    id: 'seed_urns_detail',
    speaker: 'Seed Vault',
    speakerTitle: 'Ancestral Clay Urns',
    portrait: 'grandchild',
    text: [
      "Inside the cool dark shed stand rows of burnished clay urns sealed with beeswax and neem leaves.",
      "Urn 1: Heirloom Basmati Rice (traditional, high water need).",
      "Urn 2: Drought-hardy Finger Millet (deep roots, low water).",
      "Urn 3: Nitrogen-fixing Desi Chickpea.",
      "Urn 4: Crimson Clover cover seeds."
    ],
    choices: [
      { text: "[★ MISSION 1] Match Seeds with Amma", action: 'play_amma_match' },
      { text: "Review 3-Strategy Rotation Plans", action: 'open_compare' },
      { text: "Close seed chest.", action: 'close' }
    ]
  },
  tubewell_inspect: {
    id: 'tubewell_inspect',
    speaker: 'Telemetry Readout',
    speakerTitle: 'NASA GRACE Satellite Sensor',
    portrait: 'satellite',
    nasaChip: 'GRACE_WATER',
    text: [
      "[ NASA GRACE / GRACE-FO TELEMETRY ]",
      "Regional Aquifer Drawdown: −3.2 cm/yr equivalent water thickness anomaly.",
      "Current Tubewell Head Pressure: Marginal (42% capacity). Excessive flooded rice pumping risks borewell burnout during dry spells."
    ],
    choices: [
      { text: "[◆ MINI-GAME] Balance Tubewell Valves (NASA GRACE)", action: 'play_tubewell' },
      { text: "Review NASA Groundwater Citations", action: 'open_nasa' },
      { text: "Compare Water-Smart Rotations", action: 'open_compare' },
      { text: "Step away from pump.", action: 'close' }
    ]
  },
  crop_north_inspect: {
    id: 'crop_north_inspect',
    speaker: 'Field Plot 01',
    speakerTitle: 'North Terraced Soil (SMAP Active)',
    portrait: 'grandchild',
    nasaChip: 'SMAP_SOIL',
    text: [
      "You examine the topsoil of Amma's north terrace.",
      "NASA SMAP L4 Radiometer indicates root-zone wetness (GWETROOT) is at 0.38 (stressed).",
      "Bare fallow will accelerate wind erosion. Planting a cover crop or switching to drought-hardy millets will protect the organic carbon layer."
    ],
    choices: [
      { text: "[◆ MINI-GAME] Start Precision Sowing Drill (NASA SMAP)", action: 'play_sowing' },
      { text: "Open 3-Rotation Compare Matrix", action: 'open_compare' },
      { text: "Back to walking.", action: 'close' }
    ]
  },
  crop_south_inspect: {
    id: 'crop_south_inspect',
    speaker: 'Field Plot 02',
    speakerTitle: 'South Legume Basin',
    portrait: 'grandchild',
    text: [
      "The south field is currently resting with chickpea and green gram stubble.",
      "Rhizobium root nodules are actively fixing atmospheric nitrogen. The soil smells rich, sweet, and earthy.",
      "Soil Organic Carbon index is steady at 0.65%."
    ],
    choices: [
      { text: "[◆ MINI-GAME] Deploy Heatwave Bio-Shield (NASA MERRA-2)", action: 'play_heatwave' },
      { text: "Open 3-Rotation Strategy Matrix", action: 'open_compare' },
      { text: "Leave soil undisturbed.", action: 'close' }
    ]
  }
};
