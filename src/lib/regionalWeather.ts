/**
 * Lazy per-region weekly weather loader.
 * The real NASA POWER precomputed files (~330 KB each) live in src/lib/data/;
 * each region is code-split so the app only downloads the one being viewed.
 */
import type { RegionalWeather } from '../../contracts/weather';

type WeatherModule = { default: RegionalWeather };

const loaders: Record<string, () => Promise<WeatherModule>> = {
  punjab: () => import('./data/weather_punjab.json') as unknown as Promise<WeatherModule>,
  iowa: () => import('./data/weather_iowa.json') as unknown as Promise<WeatherModule>,
  karnataka: () => import('./data/weather_karnataka.json') as unknown as Promise<WeatherModule>,
  sahel: () => import('./data/weather_sahel-kenya.json') as unknown as Promise<WeatherModule>
};

export async function loadRegionWeather(regionId: string): Promise<RegionalWeather | null> {
  const load = loaders[regionId];
  if (!load) return null;
  const mod = await load();
  return mod.default;
}

/** Most recent complete year (>= minWeeks records), weeks sorted ascending.
 *  The NASA files end mid-year (e.g. 2026 week 1), so the naive "latest year" is a stub. */
export function latestFullYear(records: RegionalWeather, minWeeks = 48): RegionalWeather {
  if (!records.length) return records;
  const countByYear = new Map<number, number>();
  for (const r of records) countByYear.set(r.year, (countByYear.get(r.year) ?? 0) + 1);
  const completeYears = [...countByYear.entries()].filter(([, count]) => count >= minWeeks).map(([year]) => year);
  const year = completeYears.length
    ? Math.max(...completeYears)
    : Math.max(...records.map((r) => r.year));
  return records
    .filter((r) => r.year === year)
    .sort((a, b) => a.week - b.week);
}
