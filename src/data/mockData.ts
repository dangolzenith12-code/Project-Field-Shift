import type { RegionInfo, EraInfo, StrategyOption, CropTrait, SatelliteNote } from '../types/game';

export const REGIONS: Record<string, RegionInfo> = {
  punjab: {
    id: 'punjab',
    name: 'Punjab Plain',
    country: 'North India',
    landscapeDescription: 'Lush alluvial plains facing deep aquifer depletion from continuous paddy-wheat cycles.',
    climateChallenge: 'Groundwater drop: −0.8m/yr. Monsoons arrive later with intense flash bursts.',
    badge: 'Groundwater Stress',
    primaryCrops: ['Basmati Rice', 'Winter Wheat', 'Mung Bean'],
    historicalTrend: 'MERRA-2 shows +1.4°C summer heat anomaly since 1981.',
    soilType: 'Alluvial loam (Clay 18%, Sand 42%, Organic 0.58%)',
    graceGroundwaterTrend: 'GRACE satellite observes −3.2 cm/year equivalent water thickness loss.',
    initialMeters: {
      soilMoisture: 42,
      organicMatter: 34,
      nitrogen: 65,
      erosionRisk: 28,
      income: 180,
      waterUse: 620
    }
  },
  iowa: {
    id: 'iowa',
    name: 'Corn Belt',
    country: 'Iowa, USA',
    landscapeDescription: 'Rolling glacial till prairie soils subject to severe sheet erosion and spring cloudbursts.',
    climateChallenge: 'Extreme spring precipitation surges; peak summer flash droughts.',
    badge: 'Erosion & Cloudbursts',
    primaryCrops: ['Dent Corn', 'Soybean', 'Winter Rye'],
    historicalTrend: 'NASA POWER shows +22% frequency of >50mm daily rain events.',
    soilType: 'Mollisol silty clay loam (Organic Carbon 2.8%, High silt)',
    graceGroundwaterTrend: 'GRACE shows oscillating seasonal recharge but increased tile drainage runoff.',
    initialMeters: {
      soilMoisture: 68,
      organicMatter: 72,
      nitrogen: 80,
      erosionRisk: 64,
      income: 240,
      waterUse: 410
    }
  },
  karnataka: {
    id: 'karnataka',
    name: 'Deccan Plateau',
    country: 'Karnataka, India',
    landscapeDescription: 'Semi-arid red gravel soils farmed for millets and pulses, heavily dependent on erratic rains.',
    climateChallenge: 'Frequent mid-monsoon dry spells spanning 20+ days during vegetative growth.',
    badge: 'Rain-Fed Drylands',
    primaryCrops: ['Finger Millet (Ragi)', 'Pigeon Pea (Tur)', 'Groundnut'],
    historicalTrend: 'NASA POWER shows 32% increase in dry spell duration since 1990.',
    soilType: 'Red sandy clay loam (Shallow root zone, low moisture retention)',
    graceGroundwaterTrend: 'Hard rock borewells show rapid localized drawdown.',
    initialMeters: {
      soilMoisture: 36,
      organicMatter: 42,
      nitrogen: 45,
      erosionRisk: 40,
      income: 140,
      waterUse: 290
    }
  },
  sahel: {
    id: 'sahel',
    name: 'Sahel Fringe',
    country: 'Niger / Senegal',
    landscapeDescription: 'Drying transition belt between the Sahara and savanna with high heat and soil crusting.',
    climateChallenge: 'Extreme surface temperatures exceeding 43°C; shifting isohyets.',
    badge: 'Drought Frontier',
    primaryCrops: ['Pearl Millet', 'Cowpea', 'Sorghum'],
    historicalTrend: 'MODIS NDVI shows shortening green season by 14 days over two decades.',
    soilType: 'Arenosol coarse sand (Rapid drainage, very low organic matter)',
    graceGroundwaterTrend: 'Regional deep fossil aquifer steady, but surface waterholes drying.',
    initialMeters: {
      soilMoisture: 22,
      organicMatter: 20,
      nitrogen: 28,
      erosionRisk: 75,
      income: 95,
      waterUse: 180
    }
  }
};

export const ERAS: EraInfo[] = [
  {
    id: '1990',
    name: 'Era 1: The Inherited Soil',
    year: 1990,
    label: '1990 Baseline',
    description: "Amma passes down the ancestral deeds. Monsoons were predictable, groundwater was within 15 meters, and the old crop calendar held true.",
    climateShiftText: 'Historical baseline: Average temperatures stable, predictable 4-month monsoon.',
    nasaEvidence: 'NASA POWER: T2M Mean 26.2°C, Root-zone wetness GWETROOT 0.65.',
    tempAnomaly: 0.0,
    rainShiftPercent: 0
  },
  {
    id: '2005',
    name: 'Era 2: The Thirsty Tubewells',
    year: 2005,
    label: '2005 Intensification',
    description: "High-yield hybrid varieties took over. Deeper diesel borewells pumped around the clock, but water tables began sinking.",
    climateShiftText: 'Precipitation variability begins creeping up; summer heatwaves intensify.',
    nasaEvidence: 'NASA POWER: T2M Mean +0.5°C, Solar radiation ALLSKY_SFC_SW_DWN +4%.',
    tempAnomaly: 0.5,
    rainShiftPercent: -4
  },
  {
    id: '2026',
    name: 'Era 3: Today’s Crossroads',
    year: 2026,
    label: '2026 Present Day',
    description: "Groundwater alerts trigger across the valley. NASA SMAP satellites show topsoil moisture flash-drying within 4 days after heavy downpours.",
    climateShiftText: 'Frequent erratic cloudbursts alternating with 3-week heat spells.',
    nasaEvidence: 'NASA SMAP L4: Root wetness down 22% compared to 1990. MODIS NDVI anomaly −0.08.',
    tempAnomaly: 1.3,
    rainShiftPercent: -10
  },
  {
    id: '2040',
    name: 'Era 4: What-If Future',
    year: 2040,
    label: '2040 Projection',
    description: "The choices you make today determine whether Amma's field turns to barren cracked clay or a resilient climate-smart oasis.",
    climateShiftText: 'Projected +2.2°C warmer conditions with +18% peak evaporation stress.',
    nasaEvidence: 'NASA NEX-GDDP-CMIP6 downscaled models project increased heat stress days >40°C.',
    tempAnomaly: 2.2,
    rainShiftPercent: -15
  }
];

export const SATELLITE_NOTES: Record<string, SatelliteNote> = {
  POWER_TEMP: {
    dataset: 'POWER',
    title: 'Daily Air Temperature (T2M)',
    sensor: 'NASA MERRA-2 Global Modeling & Assimilation',
    scientificValue: 'Hourly assimilated 0.5° x 0.625° reanalysis data converted to daily maximum, minimum, and mean.',
    farmerExplanation: "Tells us how hot the air gets around your crops, signaling when heat stress wilts flowering grains."
  },
  POWER_RAIN: {
    dataset: 'POWER',
    title: 'Precipitation Corrected (PRECTOTCORR)',
    sensor: 'NASA GMAO / IMERG Blend',
    scientificValue: 'Daily corrected total surface precipitation (mm/day).',
    farmerExplanation: "Measures exactly how much rain soaked into your village this week compared to historical averages."
  },
  SMAP_SOIL: {
    dataset: 'SMAP',
    title: 'Root-Zone Soil Wetness (GWETROOT)',
    sensor: 'Soil Moisture Active Passive L-band Radiometer',
    scientificValue: '0 to 1 dimensionless metric of available water in the top 1 meter of soil profile.',
    farmerExplanation: "Peeks beneath the surface to see if Amma's crop roots are drinking or starving for water."
  },
  MODIS_NDVI: {
    dataset: 'MODIS',
    title: 'Vegetation Greenness Index (NDVI)',
    sensor: 'Terra/Aqua Moderate Resolution Imaging Spectroradiometer',
    scientificValue: 'Surface reflectance ratio (NIR - Red) / (NIR + Red) tracking canopy density at 250m.',
    farmerExplanation: "A satellite health check: bright green means a lush vigorous field; yellow or brown flags crop distress."
  },
  GRACE_WATER: {
    dataset: 'GRACE',
    title: 'Deep Aquifer Gravity Anomaly',
    sensor: 'GRACE / GRACE-FO Twin Satellites',
    scientificValue: 'Measures minute gravitational pulls caused by underground water mass shifting across regions.',
    farmerExplanation: "Weighs the hidden groundwater from orbit—revealing how much deep water has been drained by tubewells."
  }
};

export const CROPS_CATALOG: CropTrait[] = [
  { id: 'rice', name: 'Basmati Rice', icon: '◆', waterNeed: 'High', nFixing: false, rootDepth: 'Shallow', coverValue: 'Low', growingSeasonDays: 120, revenuePotential: 95 },
  { id: 'wheat', name: 'Winter Wheat', icon: '▲', waterNeed: 'Medium', nFixing: false, rootDepth: 'Medium', coverValue: 'Medium', growingSeasonDays: 135, revenuePotential: 75 },
  { id: 'millet', name: 'Finger Millet (Ragi)', icon: '●', waterNeed: 'Low', nFixing: false, rootDepth: 'Deep', coverValue: 'High', growingSeasonDays: 105, revenuePotential: 60 },
  { id: 'chickpea', name: 'Chickpea / Gram', icon: '✦', waterNeed: 'Low', nFixing: true, rootDepth: 'Deep', coverValue: 'High', growingSeasonDays: 95, revenuePotential: 70 },
  { id: 'mung', name: 'Mung Green Bean', icon: '■', waterNeed: 'Low', nFixing: true, rootDepth: 'Medium', coverValue: 'High', growingSeasonDays: 65, revenuePotential: 55 },
  { id: 'corn', name: 'Field Corn', icon: '▼', waterNeed: 'High', nFixing: false, rootDepth: 'Medium', coverValue: 'Low', growingSeasonDays: 110, revenuePotential: 90 },
  { id: 'soy', name: 'Soybean', icon: '◈', waterNeed: 'Medium', nFixing: true, rootDepth: 'Medium', coverValue: 'Medium', growingSeasonDays: 100, revenuePotential: 80 },
  { id: 'cover_clover', name: 'Crimson Clover', icon: '❖', waterNeed: 'Low', nFixing: true, rootDepth: 'Shallow', coverValue: 'High', growingSeasonDays: 50, revenuePotential: 20 },
  { id: 'mustard', name: 'Yellow Mustard', icon: '✹', waterNeed: 'Medium', nFixing: false, rootDepth: 'Deep', coverValue: 'Medium', growingSeasonDays: 85, revenuePotential: 65 }
];

export const STRATEGIES: StrategyOption[] = [
  {
    id: 'strategy_existing',
    title: 'Traditional Rotation',
    subtitle: 'Current Practice (Paddy-Wheat Cycle)',
    cropRotation: ['Basmati Rice (Kharif)', 'Winter Wheat (Rabi)', 'Summer Bare Fallow'],
    whySuggested: 'Maximizes familiar market cash flow with existing equipment, but relies heavily on pumping deep aquifers.',
    benefits: [
      'High historical cash certainty in local government mandis (markets)',
      'Familiar agronomy requiring no new seed varieties or machinery'
    ],
    risks: [
      'High vulnerability to summer tubewell failure if water table drops',
      'Bare fallow during May exposes topsoil to intense wind erosion'
    ],
    dataGaps: [
      'Local tubewell recharge rate not captured in satellite surface grids'
    ],
    needsLocalExpert: true,
    nasaEvidenceChips: [SATELLITE_NOTES.GRACE_WATER, SATELLITE_NOTES.SMAP_SOIL],
    monteCarlo: {
      p10: 38,
      median: 54,
      p90: 71,
      distribution: [36, 40, 42, 45, 48, 51, 53, 54, 55, 57, 59, 62, 66, 70, 72]
    },
    metrics: {
      waterStressDelta: 15,
      incomeReturn: 12,
      soilCarbonDelta: -10,
      laborReqDelta: 0
    }
  },
  {
    id: 'strategy_resilience',
    title: 'Climate-Smart Resilience',
    subtitle: 'Recommended Rotation (Millet-Legume-Mustard)',
    cropRotation: ['Pearl Millet / Ragi', 'Chickpea (N-Fixing)', 'Mustard / Cover Crop'],
    whySuggested: 'Cuts water withdrawal by 42% while building soil nitrogen and carbon. Withstands dry spells observed in NASA POWER data.',
    benefits: [
      'Legumes fix atmospheric nitrogen, slashing synthetic fertilizer bills by ~35%',
      'Continuous soil cover prevents erosion during intense NASA-tracked cloudbursts',
      'Thrives even when root-zone moisture drops into the lower 25th percentile'
    ],
    risks: [
      'Requires developing connections to organic/millet aggregation hubs',
      'Slightly lower peak single-season cash return compared to rice'
    ],
    dataGaps: [
      'Micro-climate soil microbiology requires field-level soil testing'
    ],
    needsLocalExpert: false,
    nasaEvidenceChips: [SATELLITE_NOTES.SMAP_SOIL, SATELLITE_NOTES.POWER_RAIN, SATELLITE_NOTES.MODIS_NDVI],
    monteCarlo: {
      p10: 64,
      median: 78,
      p90: 89,
      distribution: [62, 65, 68, 71, 74, 76, 78, 79, 81, 83, 85, 87, 88, 90]
    },
    metrics: {
      waterStressDelta: -42,
      incomeReturn: 8,
      soilCarbonDelta: 35,
      laborReqDelta: -5
    }
  },
  {
    id: 'strategy_income',
    title: 'High-Value Commercial Shift',
    subtitle: 'Income Maximizer (Direct-Seeded Rice + Mung + Mustard)',
    cropRotation: ['Short-Duration DSR Rice', 'Summer Mung Bean', 'Mustard Seed'],
    whySuggested: 'Leverages short-duration varieties to fit three cash harvests a year while using direct seeding to curb water waste.',
    benefits: [
      'Highest gross revenue potential across three distinct market windows',
      'Mung bean adds valuable protein crop and leaves residual bio-matter'
    ],
    risks: [
      'Tighter planting turnaround windows; sensitive to sudden heat spikes at pod-fill',
      'Substantially higher labor and active field management needed'
    ],
    dataGaps: [
      'Pest and disease vector shifts under high humidity not modeled in NASA POWER'
    ],
    needsLocalExpert: true,
    nasaEvidenceChips: [SATELLITE_NOTES.POWER_TEMP, SATELLITE_NOTES.MODIS_NDVI],
    monteCarlo: {
      p10: 44,
      median: 72,
      p90: 92,
      distribution: [42, 46, 52, 59, 66, 70, 72, 75, 78, 83, 87, 91, 93]
    },
    metrics: {
      waterStressDelta: -18,
      incomeReturn: 32,
      soilCarbonDelta: 12,
      laborReqDelta: 25
    }
  }
];

export const AMMA_DIALOGS = {
  intro: "Welcome, child. For three generations, our hands have known every clod of this soil. But the skies are changing faster than the almanacs. Let me show you what the clouds and satellites whisper to those who listen.",
  drought_warning: "The dirt is turning to pale dust, child. The deep well coughs air. If we don't bring in deep-rooted pulses or ground-covering mulch, next month's heat will scorch the roots.",
  monsoon_arrival: "Smell that sweet dampness! The monsoon is here. But notice how hard it strikes now? We need our field terraced and covered so the black topsoil doesn't wash into the ditch.",
  harvest_joy: "Listen to the grain whisper in the breeze! A full harvest jar and the soil still breathes dark and moist underneath. That is true wealth.",
  expert_stamp: "Remember: satellites look from the stars, but your boots stand in the mud. Always talk to the local elders and extension officers before sowing a new seed across your whole five acres."
};
