/**
 * Typed data layer for the frontend.
 * Strategy outputs under mock/ are SYNTHETIC placeholders (see README "Data integrity");
 * contracts/ holds the frozen Phase 0 types, and data/ holds curated/precomputed datasets
 * (cited crop traits, NASA POWER weekly weather) wired by later phases.
 */
import type { CropCatalog } from '../../contracts/crops';
import type { MeterValues, SimulationOutput, StrategyId } from '../../contracts/sim-output';
import cropsJson from './data/crops.json';
import simExistingJson from './mock/sim-output-existing.json';
import simIncomeJson from './mock/sim-output-income.json';
import simResilienceJson from './mock/sim-output.json';

export const crops = cropsJson as unknown as CropCatalog;

export const sims: Record<StrategyId, SimulationOutput> = {
  existing_rotation: simExistingJson as unknown as SimulationOutput,
  resilience_rotation: simResilienceJson as unknown as SimulationOutput,
  income_rotation: simIncomeJson as unknown as SimulationOutput
};

/** Horizon years available across all strategy outputs, ascending. */
export const horizons: number[] = [...new Set(Object.values(sims).flatMap((s) => s.years.map((y) => y.year)))].sort(
  (a, b) => a - b
);

export type MeterKey = keyof MeterValues;

export interface MeterMeta {
  key: MeterKey;
  label: string;
  /** Provisional display unit; the simulation contract does not yet fix units. */
  unit: string;
  digits: number;
}

/** Display order and provisional units. Synthetic until the sim contract fixes them. */
export const METERS: MeterMeta[] = [
  { key: 'soilMoisture', label: 'Soil moisture', unit: 'fraction', digits: 2 },
  { key: 'organicMatter', label: 'Organic matter', unit: 'provisional', digits: 1 },
  { key: 'nitrogen', label: 'Nitrogen', unit: 'provisional', digits: 0 },
  { key: 'erosionRisk', label: 'Erosion risk', unit: '0–1 index', digits: 2 },
  { key: 'waterUse', label: 'Water use', unit: 'mm/season', digits: 0 },
  { key: 'income', label: 'Income', unit: 'index, 2026 = 100', digits: 0 }
];

/**
 * Safe adapter reconciling the frozen contracts/sim-output.ts contract with
 * frontend percentile band expectations.
 *
 * In mock JSON, p10 and p90 are structured as MeterValues objects (e.g. p10.soilMoisture).
 * In the engine's internal result, distributions are exposed via meterDistributions[meterKey].
 * In the frozen contract, p10/p50/p90 on SimulationOutput are PercentileBand ({ p10, p50, p90 }).
 */
export function getMeterBand(
  sim: SimulationOutput,
  key: MeterKey
): { lo: number; hi: number } {
  const extended = sim as unknown as { meterDistributions?: Record<MeterKey, { p10: number; p90: number }> };
  if (extended.meterDistributions?.[key]) {
    return {
      lo: extended.meterDistributions[key].p10,
      hi: extended.meterDistributions[key].p90
    };
  }

  const rawP10 = sim.p10 as unknown as Record<string, number>;
  const rawP90 = sim.p90 as unknown as Record<string, number>;
  if (typeof rawP10?.[key] === 'number' && typeof rawP90?.[key] === 'number') {
    return {
      lo: rawP10[key],
      hi: rawP90[key]
    };
  }

  const pb10 = (sim.p10 as unknown as { p10?: number })?.p10;
  const pb90 = (sim.p90 as unknown as { p90?: number })?.p90;
  if (typeof pb10 === 'number' && typeof pb90 === 'number') {
    return { lo: pb10, hi: pb90 };
  }

  const fallback = sim.meters[key] ?? 0;
  return { lo: fallback, hi: fallback };
}

/** Meters shown without a band edge clipped: spans every strategy, year, and percentile. */
function computeExtents(): Record<MeterKey, { min: number; max: number }> {
  const out = {} as Record<MeterKey, { min: number; max: number }>;
  for (const m of METERS) {
    let min = Infinity;
    let max = -Infinity;
    for (const s of Object.values(sims)) {
      for (const y of s.years) {
        min = Math.min(min, y.meters[m.key]);
        max = Math.max(max, y.meters[m.key]);
      }
      const band = getMeterBand(s, m.key);
      min = Math.min(min, band.lo, band.hi);
      max = Math.max(max, band.lo, band.hi);
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0;
      max = 1;
    }
    if (max - min < 1e-9) {
      min -= 1;
      max += 1;
    }
    const pad = (max - min) * 0.06;
    out[m.key] = { min: min - pad, max: max + pad };
  }
  return out;
}

export const meterExtents = computeExtents();

export function metersAt(id: StrategyId, year: number): MeterValues {
  return sims[id].years.find((y) => y.year === year)?.meters ?? sims[id].meters;
}

export interface RegionOption {
  id: string;
  label: string;
  /** Illustrative art palette only — carries no data meaning. */
  sky: string;
  soil: string;
  furrow: string;
  crop: string;
  sun: string;
}

export const REGIONS: RegionOption[] = [
  { id: 'punjab', label: 'Punjab, India', sky: '#dce5c9', soil: '#9a815b', furrow: '#d4b987', crop: '#486c42', sun: '#e8b95c' },
  { id: 'iowa', label: 'Iowa, USA', sky: '#d9e4dc', soil: '#8a6f52', furrow: '#c9b183', crop: '#3f6b3a', sun: '#e0a94e' },
  { id: 'karnataka', label: 'Karnataka, India', sky: '#e6e2cd', soil: '#a2603f', furrow: '#cf9a6b', crop: '#51713f', sun: '#dfae55' },
  {
    id: 'sahel',
    label: 'Sahel / Kenya (site to be confirmed)',
    sky: '#e9e3cf',
    soil: '#b08d55',
    furrow: '#d9c08a',
    crop: '#7c7f3f',
    sun: '#dfa63e'
  }
];

export function regionById(id: string): RegionOption {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}
