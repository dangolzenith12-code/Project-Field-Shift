<script lang="ts">
  import { onMount } from 'svelte';
  import type { PlayerState, InteractiveEntity } from './types';
  import { WORLD_WIDTH, WORLD_HEIGHT, COLLISION_OBSTACLES, INTERACTIVE_ENTITIES } from './mapData';

  interface Props {
    player: PlayerState;
    activeEntity: InteractiveEntity | null;
    weatherCondition: 'normal' | 'rain' | 'dry' | 'harvest';
    soilMoisture: number;
    onInteract: (entity: InteractiveEntity) => void;
  }

  let { player, activeEntity, weatherCondition, soilMoisture, onInteract }: Props = $props();

  let canvasEl: HTMLCanvasElement | null = $state(null);
  let animId: number;

  // Viewport dimensions
  const VIEWPORT_WIDTH = 640;
  const VIEWPORT_HEIGHT = 440;

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
      // Clear viewport
      ctx.fillStyle = '#FFF3D6'; // var(--paper)
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Translate by camera
      ctx.translate(-camX, -camY);

      // 1. Draw Ground Texture & Dirt Paths
      drawTerrain(ctx, tick);

      // 2. Draw Crop Fields
      drawCropFields(ctx, tick);

      // 3. Draw Water Canal & Bridge
      drawWaterCanal(ctx, tick);

      // 4. Draw Buildings & Static Scenery (Shed, Cottage, Well, Tree)
      drawScenery(ctx, tick);

      // 5. Draw NPCs (Amma & Dr. Rao)
      drawNpcs(ctx, tick);

      // 6. Draw Player Sprite
      drawPlayer(ctx, tick);

      // 7. Draw Floating Proximity Interaction Prompt
      if (activeEntity) {
        drawInteractionPrompt(ctx, activeEntity, tick);
      }

      // 8. Weather overlay (rain or dust)
      if (weatherCondition === 'rain') {
        drawRainOverlay(ctx, tick);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  });

  // Terrain & Paths
  function drawTerrain(ctx: CanvasRenderingContext2D, tick: number) {
    // Dirt paths in warm earthy color
    ctx.fillStyle = '#E8D2A8';
    // Path from house to fields
    ctx.fillRect(400, 220, 90, 260);
    // Path to well
    ctx.fillRect(480, 370, 340, 40);
    // Path to shed
    ctx.fillRect(180, 180, 240, 45);
    // Path to Banyan tree
    ctx.fillRect(440, 170, 60, 60);

    // Subtle grass tufts
    ctx.strokeStyle = '#3FA34D';
    ctx.lineWidth = 1.8;
    const grassSpots = [
      { x: 120, y: 300 }, { x: 340, y: 150 }, { x: 740, y: 460 },
      { x: 550, y: 320 }, { x: 80, y: 550 }, { x: 620, y: 600 }
    ];
    for (const g of grassSpots) {
      ctx.beginPath();
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.x - 4, g.y - 7);
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.x, g.y - 9);
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.x + 4, g.y - 7);
      ctx.stroke();
    }
  }

  // Crop Fields
  function drawCropFields(ctx: CanvasRenderingContext2D, tick: number) {
    // North Plot: Terraced soil bed
    ctx.fillStyle = soilMoisture < 35 ? '#C29870' : '#8A4B2A';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(140, 270, 240, 150, 8);
    ctx.fill();
    ctx.stroke();

    // Field furrows & shoots
    const sway = Math.sin(tick * 0.06) * 2;
    for (let r = 0; r < 5; r++) {
      const y = 295 + r * 26;
      ctx.strokeStyle = '#2B1B12';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(150, y);
      ctx.lineTo(370, y);
      ctx.stroke();

      // Green / Golden shoots along row
      for (let c = 0; c < 8; c++) {
        const x = 165 + c * 26;
        ctx.fillStyle = soilMoisture < 35 ? '#FFB703' : '#3FA34D';
        ctx.beginPath();
        ctx.arc(x + sway, y - 6, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // South Plot (Legumes / Pulses)
    ctx.fillStyle = '#784323';
    ctx.beginPath();
    ctx.roundRect(180, 520, 260, 150, 8);
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

  // Water Canal & Bridge
  function drawWaterCanal(ctx: CanvasRenderingContext2D, tick: number) {
    // Water stream
    ctx.fillStyle = '#2F6FED';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3;
    // West canal
    ctx.fillRect(24, 470, 416, 22);
    ctx.strokeRect(24, 470, 416, 22);
    // East canal
    ctx.fillRect(520, 470, 416, 22);
    ctx.strokeRect(520, 470, 416, 22);

    // Water ripple highlights
    ctx.strokeStyle = '#BDE8F5';
    ctx.lineWidth = 2;
    const rippleOffset = (tick * 0.8) % 30;
    ctx.beginPath();
    ctx.moveTo(80 + rippleOffset, 481);
    ctx.lineTo(110 + rippleOffset, 481);
    ctx.moveTo(600 + rippleOffset, 481);
    ctx.lineTo(630 + rippleOffset, 481);
    ctx.stroke();

    // Wooden Bridge across canal (x: 440 to 520)
    ctx.fillStyle = '#C28D58';
    ctx.fillRect(440, 460, 80, 42);
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(440, 460, 80, 42);
    // Planks
    for (let p = 0; p < 5; p++) {
      const px = 445 + p * 16;
      ctx.beginPath();
      ctx.moveTo(px, 460);
      ctx.lineTo(px, 502);
      ctx.stroke();
    }
  }

  // Scenery & Buildings
  function drawScenery(ctx: CanvasRenderingContext2D, tick: number) {
    // 1. Amma's Thatched Cottage (x: 600, y: 80)
    // Whitewashed base
    ctx.fillStyle = '#FFF3D6';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3.5;
    ctx.fillRect(600, 110, 260, 110);
    ctx.strokeRect(600, 110, 260, 110);

    // Veranda roof (turmeric thatch)
    ctx.fillStyle = '#FFB703';
    ctx.beginPath();
    ctx.moveTo(580, 110);
    ctx.lineTo(730, 40);
    ctx.lineTo(880, 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Thatch ridges
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(630, 110); ctx.lineTo(730, 40);
    ctx.moveTo(680, 110); ctx.lineTo(730, 40);
    ctx.moveTo(780, 110); ctx.lineTo(730, 40);
    ctx.moveTo(830, 110); ctx.lineTo(730, 40);
    ctx.stroke();

    // Door & Windows
    ctx.fillStyle = '#8A4B2A';
    ctx.fillRect(710, 160, 36, 60);
    ctx.strokeRect(710, 160, 36, 60);
    ctx.fillStyle = '#BDE8F5';
    ctx.fillRect(630, 140, 30, 30);
    ctx.strokeRect(630, 140, 30, 30);
    ctx.fillRect(790, 140, 30, 30);
    ctx.strokeRect(790, 140, 30, 30);

    // Veranda Porch Floor
    ctx.fillStyle = '#E69C24';
    ctx.fillRect(600, 220, 260, 30);
    ctx.strokeRect(600, 220, 260, 30);

    // 2. Sacred Banyan Tree (x: 440, y: 110)
    ctx.fillStyle = '#8A4B2A';
    ctx.fillRect(465, 95, 30, 50);
    ctx.strokeRect(465, 95, 30, 50);
    // Tree Canopy (layered green circles)
    ctx.fillStyle = '#3FA34D';
    ctx.beginPath();
    ctx.arc(450, 75, 42, 0, Math.PI * 2);
    ctx.arc(510, 75, 42, 0, Math.PI * 2);
    ctx.arc(480, 45, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Ancestral Tubewell Pump (x: 820, y: 380)
    ctx.fillStyle = '#7A8B99';
    ctx.fillRect(820, 380, 60, 50);
    ctx.strokeRect(820, 380, 60, 50);
    // Pump flywheel
    const spinAngle = tick * 0.12;
    ctx.save();
    ctx.translate(850, 405);
    ctx.rotate(spinAngle);
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.moveTo(-14, 0); ctx.lineTo(14, 0);
    ctx.moveTo(0, -14); ctx.lineTo(0, 14);
    ctx.stroke();
    ctx.restore();
    // Outflow Pipe into canal
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(820, 410);
    ctx.lineTo(760, 410);
    ctx.lineTo(760, 470);
    ctx.stroke();

    // 4. Village Weather Station Post (x: 80, y: 370)
    ctx.fillStyle = '#EAEAEA';
    ctx.fillRect(95, 350, 14, 60);
    ctx.strokeRect(95, 350, 14, 60);
    // Weather box & anemometer
    ctx.fillStyle = '#FFB703';
    ctx.fillRect(80, 340, 44, 25);
    ctx.strokeRect(80, 340, 44, 25);
    ctx.fillStyle = '#2B1B12';
    ctx.beginPath();
    ctx.arc(102, 330, 8, 0, Math.PI * 2);
    ctx.fill();

    // 5. Seed Storage Shed (x: 100, y: 90)
    ctx.fillStyle = '#D6B48B';
    ctx.fillRect(100, 110, 140, 75);
    ctx.strokeRect(100, 110, 140, 75);
    ctx.fillStyle = '#8A4B2A';
    ctx.beginPath();
    ctx.moveTo(85, 110); ctx.lineTo(170, 70); ctx.lineTo(255, 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#5C2D12';
    ctx.fillRect(150, 135, 40, 50);
    ctx.strokeRect(150, 135, 40, 50);
  }

  // NPCs
  function drawNpcs(ctx: CanvasRenderingContext2D, tick: number) {
    // 1. Amma sitting on the Veranda (x: 710, y: 220)
    const ammaBob = Math.sin(tick * 0.05) * 1.5;
    // Sari
    ctx.fillStyle = '#7B4FA3'; // Dusk purple
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(725, 238 + ammaBob, 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Head & Silver bun
    ctx.fillStyle = '#D29A72';
    ctx.beginPath();
    ctx.arc(725, 218 + ammaBob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#B0A8A0';
    ctx.beginPath();
    ctx.arc(732, 213 + ammaBob, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Village Agronomist (Dr. Rao) near Banyan Tree (x: 440, y: 130)
    ctx.fillStyle = '#C2A676'; // Khaki
    ctx.fillRect(435, 145, 18, 22);
    ctx.strokeRect(435, 145, 18, 22);
    ctx.fillStyle = '#C8926B';
    ctx.beginPath();
    ctx.arc(444, 136, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Hat
    ctx.fillStyle = '#8C6C38';
    ctx.fillRect(433, 128, 22, 5);
  }

  // Player Character Sprite (Classic Pokémon style walk animation)
  function drawPlayer(ctx: CanvasRenderingContext2D, tick: number) {
    const px = player.x;
    const py = player.y;
    const frame = player.frame;

    ctx.save();
    ctx.translate(px, py);

    // Player Shadow
    ctx.fillStyle = 'rgba(43, 27, 18, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leg stepping animation
    const legOffset = player.isMoving ? (frame === 1 ? -4 : frame === 2 ? 4 : 0) : 0;
    ctx.fillStyle = '#5A3E26'; // Brown trousers
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;

    if (player.direction === 'down' || player.direction === 'up') {
      ctx.fillRect(-6, 4, 5, 8 + legOffset);
      ctx.strokeRect(-6, 4, 5, 8 + legOffset);
      ctx.fillRect(1, 4, 5, 8 - legOffset);
      ctx.strokeRect(1, 4, 5, 8 - legOffset);
    } else {
      // Side view legs
      ctx.fillRect(-4, 4, 8, 8 + (player.isMoving ? Math.abs(legOffset) : 0));
      ctx.strokeRect(-4, 4, 8, 8 + (player.isMoving ? Math.abs(legOffset) : 0));
    }

    // Torso (Paddy green shirt)
    ctx.fillStyle = '#3FA34D';
    ctx.fillRect(-9, -10, 18, 16);
    ctx.strokeRect(-9, -10, 18, 16);

    // Head
    ctx.fillStyle = '#D29A72';
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair / Cap
    ctx.fillStyle = '#2B1B12';
    if (player.direction === 'down') {
      ctx.fillRect(-8, -26, 16, 6);
      // Eyes
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(-4, -18, 2, 3);
      ctx.fillRect(2, -18, 2, 3);
    } else if (player.direction === 'up') {
      ctx.beginPath();
      ctx.arc(0, -20, 9.5, Math.PI, 0);
      ctx.fill();
    } else if (player.direction === 'left') {
      ctx.fillRect(-8, -26, 14, 6);
      ctx.fillRect(-5, -18, 2, 3);
    } else {
      ctx.fillRect(-6, -26, 14, 6);
      ctx.fillRect(3, -18, 2, 3);
    }

    ctx.restore();
  }

  // Floating Action Bubble
  function drawInteractionPrompt(ctx: CanvasRenderingContext2D, entity: InteractiveEntity, tick: number) {
    const floatY = Math.sin(tick * 0.1) * 3;
    const px = player.x;
    const py = player.y - 42 + floatY;

    ctx.save();
    ctx.translate(px, py);

    // Bubble background
    ctx.fillStyle = '#FFB703'; // Turmeric
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-80, -14, 160, 26, 6);
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-5, 12);
    ctx.lineTo(0, 18);
    ctx.lineTo(5, 12);
    ctx.fill();
    ctx.stroke();

    // Prompt Text
    ctx.fillStyle = '#2B1B12';
    ctx.font = 'bold 11px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`[A/SPACE] ${entity.name.split(' ')[0]}`, 0, 0);

    ctx.restore();
  }

  // Weather Rain Overlay
  function drawRainOverlay(ctx: CanvasRenderingContext2D, tick: number) {
    ctx.strokeStyle = 'rgba(47, 111, 237, 0.6)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 40; i++) {
      const rx = (i * 27 + tick * 8) % WORLD_WIDTH;
      const ry = (i * 39 + tick * 18) % WORLD_HEIGHT;
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
    background-color: var(--ink);
    border: 3.5px solid var(--ink);
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
    box-shadow: 0 6px 0 var(--ink);
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
