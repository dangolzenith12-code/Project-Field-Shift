<script lang="ts">
  import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';
  import type { PlayerState, InteractiveEntity, DialogueNode, DialogueChoice } from './types';
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';
  import { 
    INITIAL_PLAYER_POSITION, 
    COLLISION_OBSTACLES, 
    INTERACTIVE_ENTITIES, 
    DIALOGUE_NODES,
    WORLD_WIDTH, 
    WORLD_HEIGHT 
  } from './mapData';
  import { REGIONS } from '../../data/mockData';
  import { sfx } from '../../utils/sound';
  import GbaCanvas from './GbaCanvas.svelte';
  import GbaDialogBox from './GbaDialogBox.svelte';
  import GbaHud from './GbaHud.svelte';
  import GbaControls from './GbaControls.svelte';
  import SowingTimingGame from '../game/SowingTimingGame.svelte';
  import TubewellPumpGame from '../game/TubewellPumpGame.svelte';
  import SluiceRunoffGame from '../game/SluiceRunoffGame.svelte';
  import HeatwaveShieldGame from '../game/HeatwaveShieldGame.svelte';
  import AmmaMatchMission from '../game/AmmaMatchMission.svelte';
  import BanyanBlankMission from '../game/BanyanBlankMission.svelte';
  import AmericaPhoneMission from '../game/AmericaPhoneMission.svelte';
  import KenyaVideoMission from '../game/KenyaVideoMission.svelte';

  interface Props {
    currentRegion: RegionInfo;
    currentEra: EraInfo;
    meters: FarmMeters;
    currentSeasonName: string;
    weatherCondition: 'normal' | 'rain' | 'dry' | 'harvest';
    onOpenCompare: () => void;
    onOpenNasa: () => void;
    onOpenRegionSelect: () => void;
    onOpenStyleguide: () => void;
    onAdvanceSeason: () => void;
    onBackToStory?: () => void;
    onBackToIntro?: () => void;
    onSelectRegion?: (region: RegionInfo) => void;
  }

  let { 
    currentRegion, 
    currentEra, 
    meters, 
    currentSeasonName, 
    weatherCondition,
    onOpenCompare,
    onOpenNasa,
    onOpenRegionSelect,
    onOpenStyleguide,
    onAdvanceSeason,
    onBackToStory,
    onBackToIntro,
    onSelectRegion
  }: Props = $props();

  // Player State
  let player = $state<PlayerState>({
    x: INITIAL_PLAYER_POSITION.x,
    y: INITIAL_PLAYER_POSITION.y,
    width: 22,
    height: 24,
    speed: 3.2,
    direction: INITIAL_PLAYER_POSITION.direction,
    isMoving: false,
    frame: 0
  });

  // Active Interactive Entity near player
  let activeEntity = $state<InteractiveEntity | null>(null);

  // Active Dialogue State
  let activeDialogue = $state<DialogueNode | null>(null);
  let dialogBoxRef = $state<any>(null);

  // 4 Overworld Mini-Missions
  let activeMission = $state<'amma_match' | 'banyan_blank' | 'america_phone' | 'kenya_video' | null>(null);
  let completedMissions = $state<Set<string>>(new Set());

  // Arcade Mini-Games
  let activeMiniGame = $state<'sowing' | 'tubewell' | 'sluice' | 'heatwave' | null>(null);

  // In-Game GBA Pause Menu State
  let isMenuOpen = $state(false);

  // Keyboard inputs
  const keysDown = new Set<string>();
  let isSprinting = $state(false);

  // Virtual controller held direction
  let virtualDir = $state<'up' | 'down' | 'left' | 'right' | null>(null);

  // Game loop ticker
  let loopId: number;
  let stepTimer = 0;

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initial check for active entity
    checkProximity();

    // Start movement physics loop
    const gameLoop = () => {
      updateMovement();
      loopId = requestAnimationFrame(gameLoop);
    };
    loopId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(loopId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Collision detection function
  function checkCollision(newX: number, newY: number): boolean {
    const pBox = {
      x: newX - 10,
      y: newY + 2,
      width: 20,
      height: 14
    };

    // Check world boundaries
    if (newX < 24 || newX > WORLD_WIDTH - 24 || newY < 30 || newY > WORLD_HEIGHT - 30) {
      return true;
    }

    // Check static obstacles
    for (const obs of COLLISION_OBSTACLES) {
      if (
        pBox.x < obs.x + obs.width &&
        pBox.x + pBox.width > obs.x &&
        pBox.y < obs.y + obs.height &&
        pBox.y + pBox.height > obs.y
      ) {
        return true;
      }
    }
    return false;
  }

  // Update Player Movement
  function updateMovement() {
    if (activeDialogue || isMenuOpen || activeMission || activeMiniGame) {
      player.isMoving = false;
      return;
    }

    let dx = 0;
    let dy = 0;

    // Read keyboard
    if (keysDown.has('ArrowUp') || keysDown.has('KeyW') || virtualDir === 'up') {
      dy -= 1;
      player.direction = 'up';
    }
    if (keysDown.has('ArrowDown') || keysDown.has('KeyS') || virtualDir === 'down') {
      dy += 1;
      player.direction = 'down';
    }
    if (keysDown.has('ArrowLeft') || keysDown.has('KeyA') || virtualDir === 'left') {
      dx -= 1;
      player.direction = 'left';
    }
    if (keysDown.has('ArrowRight') || keysDown.has('KeyD') || virtualDir === 'right') {
      dx += 1;
      player.direction = 'right';
    }

    const isMoving = dx !== 0 || dy !== 0;
    player.isMoving = isMoving;

    if (isMoving) {
      const currentSpeed = isSprinting ? player.speed * 1.55 : player.speed;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const nextX = player.x + dx * currentSpeed;
      const nextY = player.y + dy * currentSpeed;

      if (!checkCollision(nextX, player.y)) {
        player.x = nextX;
      }
      if (!checkCollision(player.x, nextY)) {
        player.y = nextY;
      }

      stepTimer++;
      if (stepTimer % 8 === 0) {
        player.frame = (player.frame + 1) % 3;
      }

      checkProximity();
    } else {
      player.frame = 0;
    }
  }

  // Check proximity to interactive ground entities
  function checkProximity() {
    let closestEnt: InteractiveEntity | null = null;
    let closestEntDist = Infinity;

    for (const ent of INTERACTIVE_ENTITIES) {
      const dist = Math.hypot(player.x - ent.x, player.y - ent.y);
      if (dist <= ent.interactionRadius && dist < closestEntDist) {
        closestEnt = ent;
        closestEntDist = dist;
      }
    }
    activeEntity = closestEnt;
  }

  // Keyboard Event Handlers
  function handleKeyDown(e: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    keysDown.add(e.code);

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') {
      isSprinting = true;
    }

    // Action Key (Space, Enter, E)
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
      handleActionA();
    }

    // Back / Cancel Key (KeyB)
    if (e.code === 'KeyB') {
      handleActionB();
    }

    // Menu Key (Escape, M)
    if (e.code === 'Escape' || e.code === 'KeyM') {
      if (activeMission) {
        activeMission = null;
      } else if (activeMiniGame) {
        activeMiniGame = null;
      } else if (activeDialogue) {
        activeDialogue = null;
      } else {
        toggleMenu();
      }
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    keysDown.delete(e.code);
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') {
      isSprinting = false;
    }
  }

  // Action Button [A] Trigger (Interact or Advance Dialogue)
  function handleActionA() {
    if (isMenuOpen || activeMission || activeMiniGame) return;

    if (activeDialogue) {
      dialogBoxRef?.handleActionPress();
      return;
    }

    if (activeEntity) {
      startDialogue(activeEntity.dialogueId);
    }
  }

  // Action Button [B] Trigger (Sprint or Cancel/Back)
  function handleActionB() {
    if (activeMission) {
      activeMission = null;
    } else if (activeMiniGame) {
      activeMiniGame = null;
    } else if (activeDialogue) {
      activeDialogue = null;
    } else if (isMenuOpen) {
      isMenuOpen = false;
    } else if (onBackToStory) {
      onBackToStory();
    }
  }

  // Start Dialogue by ID
  function startDialogue(dialogueId: string) {
    const node = DIALOGUE_NODES[dialogueId];
    if (node) {
      activeDialogue = node;
    }
  }

  // Handle Dialogue Choice Selection
  function handleDialogueChoice(choice: DialogueChoice) {
    if (choice.nextDialogueId) {
      startDialogue(choice.nextDialogueId);
    } else if (choice.action === 'play_amma_match') {
      activeDialogue = null;
      activeMission = 'amma_match';
    } else if (choice.action === 'play_banyan_blank') {
      activeDialogue = null;
      activeMission = 'banyan_blank';
    } else if (choice.action === 'play_america_phone') {
      activeDialogue = null;
      activeMission = 'america_phone';
    } else if (choice.action === 'play_kenya_video') {
      activeDialogue = null;
      activeMission = 'kenya_video';
    } else if (choice.action === 'play_sowing') {
      activeDialogue = null;
      activeMiniGame = 'sowing';
    } else if (choice.action === 'play_tubewell') {
      activeDialogue = null;
      activeMiniGame = 'tubewell';
    } else if (choice.action === 'play_sluice') {
      activeDialogue = null;
      activeMiniGame = 'sluice';
    } else if (choice.action === 'play_heatwave') {
      activeDialogue = null;
      activeMiniGame = 'heatwave';
    } else if (choice.action === 'open_compare') {
      activeDialogue = null;
      onOpenCompare();
    } else if (choice.action === 'open_nasa') {
      activeDialogue = null;
      onOpenNasa();
    } else if (choice.action === 'advance_season') {
      activeDialogue = null;
      onAdvanceSeason();
    } else {
      activeDialogue = null;
    }
  }

  // Complete one of the 4 Overworld Mini-Missions
  function handleMissionComplete(missionId: 'amma_match' | 'banyan_blank' | 'america_phone' | 'kenya_video') {
    if (missionId === 'amma_match') {
      meters.organicMatter = Math.min(100, meters.organicMatter + 20);
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 15);
      meters.income += 50;
    } else if (missionId === 'banyan_blank') {
      meters.organicMatter = Math.min(100, meters.organicMatter + 25);
      meters.waterUse = Math.max(80, meters.waterUse - 45);
      meters.income += 40;
    } else if (missionId === 'america_phone') {
      meters.erosionRisk = Math.max(5, meters.erosionRisk - 20);
      meters.income += 30;
    } else if (missionId === 'kenya_video') {
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 20);
      meters.income += 40;
    }

    completedMissions.add(missionId);
    sfx.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 }
      });
    } catch {}
    activeMission = null;
  }

  // Complete an Arcade Mini-Game Drill
  function handleMiniGameComplete(type: 'sowing' | 'tubewell' | 'sluice' | 'heatwave') {
    if (type === 'sowing') {
      meters.organicMatter = Math.min(100, meters.organicMatter + 10);
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 15);
    } else if (type === 'tubewell') {
      meters.waterUse = Math.max(100, meters.waterUse - 50);
      meters.income += 30;
    } else if (type === 'sluice') {
      meters.erosionRisk = Math.max(5, meters.erosionRisk - 15);
      meters.organicMatter = Math.min(100, meters.organicMatter + 12);
    } else if (type === 'heatwave') {
      meters.soilMoisture = Math.max(25, meters.soilMoisture - 5);
      meters.income += 40;
    }
    activeMiniGame = null;
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<div class="gba-world-container">
  <!-- Top GBA Status HUD with Back Button and Quick Regional Travel -->
  <GbaHud 
    {meters} 
    era={currentEra} 
    region={currentRegion} 
    seasonName={currentSeasonName}
    onOpenMenu={toggleMenu}
    onOpenCompare={onOpenCompare}
    onOpenRegionSelect={onOpenRegionSelect}
    {onBackToStory}
    {onBackToIntro}
    {onSelectRegion}
  />

  <!-- Main Game Stage -->
  <div class="game-stage">
    <!-- Canvas Top-Down World Viewport with High-DPI & Biomes -->
    <GbaCanvas 
      {player} 
      {activeEntity} 
      {currentRegion}
      {weatherCondition}
      soilMoisture={meters.soilMoisture}
      {meters}
      onInteract={(ent) => startDialogue(ent.dialogueId)} 
    />

    <!-- Overlaid Floating GBA Dialogue Box at Bottom -->
    {#if activeDialogue}
      <div class="dialogue-overlay-container">
        <GbaDialogBox 
          bind:this={dialogBoxRef}
          dialogue={activeDialogue}
          onSelectChoice={handleDialogueChoice}
          onClose={() => activeDialogue = null}
        />
      </div>
    {/if}

    <!-- OVERWORLD MISSION 1: Amma's Heirloom Seed Matching Matrix -->
    {#if activeMission === 'amma_match'}
      <AmmaMatchMission 
        onComplete={() => handleMissionComplete('amma_match')}
        onClose={() => activeMission = null}
      />
    {/if}

    <!-- OVERWORLD MISSION 2: Banyan Tree Fill-in-the-Blanks 3-Crop Charter -->
    {#if activeMission === 'banyan_blank'}
      <BanyanBlankMission 
        onComplete={() => handleMissionComplete('banyan_blank')}
        onClose={() => activeMission = null}
      />
    {/if}

    <!-- OVERWORLD MISSION 3: Transatlantic Satellite Phone Call from Iowa -->
    {#if activeMission === 'america_phone'}
      <AmericaPhoneMission 
        onComplete={() => handleMissionComplete('america_phone')}
        onClose={() => activeMission = null}
      />
    {/if}

    <!-- OVERWORLD MISSION 4: Kenya Heat Dome & Zaï Pit YouTube Video -->
    {#if activeMission === 'kenya_video'}
      <KenyaVideoMission 
        onComplete={() => handleMissionComplete('kenya_video')}
        onClose={() => activeMission = null}
      />
    {/if}

    <!-- Interactive Arcade Mini-Game Simulation Drills -->
    {#if activeMiniGame}
      <div class="mini-game-stage-backdrop">
        <div class="mini-game-modal-box">
          <div class="mini-game-top-bar font-pixel">
            <span>[◆ ACTIVE SIMULATION MINI-GAME]</span>
            <button class="exit-game-btn font-pixel" onclick={() => activeMiniGame = null}>
              [✕ CLOSE / RETURN]
            </button>
          </div>

          <div class="mini-game-content-viewport">
            {#if activeMiniGame === 'sowing'}
              <SowingTimingGame onComplete={() => handleMiniGameComplete('sowing')} />
            {:else if activeMiniGame === 'tubewell'}
              <TubewellPumpGame onComplete={() => handleMiniGameComplete('tubewell')} />
            {:else if activeMiniGame === 'sluice'}
              <SluiceRunoffGame onComplete={() => handleMiniGameComplete('sluice')} />
            {:else if activeMiniGame === 'heatwave'}
              <HeatwaveShieldGame onComplete={() => handleMiniGameComplete('heatwave')} />
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <!-- GBA In-Game Pause Menu with Back Options -->
    {#if isMenuOpen}
      <div class="pause-menu-backdrop" onclick={toggleMenu} role="presentation">
        <div 
          class="gba-pause-menu sticker-card no-tape" 
          role="dialog" 
          tabindex="-1"
          onclick={(e) => e.stopPropagation()} 
          onkeydown={(e) => e.stopPropagation()}
        >
          <div class="menu-title font-pixel">◆ FARM OVERWORLD ALMANAC ◆</div>
          <div class="menu-options font-pixel">
            {#if onBackToStory}
              <button class="menu-item back-option" onclick={() => { isMenuOpen = false; onBackToStory(); }}>
                <span class="bullet">◀</span>
                <span>[← BACK] Return to Hari's Main Story Campaign</span>
              </button>
            {/if}

            {#if onBackToIntro}
              <button class="menu-item back-option" onclick={() => { isMenuOpen = false; onBackToIntro(); }}>
                <span class="bullet">◀</span>
                <span>[← BACK] Return to Title / Intro Screen</span>
              </button>
            {/if}

            <div class="menu-divider font-pixel">--- 4 OVERWORLD MINI-MISSIONS ---</div>

            <button class="menu-item" onclick={() => { isMenuOpen = false; activeMission = 'amma_match'; }}>
              <span class="bullet">🌾</span>
              <span>[M1] Amma's Heirloom Matching Matrix</span>
              {#if completedMissions.has('amma_match')}<span class="done-tag">✓</span>{/if}
            </button>

            <button class="menu-item" onclick={() => { isMenuOpen = false; activeMission = 'banyan_blank'; }}>
              <span class="bullet">🌳</span>
              <span>[M2] Banyan 3-Crop Rotation Charter</span>
              {#if completedMissions.has('banyan_blank')}<span class="done-tag">✓</span>{/if}
            </button>

            <button class="menu-item" onclick={() => { isMenuOpen = false; activeMission = 'america_phone'; }}>
              <span class="bullet">📞</span>
              <span>[M3] Iowa Transatlantic Satellite Call</span>
              {#if completedMissions.has('america_phone')}<span class="done-tag">✓</span>{/if}
            </button>

            <button class="menu-item" onclick={() => { isMenuOpen = false; activeMission = 'kenya_video'; }}>
              <span class="bullet">▶️</span>
              <span>[M4] Kenya Sahel Heat Dome Video</span>
              {#if completedMissions.has('kenya_video')}<span class="done-tag">✓</span>{/if}
            </button>

            <div class="menu-divider font-pixel">--- REGIONAL FAST TRAVEL ---</div>

            <button class="menu-item" onclick={() => { isMenuOpen = false; onSelectRegion?.(REGIONS.punjab); }}>
              <span class="bullet">🗺️</span>
              <span>Punjab Plain (Emerald Alluvial & Wheat)</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onSelectRegion?.(REGIONS.iowa); }}>
              <span class="bullet">🗺️</span>
              <span>Corn Belt, Iowa (Dark Mollisol Prairie & Silo)</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onSelectRegion?.(REGIONS.karnataka); }}>
              <span class="bullet">🗺️</span>
              <span>Deccan Plateau (Red Laterite & Golden Millets)</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onSelectRegion?.(REGIONS.sahel); }}>
              <span class="bullet">🗺️</span>
              <span>Sahel Fringe (Golden Dunes & Drought Acacia)</span>
            </button>

            <div class="menu-divider font-pixel">--- ARCADE DRILLS & TOOLS ---</div>

            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenCompare(); }}>
              <span class="bullet">▶</span>
              <span>[◆] 3-Crop Rotation Compare Matrix</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenNasa(); }}>
              <span class="bullet">▶</span>
              <span>[▲] NASA Earth Science Telemetry</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; activeMiniGame = 'sowing'; }}>
              <span class="bullet">▶</span>
              <span>[◆] Mini-Game: SMAP Precision Sowing</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; activeMiniGame = 'tubewell'; }}>
              <span class="bullet">▶</span>
              <span>[◆] Mini-Game: GRACE Tubewell Balancer</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; activeMiniGame = 'sluice'; }}>
              <span class="bullet">▶</span>
              <span>[◆] Mini-Game: GPM Iowa Sluice Shield</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; activeMiniGame = 'heatwave'; }}>
              <span class="bullet">▶</span>
              <span>[◆] Mini-Game: MERRA-2 Sahel Heatwave Shield</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onAdvanceSeason(); }}>
              <span class="bullet">▶</span>
              <span>[|||] Advance Season ({currentSeasonName})</span>
            </button>
            <button class="menu-item close" onclick={toggleMenu}>
              <span class="bullet">✕</span>
              <span>Resume Game</span>
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- On-Screen GBA Virtual Gamepad Deck -->
  <GbaControls 
    onDirectionStart={(dir) => virtualDir = dir}
    onDirectionEnd={() => virtualDir = null}
    onActionA={handleActionA}
    onActionB={handleActionB}
    onStart={toggleMenu}
  />
</div>

<style>
  .gba-world-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-width: 860px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-2);
  }

  .game-stage {
    position: relative;
    width: 100%;
    user-select: none;
  }

  .dialogue-overlay-container {
    position: absolute;
    bottom: 14px;
    left: 14px;
    right: 14px;
    z-index: 100;
    pointer-events: auto;
  }

  /* Mini-Game Stage Modal */
  .mini-game-stage-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(6, 14, 10, 0.9);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 16px;
  }

  .mini-game-modal-box {
    background-color: #0E1A11;
    border: 3px solid #00FF66;
    border-radius: 8px;
    box-shadow: 0 0 25px rgba(0, 255, 102, 0.35);
    max-width: 680px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .mini-game-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background-color: #081109;
    border-bottom: 2px solid #00FF66;
    color: #00FF66;
    font-size: 0.78rem;
  }

  .exit-game-btn {
    background-color: #2E1515;
    color: #FF5A5A;
    border: 1px solid #FF5A5A;
    padding: 4px 8px;
    font-size: 0.68rem;
    cursor: pointer;
  }

  .exit-game-btn:hover {
    background-color: #FF5A5A;
    color: #000;
  }

  .mini-game-content-viewport {
    padding: 16px;
    overflow-y: auto;
  }

  /* Pause Menu Backdrop */
  .pause-menu-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(5, 10, 6, 0.75);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 40;
  }

  .gba-pause-menu {
    background-color: #0E1A11;
    border: 3px solid #00FF66;
    border-radius: 6px;
    box-shadow: 0 0 15px rgba(0, 255, 102, 0.35);
    padding: 16px 20px;
    min-width: 320px;
    max-width: 440px;
  }

  .menu-title {
    font-size: 0.85rem;
    color: #FFB703;
    text-align: center;
    border-bottom: 2px solid #1F3824;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .menu-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #142417;
    border: 1px solid #28472E;
    color: #e5f5eb;
    padding: 8px 12px;
    font-size: 0.72rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .menu-item:hover {
    background-color: #00FF66;
    color: #000000;
    border-color: #000000;
    transform: translateX(4px);
  }

  .back-option {
    background: #2a1414;
    border-color: #8c3838;
    color: #ff9e9e;
    font-weight: bold;
  }

  .back-option:hover {
    background: #e63946;
    color: #ffffff;
    border-color: #ffffff;
  }

  .done-tag {
    margin-left: auto;
    font-size: 0.7rem;
    color: #00FF66;
    font-weight: bold;
  }

  .menu-divider {
    font-size: 0.6rem;
    color: #688a72;
    text-align: center;
    margin: 4px 0 2px 0;
  }

  .menu-item.close {
    margin-top: 6px;
    background-color: #2E1515;
    border-color: #5A2A2A;
    color: #FF8585;
  }

  .menu-item.close:hover {
    background-color: #FF5A5A;
    color: #000;
  }

  .bullet {
    font-size: 0.65rem;
  }
</style>
