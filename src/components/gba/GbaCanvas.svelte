<script lang="ts">
  import { onMount } from 'svelte';
  import type { PlayerState, InteractiveEntity, EquippedTool, TimeOfDay, Particle } from './types';
  import type { FarmMeters } from '../../types/game';
  import { WORLD_WIDTH, WORLD_HEIGHT, COLLISION_OBSTACLES, INTERACTIVE_ENTITIES } from './mapData';

  interface Props {
    player: PlayerState;
    activeEntity: InteractiveEntity | null;
    weatherCondition: 'normal' | 'rain' | 'dry' | 'harvest';
    soilMoisture: number;
    meters?: FarmMeters;
    equippedTool?: EquippedTool;
    timeOfDay?: TimeOfDay;
    showMiniMap?: boolean;
    toolActionActive?: { tool: EquippedTool; tick: number; x: number; y: number } | null;
    regionId?: string;
    onInteract: (entity: InteractiveEntity) => void;
    onCycleTool?: () => void;
    onToggleMiniMap?: () => void;
  }

  let { 
    player, 
    activeEntity, 
    weatherCondition, 
    soilMoisture, 
    meters, 
    equippedTool = 'seeds',
    timeOfDay = 'noon',
    showMiniMap = true,
    toolActionActive = null,
    regionId = 'punjab',
    onInteract,
    onCycleTool,
    onToggleMiniMap
  }: Props = $props();

  let canvasEl: HTMLCanvasElement | null = $state(null);
  let animId: number;

  // Viewport dimensions (4:3 retro aspect ratio)
  const VIEWPORT_WIDTH = 640;
  const VIEWPORT_HEIGHT = 480;

  // Particle systems (footstep dust, tool effects, water foam)
  let particles: Particle[] = [];

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

      // 3. Draw Stepped Brown Cliff Strata & Water Canal with Animated Jet & Foam
      drawZeldaCliffsAndWater(ctx, tick);

      // 4. Draw Wooden Fences with Round Posts
      drawZeldaFences(ctx);

      // 5. Draw Crop Terrace Plots (North & South)
      drawZeldaCrops(ctx, tick);

      // 6. Draw Zelda Scenery (Amma's House, Chimney Smoke, Shed, Banyan Tree, Weather Post, Tubewell)
      drawZeldaScenery(ctx, tick);

      // 7. Draw Living Farm Animals (Ganga the Sahiwal Bullock)
      drawGangaBullock(ctx, tick);

      // 8. Draw NPCs (Amma & Dr. Rao in GBA sprite style)
      drawZeldaNpcs(ctx, tick);

      // 9. Update & Draw Ambient Dragonflies
      drawDragonflies(ctx, tick);

      // 10. Update & Draw Dynamic In-World Particles (Footsteps, Seeds, Water)
      updateAndDrawParticles(ctx, tick);

      // 11. Draw Player Hari (Zelda/Pokemon Adventurer Sprite)
      drawHariSprite(ctx, tick);

      // 12. Draw Tool Action Visual Effects (Waves, seed scatter, rain splash)
      if (toolActionActive && tick - toolActionActive.tick < 35) {
        drawToolActionEffect(ctx, toolActionActive, tick);
      }

      // 13. Draw Floating Action Bubble Prompt
      if (activeEntity) {
        drawZeldaActionPrompt(ctx, activeEntity, tick);
      }

      // 14. Weather Effects (Monsoon rain, summer heat haze, or golden harvest chaff)
      if (weatherCondition === 'rain') {
        drawRainOverlay(ctx, tick);
      } else if (weatherCondition === 'dry') {
        drawDryHeatHaze(ctx, tick);
      } else if (weatherCondition === 'harvest') {
        drawHarvestChaff(ctx, tick);
      } else {
        drawAmbientPetals(ctx, tick);
      }

      // 15. Night Lantern Glows (rendered in world space if night)
      if (timeOfDay === 'night') {
        drawLanternGlows(ctx, tick);
      }

      ctx.restore(); // End camera transform

      // 16. Screen-Space Atmospheric Diurnal Lighting Filter (Dawn, Sunset, Night)
      drawTimeOfDayLighting(ctx, timeOfDay);

      // 17. Draw The Authentic Zelda / FireRed HUD (Fixed on screen top!)
      drawZeldaHud(ctx, tick);

      // 18. Mini-Map Radar (Fixed on bottom-left)
      if (showMiniMap) {
        drawMiniMap(ctx, camX, camY);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  });

  // Handle canvas click to swap tools or toggle mini-map
  function handleCanvasClick(e: MouseEvent) {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = VIEWPORT_WIDTH / rect.width;
    const scaleY = VIEWPORT_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check click on item box (top right)
    if (clickX >= VIEWPORT_WIDTH - 55 && clickX <= VIEWPORT_WIDTH - 10 && clickY >= 6 && clickY <= 48) {
      onCycleTool?.();
      return;
    }

    // Check click on mini-map (bottom left)
    if (clickX >= 12 && clickX <= 90 && clickY >= VIEWPORT_HEIGHT - 74 && clickY <= VIEWPORT_HEIGHT - 10) {
      onToggleMiniMap?.();
      return;
    }
  }

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

    // Patches of tiny 4-petal white flowers
    const flowerPatches = [
      { x: 380, y: 140 }, { x: 540, y: 160 }, { x: 420, y: 260 },
      { x: 740, y: 320 }, { x: 140, y: 220 }, { x: 620, y: 560 }
    ];
    for (const fp of flowerPatches) {
      drawFlowerCluster(ctx, fp.x, fp.y);
    }

    // Winding Dirt Path (Sandy in Punjab, Terracotta Red Soil in Karnataka)
    const isKarnataka = regionId === 'karnataka';
    ctx.fillStyle = isKarnataka ? '#B86B42' : '#D8BA84';
    ctx.strokeStyle = isKarnataka ? '#8A4222' : '#B89660';
    ctx.lineWidth = 3;

    // Main winding path from house to fields
    ctx.beginPath();
    ctx.roundRect(420, 210, 75, 270, 16);
    ctx.roundRect(470, 365, 360, 50, 14);
    ctx.roundRect(170, 180, 270, 48, 14);
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
      ctx.fillRect(fx - 2, fy - 1, 5, 3);
      ctx.fillRect(fx - 1, fy - 2, 3, 5);
      ctx.fillStyle = '#FFDD44';
      ctx.fillRect(fx, fy, 1, 1);
      ctx.fillStyle = '#FFFFFF';
    }
  }

  // 2. Brown Stepped Cliff Strata & Flowing Water Canal
  function drawZeldaCliffsAndWater(ctx: CanvasRenderingContext2D, tick: number) {
    const canalY = 465;

    // Top Cliff Edge
    ctx.fillStyle = '#8B5A2B';
    ctx.strokeStyle = '#3A1F0D';
    ctx.lineWidth = 3;

    drawCliffEdge(ctx, 24, canalY - 14, 416, 16);
    drawCliffEdge(ctx, 520, canalY - 14, 416, 16);

    // Deep Water Canal
    ctx.fillStyle = '#2B60DE';
    ctx.fillRect(24, canalY, 416, 32);
    ctx.fillRect(520, canalY, 416, 32);

    // Animated foaming wave crest along shoreline
    const waveOffset = Math.sin(tick * 0.08) * 3;
    ctx.strokeStyle = '#B8E0FF';
    ctx.lineWidth = 2.5;

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

    // Tubewell Gushing Water Waterfall into canal
    drawTubewellWaterStream(ctx, tick);

    // Stepping stones in water
    const steppingStones = [
      { x: 80, y: canalY + 16 }, { x: 110, y: canalY + 14 }, { x: 140, y: canalY + 18 },
      { x: 780, y: canalY + 16 }, { x: 810, y: canalY + 14 }, { x: 840, y: canalY + 18 }
    ];
    for (const ss of steppingStones) {
      ctx.fillStyle = '#6E4823';
      ctx.strokeStyle = '#1E1005';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#B48858';
      ctx.beginPath();
      ctx.arc(ss.x - 1, ss.y - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wooden Log Bridge across Canal
    const bx = 440;
    const by = canalY - 14;
    const bw = 80;
    const bh = 54;

    ctx.fillStyle = 'rgba(20, 10, 5, 0.4)';
    ctx.fillRect(bx, by + bh, bw, 6);

    ctx.fillStyle = '#5A3818';
    ctx.fillRect(bx - 4, by, 6, bh);
    ctx.fillRect(bx + bw - 2, by, 6, bh);

    for (let ly = by + 2; ly < by + bh - 4; ly += 10) {
      ctx.fillStyle = '#9C6E3D';
      ctx.fillRect(bx + 2, ly, bw - 4, 8);
      ctx.strokeStyle = '#3A1F0D';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx + 2, ly, bw - 4, 8);
      ctx.fillStyle = '#C29862';
      ctx.fillRect(bx + 4, ly + 2, bw - 8, 2);
    }
  }

  function drawTubewellWaterStream(ctx: CanvasRenderingContext2D, tick: number) {
    const px = 760;
    const py = 465;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const jetFlow = Math.sin(tick * 0.3) * 2;
    ctx.fillRect(px - 4, py - 4, 8, 12);

    for (let i = 0; i < 3; i++) {
      const ringPhase = (tick * 0.15 + i * 1.2) % 3;
      const r = 4 + ringPhase * 8;
      const a = Math.max(0, 1 - ringPhase / 3);
      ctx.strokeStyle = `rgba(180, 220, 255, ${a})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(px + jetFlow, py + 12, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let b = 0; b < 6; b++) {
      const bAge = (tick * 1.5 + b * 24) % 140;
      const bx = px - bAge * 1.2;
      const by = py + 10 + Math.sin(bAge * 0.2) * 4;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCliffEdge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#5A3818';
    for (let cx = x; cx < x + w - 16; cx += 20) {
      ctx.beginPath();
      ctx.arc(cx + 10, y + h, 8, Math.PI, 0);
      ctx.fill();
    }
  }

  // 3. Wooden Log Fences with Round Cylinder Posts
  function drawZeldaFences(ctx: CanvasRenderingContext2D) {
    const fences = [
      { x: 140, y: 250, count: 5 },
      { x: 310, y: 250, count: 4 },
      { x: 340, y: 440, count: 4 },
      { x: 530, y: 440, count: 4 }
    ];

    for (const f of fences) {
      ctx.fillStyle = '#C49864';
      ctx.strokeStyle = '#2B1B12';
      ctx.lineWidth = 2;
      ctx.fillRect(f.x, f.y + 4, f.count * 20, 5);
      ctx.strokeRect(f.x, f.y + 4, f.count * 20, 5);
      ctx.fillRect(f.x, f.y + 12, f.count * 20, 5);
      ctx.strokeRect(f.x, f.y + 12, f.count * 20, 5);

      for (let i = 0; i <= f.count; i++) {
        const px = f.x + i * 20;
        ctx.fillStyle = '#A07038';
        ctx.fillRect(px - 4, f.y, 8, 20);
        ctx.strokeRect(px - 4, f.y, 8, 20);
        ctx.fillStyle = '#D6AA76';
        ctx.beginPath();
        ctx.ellipse(px, f.y, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // 4. Crop Terrace Plots (North & South)
  function drawZeldaCrops(ctx: CanvasRenderingContext2D, tick: number) {
    const isKarnataka = regionId === 'karnataka';
    // North Plot: Terraced furrow soil (Red Deccan Loam vs Alluvial Loam)
    ctx.fillStyle = isKarnataka
      ? (soilMoisture < 35 ? '#B85838' : '#8A321E')
      : (soilMoisture < 35 ? '#B88448' : '#723B18');
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(140, 270, 240, 150, 10);
    ctx.fill();
    ctx.stroke();

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
        ctx.fillStyle = soilMoisture < 35 ? '#FFB703' : '#3FA34D';
        ctx.strokeStyle = '#1B3B18';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x + sway, y - 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // South Legumes Plot (Millets in Karnataka, Legumes/Wheat in Punjab)
    ctx.fillStyle = isKarnataka
      ? (soilMoisture < 35 ? '#C26344' : '#943822')
      : '#643212';
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

    // Red GBA Tiled Roof
    ctx.fillStyle = '#CC3B2B';
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy + 42);
    ctx.lineTo(hx + 130, hy - 15);
    ctx.lineTo(hx + 272, hy + 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Roof tile ridges
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

    // Doorway
    ctx.fillStyle = '#5A2E12';
    ctx.fillRect(hx + 112, hy + 85, 36, 55);
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(hx + 112, hy + 85, 36, 55);

    // Glass Windows
    ctx.fillStyle = '#7EC8E3';
    ctx.fillRect(hx + 30, hy + 65, 36, 32);
    ctx.strokeRect(hx + 30, hy + 65, 36, 32);
    ctx.fillRect(hx + 194, hy + 65, 36, 32);
    ctx.strokeRect(hx + 194, hy + 65, 36, 32);

    // Veranda Porch steps
    ctx.fillStyle = '#D8AA64';
    ctx.fillRect(hx + 90, hy + 140, 80, 20);
    ctx.strokeRect(hx + 90, hy + 140, 80, 20);

    // Farmhouse Chimney & Animated Smoke Puffs
    drawChimneySmoke(ctx, tick);

    // Zelda Clustered Trees
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

    // Ancestral Tubewell Pump
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

    // Village Weather Post
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

    // Seed Storage Shed
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

  // Draw Chimney Smoke
  function drawChimneySmoke(ctx: CanvasRenderingContext2D, tick: number) {
    const cx = 640;
    const cy = 60;
    for (let i = 0; i < 5; i++) {
      const puffAge = (tick * 0.4 + i * 22) % 110;
      const progress = puffAge / 110;
      const py = cy - progress * 45;
      const px = cx + Math.sin(progress * 4 + i) * 12 + progress * 8;
      const radius = 4 + progress * 10;
      const alpha = (1 - progress) * 0.35;

      ctx.fillStyle = `rgba(230, 230, 230, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw authentic Zelda-style tree
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

    // Top Light Highlight Bubble
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.arc(-8, -14, 12, 0, Math.PI * 2);
    ctx.arc(8, -14, 12, 0, Math.PI * 2);
    ctx.arc(0, -34, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 6. Ganga the Sahiwal Bullock Sprite
  function drawGangaBullock(ctx: CanvasRenderingContext2D, tick: number) {
    const bx = 270;
    const by = 110;
    const breathe = Math.sin(tick * 0.06) * 1.2;
    const tailSwish = Math.sin(tick * 0.12) * 4;

    ctx.save();
    ctx.translate(bx, by);

    // Ground shadow
    ctx.fillStyle = 'rgba(20, 15, 10, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Straw / Neem bedding
    ctx.fillStyle = '#D6B468';
    for (let i = -18; i < 18; i += 6) {
      ctx.fillRect(i, 12, 5, 2);
      ctx.fillRect(i + 2, 14, 4, 2);
    }

    // 4 Legs
    ctx.fillStyle = '#9C6E48';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-14, 4, 4, 12);
    ctx.strokeRect(-14, 4, 4, 12);
    ctx.fillRect(-7, 6, 4, 10);
    ctx.strokeRect(-7, 6, 4, 10);
    ctx.fillRect(6, 6, 4, 10);
    ctx.strokeRect(6, 6, 4, 10);
    ctx.fillRect(12, 4, 4, 12);
    ctx.strokeRect(12, 4, 4, 12);

    // Torso / Hump (Zebu hump characteristic of Sahiwal cow)
    ctx.fillStyle = '#D8A47F';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(-16, -8 + breathe, 32, 16, 6);
    ctx.fill();
    ctx.stroke();

    // Zebu Hump
    ctx.beginPath();
    ctx.arc(-4, -10 + breathe, 7, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Neck and Head
    ctx.beginPath();
    ctx.roundRect(10, -14 + breathe, 14, 13, 4);
    ctx.fill();
    ctx.stroke();

    // Ears & Horns
    ctx.fillStyle = '#B4805A';
    ctx.fillRect(12, -18 + breathe, 3, 5);
    ctx.fillRect(19, -18 + breathe, 3, 5);
    ctx.fillStyle = '#D8A47F';
    ctx.fillRect(8, -11 + breathe, 4, 3);

    // Gentle Eye & Muzzle
    ctx.fillStyle = '#2B1B12';
    ctx.fillRect(20, -11 + breathe, 2, 2);
    ctx.fillStyle = '#4A2A1A';
    ctx.fillRect(21, -6 + breathe, 4, 5);

    // Tail with tuft swishing
    ctx.strokeStyle = '#9C6E48';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -2 + breathe);
    ctx.quadraticCurveTo(-22, 6, -22 + tailSwish, 12);
    ctx.stroke();
    ctx.fillStyle = '#2B1B12';
    ctx.fillRect(-23 + tailSwish, 11, 4, 4);

    // Red ribbon / collar with brass bell
    ctx.fillStyle = '#E63946';
    ctx.fillRect(11, -6 + breathe, 3, 8);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(12, 2 + breathe, 2, 2);

    ctx.restore();
  }

  // 7. Ambient Dragonflies
  function drawDragonflies(ctx: CanvasRenderingContext2D, tick: number) {
    const dragonflies = [
      { baseX: 200, baseY: 480, radiusX: 90, radiusY: 35, speed: 0.04, color: '#3A86FF', wingColor: '#C8E0FF' },
      { baseX: 600, baseY: 480, radiusX: 110, radiusY: 40, speed: -0.035, color: '#FFBE0B', wingColor: '#FFF2C6' },
      { baseX: 480, baseY: 420, radiusX: 70, radiusY: 25, speed: 0.05, color: '#06D6A0', wingColor: '#D8F3DC' }
    ];

    for (const df of dragonflies) {
      const angle = tick * df.speed;
      const x = df.baseX + Math.cos(angle) * df.radiusX;
      const y = df.baseY + Math.sin(angle * 2) * df.radiusY;
      const wingFlap = Math.sin(tick * 0.7) * 4;

      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = df.color;
      ctx.fillRect(-1, -4, 2, 8);
      ctx.beginPath();
      ctx.arc(0, -5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = df.wingColor;
      ctx.fillRect(-5, -3 + wingFlap, 4, 1.5);
      ctx.fillRect(1, -3 + wingFlap, 4, 1.5);
      ctx.fillRect(-4, -1 - wingFlap, 3, 1.2);
      ctx.fillRect(1, -1 - wingFlap, 3, 1.2);

      ctx.restore();
    }
  }

  // 8. Dynamic In-World Particles
  function updateAndDrawParticles(ctx: CanvasRenderingContext2D, tick: number) {
    // Spawn footstep dust if player is moving
    if (player.isMoving && tick % 6 === 0) {
      particles.push({
        x: player.x + (Math.random() * 8 - 4),
        y: player.y + 12 + (Math.random() * 4 - 2),
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.4 - Math.random() * 0.5,
        life: 0,
        maxLife: 18,
        color: '#D8BA84',
        size: 2.5
      });
    }

    // Keep particles capped
    if (particles.length > 50) {
      particles.splice(0, particles.length - 50);
    }

    // Update and draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        continue;
      }

      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  // 9. Tool Action Visual Effect
  function drawToolActionEffect(
    ctx: CanvasRenderingContext2D, 
    action: { tool: EquippedTool; tick: number; x: number; y: number }, 
    tick: number
  ) {
    const elapsed = tick - action.tick;
    const progress = elapsed / 35;

    ctx.save();
    ctx.translate(action.x, action.y);

    if (action.tool === 'seeds') {
      // Scattering green seed dots
      for (let s = 0; s < 12; s++) {
        const angle = (s / 12) * Math.PI * 2;
        const dist = progress * 40;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist * 0.7;
        ctx.fillStyle = s % 2 === 0 ? '#3FA34D' : '#FFD700';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5 * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (action.tool === 'water') {
      // Blue splashing droplets
      for (let w = 0; w < 14; w++) {
        const angle = (w / 14) * Math.PI * 2;
        const dist = progress * 35;
        const wx = Math.cos(angle) * dist;
        const wy = Math.sin(angle) * dist * 0.6;
        ctx.fillStyle = 'rgba(74, 144, 226, 0.85)';
        ctx.beginPath();
        ctx.arc(wx, wy, 3 * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (action.tool === 'probe') {
      // SMAP Radar digital scan ring
      const radius = progress * 65;
      ctx.strokeStyle = `rgba(0, 230, 200, ${1 - progress})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * (1 - progress)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 10. Zelda/Pokemon Style NPCs (Amma & Dr. Rao)
  function drawZeldaNpcs(ctx: CanvasRenderingContext2D, tick: number) {
    // Amma sitting on the Veranda
    const ammaBob = Math.sin(tick * 0.05) * 1.5;

    ctx.fillStyle = 'rgba(20, 15, 10, 0.3)';
    ctx.beginPath();
    ctx.ellipse(725, 244 + ammaBob, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7B4FA3';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(725, 232 + ammaBob, 14, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

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
    ctx.fillStyle = '#E63946';
    ctx.fillRect(724, 212 + ammaBob, 2, 2);

    // Dr. Rao near Banyan Tree
    ctx.fillStyle = '#C2A676';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;
    ctx.fillRect(435, 145, 18, 22);
    ctx.strokeRect(435, 145, 18, 22);
    ctx.fillStyle = '#C8926B';
    ctx.beginPath();
    ctx.arc(444, 136, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#8C6C38';
    ctx.fillRect(431, 128, 26, 5);
  }

  // 11. Hari Sprite
  function drawHariSprite(ctx: CanvasRenderingContext2D, tick: number) {
    const px = player.x;
    const py = player.y;
    const frame = player.frame;

    ctx.save();
    ctx.translate(px, py);

    ctx.fillStyle = 'rgba(20, 15, 10, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = player.isMoving ? (frame === 1 ? -4 : frame === 2 ? 4 : 0) : 0;

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

    ctx.fillStyle = '#3FA34D';
    ctx.fillRect(-9, -10, 18, 16);
    ctx.strokeRect(-9, -10, 18, 16);
    ctx.fillStyle = '#5A3818';
    ctx.fillRect(-9, 1, 18, 3);
    ctx.fillStyle = '#FFB703';
    ctx.fillRect(-2, 1, 4, 3);

    ctx.fillStyle = '#D29A72';
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2E7D32';
    ctx.strokeStyle = '#1B471C';
    ctx.lineWidth = 1.5;

    if (player.direction === 'down') {
      ctx.fillRect(-8, -26, 16, 7);
      ctx.strokeRect(-8, -26, 16, 7);
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(-4, -18, 2, 3);
      ctx.fillRect(2, -18, 2, 3);
    } else if (player.direction === 'up') {
      ctx.beginPath();
      ctx.arc(0, -20, 9.5, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
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

    // Shield
    ctx.fillStyle = '#C83B2B';
    ctx.strokeStyle = '#FFD700';
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

  // 12. Floating Action Prompt
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
    ctx.roundRect(-80, -14, 160, 26, 6);
    ctx.fill();
    ctx.stroke();

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

  // 13. Night Lantern Glows
  function drawLanternGlows(ctx: CanvasRenderingContext2D, tick: number) {
    const lanterns = [
      { x: 710, y: 220, radius: 95 }, // Veranda
      { x: 820, y: 380, radius: 85 }, // Tubewell
      { x: 100, y: 140, radius: 70 }  // Seed shed
    ];

    const flicker = Math.sin(tick * 0.2) * 4;

    for (const l of lanterns) {
      const grad = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, l.radius + flicker);
      grad.addColorStop(0, 'rgba(255, 220, 120, 0.45)');
      grad.addColorStop(0.5, 'rgba(255, 180, 80, 0.18)');
      grad.addColorStop(1, 'rgba(255, 160, 40, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.radius + flicker, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 14. Diurnal Time of Day Lighting
  function drawTimeOfDayLighting(ctx: CanvasRenderingContext2D, tod: TimeOfDay) {
    if (tod === 'noon') return;

    if (tod === 'dawn') {
      ctx.fillStyle = 'rgba(255, 210, 120, 0.12)';
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    } else if (tod === 'sunset') {
      ctx.fillStyle = 'rgba(235, 110, 40, 0.18)';
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    } else if (tod === 'night') {
      ctx.fillStyle = 'rgba(10, 20, 50, 0.42)';
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }
  }

  // 15. The Authentic Zelda / FireRed Top HUD
  function drawZeldaHud(ctx: CanvasRenderingContext2D, tick: number) {
    ctx.save();

    const grad = ctx.createLinearGradient(0, 0, 0, 48);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, 48);

    // 1. Left: Vertical Water/Magic Capsule
    const capX = 18;
    const capY = 8;
    const capW = 16;
    const capH = 34;

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(capX, capY, capW, capH, 8);
    ctx.fill();
    ctx.stroke();

    const waterRatio = Math.max(0.1, Math.min(1.0, soilMoisture / 100));
    const fillH = (capH - 4) * waterRatio;
    ctx.fillStyle = soilMoisture < 35 ? '#FFB703' : '#2F6FED';
    ctx.fillRect(capX + 2, capY + capH - 2 - fillH, capW - 4, fillH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(soilMoisture > 75 ? 'MAX' : '1/2', capX + 8, capY - 2);

    // 2. Middle Counters: Rupee Coins, Moisture Drop
    const gemX = 54;
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

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${meters?.income ?? 180}`, gemX + 8, 25);

    const dropX = 120;
    ctx.fillStyle = '#2F6FED';
    ctx.beginPath();
    ctx.arc(dropX, 23, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${soilMoisture}%`, dropX + 7, 25);

    // Nitrogen badge
    const nX = 185;
    ctx.fillStyle = '#E5A93C';
    ctx.beginPath();
    ctx.arc(nX, 23, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`N:${meters?.nitrogen ?? 62}`, nX + 7, 25);

    // 3. Right: "-LIFE-" Red Hearts Containers
    const lifeX = 350;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('-LIFE-', lifeX, 15);

    for (let h = 0; h < 5; h++) {
      const hx = lifeX + h * 15;
      const hy = 24;
      const isFull = h < heartCount;

      ctx.fillStyle = isFull ? '#E63946' : '#5A2A2A';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(hx + 6, hy + 2);
      ctx.bezierCurveTo(hx + 6, hy, hx + 3, hy, hx + 3, hy + 2);
      ctx.bezierCurveTo(hx + 3, hy + 4, hx + 6, hy + 7, hx + 6, hy + 9);
      ctx.bezierCurveTo(hx + 6, hy + 7, hx + 9, hy + 4, hx + 9, hy + 2);
      ctx.bezierCurveTo(hx + 9, hy, hx + 6, hy, hx + 6, hy + 2);
      ctx.fill();
      ctx.stroke();
    }

    // 4. Far Right: Equipped Tool Box with dynamic pixel tool sprite
    const itemBoxX = VIEWPORT_WIDTH - 52;
    const itemBoxY = 6;
    const itemBoxSize = 36;

    ctx.fillStyle = '#000000';
    ctx.fillRect(itemBoxX, itemBoxY, itemBoxSize, itemBoxSize);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(itemBoxX, itemBoxY, itemBoxSize, itemBoxSize);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(itemBoxX + 2, itemBoxY + 2, itemBoxSize - 4, itemBoxSize - 4);

    // Tool Sprite
    drawEquippedToolIcon(ctx, equippedTool, itemBoxX + itemBoxSize / 2, itemBoxY + itemBoxSize / 2);

    // Tool shortcut label below box
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 8px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[Q] SWAP', itemBoxX + itemBoxSize / 2, itemBoxY + itemBoxSize + 11);

    ctx.restore();
  }

  // Draw Pixel Icon for Equipped Tool
  function drawEquippedToolIcon(ctx: CanvasRenderingContext2D, tool: EquippedTool, cx: number, cy: number) {
    ctx.save();
    ctx.translate(cx, cy);

    if (tool === 'seeds') {
      // Seed Pouch with green sprout
      ctx.fillStyle = '#8B5A2B';
      ctx.beginPath();
      ctx.roundRect(-8, -6, 16, 13, 3);
      ctx.fill();
      ctx.fillStyle = '#3FA34D';
      ctx.beginPath();
      ctx.arc(0, -7, 4, 0, Math.PI * 2);
      ctx.arc(3, -9, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === 'water') {
      // Blue Water Jug
      ctx.fillStyle = '#2B60DE';
      ctx.beginPath();
      ctx.roundRect(-6, -8, 12, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#7EC8E3';
      ctx.fillRect(-2, -10, 4, 3);
    } else if (tool === 'probe') {
      // Metallic SMAP Probe
      ctx.fillStyle = '#CCCCCC';
      ctx.fillRect(-2, -10, 4, 20);
      ctx.fillStyle = '#00E6C8';
      ctx.beginPath();
      ctx.arc(0, -10, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === 'almanac') {
      // Field Almanac scroll
      ctx.fillStyle = '#E5C48A';
      ctx.beginPath();
      ctx.roundRect(-8, -9, 16, 18, 2);
      ctx.fill();
      ctx.strokeStyle = '#5A3818';
      ctx.lineWidth = 1;
      ctx.strokeRect(-8, -9, 16, 18);
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 16. Mini-Map Radar in Corner
  function drawMiniMap(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const mw = 84;
    const mh = 63;
    const mx = 12;
    const my = VIEWPORT_HEIGHT - mh - 12;

    const scaleX = mw / WORLD_WIDTH;
    const scaleY = mh / WORLD_HEIGHT;

    ctx.save();

    // Backdrop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx - 2, my - 2, mw + 4, mh + 4);

    // World terrain mini representation
    ctx.fillStyle = '#4A8C46';
    ctx.fillRect(mx, my, mw, mh);

    // Canal
    ctx.fillStyle = '#2F6FED';
    ctx.fillRect(mx, my + 465 * scaleY, mw, 32 * scaleY);

    // North Plot
    ctx.fillStyle = '#723B18';
    ctx.fillRect(mx + 140 * scaleX, my + 270 * scaleY, 240 * scaleX, 150 * scaleY);

    // South Plot
    ctx.fillStyle = '#643212';
    ctx.fillRect(mx + 180 * scaleX, my + 520 * scaleY, 260 * scaleX, 150 * scaleY);

    // House
    ctx.fillStyle = '#CC3B2B';
    ctx.fillRect(mx + 600 * scaleX, my + 80 * scaleY, 260 * scaleX, 140 * scaleY);

    // Viewport camera outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx + camX * scaleX, my + camY * scaleY, VIEWPORT_WIDTH * scaleX, VIEWPORT_HEIGHT * scaleY);

    // Blips
    // Amma (Purple)
    ctx.fillStyle = '#A066CC';
    ctx.fillRect(mx + 710 * scaleX - 1, my + 220 * scaleY - 1, 3, 3);

    // Dr. Rao (Khaki)
    ctx.fillStyle = '#D6B468';
    ctx.fillRect(mx + 440 * scaleX - 1, my + 130 * scaleY - 1, 3, 3);

    // Ganga the Bullock (Cream)
    ctx.fillStyle = '#FFF8E6';
    ctx.fillRect(mx + 270 * scaleX - 1, my + 110 * scaleY - 1, 3, 3);

    // Tubewell (Cyan)
    ctx.fillStyle = '#00E6C8';
    ctx.fillRect(mx + 820 * scaleX - 1, my + 380 * scaleY - 1, 3, 3);

    // Player Hari (Bright blinking Green)
    ctx.fillStyle = '#00FF66';
    ctx.fillRect(mx + player.x * scaleX - 1.5, my + player.y * scaleY - 1.5, 4, 4);

    // Mini radar title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 7px "Space Mono", monospace';
    ctx.fillText('RADAR', mx + 3, my - 4);

    ctx.restore();
  }

  // 17. Weather Rain Overlay
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

  // 18. Dry Heat Haze & Dust Motives (Summer Drought Weather)
  function drawDryHeatHaze(ctx: CanvasRenderingContext2D, tick: number) {
    // Shimmering dust motes
    for (let i = 0; i < 24; i++) {
      const dx = (i * 47 + Math.sin(tick * 0.05 + i) * 15) % WORLD_WIDTH;
      const dy = (i * 31 - tick * 1.2) % WORLD_HEIGHT;
      const adjY = dy < 0 ? dy + WORLD_HEIGHT : dy;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(235, 180, 90, 0.65)' : 'rgba(215, 140, 50, 0.45)';
      ctx.beginPath();
      ctx.arc(dx, adjY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Horizontal heat wave distortion ribbons
    ctx.strokeStyle = 'rgba(255, 230, 160, 0.08)';
    ctx.lineWidth = 3;
    for (let w = 0; w < 4; w++) {
      const wy = 200 + w * 120 + Math.sin(tick * 0.08 + w) * 8;
      ctx.beginPath();
      for (let wx = 0; wx < WORLD_WIDTH; wx += 40) {
        const offY = Math.sin(wx * 0.04 + tick * 0.1) * 4;
        if (wx === 0) ctx.moveTo(wx, wy + offY);
        else ctx.lineTo(wx, wy + offY);
      }
      ctx.stroke();
    }
  }

  // 19. Harvest Golden Chaff & Husk Flakes
  function drawHarvestChaff(ctx: CanvasRenderingContext2D, tick: number) {
    for (let i = 0; i < 30; i++) {
      const cx = (i * 37 + tick * 3.5) % WORLD_WIDTH;
      const cy = (i * 43 + Math.sin(tick * 0.06 + i) * 20 + tick * 1.2) % WORLD_HEIGHT;
      const rot = tick * 0.08 + i;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = i % 3 === 0 ? '#E5A93C' : i % 3 === 1 ? '#F4D06F' : '#D68C45';
      ctx.fillRect(-2, -1, 4, 2);
      ctx.restore();
    }
  }

  // 20. Gentle Ambient Flower Petals (Spring/Normal Weather)
  function drawAmbientPetals(ctx: CanvasRenderingContext2D, tick: number) {
    for (let i = 0; i < 18; i++) {
      const px = (i * 53 + tick * 1.8 + Math.sin(tick * 0.04 + i) * 18) % WORLD_WIDTH;
      const py = (i * 39 + tick * 1.4) % WORLD_HEIGHT;
      const rot = Math.sin(tick * 0.05 + i) * 0.8;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 215, 230, 0.65)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
</script>

<div class="gba-canvas-wrap">
  <canvas 
    bind:this={canvasEl} 
    width={VIEWPORT_WIDTH} 
    height={VIEWPORT_HEIGHT}
    class="gba-viewport-canvas"
    onclick={handleCanvasClick}
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
    cursor: crosshair;
  }

  .gba-viewport-canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }
</style>
