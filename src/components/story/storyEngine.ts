// Hari's Story & Quest Engine for Field Shift

export type ChapterId = 'ch1_1990' | 'ch2_2005' | 'ch3_2026' | 'ch4_2040_ending';

export interface StoryChapter {
  id: ChapterId;
  year: number;
  title: string;
  subtitle: string;
  objective: string;
  targetEntityId: string;
}

export interface HariDecision {
  chapterId: ChapterId;
  decisionTitle: string;
  choiceMade: string;
  waterImpact: number;
  soilImpact: number;
  incomeImpact: number;
}

export const CHAPTERS: StoryChapter[] = [
  {
    id: 'ch1_1990',
    year: 1990,
    title: 'Chapter 1: The Inherited Soil',
    subtitle: '1990 — Hari takes over the ancestral land',
    objective: 'Walk to the veranda and talk to Amma [Press SPACE]',
    targetEntityId: 'amma'
  },
  {
    id: 'ch2_2005',
    year: 2005,
    title: 'Chapter 2: The Deep Tubewells',
    subtitle: '2005 — The Green Revolution & Sinking Waters',
    objective: 'Inspect the ancestral tubewell pump on the east bank',
    targetEntityId: 'tubewell'
  },
  {
    id: 'ch3_2026',
    year: 2026,
    title: 'Chapter 3: The Satellite Crossroads',
    subtitle: '2026 — Erratic Skies & The 3-Rotation Decision',
    objective: 'Meet Dr. Rao under the Banyan tree to review crop rotations',
    targetEntityId: 'banyan_tree'
  },
  {
    id: 'ch4_2040_ending',
    year: 2040,
    title: 'Chapter 4: The 2040 Legacy',
    subtitle: '2040 — Where Hari’s decisions led the field',
    objective: 'Review your 50-year farm legacy and NASA climate report',
    targetEntityId: 'ending'
  }
];

export interface EndingResult {
  title: string;
  badge: string;
  rating: 'S' | 'A' | 'B' | 'C';
  summary: string;
  soilCondition: string;
  waterCondition: string;
  incomeCondition: string;
  nasaEvaluation: string;
}

export function evaluateEnding(decisions: HariDecision[], finalMeters: { moisture: number; organic: number; nitrogen: number; income: number; erosion: number }): EndingResult {
  // Score out of 100
  let score = 50;
  if (finalMeters.moisture > 45) score += 15;
  if (finalMeters.organic > 50) score += 15;
  if (finalMeters.nitrogen > 50) score += 10;
  if (finalMeters.erosion < 40) score += 10;
  if (finalMeters.income > 200) score += 10;

  if (score >= 85) {
    return {
      title: "The Living Climate-Smart Oasis",
      badge: "LEGENDARY AGRO-ECOLOGIST",
      rating: 'S',
      summary: "Hari listened to Amma's ancient soil wisdom and combined it with modern NASA satellite alerts. By rotating deep-rooted millets and nitrogen-fixing legumes, the aquifer recharged, the topsoil built rich black humus, and the farm passed securely to Hari's children.",
      soilCondition: "Rich, spongy topsoil with 2.8% organic carbon. Zero runoff erosion.",
      waterCondition: "Tubewell head is stable; root-zone moisture remains buffered even during 3-week dry spells.",
      incomeCondition: `Thriving farm vault (${finalMeters.income} Coins) with diversified grain and pulse sales.`,
      nasaEvaluation: "NASA SMAP & GRACE confirm regional water balance resilience. Positive MODIS NDVI canopy index throughout dry seasons."
    };
  } else if (score >= 65) {
    return {
      title: "The Balanced Heritage Farm",
      badge: "RESILIENT STEWARD",
      rating: 'A',
      summary: "Hari navigated turbulent weather by adapting crop rotations whenever dry spells struck. While the tubewell experienced minor drawdown during intense summers, cover crops prevented catastrophic sheet erosion.",
      soilCondition: "Moderate topsoil retention with stable organic matter.",
      waterCondition: "Seasonal drawdown managed with furrow irrigation and rain harvesting.",
      incomeCondition: `Steady family revenue (${finalMeters.income} Coins).`,
      nasaEvaluation: "NASA POWER data confirms successful buffer against summer heatwave anomalies."
    };
  } else {
    return {
      title: "The Exhausted Field",
      badge: "VULNERABLE HARVEST",
      rating: 'C',
      summary: "Over-reliance on continuous flooded rice and deep tube-pumping during heatwaves severely depleted the local aquifer. When late-season cloudbursts hit bare fallow fields, significant topsoil was washed away.",
      soilCondition: "Cracked earth with low biological activity and visible erosion gullies.",
      waterCondition: "Borewell coughing sand; water table dropped over 15 meters.",
      incomeCondition: `Strained finances (${finalMeters.income} Coins) after soaring diesel pumping costs.`,
      nasaEvaluation: "NASA GRACE records severe negative terrestrial water thickness anomaly (−4.8 cm/yr)."
    };
  }
}
