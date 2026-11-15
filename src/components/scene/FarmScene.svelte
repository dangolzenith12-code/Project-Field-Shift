<script lang="ts">
  import { onMount } from 'svelte';
  import type { FarmMeters, EraInfo } from '../../types/game';

  interface Props {
    meters: FarmMeters;
    era: EraInfo;
    weatherCondition?: 'dry' | 'rain' | 'normal' | 'harvest';
  }

  let { meters, era, weatherCondition = 'normal' }: Props = $props();

  let canvasEl: HTMLCanvasElement | null = $state(null);

  // Computed visual states based on meters
  const isDrought = $derived(meters.soilMoisture < 35);
  const isHealthy = $derived(meters.soilMoisture >= 45 && meters.organicMatter >= 40);
  const isEroded = $derived(meters.erosionRisk > 55);

  // Dynamic sky color tone
  const skyColor = $derived(
    isDrought 
      ? 'color-mix(in srgb, var(--sky) 65%, var(--turmeric))' 
      : weatherCondition === 'rain' 
        ? 'color-mix(in srgb, var(--sky) 60%, var(--monsoon))' 
        : 'var(--sky)'
  );

  // Dynamic soil color tone
  const soilFill = $derived(
    isDrought 
      ? 'color-mix(in srgb, var(--soil) 65%, var(--paper))' 
      : 'var(--soil)'
  );

  // Canvas 2D Particle System (Rain, Dust, Harvest sparkles)
  onMount(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvasEl.width = canvasEl.offsetWidth);
    let height = (canvasEl.height = canvasEl.offsetHeight);

    const handleResize = () => {
      if (!canvasEl) return;
      width = canvasEl.width = canvasEl.offsetWidth;
      height = canvasEl.height = canvasEl.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2.5 + 1.2,
      opacity: Math.random() * 0.7 + 0.3
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Determine active particle mode
      const activeMode = weatherCondition === 'rain' ? 'rain' : isDrought ? 'dust' : 'pollen';

      for (const p of particles) {
        if (activeMode === 'rain') {
          // Fast slanted raindrops
          ctx.strokeStyle = '#2F6FED';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + p.size * 6);
          ctx.stroke();

          p.y += p.speedY * 5;
          p.x -= 1;
        } else if (activeMode === 'dust') {
          // Slow floating dry dust motes
          ctx.fillStyle = '#8A4B2A';
          ctx.globalAlpha = p.opacity * 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          p.y += p.speedY * 0.4;
          p.x += Math.sin(p.y * 0.05) * 0.6;
        } else {
          // Gentle golden sparkles
          ctx.fillStyle = '#FFB703';
          ctx.globalAlpha = p.opacity * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          p.y -= p.speedY * 0.5;
          p.x += p.speedX;
        }

        // Wrap around boundaries
        if (p.y > height) { p.y = 0; p.x = Math.random() * width; }
        if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<div class="farm-scene-container" style:--scene-sky={skyColor} style:--scene-soil={soilFill}>
  <!-- Inline SVG Layer -->
  <svg class="farm-svg" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid meet">
    <defs>
      <!-- Vintage seed packet sunburst pattern -->
      <radialGradient id="sunburst-glow" cx="80%" cy="20%" r="50%">
        <stop offset="0%" stop-color="var(--turmeric)" stop-opacity="0.9" />
        <stop offset="40%" stop-color="var(--turmeric)" stop-opacity="0.3" />
        <stop offset="100%" stop-color="var(--scene-sky)" stop-opacity="0" />
      </radialGradient>

      <!-- Soil crack pattern for drought state -->
      <pattern id="cracked-earth" width="120" height="90" patternUnits="userSpaceOnUse">
        <path d="M 10 20 L 35 45 L 25 70 M 35 45 L 60 55 L 85 40 M 60 55 L 70 85" stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M 80 15 L 95 35 L 115 45" stroke="var(--ink)" stroke-width="2" fill="none" />
      </pattern>
    </defs>

    <!-- Sky Background -->
    <rect width="900" height="340" fill="var(--scene-sky)" />

    <!-- Distant Sun / Rays -->
    <circle cx="750" cy="90" r="140" fill="url(#sunburst-glow)" />
    <circle cx="750" cy="90" r="42" fill="var(--turmeric)" stroke="var(--ink)" stroke-width="3.5" />

    <!-- Clouds with ink outlines -->
    <g class="clouds-group">
      <!-- Cloud 1 -->
      <path 
        d="M 120 70 C 120 50 145 40 165 50 C 180 35 210 40 220 58 C 240 55 255 75 245 92 C 245 102 230 110 220 110 L 130 110 C 115 110 110 95 120 70 Z" 
        fill="var(--paper)" 
        stroke="var(--ink)" 
        stroke-width="3" 
      />
      <!-- Cloud 2 -->
      <path 
        d="M 380 90 C 380 75 400 68 415 76 C 428 64 450 68 458 82 C 472 80 484 95 476 108 L 390 108 C 378 108 374 96 380 90 Z" 
        fill="var(--paper)" 
        stroke="var(--ink)" 
        stroke-width="3" 
      />
    </g>

    <!-- Distant Rolling Hills -->
    <path 
      d="M 0 240 Q 220 180 460 230 T 900 210 L 900 360 L 0 360 Z" 
      fill="color-mix(in srgb, var(--paddy) 45%, var(--paper))" 
      stroke="var(--ink)" 
      stroke-width="3.5" 
    />
    <path 
      d="M 0 270 Q 300 230 580 265 T 900 250 L 900 360 L 0 360 Z" 
      fill="color-mix(in srgb, var(--paddy) 70%, var(--soil))" 
      stroke="var(--ink)" 
      stroke-width="3.5" 
    />

    <!-- Middleground: Amma's Farmhouse & Sacred Banyan Tree -->
    <g class="homestead-group" transform="translate(640, 160)">
      <!-- Amma's Vintage Thatched Hut -->
      <!-- Walls -->
      <rect x="70" y="55" width="85" height="55" fill="var(--paper)" stroke="var(--ink)" stroke-width="3" />
      <rect x="100" y="75" width="22" height="35" fill="var(--soil)" stroke="var(--ink)" stroke-width="2.5" />
      <rect x="78" y="68" width="14" height="14" fill="var(--monsoon)" stroke="var(--ink)" stroke-width="2" />
      <!-- Thatched Roof -->
      <polygon points="60,56 112,18 165,56" fill="var(--turmeric)" stroke="var(--ink)" stroke-width="3.5" />
      <line x1="112" y1="18" x2="80" y2="56" stroke="var(--ink)" stroke-width="2" />
      <line x1="112" y1="18" x2="145" y2="56" stroke="var(--ink)" stroke-width="2" />

      <!-- Tree -->
      <path d="M 38 110 Q 30 70 42 45 Q 20 20 40 -5 Q 75 10 70 45 Q 60 75 48 110 Z" fill="var(--soil)" stroke="var(--ink)" stroke-width="3" />
      <!-- Foliage Canopy -->
      <circle cx="28" cy="22" r="28" fill="var(--paddy)" stroke="var(--ink)" stroke-width="3" />
      <circle cx="56" cy="14" r="32" fill="var(--paddy)" stroke="var(--ink)" stroke-width="3" />
      <circle cx="44" cy="-8" r="26" fill="color-mix(in srgb, var(--paddy) 85%, var(--turmeric))" stroke="var(--ink)" stroke-width="3" />
    </g>

    <!-- Main Terraced Farmland Field Floor -->
    <path 
      d="M 0 310 Q 420 280 900 305 L 900 520 L 0 520 Z" 
      fill="var(--scene-soil)" 
      stroke="var(--ink)" 
      stroke-width="4" 
    />

    <!-- Dynamic Drought Cracks on Soil -->
    {#if isDrought}
      <rect x="0" y="315" width="900" height="205" fill="url(#cracked-earth)" opacity="0.85" />
    {/if}

    <!-- Dynamic Erosion Gully Cut if high erosion -->
    {#if isEroded}
      <path 
        d="M 50 330 Q 120 380 90 440 Q 140 480 110 520 L 70 520 Q 95 470 60 430 Q 80 370 30 330 Z" 
        fill="color-mix(in srgb, var(--chili) 30%, var(--soil))" 
        stroke="var(--ink)" 
        stroke-width="3" 
      />
    {/if}

    <!-- Crop Rows with animated sway -->
    <!-- Row 1 (Back) -->
    <g class="crop-row row-back" transform="translate(0, 315)">
      {#each Array(16) as _, i}
        {@const x = 35 + i * 54}
        <g transform="translate({x}, 0)">
          <!-- Shoot -->
          <line x1="0" y1="0" x2="0" y2="-28" stroke="var(--ink)" stroke-width="2.5" />
          {#if isHealthy}
            <path d="M 0 -28 C -8 -36 -10 -46 0 -50 C 10 -46 8 -36 0 -28 Z" fill="var(--paddy)" stroke="var(--ink)" stroke-width="2" />
          {:else if isDrought}
            <path d="M 0 -28 C -4 -34 -2 -40 6 -42" stroke="var(--turmeric)" stroke-width="2.5" fill="none" />
          {:else}
            <circle cx="0" cy="-30" r="5" fill="var(--turmeric)" stroke="var(--ink)" stroke-width="2" />
          {/if}
        </g>
      {/each}
    </g>

    <!-- Row 2 (Middle) -->
    <g class="crop-row row-mid" transform="translate(0, 365)">
      {#each Array(14) as _, i}
        {@const x = 50 + i * 62}
        <g transform="translate({x}, 0)">
          <line x1="0" y1="0" x2="0" y2="-38" stroke="var(--ink)" stroke-width="3" />
          {#if isHealthy}
            <path d="M 0 -38 C -12 -48 -14 -60 0 -66 C 14 -60 12 -48 0 -38 Z" fill="var(--paddy)" stroke="var(--ink)" stroke-width="2" />
            <circle cx="-6" cy="-52" r="3" fill="var(--turmeric)" />
            <circle cx="6" cy="-52" r="3" fill="var(--turmeric)" />
          {:else if isDrought}
            <path d="M 0 -38 C -6 -46 -2 -54 10 -56" stroke="var(--soil)" stroke-width="3" fill="none" />
          {:else}
            <path d="M 0 -38 C -8 -45 0 -52 0 -56 C 8 -45 0 -38 0 -38 Z" fill="var(--paddy)" stroke="var(--ink)" stroke-width="2" />
          {/if}
        </g>
      {/each}
    </g>

    <!-- Row 3 (Foreground Cutaway showing roots) -->
    <g class="crop-row row-front" transform="translate(0, 430)">
      <!-- Soil underground strata line -->
      <line x1="0" y1="0" x2="900" y2="0" stroke="var(--ink)" stroke-width="3" stroke-dasharray="6 4" />
      
      {#each Array(11) as _, i}
        {@const x = 70 + i * 78}
        <g transform="translate({x}, 0)">
          <!-- Top stalk -->
          <line x1="0" y1="0" x2="0" y2="-48" stroke="var(--ink)" stroke-width="3.5" />
          <path d="M 0 -48 C -15 -62 -18 -78 0 -86 C 18 -78 15 -62 0 -48 Z" fill="{isHealthy ? 'var(--paddy)' : 'var(--turmeric)'}" stroke="var(--ink)" stroke-width="2.5" />
          
          <!-- Root System penetrating soil strata (SMAP Root Wetness indicator) -->
          <path 
            d="M 0 0 Q -8 24 -16 48 M 0 0 Q 6 30 14 54 M -4 18 Q -16 32 -22 42" 
            stroke="var(--paper)" 
            stroke-width="2" 
            fill="none" 
            opacity="{meters.soilMoisture > 40 ? 0.95 : 0.45}" 
          />
        </g>
      {/each}
    </g>

    <!-- Vintage Engraving Vignette Border -->
    <rect x="4" y="4" width="892" height="512" fill="none" stroke="var(--ink)" stroke-width="5" rx="14" />
  </svg>

  <!-- Canvas 2D Particle Overlay -->
  <canvas bind:this={canvasEl} class="particle-canvas" aria-hidden="true"></canvas>

  <!-- Weather & Era Floating Stamp in Scene -->
  <div class="scene-overlay-badge font-display">
    <span class="era-year">ERA {era.year}</span>
    <span class="weather-indicator font-data">
      {#if weatherCondition === 'rain'}
        🌧️ MONSOON ACTIVE
      {:else if isDrought}
        ☀️ HEAT ANOMALY (+{era.tempAnomaly}°C)
      {:else}
        🌾 HEALTHY CANOPY
      {/if}
    </span>
  </div>
</div>

<style>
  .farm-scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 340px;
    background-color: var(--scene-sky);
    border: var(--outline);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .farm-svg {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .particle-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }

  .crop-row {
    transition: transform var(--slow) var(--spring);
  }

  .scene-overlay-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    background-color: var(--paper);
    border: var(--outline-thin);
    border-radius: var(--radius-sm);
    padding: 6px 12px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    z-index: 12;
  }

  .era-year {
    font-size: 0.95rem;
    color: var(--ink);
  }

  .weather-indicator {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--soil);
  }

  /* Gentle wind sway animation */
  @keyframes wind-sway {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(2.5deg); }
  }

  .row-mid {
    animation: wind-sway 4s ease-in-out infinite;
    transform-origin: bottom center;
  }
</style>
