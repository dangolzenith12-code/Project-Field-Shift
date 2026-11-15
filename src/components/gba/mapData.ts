import type { CollisionBox, InteractiveEntity, DialogueNode } from './types';

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

  // Seed Storage Shed (Top Left: x: 100, y: 90, w: 140, h: 100)
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

// Interactive Entities on the Overworld
export const INTERACTIVE_ENTITIES: InteractiveEntity[] = [
  {
    id: 'amma',
    type: 'npc_amma',
    name: 'Amma',
    promptText: 'Talk to Amma',
    x: 710,
    y: 220,
    width: 32,
    height: 40,
    interactionRadius: 65,
    dialogueId: 'amma_greeting'
  },
  {
    id: 'tubewell',
    type: 'tubewell',
    name: 'Ancestral Tubewell Pump',
    promptText: 'Inspect Borewell (GRACE Data)',
    x: 820,
    y: 380,
    width: 60,
    height: 50,
    interactionRadius: 75,
    dialogueId: 'tubewell_inspect'
  },
  {
    id: 'weather_station',
    type: 'weather_station',
    name: 'Village Weather Post',
    promptText: 'Check Rain Gauge (NASA POWER)',
    x: 80,
    y: 370,
    width: 50,
    height: 50,
    interactionRadius: 70,
    dialogueId: 'weather_station_inspect'
  },
  {
    id: 'crop_plot_north',
    type: 'crop_plot_north',
    name: 'North Terraced Field (Paddy/Millet)',
    promptText: 'Inspect Soil & Plan Rotation',
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
    promptText: 'Inspect Nitrogen & Bio-Cover',
    x: 240,
    y: 530,
    width: 200,
    height: 130,
    interactionRadius: 85,
    dialogueId: 'crop_south_inspect'
  },
  {
    id: 'banyan_tree',
    type: 'banyan_tree',
    name: 'Banyan Tree & Village Agronomist',
    promptText: 'Consult Local Agronomist',
    x: 440,
    y: 130,
    width: 80,
    height: 70,
    interactionRadius: 80,
    dialogueId: 'agronomist_consult'
  },
  {
    id: 'seed_shed',
    type: 'seed_shed',
    name: 'Ancestral Seed Shed',
    promptText: 'Examine Seed Stocks',
    x: 100,
    y: 140,
    width: 140,
    height: 60,
    interactionRadius: 70,
    dialogueId: 'seed_shed_inspect'
  }
];

// Dialogue Graph with portraits and choices
export const DIALOGUE_NODES: Record<string, DialogueNode> = {
  amma_greeting: {
    id: 'amma_greeting',
    speaker: 'Amma',
    speakerTitle: 'Farm Matriarch',
    portrait: 'amma_wise',
    text: [
      "Welcome back, child. I was just watching the dragonflies skim the canal. In my youth, dragonflies meant the monsoon rains would be gentle and steady.",
      "Now, the skies hold their breath for weeks, only to pour three inches in one night. The soil cannot drink so fast."
    ],
    choices: [
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
      "Our neighbors rush to plant water-hungry hybrid rice because the grain buyers promise ready cash.",
      "But if you intercrop pearl millet with deep-rooted chickpea, the roots seek moisture four feet down, and the legumes feed nitrogen back into the soil.",
      "Open our rotation almanac and see for yourself how the climate risk shifts."
    ],
    choices: [
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
      "Today, the diesel borewell hums at three hundred feet, coughing up sand when the neighboring villages run their pumps simultaneously.",
      "Go inspect the tubewell pump—the satellite telemetry chips we installed will show you the regional aquifer trend."
    ],
    choices: [
      { text: "I'll go check the tubewell pump.", action: 'close' }
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
      "Current Tubewell Head Pressure: Marginal (42% capacity). Excessive rice flooding risks pump burnout during dry spells."
    ],
    choices: [
      { text: "Review NASA Groundwater Citations", action: 'open_nasa' },
      { text: "Compare Water-Smart Rotations", action: 'open_compare' },
      { text: "Step away from pump.", action: 'close' }
    ]
  },
  weather_station_inspect: {
    id: 'weather_station_inspect',
    speaker: 'Village Weather Post',
    speakerTitle: 'NASA POWER Meteorological Station',
    portrait: 'satellite',
    nasaChip: 'POWER_RAIN',
    text: [
      "[ NASA POWER MERRA-2 ASSIMILATION ]",
      "Weekly Solar Radiation (ALLSKY_SFC_SW_DWN): 21.4 MJ/m²/day.",
      "Surface Evaporation Rate (EVLAND): 4.8 mm/day.",
      "Consecutive Dry Spell Days: 18 days above historical normal. High evaporative soil moisture loss detected."
    ],
    choices: [
      { text: "Open Full NASA Data Glossary", action: 'open_nasa' },
      { text: "Check field moisture impact", action: 'close' }
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
      { text: "Open 3-Rotation Compare Matrix", action: 'open_compare' },
      { text: "Advance Season & Sow Seeds", action: 'advance_season' },
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
      { text: "Open 3-Rotation Strategy Matrix", action: 'open_compare' },
      { text: "Leave soil undisturbed.", action: 'close' }
    ]
  },
  agronomist_consult: {
    id: 'agronomist_consult',
    speaker: 'Dr. Rao',
    speakerTitle: 'District Extension Agronomist',
    portrait: 'agronomist',
    text: [
      "Namaskara! I am here under the Banyan tree reviewing the district crop patterns.",
      "Satellites provide marvelous regional observations, but remember our golden rule: 'Supports farmers, doesn't replace them!'",
      "Before adopting a brand new variety across your whole acreage, test it in a quarter-acre test strip and consult our local extension office for pest forecasts."
    ],
    choices: [
      { text: "What do you think of climate-smart millets?", nextDialogueId: 'agronomist_millets' },
      { text: "Review crop rotation options", action: 'open_compare' },
      { text: "Thank you, Dr. Rao.", action: 'close' }
    ]
  },
  agronomist_millets: {
    id: 'agronomist_millets',
    speaker: 'Dr. Rao',
    speakerTitle: 'District Extension Agronomist',
    portrait: 'agronomist',
    text: [
      "Millets like Ragi (Finger Millet) and Bajra (Pearl Millet) have silica-reinforced roots that penetrate compaction layers.",
      "They survive on 350mm of seasonal rain where rice requires 1200mm! Plus, local millet mills are offering premium buyback contracts.",
      "I give that rotation my official stamp of approval!"
    ],
    choices: [
      { text: "Open Strategy Matrix to see numbers", action: 'open_compare' },
      { text: "Good to know!", action: 'close' }
    ]
  },
  seed_shed_inspect: {
    id: 'seed_shed_inspect',
    speaker: 'Seed Vault',
    speakerTitle: 'Amma’s Clay Urns',
    portrait: 'grandchild',
    text: [
      "Inside the cool dark shed stand rows of burnished clay urns sealed with beeswax and neem leaves.",
      "Urn 1: Heirloom Basmati Rice (traditional, high water need).",
      "Urn 2: Drought-hardy Finger Millet (deep roots, low water).",
      "Urn 3: Nitrogen-fixing Desi Chickpea.",
      "Urn 4: Crimson Clover cover seeds."
    ],
    choices: [
      { text: "Review 3-Strategy Rotation Plans", action: 'open_compare' },
      { text: "Close seed chest.", action: 'close' }
    ]
  }
};
