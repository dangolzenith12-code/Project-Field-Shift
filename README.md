# 🌾 Field Shift: Four Seasons of Amma's Field
### NASA Space Apps Challenge | Frontend UI/UX Module

> **Vintage Seed-Packet Arcade Aesthetic**  
> *"A cozy farm simulation game printed like an illustrated almanac. Chunky 3px ink outlines, flat warm colors, hard offset shadows, springy motion, and living SVG ecology."*

---

## 🎨 Design System Foundation

Built strictly following the **Harvest Almanac Arcade** specifications:

* **Strict 9-Color Semantic Palette**:
  * `--ink`: `#2B1B12` (All outlines, text, and hard shadows)
  * `--paper`: `#FFF3D6` (Warm cream background, never pure white)
  * `--soil`: `#8A4B2A` (Soil strata, organic matter)
  * `--turmeric`: `#FFB703` (Primary actions, coins, and sunbursts)
  * `--paddy`: `#3FA34D` (Healthy crops, positive outcomes)
  * `--monsoon`: `#2F6FED` (Rain, soil moisture, NASA data tags)
  * `--chili`: `#E63946` (Drought, erosion warnings, rubber stamps)
  * `--dusk`: `#7B4FA3` (Reserved for Amma's narrator wisdom)
  * `--sky`: `#BDE8F5` (Scene atmospheric backdrop)
* **Typography**:
  * **Display**: `Bagel Fat One` (titles, button text, rubber stamps; tilted -1° to -2°)
  * **Body**: `Figtree` (narrative dialogue, card body copy)
  * **Data/Readouts**: `Space Mono` (all numbers, telemetry, and dataset chips)
* **Tactile Physics**:
  * 3px solid ink outlines with `0 5px 0 var(--ink)` hard drop shadows.
  * Spring overshoot curves on release (`cubic-bezier(.34, 1.56, .64, 1)`).
  * Hover lifts 2px; active press sinks 4px into the page.

---

## 🚀 Key Features Built in this UI

1. **Living SVG Farm Scene Hero (`FarmScene.svelte`)**:
   * Multi-layered SVG with sky, sunburst, rolling hills, thatched farmhouse, Banyan tree, and crop rows.
   * Dynamically mutates based on simulation state:
     * **Drought State**: Soil cracks appear via SVG patterns, crops droop.
     * **Healthy State**: Lush paddy-green canopy and deep fertile soil.
     * **Erosion State**: Fractured soil gullies appear on steep slopes.
   * **Canvas 2D Particle System**: Slanted monsoon raindrops, gentle summer dust motes, or golden harvest sparkles running at 60fps with zero external game engine overhead.
2. **5 Tactile Jars & Gauge Meters**:
   * **Water Jar (`WaterJarMeter.svelte`)**: Glass/clay jar filling with monsoon-blue water, meniscus ripple, and spring wobble.
   * **Soil Strata Profile (`SoilProfileMeter.svelte`)**: Cross-section showing topsoil organic depth against bedrock.
   * **Erosion Risk Gauge (`ErosionGaugeMeter.svelte`)**: Crumbling cliff edge with falling debris.
   * **Coin Stack (`CoinStackMeter.svelte`)**: Tactile stack of turmeric gold coins with bouncing animation.
   * **Nitrogen Sprout (`SproutMeter.svelte`)**: Living seedling that unfolds leaves and glows green as nitrogen balances.
3. **Strategy Compare Screen (`CompareScreen.svelte`)**:
   * 3 rotation cards dealt on a table (Traditional, Climate-Smart Resilience, High-Value Commercial).
   * **Monte Carlo Uncertainty Ribbon (`MonteCarloRibbon.svelte`)**: Hand-drawn wobbly ribbon displaying p10/median/p90 resilience ranges from 40 resampled weather years.
   * **"ASK A LOCAL EXPERT" Stamp (`RubberStamp.svelte`)**: Chili-red double-outlined rubber stamp with squash-and-stretch drop animation.
   * **Live Sensitivity Control Panel**: Farmer priority sliders (Water, Income, Soil, Labor) and Climate stress sliders (+0°C to +3°C, ±20% rain) that re-calculate and re-rank strategies in real time with an animated winner ribbon.
4. **Interactive NASA Data Chips (`DataChip.svelte`)**:
   * Monsoon-blue chips for `[NASA POWER]`, `[SMAP L4]`, `[MODIS NDVI]`, `[GRACE]`.
   * Click any chip to open a plain-language "Satellite Note" popover with both the scientific definition and "Farmer's Translation".
5. **Living Styleguide (`/styleguide` view)**:
   * Interactive testing lab verifying all 9 swatches, typography hierarchy, button states, meters, stamps, and sliders in isolation.
6. **NASA Citations & Methodology Page (`NasaDataView.svelte`)**:
   * Transparent scientific documentation, dataset parameters, and honest limitations section.

---

## 🛠️ Integration Guide for Teammates (GitHub Merge)

All types and contracts are cleanly isolated in `src/types/game.ts` and `src/data/mockData.ts`:

* **Teammate A (Data Lead)**:
  * Replace the static regional arrays in `src/data/mockData.ts` (`REGIONS`) with your precomputed `weather_{region}.json` aggregates.
* **Teammate B (Simulation Engineer)**:
  * Hook your daily water balance and Monte Carlo worker into `advanceSeason()` in `src/App.svelte`. The UI simply reads `meters` (`soilMoisture`, `organicMatter`, `nitrogen`, `erosionRisk`, `income`, `waterUse`).
* **Teammate E (Story & QA)**:
  * Add custom dialogue strings to `AMMA_DIALOGS` in `src/data/mockData.ts`.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run production build
npm run build
```
