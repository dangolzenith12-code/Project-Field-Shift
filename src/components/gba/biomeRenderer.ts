import type { FloatingBox } from './types';
import { WORLD_WIDTH, WORLD_HEIGHT } from './mapData';

export interface BiomePalette {
  id: string;
  name: string;
  groundBase: string;
  groundDapple1: string;
  groundDapple2: string;
  pathBase: string;
  pathBorder: string;
  pathStones: string;
  cliffRock: string;
  cliffDark: string;
  cliffHighlight: string;
  waterDeep: string;
  waterMid: string;
  waterFoam: string;
  ambientTint: string;
  ambientVignette: string;
  particleType: 'pollen' | 'chaff' | 'dust' | 'sand';
  particleColor: string;
}

export const BIOME_PALETTES: Record<string, BiomePalette> = {
  punjab: {
    id: 'punjab',
    name: 'Punjab Plain',
    groundBase: '#4E9848',
    groundDapple1: '#3D8238',
    groundDapple2: '#5DB356',
    pathBase: '#D8BA84',
    pathBorder: '#B89660',
    pathStones: '#C4A36B',
    cliffRock: '#7C5028',
    cliffDark: '#3A1F0D',
    cliffHighlight: '#A8723C',
    waterDeep: '#1E6CB0',
    waterMid: '#2B8BD8',
    waterFoam: '#B8E8FF',
    ambientTint: 'rgba(255, 235, 180, 0.05)',
    ambientVignette: 'rgba(10, 30, 15, 0.4)',
    particleType: 'pollen',
    particleColor: 'rgba(255, 245, 180, 0.85)'
  },
  iowa: {
    id: 'iowa',
    name: 'Corn Belt',
    groundBase: '#2C3A27',
    groundDapple1: '#202D1D',
    groundDapple2: '#384C34',
    pathBase: '#C5BFB6',
    pathBorder: '#9E9790',
    pathStones: '#86807A',
    cliffRock: '#6E6C66',
    cliffDark: '#282725',
    cliffHighlight: '#96948D',
    waterDeep: '#1D3B45',
    waterMid: '#2A5563',
    waterFoam: '#A8D2DC',
    ambientTint: 'rgba(200, 225, 255, 0.06)',
    ambientVignette: 'rgba(15, 20, 25, 0.45)',
    particleType: 'chaff',
    particleColor: 'rgba(240, 200, 100, 0.8)'
  },
  karnataka: {
    id: 'karnataka',
    name: 'Deccan Plateau',
    groundBase: '#9E3E2B',
    groundDapple1: '#843120',
    groundDapple2: '#B84E38',
    pathBase: '#D68448',
    pathBorder: '#B06330',
    pathStones: '#A05526',
    cliffRock: '#823724',
    cliffDark: '#3D150B',
    cliffHighlight: '#B0533C',
    waterDeep: '#1F5557',
    waterMid: '#2B7578',
    waterFoam: '#98DFE2',
    ambientTint: 'rgba(255, 180, 110, 0.08)',
    ambientVignette: 'rgba(35, 15, 10, 0.45)',
    particleType: 'dust',
    particleColor: 'rgba(235, 140, 95, 0.8)'
  },
  sahel: {
    id: 'sahel',
    name: 'Sahel Fringe',
    groundBase: '#C69746',
    groundDapple1: '#B08235',
    groundDapple2: '#DBAD58',
    pathBase: '#E8D5A4',
    pathBorder: '#C8B07A',
    pathStones: '#BAA068',
    cliffRock: '#9E642A',
    cliffDark: '#4A2A0C',
    cliffHighlight: '#C48440',
    waterDeep: '#286C6E',
    waterMid: '#388F91',
    waterFoam: '#B2EAEB',
    ambientTint: 'rgba(255, 215, 130, 0.12)',
    ambientVignette: 'rgba(35, 25, 10, 0.4)',
    particleType: 'sand',
    particleColor: 'rgba(245, 210, 140, 0.85)'
  }
};

export interface BiomeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rot: number;
  vRot: number;
}

export function initBiomeParticles(count = 50): BiomeParticle[] {
  const particles: BiomeParticle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      vx: (Math.random() - 0.3) * 0.8,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2.5 + 1.2,
      alpha: Math.random() * 0.6 + 0.3,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.05
    });
  }
  return particles;
}

export function updateBiomeParticles(particles: BiomeParticle[], regionId: string) {
  const windX = regionId === 'sahel' ? 1.6 : regionId === 'iowa' ? 1.2 : 0.6;
  for (const p of particles) {
    p.x += p.vx + windX;
    p.y += p.vy;
    p.rot += p.vRot;

    if (p.x > WORLD_WIDTH + 20) p.x = -20;
    if (p.x < -20) p.x = WORLD_WIDTH + 20;
    if (p.y > WORLD_HEIGHT + 20) p.y = -20;
    if (p.y < -20) p.y = WORLD_HEIGHT + 20;
  }
}

// 1. Draw Biome-Themed Ground & Winding Road
export function drawRegionalTerrain(ctx: CanvasRenderingContext2D, regionId: string, tick: number) {
  const pal = BIOME_PALETTES[regionId] || BIOME_PALETTES.punjab;

  // Base ground
  ctx.fillStyle = pal.groundBase;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // Ground dapples and texture
  ctx.fillStyle = pal.groundDapple1;
  for (let x = 0; x < WORLD_WIDTH; x += 32) {
    for (let y = 0; y < WORLD_HEIGHT; y += 32) {
      if ((x + y) % 64 === 0) {
        ctx.fillRect(x + 4, y + 4, 6, 4);
        ctx.fillRect(x + 18, y + 20, 6, 4);
      }
    }
  }

  ctx.fillStyle = pal.groundDapple2;
  for (let x = 16; x < WORLD_WIDTH; x += 48) {
    for (let y = 16; y < WORLD_HEIGHT; y += 48) {
      ctx.fillRect(x + 6, y + 2, 4, 3);
      ctx.fillRect(x + 22, y + 14, 5, 3);
    }
  }

  // Region-specific vegetation & micro-details
  if (regionId === 'punjab') {
    // White chamomile flower patches
    const flowerPatches = [
      { x: 380, y: 140 }, { x: 540, y: 160 }, { x: 420, y: 260 },
      { x: 740, y: 320 }, { x: 140, y: 220 }, { x: 620, y: 560 }
    ];
    for (const fp of flowerPatches) {
      drawDaisyCluster(ctx, fp.x, fp.y);
    }
  } else if (regionId === 'iowa') {
    // Prairie golden coneflowers
    const flowerPatches = [
      { x: 390, y: 130 }, { x: 530, y: 170 }, { x: 440, y: 270 },
      { x: 760, y: 310 }, { x: 150, y: 210 }, { x: 640, y: 550 }
    ];
    for (const fp of flowerPatches) {
      drawSunflowerCluster(ctx, fp.x, fp.y);
    }
  } else if (regionId === 'karnataka') {
    // Dry thorny shrubs & granite pebbles
    ctx.fillStyle = '#6E2A1C';
    for (let i = 0; i < 20; i++) {
      const px = (i * 47) % (WORLD_WIDTH - 60) + 30;
      const py = (i * 39) % (WORLD_HEIGHT - 60) + 30;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (regionId === 'sahel') {
    // Wind-blown sand ripples across dunes
    ctx.strokeStyle = 'rgba(255, 230, 160, 0.35)';
    ctx.lineWidth = 1.8;
    for (let y = 50; y < WORLD_HEIGHT; y += 45) {
      ctx.beginPath();
      for (let x = 30; x < WORLD_WIDTH; x += 30) {
        const offset = Math.sin((x + tick * 0.5) * 0.05) * 3;
        ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }
  }

  // Winding Road
  ctx.fillStyle = pal.pathBase;
  ctx.strokeStyle = pal.pathBorder;
  ctx.lineWidth = 3;

  ctx.beginPath();
  // House to central crossroads
  ctx.roundRect(420, 210, 75, 270, 16);
  // Crossroads to tubewell
  ctx.roundRect(470, 365, 360, 50, 14);
  // Crossroads to seed shed
  ctx.roundRect(170, 180, 270, 48, 14);
  // Crossroads to Banyan / landmark tree
  ctx.roundRect(430, 160, 65, 60, 10);
  ctx.fill();
  ctx.stroke();

  // Dappled path stones
  ctx.fillStyle = pal.pathStones;
  const stones = [
    { x: 440, y: 240 }, { x: 470, y: 300 }, { x: 520, y: 380 },
    { x: 620, y: 390 }, { x: 720, y: 380 }, { x: 260, y: 200 }
  ];
  for (const s of stones) {
    ctx.fillRect(s.x, s.y, 10, 6);
  }
}

function drawDaisyCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#FFFFFF';
  const offsets = [
    { dx: 0, dy: 0 }, { dx: 10, dy: -4 }, { dx: -8, dy: 6 },
    { dx: 14, dy: 8 }, { dx: 4, dy: 14 }
  ];
  for (const o of offsets) {
    const fx = cx + o.dx;
    const fy = cy + o.dy;
    ctx.fillRect(fx - 2, fy - 1, 5, 3);
    ctx.fillRect(fx - 1, fy - 2, 3, 5);
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(fx, fy, 1, 1);
    ctx.fillStyle = '#FFFFFF';
  }
}

function drawSunflowerCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const offsets = [
    { dx: 0, dy: 0 }, { dx: 12, dy: -5 }, { dx: -10, dy: 8 }
  ];
  for (const o of offsets) {
    const fx = cx + o.dx;
    const fy = cy + o.dy;
    ctx.fillStyle = '#FFB703';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5A3818';
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 2. Draw Biome-Themed Cliffs and Waterway
export function drawRegionalCliffsAndWater(ctx: CanvasRenderingContext2D, regionId: string, tick: number) {
  const pal = BIOME_PALETTES[regionId] || BIOME_PALETTES.punjab;
  const canalY = 465;

  // Cliff Rock Banks
  ctx.fillStyle = pal.cliffRock;
  ctx.strokeStyle = pal.cliffDark;
  ctx.lineWidth = 3;

  drawCliffEdge(ctx, 24, canalY - 14, 416, 16, pal.cliffDark);
  drawCliffEdge(ctx, 520, canalY - 14, 416, 16, pal.cliffDark);

  // Waterway
  ctx.fillStyle = pal.waterDeep;
  ctx.fillRect(24, canalY, 416, 32);
  ctx.fillRect(520, canalY, 416, 32);

  // Animated wavelets
  const waveOffset = Math.sin(tick * 0.08) * 3;
  ctx.strokeStyle = pal.waterFoam;
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  for (let wx = 30; wx < 430; wx += 24) {
    ctx.moveTo(wx, canalY + 4);
    ctx.quadraticCurveTo(wx + 6, canalY + 1 + waveOffset, wx + 12, canalY + 4);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let wx = 530; wx < 930; wx += 24) {
    ctx.moveTo(wx, canalY + 4);
    ctx.quadraticCurveTo(wx + 6, canalY + 1 - waveOffset, wx + 12, canalY + 4);
  }
  ctx.stroke();

  // Stepping posts or water features
  const steppingStones = [
    { x: 80, y: canalY + 16 }, { x: 110, y: canalY + 14 }, { x: 140, y: canalY + 18 },
    { x: 780, y: canalY + 16 }, { x: 810, y: canalY + 14 }, { x: 840, y: canalY + 18 }
  ];
  for (const ss of steppingStones) {
    ctx.fillStyle = pal.cliffDark;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pal.cliffHighlight;
    ctx.beginPath();
    ctx.arc(ss.x - 1, ss.y - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wooden / Stone Log Bridge across Canal
  const bx = 440;
  const by = canalY - 14;
  const bw = 80;
  const bh = 54;

  ctx.fillStyle = 'rgba(20, 10, 5, 0.45)';
  ctx.fillRect(bx, by + bh, bw, 6);

  ctx.fillStyle = pal.cliffDark;
  ctx.fillRect(bx - 4, by, 6, bh);
  ctx.fillRect(bx + bw - 2, by, 6, bh);

  for (let ly = by + 2; ly < by + bh - 4; ly += 10) {
    ctx.fillStyle = pal.pathBorder;
    ctx.fillRect(bx + 2, ly, bw - 4, 8);
    ctx.strokeStyle = pal.cliffDark;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 2, ly, bw - 4, 8);
    ctx.fillStyle = pal.pathBase;
    ctx.fillRect(bx + 4, ly + 2, bw - 8, 2);
  }
}

function drawCliffEdge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, darkColor: string) {
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = darkColor;
  for (let cx = x; cx < x + w - 16; cx += 20) {
    ctx.beginPath();
    ctx.arc(cx + 10, y + h, 8, Math.PI, 0);
    ctx.fill();
  }
}

// 3. Draw Biome-Themed Fences
export function drawRegionalFences(ctx: CanvasRenderingContext2D, regionId: string) {
  const pal = BIOME_PALETTES[regionId] || BIOME_PALETTES.punjab;
  const fences = [
    { x: 140, y: 250, count: 5 },
    { x: 310, y: 250, count: 4 },
    { x: 340, y: 440, count: 4 },
    { x: 530, y: 440, count: 4 }
  ];

  for (const f of fences) {
    // Horizontal rails
    ctx.fillStyle = pal.pathBorder;
    ctx.strokeStyle = pal.cliffDark;
    ctx.lineWidth = 2;
    ctx.fillRect(f.x, f.y + 4, f.count * 20, 5);
    ctx.strokeRect(f.x, f.y + 4, f.count * 20, 5);
    ctx.fillRect(f.x, f.y + 12, f.count * 20, 5);
    ctx.strokeRect(f.x, f.y + 12, f.count * 20, 5);

    // Posts
    for (let i = 0; i <= f.count; i++) {
      const px = f.x + i * 20;
      ctx.fillStyle = pal.cliffRock;
      ctx.fillRect(px - 4, f.y, 8, 20);
      ctx.strokeRect(px - 4, f.y, 8, 20);
      ctx.fillStyle = pal.pathBase;
      ctx.beginPath();
      ctx.ellipse(px, f.y, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

// 4. Draw Biome-Themed Crops
export function drawRegionalCrops(
  ctx: CanvasRenderingContext2D, 
  regionId: string, 
  soilMoisture: number, 
  tick: number
) {
  const sway = Math.sin(tick * 0.07) * 2;

  // North Plot: Terraced Plot
  let plotSoil = soilMoisture < 35 ? '#B88448' : '#723B18';
  if (regionId === 'iowa') plotSoil = '#2E2218';
  if (regionId === 'karnataka') plotSoil = '#8A321E';
  if (regionId === 'sahel') plotSoil = '#B08035';

  ctx.fillStyle = plotSoil;
  ctx.strokeStyle = '#2B1B12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(140, 270, 240, 150, 10);
  ctx.fill();
  ctx.stroke();

  // Draw North crop rows based on region
  for (let r = 0; r < 5; r++) {
    const y = 295 + r * 26;
    ctx.strokeStyle = '#1E120A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(150, y);
    ctx.lineTo(370, y);
    ctx.stroke();

    for (let c = 0; c < 8; c++) {
      const x = 165 + c * 26;
      if (regionId === 'punjab') {
        // Rice Paddy Shoot
        ctx.fillStyle = soilMoisture < 35 ? '#FFB703' : '#3FA34D';
        ctx.strokeStyle = '#1B3B18';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x + sway, y - 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (regionId === 'iowa') {
        // Tall Corn Stalk with yellow silk
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x - 2, y - 10, 4, 10);
        ctx.fillStyle = '#FFD166';
        ctx.beginPath();
        ctx.arc(x + sway * 0.8, y - 11, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (regionId === 'karnataka') {
        // Finger Millet (Ragi) dark purple-brown head
        ctx.fillStyle = '#4C7A34';
        ctx.fillRect(x - 2, y - 8, 4, 8);
        ctx.fillStyle = '#8C4836';
        ctx.beginPath();
        ctx.arc(x + sway, y - 9, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sahel Pearl Millet
        ctx.fillStyle = '#A38B4A';
        ctx.fillRect(x - 2, y - 12, 4, 12);
        ctx.fillStyle = '#D4A359';
        ctx.beginPath();
        ctx.ellipse(x + sway, y - 13, 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // South Plot: Legumes / Pulses / Secondary
  let southPlotSoil = '#643212';
  if (regionId === 'iowa') southPlotSoil = '#231B13';
  if (regionId === 'karnataka') southPlotSoil = '#752917';
  if (regionId === 'sahel') southPlotSoil = '#9C702E';

  ctx.fillStyle = southPlotSoil;
  ctx.beginPath();
  ctx.roundRect(180, 520, 260, 150, 10);
  ctx.fill();
  ctx.stroke();

  for (let r = 0; r < 5; r++) {
    const y = 545 + r * 26;
    for (let c = 0; c < 9; c++) {
      const x = 200 + c * 26;
      ctx.fillStyle = regionId === 'karnataka' ? '#E9C46A' : '#3FA34D';
      ctx.fillRect(x - 3, y - 5, 6, 6);
    }
  }
}

// 5. Draw Biome-Themed Scenery (Buildings, Trees, Silos)
export function drawRegionalScenery(ctx: CanvasRenderingContext2D, regionId: string, tick: number) {
  const hx = 600;
  const hy = 80;

  // Farmhouse Building Shadow
  ctx.fillStyle = 'rgba(20, 15, 10, 0.35)';
  ctx.fillRect(hx - 10, hy + 130, 280, 15);

  if (regionId === 'iowa') {
    // --- IOWA RED BARN & GRAIN SILO ---
    // Barn walls (Deep Barn Red)
    ctx.fillStyle = '#9E2A2B';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3.5;
    ctx.fillRect(hx, hy + 30, 220, 110);
    ctx.strokeRect(hx, hy + 30, 220, 110);

    // Barn Gambrel Roof
    ctx.fillStyle = '#C0C8D0';
    ctx.beginPath();
    ctx.moveTo(hx - 10, hy + 32);
    ctx.lineTo(hx + 30, hy - 10);
    ctx.lineTo(hx + 110, hy - 25);
    ctx.lineTo(hx + 190, hy - 10);
    ctx.lineTo(hx + 230, hy + 32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White sliding door with X-brace
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(hx + 85, hy + 75, 50, 65);
    ctx.strokeStyle = '#9E2A2B';
    ctx.lineWidth = 3;
    ctx.strokeRect(hx + 85, hy + 75, 50, 65);
    ctx.beginPath();
    ctx.moveTo(hx + 85, hy + 75); ctx.lineTo(hx + 135, hy + 140);
    ctx.moveTo(hx + 135, hy + 75); ctx.lineTo(hx + 85, hy + 140);
    ctx.stroke();

    // Silver Grain Silo next to barn
    const sx = hx + 225;
    ctx.fillStyle = '#D6DEE6';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3;
    ctx.fillRect(sx, hy - 15, 45, 155);
    ctx.strokeRect(sx, hy - 15, 45, 155);
    // Silo dome
    ctx.beginPath();
    ctx.arc(sx + 22.5, hy - 15, 22.5, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    // Silo horizontal corrugated bands
    ctx.strokeStyle = '#8A9BA8';
    ctx.lineWidth = 1.5;
    for (let sy = hy - 5; sy < hy + 140; sy += 18) {
      ctx.beginPath();
      ctx.moveTo(sx, sy); ctx.lineTo(sx + 45, sy);
      ctx.stroke();
    }
  } else if (regionId === 'sahel') {
    // --- SAHEL BANCO/ADOBE DWELLING ---
    ctx.fillStyle = '#B8824C';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3.5;
    ctx.fillRect(hx, hy + 35, 250, 105);
    ctx.strokeRect(hx, hy + 35, 250, 105);

    // Flat roof with parapet horns
    ctx.fillStyle = '#A6703B';
    ctx.fillRect(hx - 5, hy + 25, 260, 15);
    ctx.strokeRect(hx - 5, hy + 25, 260, 15);
    // Horns / Toron sticks
    ctx.fillStyle = '#4A2A0C';
    for (let tx = hx + 15; tx < hx + 245; tx += 28) {
      ctx.fillRect(tx, hy + 32, 6, 8);
    }
    // Arched wooden doorway
    ctx.fillStyle = '#3A1F0D';
    ctx.beginPath();
    ctx.roundRect(hx + 105, hy + 80, 40, 60, [14, 14, 0, 0]);
    ctx.fill();
    ctx.stroke();
  } else if (regionId === 'karnataka') {
    // --- KARNATAKA / DECCAN HOMESTEAD ---
    ctx.fillStyle = '#ECE5D8';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3.5;
    ctx.fillRect(hx, hy + 40, 260, 100);
    ctx.strokeRect(hx, hy + 40, 260, 100);

    // Terracotta roof
    ctx.fillStyle = '#BA4832';
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy + 42);
    ctx.lineTo(hx + 130, hy - 15);
    ctx.lineTo(hx + 272, hy + 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Carved wooden veranda pillars
    ctx.fillStyle = '#5A3818';
    ctx.fillRect(hx + 90, hy + 100, 8, 40);
    ctx.fillRect(hx + 160, hy + 100, 8, 40);
  } else {
    // --- PUNJAB HOMESTEAD ---
    ctx.fillStyle = '#FFF8E6';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3.5;
    ctx.fillRect(hx, hy + 40, 260, 100);
    ctx.strokeRect(hx, hy + 40, 260, 100);

    // Red GBA Tiled Roof
    ctx.fillStyle = '#CC3B2B';
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy + 42);
    ctx.lineTo(hx + 130, hy - 15);
    ctx.lineTo(hx + 272, hy + 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windows
    ctx.fillStyle = '#7EC8E3';
    ctx.fillRect(hx + 30, hy + 65, 36, 32);
    ctx.strokeRect(hx + 30, hy + 65, 36, 32);
    ctx.fillRect(hx + 194, hy + 65, 36, 32);
    ctx.strokeRect(hx + 194, hy + 65, 36, 32);

    // Doorway
    ctx.fillStyle = '#5A2E12';
    ctx.fillRect(hx + 112, hy + 85, 36, 55);
    ctx.strokeRect(hx + 112, hy + 85, 36, 55);
  }

  // Clustered Trees based on region
  const treeClusters = [
    { x: 50, y: 80, scale: 1.1 },
    { x: 340, y: 80, scale: 0.95 },
    { x: 480, y: 70, scale: 1.25 }, // Center tree
    { x: 80, y: 560, scale: 1.0 },
    { x: 880, y: 220, scale: 1.05 }
  ];

  for (const tc of treeClusters) {
    if (regionId === 'sahel') {
      drawUmbrellaAcacia(ctx, tc.x, tc.y, tc.scale);
    } else if (regionId === 'iowa') {
      drawPineTree(ctx, tc.x, tc.y, tc.scale);
    } else {
      drawBroadTree(ctx, tc.x, tc.y, tc.scale, regionId);
    }
  }

  // Tubewell Pump Machine (x: 820, y: 380)
  ctx.fillStyle = regionId === 'iowa' ? '#4A6274' : '#70889B';
  ctx.fillRect(820, 380, 60, 50);
  ctx.strokeRect(820, 380, 60, 50);

  // Rotating flywheel
  ctx.save();
  ctx.translate(850, 405);
  ctx.rotate(tick * 0.14);
  ctx.strokeStyle = '#1E2B38';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
  ctx.moveTo(0, -15); ctx.lineTo(0, 15);
  ctx.stroke();
  ctx.restore();

  // Pipe into canal
  ctx.strokeStyle = '#2B1B12';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(820, 410);
  ctx.lineTo(760, 410);
  ctx.lineTo(760, 465);
  ctx.stroke();

  // Weather Post (x: 80, y: 370)
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(96, 350, 12, 60);
  ctx.strokeRect(96, 350, 12, 60);
  ctx.fillStyle = '#FFB703';
  ctx.fillRect(82, 340, 40, 24);
  ctx.strokeRect(82, 340, 40, 24);
  ctx.fillStyle = '#2B1B12';
  ctx.beginPath();
  ctx.arc(102, 330, 8, 0, Math.PI * 2);
  ctx.fill();

  // Seed Shed (x: 100, y: 90)
  ctx.fillStyle = regionId === 'sahel' ? '#B8824C' : '#D6AA76';
  ctx.fillRect(100, 110, 140, 75);
  ctx.strokeRect(100, 110, 140, 75);
  ctx.fillStyle = '#8B5A2B';
  ctx.beginPath();
  ctx.moveTo(85, 110); ctx.lineTo(170, 65); ctx.lineTo(255, 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBroadTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0, regionId = 'punjab') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Trunk
  ctx.fillStyle = '#5A3818';
  ctx.fillRect(-10, 15, 20, 25);
  ctx.strokeRect(-10, 15, 20, 25);

  // Shadow
  ctx.fillStyle = 'rgba(20, 15, 10, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  const c1 = regionId === 'karnataka' ? '#2B6A2D' : '#2E7D32';
  const c2 = regionId === 'karnataka' ? '#3E8C40' : '#4CAF50';
  const c3 = regionId === 'karnataka' ? '#68B36A' : '#81C784';

  ctx.fillStyle = c1;
  ctx.strokeStyle = '#1B471C';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-16, -4, 26, 0, Math.PI * 2);
  ctx.arc(16, -4, 26, 0, Math.PI * 2);
  ctx.arc(0, -26, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = c2;
  ctx.beginPath();
  ctx.arc(-14, -8, 20, 0, Math.PI * 2);
  ctx.arc(14, -8, 20, 0, Math.PI * 2);
  ctx.arc(0, -28, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c3;
  ctx.beginPath();
  ctx.arc(-8, -14, 12, 0, Math.PI * 2);
  ctx.arc(8, -14, 12, 0, Math.PI * 2);
  ctx.arc(0, -34, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPineTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#3E2512';
  ctx.fillRect(-7, 10, 14, 25);

  ctx.fillStyle = 'rgba(20, 15, 10, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 32, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3 Triangular Tiers of Pine
  ctx.fillStyle = '#1B4725';
  ctx.strokeStyle = '#0F2E17';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(0, -50); ctx.lineTo(24, -18); ctx.lineTo(-24, -18); ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -30); ctx.lineTo(30, 0); ctx.lineTo(-30, 0); ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -10); ctx.lineTo(36, 18); ctx.lineTo(-36, 18); ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.restore();
}

function drawUmbrellaAcacia(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#4A2A0C';
  ctx.fillRect(-6, -10, 12, 45);

  ctx.fillStyle = 'rgba(20, 15, 10, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 40, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spreading Umbrella Canopy
  ctx.fillStyle = '#5A7A38';
  ctx.strokeStyle = '#283B18';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, -20, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#789E4E';
  ctx.beginPath();
  ctx.ellipse(0, -24, 38, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 6. Draw 3D Floating Boxes (Sci-Fi / NASA Satellite Telemetry Cubes)
export function drawFloatingBox3D(
  ctx: CanvasRenderingContext2D,
  box: FloatingBox,
  tick: number,
  isNear: boolean,
  activeBox: FloatingBox | null | undefined
) {
  const floatOffset = Math.sin(tick * box.floatSpeed + box.phaseOffset) * box.floatAmplitude;
  const cy = box.y - box.baseElevation + floatOffset;
  const shadowScale = 1 - (floatOffset / (box.floatAmplitude * 3.5));
  const shadowAlpha = Math.max(0.15, Math.min(0.45, 0.35 - (floatOffset / 60)));

  // Ground Drop Shadow
  ctx.save();
  ctx.fillStyle = `rgba(10, 15, 20, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(box.x, box.y + 12, 28 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Anti-Gravity Light Tractor Beam (Subtle vertical cone)
  const beamGrad = ctx.createLinearGradient(box.x, cy + 15, box.x, box.y + 12);
  beamGrad.addColorStop(0, box.glowColor);
  beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(box.x - 12, cy + 15);
  ctx.lineTo(box.x + 12, cy + 15);
  ctx.lineTo(box.x + 24 * shadowScale, box.y + 12);
  ctx.lineTo(box.x - 24 * shadowScale, box.y + 12);
  ctx.closePath();
  ctx.fill();

  // 3D Isometric Cube Facets
  ctx.translate(box.x, cy);

  const size = 18;
  const w = size * 0.866;
  const h = size * 0.5;

  // 1. Top Rhombus Face (Lit by Sky)
  ctx.fillStyle = box.themeColor;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(w, -h);
  ctx.lineTo(0, 0);
  ctx.lineTo(-w, -h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 2. Left Parallelogram Face (Medium Shaded)
  ctx.fillStyle = '#1A2A2F';
  ctx.beginPath();
  ctx.moveTo(-w, -h);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-w, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = box.themeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Right Parallelogram Face (Dark Shaded)
  ctx.fillStyle = '#0E171C';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, -h);
  ctx.lineTo(w, h);
  ctx.lineTo(0, size);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = box.themeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rotating Holographic Orbit Rings
  const ring1 = tick * 0.05 + box.phaseOffset;
  ctx.strokeStyle = box.themeColor;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.5, size * 0.55, ring1, 0, Math.PI * 2);
  ctx.stroke();

  // Orbiting satellite drone dot on ring
  const orbitX = Math.cos(ring1) * size * 1.5;
  const orbitY = Math.sin(ring1) * size * 0.55;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(orbitX, orbitY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Floating Micro-Sparks
  for (let s = 0; s < 3; s++) {
    const spX = Math.sin(tick * 0.1 + s * 2) * 14;
    const spY = -size - 4 - ((tick * 1.2 + s * 10) % 24);
    ctx.fillStyle = box.themeColor;
    ctx.fillRect(spX, spY, 2, 2);
  }

  // Floating Pill Header Label
  ctx.fillStyle = '#08120B';
  ctx.strokeStyle = box.themeColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-42, -size - 22, 84, 16, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = box.themeColor;
  ctx.font = 'bold 8.5px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(box.tag, 0, -size - 14);

  // Proximity Notification Indicator
  if (isNear) {
    // Pulse ring around ground
    ctx.restore();
    ctx.save();
    const pulseR = 24 + (tick % 30);
    ctx.strokeStyle = box.themeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(box.x, box.y + 12, pulseR, pulseR * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Floating Interaction Prompt
    const promptY = cy - 42;
    ctx.fillStyle = '#00FF66';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(box.x - 70, promptY - 12, 140, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('[SPACE/E] OPEN BOX', box.x, promptY);
    ctx.restore();
    return;
  }

  ctx.restore();
}

// 7. Ambient Lighting & Atmospheric Vignette
export function drawRegionalAtmosphere(
  ctx: CanvasRenderingContext2D,
  regionId: string,
  weatherCondition: string,
  tick: number,
  particles: BiomeParticle[]
) {
  const pal = BIOME_PALETTES[regionId] || BIOME_PALETTES.punjab;

  // 1. Ambient Color Tint
  ctx.fillStyle = pal.ambientTint;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // 2. Weather Condition Adjustments
  if (weatherCondition === 'rain') {
    ctx.fillStyle = 'rgba(20, 40, 60, 0.25)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Rain Streaks
    ctx.strokeStyle = 'rgba(180, 220, 255, 0.75)';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 55; i++) {
      const rx = (i * 29 + tick * 9) % WORLD_WIDTH;
      const ry = (i * 37 + tick * 20) % WORLD_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 14);
      ctx.stroke();
    }
  } else if (weatherCondition === 'dry') {
    ctx.fillStyle = 'rgba(255, 140, 0, 0.12)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  // 3. Biome Particles (Pollen, Chaff, Terracotta Dust, Desert Sand)
  ctx.fillStyle = pal.particleColor;
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
