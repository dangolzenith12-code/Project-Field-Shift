<script lang="ts">
  import { onMount } from 'svelte';
  import type { PlayerState, InteractiveEntity, DialogueNode, DialogueChoice } from '../gba/types';
  import type { FarmMeters, RegionInfo, StrategyOption } from '../../types/game';
  import { 
    INITIAL_PLAYER_POSITION, 
    COLLISION_OBSTACLES, 
    INTERACTIVE_ENTITIES, 
    WORLD_WIDTH, 
    WORLD_HEIGHT 
  } from '../gba/mapData';
  import { CHAPTERS, evaluateEnding, type ChapterId, type HariDecision, type EndingResult } from './storyEngine';
  import GbaCanvas from '../gba/GbaCanvas.svelte';
  import GbaDialogBox from '../gba/GbaDialogBox.svelte';
  import GbaControls from '../gba/GbaControls.svelte';
  import CompareScreen from '../compare/CompareScreen.svelte';
  import EndingScreen from './EndingScreen.svelte';

  interface Props {
    currentRegion: RegionInfo;
    onViewStyleguide?: () => void;
  }

  let { currentRegion, onViewStyleguide }: Props = $props();

  // Current Story Chapter (0 = 1990, 1 = 2005, 2 = 2026, 3 = 2040 Ending)
  let chapterIndex = $state(0);
  const currentChapter = $derived(CHAPTERS[chapterIndex]);

  // Hari's Decisions History
  let decisionsHistory = $state<HariDecision[]>([]);

  // Hari's Farm Meters
  let meters = $state<FarmMeters>({
    soilMoisture: 42,
    organicMatter: 34,
    nitrogen: 65,
    erosionRisk: 28,
    income: 180,
    waterUse: 620
  });

  $effect(() => {
    if (currentRegion?.initialMeters) {
      meters = { ...currentRegion.initialMeters };
    }
  });

  // Weather Condition for Canvas
  let weatherCondition = $state<'normal' | 'rain' | 'dry' | 'harvest'>('normal');

  // Player State for Hari
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

  // Active Interactive Entity near Hari
  let activeEntity = $state<InteractiveEntity | null>(null);

  // Active Dialogue State
  let activeDialogue = $state<DialogueNode | null>(null);
  let dialogBoxRef = $state<any>(null);

  // Strategy Compare Modal State (triggered during Chapter 3)
  let isCompareModalOpen = $state(false);

  // Final Ending Result State
  let endingResult = $state<EndingResult | null>(null);

  // Keyboard inputs
  const keysDown = new Set<string>();
  let isSprinting = $state(false);
  let virtualDir = $state<'up' | 'down' | 'left' | 'right' | null>(null);

  let loopId: number;
  let stepTimer = 0;

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initial Chapter 1 Opening Dialogue after a short moment
    setTimeout(() => {
      startStoryDialogue('ch1_welcome');
    }, 400);

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

  // Collision detection
  function checkCollision(newX: number, newY: number): boolean {
    const pBox = { x: newX - 10, y: newY + 2, width: 20, height: 14 };

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

  // Update Movement
  function updateMovement() {
    if (activeDialogue || isCompareModalOpen || endingResult) {
      player.isMoving = false;
      return;
    }

    let dx = 0;
    let dy = 0;

    if (keysDown.has('ArrowUp') || keysDown.has('KeyW') || virtualDir === 'up') {
      dy -= 1; player.direction = 'up';
    }
    if (keysDown.has('ArrowDown') || keysDown.has('KeyS') || virtualDir === 'down') {
      dy += 1; player.direction = 'down';
    }
    if (keysDown.has('ArrowLeft') || keysDown.has('KeyA') || virtualDir === 'left') {
      dx -= 1; player.direction = 'left';
    }
    if (keysDown.has('ArrowRight') || keysDown.has('KeyD') || virtualDir === 'right') {
      dx += 1; player.direction = 'right';
    }

    const isMoving = dx !== 0 || dy !== 0;
    player.isMoving = isMoving;

    if (isMoving) {
      const currentSpeed = isSprinting ? player.speed * 1.55 : player.speed;
      if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

      const nextX = player.x + dx * currentSpeed;
      const nextY = player.y + dy * currentSpeed;

      if (!checkCollision(nextX, player.y)) player.x = nextX;
      if (!checkCollision(player.x, nextY)) player.y = nextY;

      stepTimer++;
      if (stepTimer % 8 === 0) player.frame = (player.frame + 1) % 3;

      checkProximity();
    } else {
      player.frame = 0;
    }
  }

  // Proximity check
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

  // Story Dialogues tailored directly to Hari's journey
  const STORY_NODES: Record<string, DialogueNode> = {
    ch1_welcome: {
      id: 'ch1_welcome',
      speaker: 'Amma',
      speakerTitle: 'Farm Matriarch (1990)',
      portrait: 'amma_wise',
      text: [
        "Welcome home, Hari! Your grandfather and I have tended this soil for fifty years.",
        "Now the land is yours to steward. The well is full, the monsoon is gentle, and your ancestors' blessings are in this dirt.",
        "Walk down to the North Field furrow and decide what we shall plant for your very first crop season."
      ],
      choices: [
        { text: "I'm ready, Amma. I'll inspect the North Field.", action: 'close' },
        { text: "Tell me about our water table first.", nextDialogueId: 'ch1_water_lore' }
      ]
    },
    ch1_water_lore: {
      id: 'ch1_water_lore',
      speaker: 'Amma',
      speakerTitle: 'Farm Matriarch',
      portrait: 'amma_smile',
      text: [
        "In our village, sweet water rests just twelve meters beneath the grass. A simple bullock pulley draws all we need.",
        "Remember, Hari: the clouds give life, but the soil holds it. Treat the water like liquid gold."
      ],
      choices: [
        { text: "I understand, Amma. I'll head to the North Field.", action: 'close' }
      ]
    },
    ch1_crop_decision: {
      id: 'ch1_crop_decision',
      speaker: 'Hari',
      speakerTitle: 'Season 1 Decision (1990)',
      portrait: 'grandchild',
      text: [
        "You stand over the fertile North Field.",
        "Amma is watching from the veranda. How will you begin your farming legacy?"
      ],
      choices: [
        { 
          text: "Plant Traditional Basmati Rice (Flooded fields, guaranteed government mandi price)", 
          action: 'ch1_choose_rice' 
        },
        { 
          text: "Plant Drought-Hardy Pearl Millet & Green Gram (Deep roots, builds organic soil)", 
          action: 'ch1_choose_millet' 
        }
      ]
    },

    // Chapter 2: 2005 Tubewell Crisis
    ch2_tubewell_story: {
      id: 'ch2_tubewell_story',
      speaker: 'Amma',
      speakerTitle: 'Farm Matriarch (2005)',
      portrait: 'amma_worry',
      text: [
        "Fifteen years have passed, Hari. Look at our valley! Everyone has drilled diesel tubewells.",
        "Listen to our pump cough—it is spitting sand! The neighboring borewells run all night, and our water table has sunk to eighty meters."
      ],
      choices: [
        { text: "Let's inspect the pump and NASA telemetry.", nextDialogueId: 'ch2_pump_inspect' }
      ]
    },
    ch2_pump_inspect: {
      id: 'ch2_pump_inspect',
      speaker: 'NASA GRACE Telemetry',
      speakerTitle: 'Aquifer Mass Anomaly (2005)',
      portrait: 'satellite',
      nasaChip: 'GRACE_WATER',
      text: [
        "[ NASA GRACE SATELLITE WARNING ]",
        "Regional Terrestrial Water Loss: −3.2 cm/year equivalent thickness.",
        "A diesel drilling contractor has arrived in the village. What will you do, Hari?"
      ],
      choices: [
        { 
          text: "Pay 50 Coins to drill 100ft deeper (Maximizes short-term water, drains aquifer)", 
          action: 'ch2_choose_drill' 
        },
        { 
          text: "Invest in Furrow Drip & Switch to Low-Water Legumes/Mustard (Saves water)", 
          action: 'ch2_choose_conserve' 
        }
      ]
    },

    // Chapter 3: 2026 Climate Crossroads
    ch3_banyan_story: {
      id: 'ch3_banyan_story',
      speaker: 'Dr. Rao',
      speakerTitle: 'District Extension Agronomist (2026)',
      portrait: 'agronomist',
      text: [
        "Hari! Thank goodness you came. Year 2026 has brought severe climate volatility.",
        "NASA POWER models show heat anomalies exceeding +1.5°C, and NASA SMAP shows topsoil flash-drying in four days.",
        "We need a comprehensive 5-year crop rotation strategy. I have prepared the 3-Strategy Comparison Matrix for your farm."
      ],
      choices: [
        { text: "Open 3-Rotation Compare Matrix & Sensitivity Sliders", action: 'ch3_open_matrix' }
      ]
    }
  };

  // Keyboard handlers
  function handleKeyDown(e: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    keysDown.add(e.code);

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') {
      isSprinting = true;
    }
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
      handleActionA();
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    keysDown.delete(e.code);
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') {
      isSprinting = false;
    }
  }

  // Handle Action Button A
  function handleActionA() {
    if (isCompareModalOpen || endingResult) return;

    if (activeDialogue) {
      dialogBoxRef?.handleActionPress();
      return;
    }

    if (activeEntity) {
      // Trigger context-sensitive chapter dialog
      if (chapterIndex === 0) {
        if (activeEntity.id === 'amma') {
          startStoryDialogue('ch1_welcome');
        } else if (activeEntity.id === 'crop_plot_north') {
          startStoryDialogue('ch1_crop_decision');
        } else {
          startStoryDialogue('ch1_welcome');
        }
      } else if (chapterIndex === 1) {
        if (activeEntity.id === 'tubewell') {
          startStoryDialogue('ch2_tubewell_story');
        } else {
          startStoryDialogue('ch2_tubewell_story');
        }
      } else if (chapterIndex === 2) {
        if (activeEntity.id === 'banyan_tree') {
          startStoryDialogue('ch3_banyan_story');
        } else {
          startStoryDialogue('ch3_banyan_story');
        }
      }
    }
  }

  function startStoryDialogue(dialogueId: string) {
    const node = STORY_NODES[dialogueId];
    if (node) activeDialogue = node;
  }

  // Handle Choices in Story Dialogues
  function handleDialogueChoice(choice: DialogueChoice) {
    if (choice.nextDialogueId) {
      startStoryDialogue(choice.nextDialogueId);
      return;
    }

    // Story Decision Branching
    if (choice.action === 'ch1_choose_rice') {
      activeDialogue = null;
      decisionsHistory.push({
        chapterId: 'ch1_1990',
        decisionTitle: '1990 Sowing Strategy',
        choiceMade: 'Traditional Basmati Rice (Continuous Flood Irrigation)',
        waterImpact: -18,
        soilImpact: -5,
        incomeImpact: +45
      });
      meters.soilMoisture = Math.min(95, meters.soilMoisture + 15);
      meters.income += 45;
      weatherCondition = 'harvest';
      
      // Transition to Chapter 2 (2005)
      advanceToChapter(1);
    } else if (choice.action === 'ch1_choose_millet') {
      activeDialogue = null;
      decisionsHistory.push({
        chapterId: 'ch1_1990',
        decisionTitle: '1990 Sowing Strategy',
        choiceMade: 'Drought-Hardy Millet & Green Gram (Deep Root Intercropping)',
        waterImpact: +12,
        soilImpact: +20,
        incomeImpact: +30
      });
      meters.organicMatter += 15;
      meters.nitrogen += 18;
      meters.income += 30;
      weatherCondition = 'harvest';

      // Transition to Chapter 2 (2005)
      advanceToChapter(1);
    } else if (choice.action === 'ch2_choose_drill') {
      activeDialogue = null;
      decisionsHistory.push({
        chapterId: 'ch2_2005',
        decisionTitle: '2005 Aquifer Crisis',
        choiceMade: 'Drilled 100ft deeper borewell with heavy diesel pump',
        waterImpact: -35,
        soilImpact: -10,
        incomeImpact: +25
      });
      meters.soilMoisture = Math.max(20, meters.soilMoisture - 25);
      meters.income -= 30; // Drilling fee
      weatherCondition = 'dry';

      // Transition to Chapter 3 (2026)
      advanceToChapter(2);
    } else if (choice.action === 'ch2_choose_conserve') {
      activeDialogue = null;
      decisionsHistory.push({
        chapterId: 'ch2_2005',
        decisionTitle: '2005 Aquifer Crisis',
        choiceMade: 'Adopted Drip Furrows & Switched to Nitrogen-Fixing Pulses/Mustard',
        waterImpact: +25,
        soilImpact: +25,
        incomeImpact: +40
      });
      meters.organicMatter += 18;
      meters.soilMoisture += 10;
      meters.income += 40;
      weatherCondition = 'normal';

      // Transition to Chapter 3 (2026)
      advanceToChapter(2);
    } else if (choice.action === 'ch3_open_matrix') {
      activeDialogue = null;
      isCompareModalOpen = true;
    } else {
      activeDialogue = null;
    }
  }

  // Advance Chapter with screen flash animation
  function advanceToChapter(targetIdx: number) {
    chapterIndex = targetIdx;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle Strategy Adoption from Compare Matrix (Chapter 3 finale)
  function handleAdoptStrategy(strat: StrategyOption) {
    isCompareModalOpen = false;

    decisionsHistory.push({
      chapterId: 'ch3_2026',
      decisionTitle: '2026 Long-Term 5-Year Strategy',
      choiceMade: `${strat.title} (${strat.subtitle})`,
      waterImpact: -strat.metrics.waterStressDelta,
      soilImpact: strat.metrics.soilCarbonDelta,
      incomeImpact: strat.metrics.incomeReturn
    });

    // Update final meters
    meters.soilMoisture = Math.min(100, Math.max(15, meters.soilMoisture - strat.metrics.waterStressDelta * 0.5));
    meters.organicMatter = Math.min(100, meters.organicMatter + strat.metrics.soilCarbonDelta * 0.6);
    meters.income = Math.round(meters.income * (1 + strat.metrics.incomeReturn / 100));
    meters.erosionRisk = Math.max(10, meters.erosionRisk - 15);

    // Compute Ending for Year 2040!
    endingResult = evaluateEnding(decisionsHistory, {
      moisture: meters.soilMoisture,
      organic: meters.organicMatter,
      nitrogen: meters.nitrogen,
      income: meters.income,
      erosion: meters.erosionRisk
    });

    chapterIndex = 3;
  }

  // Restart Story
  function handleRestartGame() {
    chapterIndex = 0;
    decisionsHistory = [];
    meters = { ...currentRegion.initialMeters };
    weatherCondition = 'normal';
    endingResult = null;
    player.x = INITIAL_PLAYER_POSITION.x;
    player.y = INITIAL_PLAYER_POSITION.y;
    setTimeout(() => {
      startStoryDialogue('ch1_welcome');
    }, 400);
  }
</script>

<div class="story-game-container">
  {#if endingResult}
    <!-- Final 2040 Ending Screen -->
    <EndingScreen 
      ending={endingResult} 
      decisions={decisionsHistory} 
      finalMeters={meters}
      onRestart={handleRestartGame} 
    />
  {:else if isCompareModalOpen}
    <!-- 3-Strategy Compare Matrix (In-Game Milestone) -->
    <CompareScreen 
      onSelectStrategy={handleAdoptStrategy}
      onBack={() => isCompareModalOpen = false}
    />
  {:else}
    <!-- Active GBA Story Overworld Play -->
    <!-- Top Story Quest Banner -->
    <div class="quest-banner sticker-card no-tape">
      <div class="quest-left">
        <span class="farmer-avatar" aria-hidden="true">🧑🏽‍🌾</span>
        <div class="quest-meta">
          <span class="farmer-name font-display">HARI’S FARM JOURNEY</span>
          <span class="chapter-badge font-data">{currentChapter.subtitle}</span>
        </div>
      </div>
      <div class="quest-objective">
        <span class="obj-tag font-data">CURRENT QUEST:</span>
        <span class="obj-text font-body">{currentChapter.objective}</span>
      </div>
      {#if onViewStyleguide}
        <button class="styleguide-link font-data" onclick={onViewStyleguide}>🎨 Styleguide</button>
      {/if}
    </div>

    <!-- The 2D Walkable Farm Canvas -->
    <div class="game-stage">
      <GbaCanvas 
        {player} 
        {activeEntity} 
        {weatherCondition}
        soilMoisture={meters.soilMoisture}
        {meters}
        onInteract={(ent) => handleActionA()} 
      />

      <!-- GBA Dialogue Box with Typewriter Effect & Amma Portraits -->
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
    </div>

    <!-- On-Screen Virtual GBA Gamepad Deck -->
    <GbaControls 
      onDirectionStart={(dir) => virtualDir = dir}
      onDirectionEnd={() => virtualDir = null}
      onActionA={handleActionA}
      onActionB={() => { if (activeDialogue) activeDialogue = null; }}
      onStart={() => {
        if (chapterIndex === 2) isCompareModalOpen = true;
      }}
    />
  {/if}
</div>

<style>
  .story-game-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-width: 860px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-2);
  }

  /* Story Quest Banner */
  .quest-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    background-color: var(--paper);
    border: 3px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 8px 14px;
    box-shadow: 0 4px 0 var(--ink);
    flex-wrap: wrap;
  }

  .quest-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .farmer-avatar {
    font-size: 1.5rem;
  }

  .quest-meta {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .farmer-name {
    font-size: 1.1rem;
    color: var(--ink);
  }

  .chapter-badge {
    font-size: 0.72rem;
    color: var(--soil);
    font-weight: bold;
  }

  .quest-objective {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: color-mix(in srgb, var(--turmeric) 25%, var(--paper));
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 4px 10px;
    flex-grow: 1;
    max-width: 480px;
  }

  .obj-tag {
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--chili);
  }

  .obj-text {
    font-size: 0.85rem;
    color: var(--ink);
    font-weight: 600;
  }

  .styleguide-link {
    background: none;
    border: 1px dashed var(--ink);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.72rem;
    cursor: pointer;
    color: var(--ink);
  }

  .styleguide-link:hover {
    background-color: var(--turmeric);
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
</style>
