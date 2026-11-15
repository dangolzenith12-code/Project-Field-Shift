<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import confetti from 'canvas-confetti';
  import type { PlayerState, InteractiveEntity, DialogueNode, DialogueChoice, EquippedTool, TimeOfDay } from './types';
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';
  import { 
    INITIAL_PLAYER_POSITION, 
    COLLISION_OBSTACLES, 
    INTERACTIVE_ENTITIES, 
    DIALOGUE_NODES,
    WORLD_WIDTH, 
    WORLD_HEIGHT 
  } from './mapData';
  import { sfx } from '../../utils/sound';
  import GbaCanvas from './GbaCanvas.svelte';
  import GbaDialogBox from './GbaDialogBox.svelte';
  import GbaHud from './GbaHud.svelte';
  import GbaControls from './GbaControls.svelte';
  import BackpackModal from '../common/BackpackModal.svelte';
  import AmmaMatchMission from '../game/AmmaMatchMission.svelte';
  import BanyanBlankMission from '../game/BanyanBlankMission.svelte';
  import AmericaPhoneMission from '../game/AmericaPhoneMission.svelte';
  import KenyaVideoMission from '../game/KenyaVideoMission.svelte';
  import SowingTimingGame from '../game/SowingTimingGame.svelte';
  import TubewellPumpGame from '../game/TubewellPumpGame.svelte';
  import SluiceRunoffGame from '../game/SluiceRunoffGame.svelte';
  import HeatwaveShieldGame from '../game/HeatwaveShieldGame.svelte';

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
    onOpenStory?: () => void;
    onReturnToStart?: () => void;
    onOpenJournal?: () => void;
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
    onOpenStory,
    onReturnToStart,
    onOpenJournal
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

  // In-Game Backpack Modal State
  let isBackpackOpen = $state(false);

  // 4 Overworld Mini-Missions
  let activeMission = $state<'amma_match' | 'banyan_blank' | 'america_phone' | 'kenya_video' | null>(null);
  let completedMissions = $state<Set<string>>(new Set());

  // Arcade Mini-Games
  let activeMiniGame = $state<'sowing' | 'tubewell' | 'sluice' | 'heatwave' | null>(null);

  // Equipped Tool & Atmosphere Systems
  let equippedTool = $state<EquippedTool>('seeds');
  let timeOfDay = $state<TimeOfDay>('noon');
  let showMiniMap = $state(true);
  let toolActionActive = $state<{ tool: EquippedTool; tick: number; x: number; y: number } | null>(null);

  // In-Game Modals
  let isProbeModalOpen = $state(false);
  let isTubewellModalOpen = $state(false);
  let tubewellRpm = $state(1450);

  // In-Game Feedback Toast
  let toastMessage = $state<string | null>(null);
  let toastTimer: any = null;

  function showToast(msg: string) {
    toastMessage = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage = null;
    }, 3200);
  }

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

    checkProximity();

    const gameLoop = () => {
      updateMovement();
      loopId = requestAnimationFrame(gameLoop);
    };
    loopId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(loopId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (toastTimer) clearTimeout(toastTimer);
    };
  });

  // Tool Cycling
  function cycleTool() {
    const tools: EquippedTool[] = ['seeds', 'water', 'probe', 'almanac'];
    const idx = tools.indexOf(equippedTool);
    equippedTool = tools[(idx + 1) % tools.length];
    sfx.playSelect();

    const labels: Record<EquippedTool, string> = {
      seeds: 'Seed Pouch (Mung Bean / Clover Cover)',
      water: 'AWD Irrigation Lota',
      probe: 'NASA SMAP Soil Probe',
      almanac: 'Crop Rotation Almanac'
    };
    showToast(`Equipped: ${labels[equippedTool]}`);
  }

  // Time of Day Lighting Cycling
  function cycleTimeOfDay() {
    const times: TimeOfDay[] = ['dawn', 'noon', 'sunset', 'night'];
    const idx = times.indexOf(timeOfDay);
    timeOfDay = times[(idx + 1) % times.length];
    sfx.playSelect();
  }

  // Check if player is standing on either field terrace
  function isPlayerOnField(): 'north' | 'south' | null {
    // North Plot: x: 140..380, y: 270..420
    if (player.x >= 140 && player.x <= 380 && player.y >= 270 && player.y <= 420) {
      return 'north';
    }
    // South Plot: x: 180..440, y: 520..670
    if (player.x >= 180 && player.x <= 440 && player.y >= 520 && player.y <= 670) {
      return 'south';
    }
    return null;
  }

  // Collision detection function
  function checkCollision(newX: number, newY: number): boolean {
    const pBox = {
      x: newX - 10,
      y: newY + 2,
      width: 20,
      height: 14
    };

    if (newX < 24 || newX > WORLD_WIDTH - 24 || newY < 30 || newY > WORLD_HEIGHT - 30) {
      return true;
    }

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
    if (activeDialogue || isMenuOpen || isProbeModalOpen || isTubewellModalOpen || isBackpackOpen || activeMission || activeMiniGame) {
      player.isMoving = false;
      return;
    }

    let dx = 0;
    let dy = 0;

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
      if (stepTimer % 20 === 0) {
        sfx.playStep();
      }
      if (stepTimer % 8 === 0) {
        player.frame = (player.frame + 1) % 3;
      }

      checkProximity();
    } else {
      player.frame = 0;
    }
  }

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

    // Tool Cycle Key (Q, Tab)
    if (e.code === 'KeyQ' || e.code === 'Tab') {
      e.preventDefault();
      cycleTool();
    }

    // Time of Day Cycle Key (T)
    if (e.code === 'KeyT') {
      e.preventDefault();
      cycleTimeOfDay();
    }

    // MiniMap Radar Toggle Key (M)
    if (e.code === 'KeyM') {
      e.preventDefault();
      showMiniMap = !showMiniMap;
      sfx.playSelect();
    }

    // Backpack Inventory Key (I or B)
    if (e.code === 'KeyI' || e.code === 'KeyB') {
      if (!activeDialogue && !activeMission && !activeMiniGame) {
        e.preventDefault();
        isBackpackOpen = !isBackpackOpen;
        sfx.playSelect();
      }
    }

    // Menu Key (Escape)
    if (e.code === 'Escape') {
      if (activeMission) {
        activeMission = null;
      } else if (activeMiniGame) {
        activeMiniGame = null;
      } else if (isBackpackOpen) {
        isBackpackOpen = false;
      } else if (isProbeModalOpen) {
        isProbeModalOpen = false;
      } else if (isTubewellModalOpen) {
        isTubewellModalOpen = false;
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

  // Action Button [A] Trigger
  function handleActionA() {
    if (isMenuOpen || isProbeModalOpen || isTubewellModalOpen) return;

    if (activeDialogue) {
      dialogBoxRef?.handleActionPress();
      return;
    }

    // If standing right next to an interactive entity, open dialogue
    if (activeEntity) {
      startDialogue(activeEntity.dialogueId);
      return;
    }

    // Otherwise, check if player is standing on a field terrace to use tool!
    const fieldLocation = isPlayerOnField();
    if (fieldLocation) {
      executeToolOnField(fieldLocation);
    }
  }

  // Execute equipped tool on field plot
  function executeToolOnField(plot: 'north' | 'south') {
    toolActionActive = {
      tool: equippedTool,
      tick: stepTimer,
      x: player.x,
      y: player.y
    };

    if (equippedTool === 'seeds') {
      sfx.playSow();
      meters.nitrogen = Math.min(100, meters.nitrogen + 4);
      meters.organicMatter = Math.min(100, meters.organicMatter + 2);
      showToast(`Sowed Legume Seeds on ${plot === 'north' ? 'North' : 'South'} Terrace! Nitrogen +4 kg/ha, SOM +2%`);
    } else if (equippedTool === 'water') {
      sfx.playWater();
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 8);
      showToast(`AWD Sluice Hydrated ${plot === 'north' ? 'North' : 'South'} Terrace! Moisture +8%`);
    } else if (equippedTool === 'probe') {
      sfx.playScan();
      isProbeModalOpen = true;
    } else if (equippedTool === 'almanac') {
      sfx.playSelect();
      onOpenCompare();
    }
  }

  // Action Button [B] Trigger
  function handleActionB() {
    if (isProbeModalOpen) {
      isProbeModalOpen = false;
    } else if (isTubewellModalOpen) {
      isTubewellModalOpen = false;
    } else if (activeDialogue) {
      activeDialogue = null;
    } else if (isMenuOpen) {
      isMenuOpen = false;
    }
  }

  function startDialogue(dialogueId: string) {
    const node = DIALOGUE_NODES[dialogueId];
    if (node) {
      activeDialogue = node;
    }
  }

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
    } else if (choice.action === 'calibrate_pump') {
      activeDialogue = null;
      isTubewellModalOpen = true;
      sfx.playSelect();
    } else if (choice.action === 'boost_som') {
      activeDialogue = null;
      meters.organicMatter = Math.min(100, meters.organicMatter + 6);
      sfx.playSuccess();
      showToast('Applied Sahiwal Compost! Soil Organic Matter +6%');
    } else {
      activeDialogue = null;
    }
  }

  // Complete one of the 4 Overworld Mini-Missions
  function handleMissionComplete(missionId: 'amma_match' | 'banyan_blank' | 'america_phone' | 'kenya_video') {
    completedMissions.add(missionId);
    if (missionId === 'amma_match') {
      meters.organicMatter = Math.min(100, meters.organicMatter + 20);
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 15);
      meters.income += 50;
      showToast('Mission 1 Conquered: Heirloom Seeds Matched! (+20% SOM, +50 Coins)');
    } else if (missionId === 'banyan_blank') {
      meters.organicMatter = Math.min(100, meters.organicMatter + 25);
      meters.waterUse = Math.max(80, meters.waterUse - 45);
      meters.income += 40;
      showToast('Mission 2 Conquered: 3-Crop Rotation Verified! (+25% SOM, −45mm Water)');
    } else if (missionId === 'america_phone') {
      meters.erosionRisk = Math.max(5, meters.erosionRisk - 20);
      meters.income += 30;
      showToast('Mission 3 Conquered: Iowa Swale Shield Deployed! (−20% Erosion Risk)');
    } else if (missionId === 'kenya_video') {
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 25);
      meters.organicMatter = Math.min(100, meters.organicMatter + 20);
      meters.income += 40;
      showToast('Mission 4 Conquered: Zaï Pit Bio-Shield Active! (+25% Moisture, +40 Coins)');
    }
    activeMission = null;
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {}
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  // Apply Tubewell Calibration
  function applyTubewellCalibration() {
    sfx.playValve();
    if (tubewellRpm > 1800) {
      sfx.playAlert();
      meters.income = Math.max(0, meters.income - 45); // Pump wear expense
      showToast('Warning: High RPM triggered sand suction! Minor impeller cavitation pitting.');
    } else {
      sfx.playSuccess();
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 10);
      showToast('Optimal AWD pump calibration applied! Water pumped without aquifer cavitation.');
    }
    isTubewellModalOpen = false;
  }
</script>

<div class="gba-world-container">
  <!-- Top GBA Status HUD -->
  <GbaHud 
    {meters} 
    era={currentEra} 
    region={currentRegion} 
    seasonName={currentSeasonName}
    {timeOfDay}
    {equippedTool}
    onToggleTimeOfDay={cycleTimeOfDay}
    onCycleTool={cycleTool}
    onOpenMenu={toggleMenu}
    onOpenCompare={onOpenCompare}
    onOpenBackpack={() => isBackpackOpen = true}
  />

  <!-- Main Game Stage -->
  <div class="game-stage">
    <!-- In-Game Toast Alert -->
    {#if toastMessage}
      <div class="overworld-toast font-data" role="status">
        <span class="toast-dot">●</span>
        <span>{toastMessage}</span>
      </div>
    {/if}

    <!-- Canvas Top-Down World Viewport -->
    <GbaCanvas 
      {player} 
      {activeEntity} 
      {weatherCondition}
      soilMoisture={meters.soilMoisture}
      {meters}
      {equippedTool}
      {timeOfDay}
      {showMiniMap}
      {toolActionActive}
      regionId={currentRegion.id}
      onInteract={(ent) => startDialogue(ent.dialogueId)} 
      onCycleTool={cycleTool}
      onToggleMiniMap={() => showMiniMap = !showMiniMap}
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

    <!-- Interactive NASA SMAP Soil Core Modal -->
    {#if isProbeModalOpen}
      <div class="pause-menu-backdrop" onclick={() => isProbeModalOpen = false} role="presentation">
        <div 
          class="soil-probe-modal sticker-card no-tape" 
          role="dialog" 
          tabindex="-1"
          onclick={(e) => e.stopPropagation()} 
          onkeydown={(e) => e.stopPropagation()}
        >
          <div class="modal-header">
            <span class="font-display modal-title">NASA SMAP SOIL CORE PROFILE</span>
            <span class="font-data modal-chip">[L4 Active Radiometer]</span>
          </div>

          <div class="strata-container font-body">
            <!-- Stratum 1: Topsoil -->
            <div class="stratum stratum-topsoil">
              <div class="stratum-meta">
                <span class="depth font-data">0 – 15 cm</span>
                <span class="name font-display">Humus & Topsoil Horizon</span>
              </div>
              <p class="desc">
                Soil Organic Matter: <strong>{meters.organicMatter}%</strong>. High biological aggregate crumb structure with active earthworm channels.
              </p>
            </div>

            <!-- Stratum 2: Root-Zone Subsoil -->
            <div class="stratum stratum-rootzone">
              <div class="stratum-meta">
                <span class="depth font-data">15 – 60 cm</span>
                <span class="name font-display">Root-Zone Active Subsoil</span>
              </div>
              <p class="desc">
                NASA SMAP Root-Zone Wetness (GWETROOT): <strong>{meters.soilMoisture}%</strong>. Active <em>Rhizobium</em> legume root nodules fixing biological nitrogen (<strong>{meters.nitrogen} kg/ha</strong>).
              </p>
            </div>

            <!-- Stratum 3: Deep Hardpan / Aquifer -->
            <div class="stratum stratum-hardpan">
              <div class="stratum-meta">
                <span class="depth font-data">60+ cm</span>
                <span class="name font-display">Subsoil Hardpan & Aquifer Trend</span>
              </div>
              <p class="desc">
                NASA GRACE Gravity Telemetry: Subterranean water table at <strong>{currentEra.year === 1990 ? '40m' : currentEra.year === 2026 ? '82m' : '65m'}</strong>. Deep taproots (Mustard/Millet) bio-drill through heavy plow compaction.
              </p>
            </div>
          </div>

          <div class="modal-footnote font-data">
            * "Field Shift supports farmers and local experts. It does not replace their judgement."
          </div>

          <div class="modal-actions">
            <button class="action-btn font-display" onclick={() => isProbeModalOpen = false}>
              Close & Return to Field
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Interactive Tubewell Valve Balancer Modal -->
    {#if isTubewellModalOpen}
      <div class="pause-menu-backdrop" onclick={() => isTubewellModalOpen = false} role="presentation">
        <div 
          class="tubewell-modal sticker-card no-tape" 
          role="dialog" 
          tabindex="-1"
          onclick={(e) => e.stopPropagation()} 
          onkeydown={(e) => e.stopPropagation()}
        >
          <div class="modal-header">
            <span class="font-display modal-title">ANCESTRAL TUBEWELL BALANCER</span>
            <span class="font-data modal-chip">[AWD Valve Calibration]</span>
          </div>

          <div class="tubewell-body font-body">
            <p>
              Regulate diesel pump motor RPM. High extraction floods paddies quickly but risks pump cavitation and suction of aquifer silt below 80m.
            </p>

            <div class="slider-control">
              <div class="slider-labels font-data">
                <span>Motor Speed: <strong>{tubewellRpm} RPM</strong></span>
                <span>{tubewellRpm > 1800 ? 'DANGER: CAVITATION' : 'OPTIMAL: AWD'}</span>
              </div>
              <input 
                type="range" 
                min="800" 
                max="2200" 
                step="50" 
                bind:value={tubewellRpm}
                class="rpm-slider"
              />
            </div>

            <div class="telemetry-readout font-data">
              <div class="tele-item">
                <span class="label">Discharge Flow:</span>
                <span class="val">{(tubewellRpm * 0.08).toFixed(1)} L/s</span>
              </div>
              <div class="tele-item">
                <span class="label">Drawdown Rate:</span>
                <span class="val">−{(tubewellRpm * 0.002).toFixed(2)} cm/hr</span>
              </div>
              <div class="tele-item">
                <span class="label">Motor Strain:</span>
                <span class="val {tubewellRpm > 1800 ? 'warn' : 'good'}">
                  {tubewellRpm > 1800 ? 'High Cavitation Risk' : 'Laminar AWD Flow'}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="action-btn font-display" onclick={applyTubewellCalibration}>
              Apply Calibration
            </button>
            <button class="cancel-btn font-data" onclick={() => isTubewellModalOpen = false}>
              Cancel
            </button>
          </div>
        </div>
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
          <div class="menu-title font-display">PAUSE MENU</div>
          <div class="menu-options font-body">
            {#if onOpenStory}
              <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenStory?.(); }}>
                <span class="bullet">▶</span>
                <span>Enter {currentRegion.name} Story Mode</span>
              </button>
            {/if}
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenCompare(); }}>
              <span class="bullet">▶</span>
              <span>Compare Rotation Paths</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenNasa(); }}>
              <span class="bullet">▶</span>
              <span>NASA Data & Evidence</span>
            </button>
            {#if onOpenJournal}
              <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenJournal?.(); }}>
                <span class="bullet">▶</span>
                <span>Field Journal</span>
              </button>
            {/if}
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenStyleguide(); }}>
              <span class="bullet">▶</span>
              <span>Design Styleguide</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onOpenRegionSelect(); }}>
              <span class="bullet">▶</span>
              <span>Choose Region</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; cycleTimeOfDay(); }}>
              <span class="bullet">▶</span>
              <span>Toggle Time of Day ({timeOfDay.toUpperCase()})</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; showMiniMap = !showMiniMap; }}>
              <span class="bullet">▶</span>
              <span>Toggle Radar ({showMiniMap ? 'ON' : 'OFF'})</span>
            </button>
            <button class="menu-item" onclick={() => { isMenuOpen = false; onAdvanceSeason(); }}>
              <span class="bullet">▶</span>
              <span>Advance Season ({currentSeasonName})</span>
            </button>
            {#if onReturnToStart}
              <button class="menu-item" onclick={() => { isMenuOpen = false; onReturnToStart?.(); }}>
                <span class="bullet">▶</span>
                <span>Return to Start Screen</span>
              </button>
            {/if}
            <button class="menu-item close" onclick={toggleMenu}>
              <span class="bullet">✕</span>
              <span>Resume Game</span>
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- In-Game Backpack Modal (Never resets game state) -->
    <BackpackModal 
      isOpen={isBackpackOpen}
      regionId={currentRegion.id}
      {meters}
      {equippedTool}
      {timeOfDay}
      onClose={() => isBackpackOpen = false}
      onEquipTool={(tool) => { equippedTool = tool; showToast(`Equipped: ${tool}`); }}
      onToggleTimeOfDay={cycleTimeOfDay}
      onSelectStrategy={(strat) => {
        meters.soilMoisture = Math.min(100, Math.max(10, meters.soilMoisture - strat.metrics.waterStressDelta * 0.4));
        meters.income = Math.max(20, Math.round(meters.income * (1 + strat.metrics.incomeReturn / 100)));
        meters.organicMatter = Math.min(100, Math.max(15, meters.organicMatter + strat.metrics.soilCarbonDelta * 0.5));
        meters.erosionRisk = Math.max(10, Math.min(90, meters.erosionRisk - 15));
        showToast(`Adopted Strategy: ${strat.title}!`);
      }}
      onReturnToSelect={onOpenRegionSelect}
    />

    <!-- Overworld 4 Mini-Missions -->
    {#if activeMission === 'amma_match'}
      <AmmaMatchMission 
        onComplete={() => handleMissionComplete('amma_match')}
        onClose={() => activeMission = null}
      />
    {:else if activeMission === 'banyan_blank'}
      <BanyanBlankMission 
        onComplete={() => handleMissionComplete('banyan_blank')}
        onClose={() => activeMission = null}
      />
    {:else if activeMission === 'america_phone'}
      <AmericaPhoneMission 
        onComplete={() => handleMissionComplete('america_phone')}
        onClose={() => activeMission = null}
      />
    {:else if activeMission === 'kenya_video'}
      <KenyaVideoMission 
        onComplete={() => handleMissionComplete('kenya_video')}
        onClose={() => activeMission = null}
      />
    {/if}

    <!-- Arcade Mini-Games -->
    {#if activeMiniGame === 'sowing'}
      <SowingTimingGame 
        onComplete={() => {
          meters.soilMoisture = Math.min(100, meters.soilMoisture + 15);
          meters.income += 30;
          showToast('Precision Sowing Complete! Soil Moisture +15%');
          activeMiniGame = null;
        }}
      />
    {:else if activeMiniGame === 'tubewell'}
      <TubewellPumpGame 
        onComplete={() => {
          meters.waterUse = Math.max(80, meters.waterUse - 40);
          meters.income += 25;
          showToast('Tubewell Balanced! Water Drawdown Stabilized');
          activeMiniGame = null;
        }}
      />
    {:else if activeMiniGame === 'sluice'}
      <SluiceRunoffGame 
        onComplete={() => {
          meters.erosionRisk = Math.max(5, meters.erosionRisk - 18);
          meters.income += 25;
          showToast('Sluice Runoff Regulated! Erosion Risk −18%');
          activeMiniGame = null;
        }}
      />
    {:else if activeMiniGame === 'heatwave'}
      <HeatwaveShieldGame 
        onComplete={() => {
          meters.organicMatter = Math.min(100, meters.organicMatter + 18);
          meters.soilMoisture = Math.min(100, meters.soilMoisture + 12);
          showToast('Heatwave Bio-Shield Active! Soil Protected');
          activeMiniGame = null;
        }}
      />
    {/if}
  </div>

  <!-- On-Screen GBA Virtual Gamepad Deck -->
  <GbaControls 
    onDirectionStart={(dir) => virtualDir = dir}
    onDirectionEnd={() => virtualDir = null}
    onActionA={handleActionA}
    onActionB={handleActionB}
    onStart={toggleMenu}
    onCycleTool={cycleTool}
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

  /* In-Game Toast Alert */
  .overworld-toast {
    position: absolute;
    top: 56px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--ink);
    color: var(--paper);
    padding: 6px 16px;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 600;
    z-index: 150;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    animation: toast-in 200ms ease forwards;
    pointer-events: none;
  }

  .toast-dot {
    color: var(--turmeric);
    font-size: 0.75rem;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translate(-50%, -8px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  /* Modals */
  .pause-menu-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(43, 27, 18, 0.65);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fade-in 150ms ease forwards;
    padding: var(--space-3);
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .soil-probe-modal, .tubewell-modal, .gba-pause-menu {
    width: 480px;
    max-width: 95%;
    background-color: var(--paper);
    border: 3.5px solid var(--ink);
    border-radius: var(--radius);
    padding: var(--space-4);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 6px;
  }

  .modal-title {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--ink);
  }

  .modal-chip {
    font-size: 0.75rem;
    background-color: color-mix(in srgb, var(--turmeric) 35%, var(--paper));
    border: 1px solid var(--ink);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .strata-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stratum {
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
  }

  .stratum-topsoil {
    background-color: color-mix(in srgb, var(--soil) 12%, var(--paper));
    border-left: 6px solid var(--soil);
  }

  .stratum-rootzone {
    background-color: color-mix(in srgb, var(--monsoon) 14%, var(--paper));
    border-left: 6px solid var(--monsoon);
  }

  .stratum-hardpan {
    background-color: color-mix(in srgb, var(--ink) 8%, var(--paper));
    border-left: 6px solid var(--ink);
  }

  .stratum-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .stratum-meta .depth {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--soil);
  }

  .stratum-meta .name {
    font-size: 0.88rem;
    font-weight: bold;
    color: var(--ink);
  }

  .stratum .desc {
    font-size: 0.82rem;
    margin: 0;
    line-height: 1.4;
    color: var(--ink);
  }

  .modal-footnote {
    font-size: 0.7rem;
    color: var(--soil);
    font-style: italic;
    border-top: 1px dashed var(--ink);
    padding-top: 6px;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .action-btn {
    background-color: var(--turmeric);
    color: var(--ink);
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 6px 14px;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 2px 0 var(--ink);
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 0 var(--ink);
  }

  .cancel-btn {
    background: none;
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 6px 12px;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--ink);
  }

  /* Tubewell Modal */
  .slider-control {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 12px 0;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
  }

  .rpm-slider {
    width: 100%;
    accent-color: var(--soil);
    cursor: pointer;
  }

  .telemetry-readout {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background-color: color-mix(in srgb, var(--paper) 90%, var(--ink));
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 0.82rem;
  }

  .tele-item {
    display: flex;
    justify-content: space-between;
  }

  .tele-item .val.warn {
    color: #CC3B2B;
    font-weight: bold;
  }

  .tele-item .val.good {
    color: var(--forest);
    font-weight: bold;
  }

  /* GBA In-Game Pause Menu */
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
