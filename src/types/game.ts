// Game Types & Contracts for Field Shift: Four Seasons of Amma's Field

export type RegionId = 'punjab' | 'iowa' | 'karnataka' | 'sahel';

export interface RegionInfo {
  id: RegionId;
  name: string;
  country: string;
  landscapeDescription: string;
  climateChallenge: string;
  badge: string;
  primaryCrops: string[];
  historicalTrend: string;
  soilType: string;
  graceGroundwaterTrend: string; // Precomputed regional callout
  initialMeters: FarmMeters;
}

export type EraId = '1990' | '2005' | '2026' | '2040';

export interface EraInfo {
  id: EraId;
  name: string;
  year: number;
  label: string;
  description: string;
  climateShiftText: string;
  nasaEvidence: string;
  tempAnomaly: number; // in Celsius e.g. +0.0, +0.6, +1.2, +2.1
  rainShiftPercent: number; // e.g. 0, -5%, -12%, -18%
}

export interface FarmMeters {
  soilMoisture: number;    // 0 - 100 (%) -> Feeds Water Jar
  organicMatter: number;   // 0 - 100 (%) -> Feeds Soil Profile
  nitrogen: number;        // 0 - 100 (%) -> Feeds Sprout Meter
  erosionRisk: number;     // 0 - 100 (%) -> Feeds Crumbling Edge Meter (higher is riskier)
  income: number;          // Coins count -> Feeds Coin Stack
  waterUse: number;        // mm/season -> Readout
}

export interface SatelliteNote {
  dataset: 'POWER' | 'SMAP' | 'MODIS' | 'GRACE' | 'SoilGrids' | 'SRTM';
  title: string;
  sensor: string;
  scientificValue: string;
  farmerExplanation: string;
  url?: string;
}

export interface CropTrait {
  id: string;
  name: string;
  icon: string;
  waterNeed: 'Low' | 'Medium' | 'High';
  nFixing: boolean;
  rootDepth: 'Shallow' | 'Medium' | 'Deep';
  coverValue: 'Low' | 'Medium' | 'High';
  growingSeasonDays: number;
  revenuePotential: number; // in coins
}

export interface StrategyOption {
  id: string;
  title: string;
  subtitle: string;
  cropRotation: string[];
  whySuggested: string;
  benefits: string[];
  risks: string[];
  dataGaps: string[];
  needsLocalExpert: boolean;
  nasaEvidenceChips: SatelliteNote[];
  // Monte Carlo range values (p10, median, p90) for projected 5-year resilience score (0-100)
  monteCarlo: {
    p10: number;
    median: number;
    p90: number;
    distribution: number[]; // 20-30 data points for wobbly curve
  };
  metrics: {
    waterStressDelta: number; // e.g. -25%
    incomeReturn: number;    // e.g. +18%
    soilCarbonDelta: number; // e.g. +30%
    laborReqDelta: number;   // e.g. +10%
  };
}

export interface FarmerPriorities {
  water: number;       // 0 - 100 weight
  income: number;      // 0 - 100 weight
  soilHealth: number;  // 0 - 100 weight
  labor: number;       // 0 - 100 weight
}

export interface ClimateModifiers {
  tempOffset: number;  // 0 to +3 °C
  rainOffset: number;  // -20% to +20%
}

export type SceneView = 'STORY_GAME' | 'INTRO' | 'REGION_SELECT' | 'SEASON_PLAY' | 'STRATEGY_COMPARE' | 'NASA_DATA' | 'STYLEGUIDE';
