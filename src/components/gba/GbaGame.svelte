<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
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
  import GbaCanvas from './GbaCanvas.svelte';
  import GbaDialogBox from './GbaDialogBox.svelte';
  import GbaHud from './GbaHud.svelte';
  import GbaControls from './GbaControls.svelte';

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
    onAdvanceSeason 
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
    if (activeDialogue || isMenuOpen) {
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
      // Sprint multiplier
      const currentSpeed = isSprinting ? player.speed * 1.55 : player.speed;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const nextX = player.x + dx * currentSpeed;
      const nextY = player.y + dy * currentSpeed;

      // Independent X and Y collision check (sliding along walls)
      if (!checkCollision(nextX, player.y)) {
        player.x = nextX;
      }
      if (!checkCollision(player.x, nextY)) {
        player.y = nextY;
      }

      // Step frame cycling
      stepTimer++;
      if (stepTimer % 8 === 0) {
        player.frame = (player.frame + 1) % 3;
      }

      // Check proximity to interactive entities
      checkProximity();
    } else {
      player.frame = 0;
    }
  }

  // Check proximity to interactive entities
  function checkProximity() {
    let closest: InteractiveEntity | null = null;
    let closestDist = Infinity;

    for (const ent of INTERACTIVE_ENTITIES) {
      const dist = Math.hypot(player.x - ent.x, player.y - ent.y);
      if (dist <= ent.interactionRadius && dist < closestDist) {
        closest = ent;
        closestDist = dist;
      }
    }

    activeEntity = closest;
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

    // Menu Key (Escape, M)
    if (e.code === 'Escape' || e.code === 'KeyM') {
      toggleMenu();
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
    if (isMenuOpen) return;

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
    if (activeDialogue) {
      activeDialogue = null;
    } else if (isMenuOpen) {
      isMenuOpen = false;
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

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<div class="gba-world-container">
  <!-- Top GBA Status HUD -->
  <GbaHud 
    {meters} 
    era={currentEra} 
    region={currentRegion} 
    seasonName={currentSeasonName}
    onOpenMenu={toggleMenu}
    onOpenCompare={onOpenCompare}
  />

  <!-- Main Game Stage -->
  <div class="game-stage">
    <!-- Canvas Top-Down World Viewport -->
    <GbaCanvas 
      {player} 
      {activeEntity} 
      {weatherCondition}
      soilMoisture={meters.soilMoisture}
      {meters}
      onInteract={(ent) => startDialogue(ent.dialogueId)} 
    />

    <!-- Overlaid Classic GBA Dialogue Box at Bottom -->
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

    <!-- GBA In-Game Pause Menu -->
    {#if isMenuOpen}
      <div class="pause-menu-backdrop" onclick={toggleMenu} role="presentation">
        <div 
          class="gba-pause-menu sticker-card no-tape" 
          role="dialog" 
          tabindex="-1"
          onclick={(e) => e.stopPropagation()} 
          onkeydown={(e) => e.stopPropagation()}
        >
          <div class="menu-title font-display">🌱 FARM ALMANAC MENU</div>
          <div class="menu-options font-body">
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenCompare(); }}>
              <span class="bullet">▶</span>
              <span>🌾 3-Crop Rotation Compare Matrix</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenNasa(); }}>
              <span class="bullet">▶</span>
              <span>🛰️ NASA Earth Science Logbook</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenRegionSelect(); }}>
              <span class="bullet">▶</span>
              <span>🗺️ Switch Region (Punjab, Iowa, Sahel, Deccan)</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onAdvanceSeason(); }}>
              <span class="bullet">▶</span>
              <span>⏭️ Advance Season ({currentSeasonName})</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenStyleguide(); }}>
              <span class="bullet">▶</span>
              <span>🎨 Design System Styleguide</span>
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
    display: flex;
    flex-direction: column;
  }

  .dialogue-overlay-container {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    z-index: 100;
  }

  /* GBA In-Game Pause Menu */
  .pause-menu-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(43, 27, 18, 0.65);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fade-in 150ms ease forwards;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .gba-pause-menu {
    width: 380px;
    max-width: 90%;
    background-color: var(--paper);
    border: 3.5px solid var(--ink);
    border-radius: var(--radius);
    padding: var(--space-4);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .menu-title {
    font-size: 1.25rem;
    color: var(--ink);
    border-bottom: 2px solid var(--ink);
    padding-bottom: 4px;
    text-align: center;
  }

  .menu-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .menu-item {
    background: none;
    border: 1.5px solid transparent;
    padding: 8px 12px;
    text-align: left;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color var(--fast) ease;
  }

  .menu-item:hover {
    background-color: color-mix(in srgb, var(--turmeric) 45%, var(--paper));
    border-color: var(--ink);
  }

  .menu-item.close {
    margin-top: 6px;
    border-top: 1.5px dashed var(--ink);
    color: var(--soil);
  }

  .bullet {
    color: var(--soil);
  }
</style>
