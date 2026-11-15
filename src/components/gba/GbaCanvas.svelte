<script lang="ts">
  import { onMount } from 'svelte';
  import type { PlayerState, InteractiveEntity } from './types';
  import type { FarmMeters, RegionInfo } from '../../types/game';
  import { WORLD_WIDTH, WORLD_HEIGHT } from './mapData';
  import { REGIONS } from '../../data/mockData';
  import {
    drawRegionalTerrain,
    drawRegionalCliffsAndWater,
    drawRegionalFences,
    drawRegionalCrops,
    drawRegionalScenery,
    drawRegionalAtmosphere,
    initBiomeParticles,
    updateBiomeParticles,
    type BiomeParticle
  } from './biomeRenderer';

  interface Props {
    player: PlayerState;
    activeEntity: InteractiveEntity | null;
    currentRegion?: RegionInfo;
    weatherCondition: 'normal' | 'rain' | 'dry' | 'harvest';
    soilMoisture: number;
    meters?: FarmMeters;
    onInteract: (entity: InteractiveEntity) => void;
  }

  let { 
    player, 
    activeEntity, 
    currentRegion = REGIONS.punjab, 
    weatherCondition, 
    soilMoisture, 
    meters, 
    onInteract
  }: Props = $props();

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

    // Retina / High-DPI crisp rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = VIEWPORT_WIDTH * dpr;
    canvasEl.height = VIEWPORT_HEIGHT * dpr;

    let tick = 0;
    const particles: BiomeParticle[] = initBiomeParticles(55);

    const render = () => {
      tick++;

      // Update atmospheric particles
      updateBiomeParticles(particles, currentRegion.id);

      // Compute camera offset to center on player
      let camX = player.x - VIEWPORT_WIDTH / 2;
      let camY = player.y - VIEWPORT_HEIGHT / 2;

      // Clamp camera within world bounds
      camX = Math.max(0, Math.min(WORLD_WIDTH - VIEWPORT_WIDTH, camX));
      camY = Math.max(0, Math.min(WORLD_HEIGHT - VIEWPORT_HEIGHT, camY));

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear Canvas Background
      ctx.fillStyle = '#080F0A';
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Translate camera for overworld map
      ctx.save();
      ctx.translate(-camX, -camY);

      // 1. Biome-Themed Ground, Paths & Regional Details
      drawRegionalTerrain(ctx, currentRegion.id, tick);

      // 2. Biome-Themed Cliffs & Waterway (Canal, Swale, Stepwell, or Oasis)
      drawRegionalCliffsAndWater(ctx, currentRegion.id, tick);

      // 3. Biome-Themed Fences & Enclosures
      drawRegionalFences(ctx, currentRegion.id);

      // 4. Biome-Themed Crop Terrace Plots
      drawRegionalCrops(ctx, currentRegion.id, soilMoisture, tick);

      // 5. Biome-Themed Scenery (Barns, Silos, Thatched Houses, Banyans, Acacias)
      drawRegionalScenery(ctx, currentRegion.id, tick);

      // 6. Active NASA Satellite Flyover with Radar Cone Beam Sweep
      drawNasaSatelliteFlyover(ctx, tick);

      // 7. Landmark Overworld Quest Banners (Amma, Banyan, Weather Post, Kenya Kiosk)
      drawLandmarkQuestBanners(ctx, tick);

      // 8. Draw NPCs (Amma & Village Agronomist)
      drawRegionalNpcs(ctx, currentRegion.id, tick);

      // 9. Draw Player Hari (Authentic Indian Farmer Hero Sprite)
      drawHariFarmerSprite(ctx, tick);

      // 10. Floating Speech Balloon Action Prompt for Active Landmark
      if (activeEntity) {
        drawFloatingSpeechActionPrompt(ctx, activeEntity, tick);
      }

      // 11. Ambient Lighting, Atmospheric Vignette & Weather Particles
      drawRegionalAtmosphere(ctx, currentRegion.id, weatherCondition, tick, particles);

      ctx.restore(); // End camera transform

      // 12. Authentic GBA / Farm Status HUD (Fixed on screen top)
      drawFarmTopHud(ctx, tick);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  });

  // 1. NASA Satellite Flyover with Sweeping Radar Cone Beam
  function drawNasaSatelliteFlyover(ctx: CanvasRenderingContext2D, tick: number) {
    // Satellite orbital traverse across upper atmosphere (x: -80 to WORLD_WIDTH + 80)
    const satSpan = WORLD_WIDTH + 240;
    const satSpeed = 0.9;
    const rawX = ((tick * satSpeed) % satSpan) - 120;
    const satX = rawX;
    const satY = 60 + Math.sin(tick * 0.03) * 8;

    ctx.save();

    // A. Downward Sweeping Active Radar Cone Beam (SMAP / SWOT L-Band Radiometry)
    const beamGroundY = 460;
    const beamSpread = 140;
    const pulseOffset = (tick * 2.5) % 80;

    const coneGrad = ctx.createLinearGradient(satX, satY, satX, beamGroundY);
    coneGrad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
    coneGrad.addColorStop(0.35, 'rgba(0, 255, 102, 0.22)');
    coneGrad.addColorStop(1, 'rgba(0, 255, 102, 0.02)');

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(satX, satY + 12);
    ctx.lineTo(satX - beamSpread, beamGroundY);
    ctx.lineTo(satX + beamSpread, beamGroundY);
    ctx.closePath();
    ctx.fill();

    // Radar scanning wave rings
    for (let r = 0; r < 3; r++) {
      const ringY = satY + 30 + ((pulseOffset + r * 30) % (beamGroundY - satY - 40));
      const ringRatio = (ringY - satY) / (beamGroundY - satY);
      const curSpread = beamSpread * ringRatio;

      ctx.strokeStyle = `rgba(0, 255, 102, ${0.45 - ringRatio * 0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(satX, ringY, curSpread, 14 * ringRatio, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // B. Satellite Hardware (Dual Blue Solar Wings, Gold MLI Bus, Dish, Beacons)
    ctx.translate(satX, satY);

    // Left Solar Panel Array
    ctx.fillStyle = '#0D47A1';
    ctx.fillRect(-48, -7, 34, 14);
    ctx.strokeStyle = '#64B5F6';
    ctx.lineWidth = 1;
    ctx.strokeRect(-48, -7, 34, 14);
    // Solar cell grid
    ctx.beginPath();
    ctx.moveTo(-36, -7); ctx.lineTo(-36, 7);
    ctx.moveTo(-24, -7); ctx.lineTo(-24, 7);
    ctx.moveTo(-48, 0); ctx.lineTo(-14, 0);
    ctx.stroke();

    // Right Solar Panel Array
    ctx.fillStyle = '#0D47A1';
    ctx.fillRect(14, -7, 34, 14);
    ctx.strokeRect(14, -7, 34, 14);
    // Solar cell grid
    ctx.beginPath();
    ctx.moveTo(26, -7); ctx.lineTo(26, 7);
    ctx.moveTo(38, -7); ctx.lineTo(38, 7);
    ctx.moveTo(14, 0); ctx.lineTo(48, 0);
    ctx.stroke();

    // Connecting Truss Arms
    ctx.fillStyle = '#78909C';
    ctx.fillRect(-14, -2, 28, 4);

    // Main Satellite Bus (Gold MLI Thermal Foil)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-10, -10, 20, 20);
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, -10, 20, 20);

    // High-Gain Parabolic Earth Dish
    ctx.fillStyle = '#ECEFF1';
    ctx.strokeStyle = '#455A64';
    ctx.beginPath();
    ctx.arc(0, 12, 8, Math.PI, 0, true);
    ctx.fill();
    ctx.stroke();
    // Feed horn
    ctx.fillStyle = '#263238';
    ctx.fillRect(-1, 12, 2, 6);

    // Blinking Navigation Beacons
    const blinkOn = Math.floor(tick / 20) % 2 === 0;
    // Red beacon (Port)
    ctx.fillStyle = blinkOn ? '#FF1744' : '#7F0000';
    ctx.beginPath();
    ctx.arc(-46, -7, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Green beacon (Starboard)
    ctx.fillStyle = blinkOn ? '#00E676' : '#004D20';
    ctx.beginPath();
    ctx.arc(46, -7, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // C. Live Satellite Telemetry Callout Pill
    ctx.fillStyle = 'rgba(6, 15, 10, 0.85)';
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-80, -28, 160, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 8px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛰️ NASA SMAP-L4 RADAR SWEEP (680km)', 0, -20);

    ctx.restore();
  }

  // 2. Landmark Overworld Quest Banners
  function drawLandmarkQuestBanners(ctx: CanvasRenderingContext2D, tick: number) {
    const bob = Math.sin(tick * 0.08) * 3;

    // Mission 1: Amma's Heirloom Seed Matrix (x: 710, y: 220)
    drawFloatingBadge(ctx, 725, 180 + bob, '🌾 M1: Heirloom Seeds', '#FFD166', '#B85D19');

    // Mission 2: Sacred Banyan 3-Crop Rotation Charter (x: 440, y: 130)
    drawFloatingBadge(ctx, 480, 85 + bob, '🌳 M2: 3-Crop Rotation', '#52B788', '#1B4D2B');

    // Mission 3: Iowa Satellite Phone Call (x: 80, y: 370)
    drawFloatingBadge(ctx, 105, 330 + bob, '📞 M3: Transatlantic Call', '#00E5FF', '#0D47A1');

    // Mission 4: Kenya Solar Video Kiosk (x: 100, y: 140)
    drawFloatingBadge(ctx, 170, 75 + bob, '▶️ M4: Kenya Video', '#FF5A67', '#80131B');
  }

  function drawFloatingBadge(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    text: string, 
    textColor: string, 
    bgColor: string
  ) {
    ctx.save();
    ctx.translate(x, y);

    const padX = 8;
    ctx.font = 'bold 9px "Space Mono", monospace';
    const textWidth = ctx.measureText(text).width;
    const badgeW = textWidth + padX * 2;
    const badgeH = 18;

    // Badge Pill
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 4);
    ctx.fill();
    ctx.stroke();

    // Little downward arrow
    ctx.fillStyle = textColor;
    ctx.beginPath();
    ctx.moveTo(-4, badgeH / 2);
    ctx.lineTo(0, badgeH / 2 + 4);
    ctx.lineTo(4, badgeH / 2);
    ctx.closePath();
    ctx.fill();

    // Text
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  // 3. NPCs (Amma & Dr. Rao)
  function drawRegionalNpcs(ctx: CanvasRenderingContext2D, regionId: string, tick: number) {
    const ammaBob = Math.sin(tick * 0.05) * 1.5;

    // Amma's Shadow
    ctx.fillStyle = 'rgba(20, 15, 10, 0.3)';
    ctx.beginPath();
    ctx.ellipse(725, 244 + ammaBob, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Amma's Saree
    ctx.fillStyle = '#7B4FA3';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(725, 232 + ammaBob, 14, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Face & Silver hair
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

    // Amma's Bindi
    ctx.fillStyle = '#E63946';
    ctx.fillRect(724, 212 + ammaBob, 2, 2);

    // Dr. Rao / Agronomist under Banyan Tree (x: 440, y: 130)
    ctx.fillStyle = '#264653';
    ctx.strokeStyle = '#1D3557';
    ctx.lineWidth = 2;
    ctx.fillRect(435, 145, 18, 22);
    ctx.strokeRect(435, 145, 18, 22);
    ctx.fillStyle = '#C88756';
    ctx.beginPath();
    ctx.arc(444, 136, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Agronomist Pith / Sun Hat
    ctx.fillStyle = '#E9C46A';
    ctx.fillRect(430, 128, 28, 5);
  }

  // 4. Hari - Authentic Indian Farmer Hero Sprite (NO Zelda/Link look)
  function drawHariFarmerSprite(ctx: CanvasRenderingContext2D, tick: number) {
    const px = player.x;
    const py = player.y;
    const frame = player.frame;

    ctx.save();
    ctx.translate(px, py);

    // Ground Shadow
    ctx.fillStyle = 'rgba(20, 15, 10, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = player.isMoving ? (frame === 1 ? -4 : frame === 2 ? 4 : 0) : 0;
    const clothSway = player.isMoving ? Math.sin(tick * 0.25) * 3 : Math.sin(tick * 0.08) * 1;

    // A. Feet / Traditional Leather Chappals (Sandals)
    ctx.fillStyle = '#5A3818';
    ctx.strokeStyle = '#2B1B12';
    ctx.lineWidth = 1.5;

    if (player.direction === 'down' || player.direction === 'up') {
      ctx.fillRect(-6, 6 + legOffset, 5, 6);
      ctx.strokeRect(-6, 6 + legOffset, 5, 6);
      ctx.fillRect(2, 6 - legOffset, 5, 6);
      ctx.strokeRect(2, 6 - legOffset, 5, 6);
    } else {
      ctx.fillRect(-3, 6 + (player.isMoving ? Math.abs(legOffset) : 0), 7, 6);
      ctx.strokeRect(-3, 6 + (player.isMoving ? Math.abs(legOffset) : 0), 7, 6);
    }

    // B. Dhoti / Farmer Drawstring Trousers (Warm Ochre / Beige Cotton)
    ctx.fillStyle = '#D4B483';
    ctx.strokeStyle = '#8C6C38';
    ctx.lineWidth = 1.6;

    if (player.direction === 'down' || player.direction === 'up') {
      // Left leg fold
      ctx.fillRect(-7, -2, 6, 9 + (legOffset * 0.5));
      ctx.strokeRect(-7, -2, 6, 9 + (legOffset * 0.5));
      // Right leg fold
      ctx.fillRect(1, -2, 6, 9 - (legOffset * 0.5));
      ctx.strokeRect(1, -2, 6, 9 - (legOffset * 0.5));
    } else {
      ctx.fillRect(-5, -2, 10, 9);
      ctx.strokeRect(-5, -2, 10, 9);
    }

    // C. Traditional Cotton Kurta (Light Cream / Off-White Khadi)
    ctx.fillStyle = '#F8F9FA';
    ctx.strokeStyle = '#A39988';
    ctx.lineWidth = 1.6;
    ctx.fillRect(-9, -14, 18, 14);
    ctx.strokeRect(-9, -14, 18, 14);

    // Terracotta / Red Waistband Sash (Kamarbandh)
    ctx.fillStyle = '#C05C46';
    ctx.fillRect(-9, -4, 18, 4);
    // Tied knot on side
    ctx.beginPath();
    ctx.ellipse(7, -2, 3, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // D. Head & Warm Skin Tone
    ctx.fillStyle = '#C8855A';
    ctx.strokeStyle = '#784524';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, -20, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // E. Expressive Facial Details
    if (player.direction === 'down') {
      // Eyes
      ctx.fillStyle = '#1F1610';
      ctx.fillRect(-3, -21, 2, 2.5);
      ctx.fillRect(2, -21, 2, 2.5);
      // Small mustache / friendly smile
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(-3, -17, 7, 1.5);
    } else if (player.direction === 'left') {
      ctx.fillStyle = '#1F1610';
      ctx.fillRect(-5, -21, 2, 2.5);
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(-6, -17, 4, 1.5);
    } else if (player.direction === 'right') {
      ctx.fillStyle = '#1F1610';
      ctx.fillRect(3, -21, 2, 2.5);
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(2, -17, 4, 1.5);
    }

    // F. Authentic Indian Saffron Pagri / Gamcha Turban
    ctx.fillStyle = '#E76F51';
    ctx.strokeStyle = '#B84528';
    ctx.lineWidth = 1.5;

    // Turban dome
    ctx.beginPath();
    ctx.arc(0, -23, 9.5, Math.PI, 0, false);
    ctx.fill();
    ctx.stroke();

    // Front folded band
    ctx.fillStyle = '#F4A261';
    ctx.fillRect(-9, -27, 18, 5);
    ctx.strokeRect(-9, -27, 18, 5);

    // Turban Center Crest / Fold
    ctx.fillStyle = '#D97706';
    ctx.fillRect(-2, -28, 4, 6);

    // Fluttering Gamcha Tail (Flowing over shoulder)
    ctx.fillStyle = '#E76F51';
    ctx.strokeStyle = '#B84528';
    ctx.beginPath();
    ctx.moveTo(7, -24);
    ctx.quadraticCurveTo(11 + clothSway, -16, 10 + clothSway, -6);
    ctx.lineTo(7 + clothSway, -6);
    ctx.quadraticCurveTo(8 + clothSway, -16, 5, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // G. Hand Tool: Traditional Harvest Sickle (Daranti) with Wood Handle
    if (player.direction === 'down' || player.direction === 'right') {
      ctx.save();
      ctx.translate(11, -6);
      // Rosewood Handle
      ctx.fillStyle = '#4E2A12';
      ctx.fillRect(-2, 0, 3, 8);
      // Steel Curved Blade
      ctx.strokeStyle = '#CFD8DC';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 7, -Math.PI * 0.4, Math.PI * 0.4, false);
      ctx.stroke();
      ctx.restore();
    } else if (player.direction === 'left') {
      ctx.save();
      ctx.translate(-11, -6);
      ctx.fillStyle = '#4E2A12';
      ctx.fillRect(-1, 0, 3, 8);
      ctx.strokeStyle = '#CFD8DC';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 7, Math.PI * 0.6, Math.PI * 1.4, false);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // 5. Floating Speech Balloon Action Prompt
  function drawFloatingSpeechActionPrompt(ctx: CanvasRenderingContext2D, entity: InteractiveEntity, tick: number) {
    const floatY = Math.sin(tick * 0.1) * 3;
    const px = player.x;
    const py = player.y - 46 + floatY;

    ctx.save();
    ctx.translate(px, py);

    const promptText = `[SPACE / E] ${entity.promptText}`;
    ctx.font = 'bold 11px "Space Mono", monospace';
    const textW = ctx.measureText(promptText).width;
    const bubbleW = textW + 24;
    const bubbleH = 26;

    // Speech Bubble Body
    ctx.fillStyle = '#FFD166';
    ctx.strokeStyle = '#1B241E';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 6);
    ctx.fill();
    ctx.stroke();

    // Speech Tail Pointing Down to Hari
    ctx.beginPath();
    ctx.moveTo(-5, bubbleH / 2);
    ctx.lineTo(0, bubbleH / 2 + 6);
    ctx.lineTo(5, bubbleH / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text Label
    ctx.fillStyle = '#1A231C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(promptText, 0, 0);

    ctx.restore();
  }

  // 6. Zelda / GBA Top Farm Status HUD
  function drawFarmTopHud(ctx: CanvasRenderingContext2D, tick: number) {
    ctx.save();

    // Top Dark Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 48);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, 48);

    // 1. Water Saturation Capsule
    const capX = 18;
    const capY = 8;
    const capW = 16;
    const capH = 34;

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.2;
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
    ctx.fillText(soilMoisture > 75 ? 'MAX' : 'H₂O', capX + 8, capY - 2);

    // 2. Rupee / Coins Counter
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

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${meters?.income ?? 180}`, gemX + 8, 25);

    // Soil Moisture Percentage
    const dropX = 135;
    ctx.fillStyle = '#2F6FED';
    ctx.beginPath();
    ctx.arc(dropX, 23, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${soilMoisture}%`, dropX + 7, 25);

    // 3. Life Hearts
    const lifeX = 380;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('-HEALTH-', lifeX, 15);

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

    // 4. NASA Satellite Active Radar Indicator
    const itemBoxX = VIEWPORT_WIDTH - 60;
    const itemBoxY = 6;
    const itemBoxSize = 36;

    ctx.fillStyle = '#000000';
    ctx.fillRect(itemBoxX, itemBoxY, itemBoxSize, itemBoxSize);
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 2;
    ctx.strokeRect(itemBoxX, itemBoxY, itemBoxSize, itemBoxSize);

    ctx.fillStyle = '#00FF66';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛰️', itemBoxX + itemBoxSize / 2, itemBoxY + itemBoxSize / 2);

    ctx.restore();
  }
</script>

<div class="gba-canvas-wrap">
  <canvas 
    bind:this={canvasEl} 
    class="gba-viewport-canvas"
    onclick={() => { if (activeEntity) onInteract(activeEntity); }}
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
    box-shadow: 0 7px 0 var(--ink), 0 0 20px rgba(0, 255, 102, 0.15);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .gba-viewport-canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: auto;
  }
</style>
