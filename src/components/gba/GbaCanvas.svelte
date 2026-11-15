<script lang="ts">
  import { onMount } from 'svelte';
  import type { PlayerState, InteractiveEntity } from './types';
  import type { FarmMeters } from '../../types/game';
  import { WORLD_WIDTH, WORLD_HEIGHT, COLLISION_OBSTACLES, INTERACTIVE_ENTITIES } from './mapData';

  interface Props {
    player: PlayerState;
    activeEntity: InteractiveEntity | null;
    weatherCondition: 'normal' | 'rain' | 'dry' | 'harvest';
    soilMoisture: number;
    meters?: FarmMeters;
    onInteract: (entity: InteractiveEntity) => void;
  }

  let { player, activeEntity, weatherCondition, soilMoisture, meters, onInteract }: Props = $props();

  let canvasEl: HTMLCanvasElement | null = $state(null);
  let animId: number;

  // Viewport dimensions (4:3 retro aspect ratio)
  const VIEWPORT_WIDTH = 640;
  const VIEWPORT_HEIGHT = 480;

  // Derive health hearts based on farm state (1 to 5 hearts)
  const heartCount = $derived(
    meters 
      ? Math.max(1, Math.min(5, Math.ceil((meters.soilMoisture + meters.organicMatter) / 36)))
      : 4
  );

  onMount(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick++;

      // Compute camera offset to center on player
      let camX = player.x - VIEWPORT_WIDTH / 2;
      let camY = player.y - VIEWPORT_HEIGHT / 2;

      // Clamp camera within world bounds
      camX = Math.max(0, Math.min(WORLD_WIDTH - VIEWPORT_WIDTH, camX));
      camY = Math.max(0, Math.min(WORLD_HEIGHT - VIEWPORT_HEIGHT, camY));

      ctx.save();
      // 1. Draw Zelda/GBA Grass Canvas Background
      ctx.fillStyle = '#64B860'; // Lush GBA Zelda Green
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Translate camera for overworld map
      ctx.save();
      ctx.translate(-camX, -camY);

      // 2. Draw Pixel Ground, Dappled Grass & Winding Dirt Paths
      drawZeldaTerrain(ctx, tick);

      // 3. Draw Stepped Brown Cliff Strata & Water Canal (Image 2 style)
      drawZeldaCliffsAndWater(ctx, tick);

      // 4. Draw Wooden Fences with Round Posts (Image 1 style)
      drawZeldaFences(ctx);

      // 5. Draw Crop Terrace Plots
      drawZeldaCrops(ctx, tick);

      // 6. Draw Zelda Clustered Trees & Thatched House (Image 1 & 3 style)
      drawZeldaScenery(ctx, tick);

      // 7. Draw NPCs (Amma & Dr. Rao in GBA sprite style)
      drawZeldaNpcs(ctx, tick);

      // 8. Draw Player Hari (Zelda/Pokemon Adventurer Sprite)
      drawHariSprite(ctx, tick);

      // 9. Draw Floating Action Bubble Prompt
      if (activeEntity) {
        drawZeldaActionPrompt(ctx, activeEntity, tick);
      }

      // 10. Weather Effects (Monsoon rain or summer heat dust)
      if (weatherCondition === 'rain') {
        drawRainOverlay(ctx, tick);
      }

      ctx.restore(); // End camera transform

      // 11. Draw The Authentic Zelda / FireRed HUD (Fixed on screen top!)
      drawZeldaHud(ctx, tick);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  });

  // 1. Grass & Winding Dirt Paths (Zelda style)
  function drawZeldaTerrain(ctx: CanvasRenderingContext2D, tick: number) {
    // Grass texture dapples
    ctx.fillStyle = '#56A852';
    for (let x = 0; x < WORLD_WIDTH; x += 32) {
      for (let y = 0; y < WORLD_HEIGHT; y += 32) {
        if ((x + y) % 64 === 0) {
          ctx.fillRect(x + 4, y + 4, 6, 4);
          ctx.fillRect(x + 18, y + 20, 6, 4);
        }
      }
    }

    // Patches of tiny 4-petal white flowers (just like Image 1)
    const flowerPatches = [
      { x: 380, y: 140 }, { x: 540, y: 160 }, { x: 420, y: 260 },
      { x: 740, y: 320 }, { x: 140, y: 220 }, { x: 620, y: 560 }
    ];
    for (const fp of flowerPatches) {
      drawFlowerCluster(ctx, fp.x, fp.y);
    }

    // Winding Sandy Dirt Path (Image 1 style)
    ctx.fillStyle = '#D8BA84'; // Sandy beige
    ctx.strokeStyle = '#B89660'; // Darker sandy edge
    ctx.lineWidth = 3;

    // Main winding path from house to fields
    ctx.beginPath();
    // House to central crossroads
    ctx.roundRect(420, 210, 75, 270, 16);
    // Crossroads to tubewell
    ctx.roundRect(470, 365, 360, 50, 14);
    // Crossroads to seed shed
    ctx.roundRect(170, 180, 270, 48, 14);
    // Crossroads to Banyan tree
    ctx.roundRect(430, 160, 65, 60, 10);
    ctx.fill();
    ctx.stroke();

    // Dappled path stones
    ctx.fillStyle = '#C4A36B';
    const stones = [
      { x: 440, y: 240 }, { x: 470, y: 300 }, { x: 520, y: 380 },
      { x: 620, y: 390 }, { x: 720, y: 380 }, { x: 260, y: 200 }
    ];
    for (const s of stones) {
      ctx.fillRect(s.x, s.y, 10, 6);
    }
  }

  function drawFlowerCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.fillStyle = '#FFFFFF';
    const offsets = [
      { dx: 0, dy: 0 }, { dx: 10, dy: -4 }, { dx: -8, dy: 6 },
      { dx: 14, dy: 8 }, { dx: 4, dy: 14 }
    ];
    for (const o of offsets) {
      const fx = cx + o.dx;
      const fy = cy + o.dy;
      // 4 petals
      ctx.fillRect(fx - 2, fy - 1, 5, 3);
      ctx.fillRect(fx - 1, fy - 2, 3, 5);
      // Yellow center
      ctx.fillStyle = '#FFDD44';
      ctx.fillRect(fx, fy, 1, 1);
      ctx.fillStyle = '#FFFFFF';
    }
  }

  // 2. Brown Stepped Cliff Strata & Flowing Water Canal (Image 2 style)
  function drawZeldaCliffsAndWater(ctx: CanvasRenderingContext2D, tick: number) {
    const canalY = 465;

    // Top Cliff Edge (stepped brown rock face dropping into canal)
    ctx.fillStyle = '#8B5A2B'; // Rich cliff rock brown
    ctx.strokeStyle = '#3A1F0D'; // Dark ink rock shadow
    ctx.lineWidth = 3;

    // West Cliff bank
    drawCliffEdge(ctx, 24, canalY - 14, 416, 16);
    // East Cliff bank
    drawCliffEdge(ctx, 520, canalY - 14, 416, 16);

    // Deep Water Canal (Zelda deep blue)
    ctx.fillStyle = '#2B60DE';
    ctx.fillRect(24, canalY, 416, 32);
    ctx.fillRect(520, canalY, 416, 32);

    // Animated foaming wave crest along shoreline (Image 2 style)
    const waveOffset = Math.sin(tick * 0.08) * 3;
    ctx.strokeStyle = '#B8E0FF';
    ctx.lineWidth = 2.5;

    // West shoreline waves
    ctx.beginPath();
    for (let wx = 30; wx < 430; wx += 24) {
      ctx.moveTo(wx, canalY + 4);
      ctx.quadraticCurveTo(wx + 6, canalY + 1 + waveOffset, wx + 12, canalY + 4);
    }
    ctx.stroke();

    // East shoreline waves
    ctx.beginPath();
    for (let wx = 530; wx < 930; wx += 24) {
      ctx.moveTo(wx, canalY + 4);
      ctx.quadraticCurveTo(wx + 6, canalY + 1 - waveOffset, wx + 12, canalY + 4);
    }
    ctx.stroke();

    // Stepping poles/stones in water (just like Image 2 bottom-left!)
    const steppingStones = [
      { x: 80, y: canalY + 16 }, { x: 110, y: canalY + 14 }, { x: 140, y: canalY + 18 },
      { x: 780, y: canalY + 16 }, { x: 810, y: canalY + 14 }, { x: 840, y: canalY + 18 }
    ];
    for (const ss of steppingStones) {
      ctx.fillStyle = '#6E4823'; // brown post
      ctx.strokeStyle = '#1E1005';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Highlight on top cap
      ctx.fillStyle = '#B48858';
      ctx.beginPath();
      ctx.arc(ss.x - 1, ss.y - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wooden Log Bridge across Canal (Image 2 style)
    const bx = 440;
    const by = canalY - 14;
    const bw = 80;
    const bh = 54;

    // Bridge shadow
    ctx.fillStyle = 'rgba(20, 10, 5, 0.4)';
    ctx.fillRect(bx, by + bh, bw, 6);

    // Bridge side railings
    ctx.fillStyle = '#5A3818';
    ctx.fillRect(bx - 4, by, 6, bh);
    ctx.fillRect(bx + bw - 2, by, 6, bh);

    // Individual horizontal timber logs
    for (let ly = by + 2; ly < by + bh - 4; ly += 10) {
      ctx.fillStyle = '#9C6E3D';
      ctx.fillRect(bx + 2, ly, bw - 4, 8);
      ctx.strokeStyle = '#3A1F0D';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx + 2, ly, bw - 4, 8);
      // Log grain highlight
      ctx.fillStyle = '#C29862';
      ctx.fillRect(bx + 4, ly + 2, bw - 8, 2);
    }
  }

  function drawCliffEdge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    // Rounded scalloped ledge shadows (Image 2 style)
    ctx.fillStyle = '#5A3818';
    for (let cx = x; cx < x + w - 16; cx += 20) {
      ctx.beginPath();
      ctx.arc(cx + 10, y + h, 8, Math.PI, 0);
      ctx.fill();
    }
  }

  // 3. Wooden Log Fences with Round Cylinder Posts (Image 1 style)
  function drawZeldaFences(ctx: CanvasRenderingContext2D) {
    const fences = [
      // Fence segment near North field
      { x: 140, y: 250, count: 5 },
      { x: 310, y: 250, count: 4 },
      // Fence segment south of crossroads
      { x: 340, y: 440, count: 4 },
      { x: 530, y: 440, count: 4 }
    ];

    for (const f of fences) {
      // Horizontal rails
      ctx.fillStyle = '#C49864';
      ctx.strokeStyle = '#2B1B12';
      ctx.lineWidth = 2;
      ctx.fillRect(f.x, f.y + 4, f.count * 20, 5);
      ctx.strokeRect(f.x, f.y + 4, f.count * 20, 5);
      ctx.fillRect(f.x, f.y + 12, f.count * 20, 5);
      ctx.strokeRect(f.x, f.y + 12, f.count * 20, 5);

      // Round Vertical Posts
      for (let i = 0; i <= f.count; i++) {
        const px = f.x + i * 20;
        ctx.fillStyle = '#A07038';
        ctx.fillRect(px - 4, f.y, 8, 20);
        ctx.strokeRect(px - 4, f.y, 8, 20);
        // Round cylinder top cap (Image 1 style)
        ctx.fillStyle = '#D6AA76';
        ctx.beginPath();
        ctx.ellipse(px, f.y, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // 4. Crop Terrace Plots (Paddy & Millets)
  function drawZeldaCrops(ctx: CanvasRenderingContext2D, tick: number) {
    // North Plot: Terraced furrow soil
    ctx.fillStyle = soilMoisture < 35 ? '#B88448' : '#723B18';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(140, 270, 240, 150, 10);
    ctx.fill();
    ctx.stroke();

    // Crop furrows
    const sway = Math.sin(tick * 0.07) * 2;
    for (let r = 0; r < 5; r++) {
      const y = 295 + r * 26;
      ctx.strokeStyle = '#3A1F0D';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(150, y);
      ctx.lineTo(370, y);
      ctx.stroke();

      for (let c = 0; c < 8; c++) {
        const x = 165 + c * 26;
        // Sprouted crop sprite
        ctx.fillStyle = soilMoisture < 35 ? '#FFB703' : '#3FA34D';
        ctx.strokeStyle = '#1B3B18';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x + sway, y - 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // South Legumes Plot
    ctx.fillStyle = '#643212';
    ctx.beginPath();
    ctx.roundRect(180, 520, 260, 150, 10);
    ctx.fill();
    ctx.stroke();

    for (let r = 0; r < 5; r++) {
      const y = 545 + r * 26;
      for (let c = 0; c < 9; c++) {
        const x = 200 + c * 26;
        ctx.fillStyle = '#3FA34D';
        ctx.fillRect(x - 3, y - 5, 6, 6);
      }
    }
  }

  // 5. Clustered Zelda Trees & Buildings (Image 1 & 3 style)
  function drawZeldaScenery(ctx: CanvasRenderingContext2D, tick: number) {
    // 1. Amma's Thatched Red-Tiled House (Zelda / FireRed style)
    const hx = 600;
    const hy = 80;

    // Building Shadow
    ctx.fillStyle = 'rgba(20, 15, 10, 0.35)';
    ctx.fillRect(hx - 10, hy + 130, 280, 15);

    // Whitewashed stone walls
    ctx.fillStyle = '#FFF8E6';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3.5;
    ctx.fillRect(hx, hy + 40, 260, 100);
    ctx.strokeRect(hx, hy + 40, 260, 100);

    // Red GBA Tiled Roof (Image 1 & 3 style)
    ctx.fillStyle = '#CC3B2B'; // Red tile
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy + 42);
    ctx.lineTo(hx + 130, hy - 15);
    ctx.lineTo(hx + 272, hy + 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Roof tile horizontal ridges
    ctx.strokeStyle = '#8E1F12';
    ctx.lineWidth = 2;
    for (let ry = hy + 30; ry > hy; ry -= 10) {
      const factor = (ry - hy) / 40;
      const leftX = (hx - 10) + (1 - factor) * 120;
      const rightX = (hx + 270) - (1 - factor) * 120;
      ctx.beginPath();
      ctx.moveTo(leftX, ry);
      ctx.lineTo(rightX, ry);
      ctx.stroke();
    }

    // Doorway with decorative skull/lanterns
    ctx.fillStyle = '#5A2E12';
    ctx.fillRect(hx + 112, hy + 85, 36, 55);
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(hx + 112, hy + 85, 36, 55);

    // Glass Windows with blue reflection
    ctx.fillStyle = '#7EC8E3';
    ctx.fillRect(hx + 30, hy + 65, 36, 32);
    ctx.strokeRect(hx + 30, hy + 65, 36, 32);
    ctx.fillRect(hx + 194, hy + 65, 36, 32);
    ctx.strokeRect(hx + 194, hy + 65, 36, 32);

    // Veranda Porch steps
    ctx.fillStyle = '#D8AA64';
    ctx.fillRect(hx + 90, hy + 140, 80, 20);
    ctx.strokeRect(hx + 90, hy + 140, 80, 20);

    // 2. Zelda Clustered Trees (Image 1 style with layered concentric circles)
    const treeClusters = [
      { x: 50, y: 80, scale: 1.1 },
      { x: 340, y: 80, scale: 0.95 },
      { x: 480, y: 70, scale: 1.25 }, // Sacred Banyan tree
      { x: 80, y: 560, scale: 1.0 },
      { x: 880, y: 220, scale: 1.05 }
    ];

    for (const tc of treeClusters) {
      drawZeldaTree(ctx, tc.x, tc.y, tc.scale);
    }

    // 3. Ancestral Tubewell Pump (x: 820, y: 380)
    ctx.fillStyle = '#70889B';
    ctx.fillRect(820, 380, 60, 50);
    ctx.strokeRect(820, 380, 60, 50);
    // Rotating pump wheel
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

    // 4. Village Weather Post (x: 80, y: 370)
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

    // 5. Seed Storage Shed (x: 100, y: 90)
    ctx.fillStyle = '#D6AA76';
    ctx.fillRect(100, 110, 140, 75);
    ctx.strokeRect(100, 110, 140, 75);
    ctx.fillStyle = '#8B5A2B';
    ctx.beginPath();
    ctx.moveTo(85, 110); ctx.lineTo(170, 65); ctx.lineTo(255, 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Draw authentic Zelda-style tree (Image 1 style with multi-toned overlapping domes)
  function drawZeldaTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Trunk
    ctx.fillStyle = '#5A3818';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2.5;
    ctx.fillRect(-10, 15, 20, 25);
    ctx.strokeRect(-10, 15, 20, 25);

    // Tree Shadow
    ctx.fillStyle = 'rgba(20, 15, 10, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 36, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer Dark Green Layer
    ctx.fillStyle = '#2E7D32';
    ctx.strokeStyle = '#1B471C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-16, -4, 26, 0, Math.PI * 2);
    ctx.arc(16, -4, 26, 0, Math.PI * 2);
    ctx.arc(0, -26, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Middle Emerald Green Layer
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(-14, -8, 20, 0, Math.PI * 2);
    ctx.arc(14, -8, 20, 0, Math.PI * 2);
    ctx.arc(0, -28, 24, 0, Math.PI * 2);
    ctx.fill();

    // Top Light Highlight Bubble (Image 1 style rim light)
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.arc(-8, -14, 12, 0, Math.PI * 2);
    ctx.arc(8, -14, 12, 0, Math.PI * 2);
    ctx.arc(0, -34, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 6. Zelda/Pokemon Style NPCs (Amma & Dr. Rao)
  function drawZeldaNpcs(ctx: CanvasRenderingContext2D, tick: number) {
    // Amma sitting on the Veranda (x: 710, y: 220)
    const ammaBob = Math.sin(tick * 0.05) * 1.5;

    // Shadow
    ctx.fillStyle = 'rgba(20, 15, 10, 0.3)';
    ctx.beginPath();
    ctx.ellipse(725, 244 + ammaBob, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sari (Dusk Purple)
    ctx.fillStyle = '#7B4FA3';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(725, 232 + ammaBob, 14, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Face & Silver hair bun
    ctx.fillStyle = '#D29A72';
    ctx.beginPath();
    ctx.arc(725, 214 + ammaBob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#C8C4BE';
    ctx.beginPath();
    ctx.arc(733, 208 + ammaBob, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bindi
    ctx.fillStyle = '#E63946';
    ctx.fillRect(724, 212 + ammaBob, 2, 2);

    // Dr. Rao (District Extension Agronomist) near Banyan Tree (x: 440, y: 130)
    ctx.fillStyle = '#C2A676'; // Khaki
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;
    ctx.fillRect(435, 145, 18, 22);
    ctx.strokeRect(435, 145, 18, 22);
    ctx.fillStyle = '#C8926B';
    ctx.beginPath();
    ctx.arc(444, 136, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Khaki Hat
    ctx.fillStyle = '#8C6C38';
    ctx.fillRect(431, 128, 26, 5);
  }

  // 7. Hari - Zelda/Pokemon Adventurer Sprite (Walk animations & Shield/Tunic)
  function drawHariSprite(ctx: CanvasRenderingContext2D, tick: number) {
    const px = player.x;
    const py = player.y;
    const frame = player.frame;

    ctx.save();
    ctx.translate(px, py);

    // Shadow
    ctx.fillStyle = 'rgba(20, 15, 10, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = player.isMoving ? (frame === 1 ? -4 : frame === 2 ? 4 : 0) : 0;

    // Boots (Dark brown Zelda boots)
    ctx.fillStyle = '#4A2A0C';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 1.8;

    if (player.direction === 'down' || player.direction === 'up') {
      ctx.fillRect(-6, 4, 5, 8 + legOffset);
      ctx.strokeRect(-6, 4, 5, 8 + legOffset);
      ctx.fillRect(1, 4, 5, 8 - legOffset);
      ctx.strokeRect(1, 4, 5, 8 - legOffset);
    } else {
      ctx.fillRect(-4, 4, 8, 8 + (player.isMoving ? Math.abs(legOffset) : 0));
      ctx.strokeRect(-4, 4, 8, 8 + (player.isMoving ? Math.abs(legOffset) : 0));
    }

    // Tunic (Paddy Green Zelda/Farmer tunic)
    ctx.fillStyle = '#3FA34D';
    ctx.fillRect(-9, -10, 18, 16);
    ctx.strokeRect(-9, -10, 18, 16);
    // Brown Belt & Gold Buckle
    ctx.fillStyle = '#5A3818';
    ctx.fillRect(-9, 1, 18, 3);
    ctx.fillStyle = '#FFB703';
    ctx.fillRect(-2, 1, 4, 3);

    // Head
    ctx.fillStyle = '#D29A72';
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cap / Hair (Zelda Green Cap or Farmer Bandana)
    ctx.fillStyle = '#2E7D32';
    ctx.strokeStyle = '#1B471C';
    ctx.lineWidth = 1.5;

    if (player.direction === 'down') {
      ctx.fillRect(-8, -26, 16, 7);
      ctx.strokeRect(-8, -26, 16, 7);
      // Face eyes
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(-4, -18, 2, 3);
      ctx.fillRect(2, -18, 2, 3);
    } else if (player.direction === 'up') {
      ctx.beginPath();
      ctx.arc(0, -20, 9.5, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      // Cap tail hanging down
      ctx.fillRect(-3, -16, 6, 8);
    } else if (player.direction === 'left') {
      ctx.fillRect(-8, -26, 14, 7);
      ctx.strokeRect(-8, -26, 14, 7);
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(-5, -18, 2, 3);
    } else {
      ctx.fillRect(-6, -26, 14, 7);
      ctx.strokeRect(-6, -26, 14, 7);
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(3, -18, 2, 3);
    }

    // Shield on Hari's hand (Image 2 style crest shield!)
    ctx.fillStyle = '#C83B2B'; // Red shield with border
    ctx.strokeStyle = '#FFD700'; // Gold rim
    ctx.lineWidth = 1.5;
    if (player.direction === 'down' || player.direction === 'left') {
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.lineTo(-6, -4);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-9, 10);
      ctx.lineTo(-12, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (player.direction === 'right') {
      ctx.beginPath();
      ctx.moveTo(6, -4);
      ctx.lineTo(12, -4);
      ctx.lineTo(12, 6);
      ctx.lineTo(9, 10);
      ctx.lineTo(6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // 8. Floating Action Prompt
  function drawZeldaActionPrompt(ctx: CanvasRenderingContext2D, entity: InteractiveEntity, tick: number) {
    const floatY = Math.sin(tick * 0.1) * 3;
    const px = player.x;
    const py = player.y - 44 + floatY;

    ctx.save();
    ctx.translate(px, py);

    ctx.fillStyle = '#FFB703';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-75, -14, 150, 26, 6);
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-5, 12); ctx.lineTo(0, 18); ctx.lineTo(5, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2B1B12';
    ctx.font = 'bold 11px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`[A/SPACE] ${entity.name.split(' ')[0]}`, 0, 0);

    ctx.restore();
  }

  // 9. Authentic Zelda: A Link to the Past & FireRed Top HUD! (Images 1 & 2)
  function drawZeldaHud(ctx: CanvasRenderingContext2D, tick: number) {
    ctx.save();

    // Top subtle dark gradient banner behind HUD for high contrast
    const grad = ctx.createLinearGradient(0, 0, 0, 48);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, 48);

    // 1. Left: Vertical Water/Magic Capsule (Images 1 & 2)
    const capX = 18;
    const capY = 8;
    const capW = 16;
    const capH = 34;

    // Capsule black interior & white rounded border
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(capX, capY, capW, capH, 8);
    ctx.fill();
    ctx.stroke();

    // Liquid fill level (Root-zone wetness)
    const waterRatio = Math.max(0.1, Math.min(1.0, soilMoisture / 100));
    const fillH = (capH - 4) * waterRatio;
    ctx.fillStyle = soilMoisture < 35 ? '#FFB703' : '#2F6FED'; // Monsoon blue or warning turmeric
    ctx.fillRect(capX + 2, capY + capH - 2 - fillH, capW - 4, fillH);

    // "1/2" or "MAX" label above capsule
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(soilMoisture > 75 ? 'MAX' : '1/2', capX + 8, capY - 2);

    // 2. Middle Counters: Emerald Rupee / Coins, Water, Seeds (Image 2 style)
    // Emerald Rupee Gem icon (Green diamond)
    const gemX = 64;
    ctx.fillStyle = '#3FA34D';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gemX, 18);
    ctx.lineTo(gemX + 5, 23);
    ctx.lineTo(gemX, 28);
    ctx.lineTo(gemX - 5, 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Coin count in retro white pixel font
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${meters?.income ?? 180}`, gemX + 8, 25);

    // Water Drop icon
    const dropX = 140;
    ctx.fillStyle = '#2F6FED';
    ctx.beginPath();
    ctx.arc(dropX, 23, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${soilMoisture}%`, dropX + 7, 25);

    // 3. Right: "-LIFE-" Red Hearts Containers (Images 1 & 2 style)
    const lifeX = 400;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('-LIFE-', lifeX, 15);

    // Draw 5 Red Heart Containers
    for (let h = 0; h < 5; h++) {
      const hx = lifeX + h * 15;
      const hy = 24;
      const isFull = h < heartCount;

      ctx.fillStyle = isFull ? '#E63946' : '#5A2A2A'; // Red or empty dark red
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;

      // Pixel Heart Path
      ctx.beginPath();
      ctx.moveTo(hx + 6, hy + 2);
      ctx.bezierCurveTo(hx + 6, hy, hx + 3, hy, hx + 3, hy + 2);
      ctx.bezierCurveTo(hx + 3, hy + 4, hx + 6, hy + 7, hx + 6, hy + 9);
      ctx.bezierCurveTo(hx + 6, hy + 7, hx + 9, hy + 4, hx + 9, hy + 2);
      ctx.bezierCurveTo(hx + 9, hy, hx + 6, hy, hx + 6, hy + 2);
      ctx.fill();
      ctx.stroke();
    }

    // 4. Far Right: Equipped Item Box (Image 1 & 2 style golden box)
    const itemBoxX = VIEWPORT_WIDTH - 48;
    const itemBoxY = 8;
    const itemBoxSize = 34;

    ctx.fillStyle = '#000000';
    ctx.fillRect(itemBoxX, itemBoxY, itemBoxSize, itemBoxSize);
    // Double gold border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(itemBoxX, itemBoxY, itemBoxSize, itemBoxSize);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(itemBoxX + 2, itemBoxY + 2, itemBoxSize - 4, itemBoxSize - 4);

    // Active tool icon inside box (Satellite Telemetry or Seed Bag)
    ctx.fillStyle = '#2F6FED';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛰️', itemBoxX + itemBoxSize / 2, itemBoxY + itemBoxSize / 2);

    ctx.restore();
  }

  // Weather Rain Overlay
  function drawRainOverlay(ctx: CanvasRenderingContext2D, tick: number) {
    ctx.strokeStyle = 'rgba(180, 220, 255, 0.7)';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 45; i++) {
      const rx = (i * 29 + tick * 8) % WORLD_WIDTH;
      const ry = (i * 37 + tick * 18) % WORLD_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 12);
      ctx.stroke();
    }
  }
</script>

<div class="gba-canvas-wrap">
  <canvas 
    bind:this={canvasEl} 
    width={VIEWPORT_WIDTH} 
    height={VIEWPORT_HEIGHT}
    class="gba-viewport-canvas"
  ></canvas>
</div>

<style>
  .gba-canvas-wrap {
    width: 100%;
    aspect-ratio: 4 / 3;
    max-height: 520px;
    background-color: #000000;
    border: 4px solid var(--ink);
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
    box-shadow: 0 7px 0 var(--ink);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .gba-viewport-canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }
</style>
