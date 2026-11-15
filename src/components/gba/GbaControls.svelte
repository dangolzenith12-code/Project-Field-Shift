<script lang="ts">
  interface Props {
    onDirectionStart: (dir: 'up' | 'down' | 'left' | 'right') => void;
    onDirectionEnd: () => void;
    onActionA: () => void;
    onActionB: () => void;
    onStart: () => void;
    onCycleTool?: () => void;
  }

  let { onDirectionStart, onDirectionEnd, onActionA, onActionB, onStart, onCycleTool }: Props = $props();

  function handleTouchStart(e: TouchEvent | MouseEvent, dir: 'up' | 'down' | 'left' | 'right') {
    e.preventDefault();
    onDirectionStart(dir);
  }

  function handleTouchEnd(e: TouchEvent | MouseEvent) {
    e.preventDefault();
    onDirectionEnd();
  }
</script>

<div class="gba-gamepad-deck">
  <!-- D-PAD on Left -->
  <div class="dpad-container" aria-label="D-Pad Controls">
    <div class="dpad-cross">
      <!-- UP -->
      <button 
        type="button"
        class="dpad-btn up"
        onmousedown={(e) => handleTouchStart(e, 'up')}
        onmouseup={handleTouchEnd}
        ontouchstart={(e) => handleTouchStart(e, 'up')}
        ontouchend={handleTouchEnd}
        aria-label="Walk Up"
      >▲</button>

      <!-- LEFT -->
      <button 
        type="button"
        class="dpad-btn left"
        onmousedown={(e) => handleTouchStart(e, 'left')}
        onmouseup={handleTouchEnd}
        ontouchstart={(e) => handleTouchStart(e, 'left')}
        ontouchend={handleTouchEnd}
        aria-label="Walk Left"
      >◀</button>

      <!-- CENTER -->
      <div class="dpad-center"></div>

      <!-- RIGHT -->
      <button 
        type="button"
        class="dpad-btn right"
        onmousedown={(e) => handleTouchStart(e, 'right')}
        onmouseup={handleTouchEnd}
        ontouchstart={(e) => handleTouchStart(e, 'right')}
        ontouchend={handleTouchEnd}
        aria-label="Walk Right"
      >▶</button>

      <!-- DOWN -->
      <button 
        type="button"
        class="dpad-btn down"
        onmousedown={(e) => handleTouchStart(e, 'down')}
        onmouseup={handleTouchEnd}
        ontouchstart={(e) => handleTouchStart(e, 'down')}
        ontouchend={handleTouchEnd}
        aria-label="Walk Down"
      >▼</button>
    </div>
  </div>

  <!-- Middle Start / Select Buttons -->
  <div class="center-buttons">
    {#if onCycleTool}
      <button 
        type="button" 
        class="pill-btn font-data select-tool-btn"
        onclick={onCycleTool}
        aria-label="Cycle Equipped Tool"
      >
        TOOL
      </button>
    {/if}
    <button 
      type="button" 
      class="pill-btn font-data"
      onclick={onStart}
      aria-label="GBA Start Button"
    >
      START
    </button>
  </div>

  <!-- A & B Action Buttons on Right -->
  <div class="action-buttons-container">
    <!-- B Button (Sprint / Back) -->
    <button 
      type="button" 
      class="round-btn btn-b font-display" 
      onclick={onActionB}
      aria-label="B Button (Run / Cancel)"
    >
      B
    </button>

    <!-- A Button (Interact / Talk) -->
    <button 
      type="button" 
      class="round-btn btn-a font-display" 
      onclick={onActionA}
      aria-label="A Button (Talk / Interact)"
    >
      A
    </button>
  </div>
</div>

<style>
  .gba-gamepad-deck {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    background-color: color-mix(in srgb, var(--paper) 95%, var(--turmeric));
    border: 3px solid var(--ink);
    border-radius: var(--radius);
    padding: var(--space-3) var(--space-4);
    box-shadow: 0 4px 0 var(--ink);
    user-select: none;
    touch-action: manipulation;
  }

  /* D-PAD cross */
  .dpad-container {
    width: 104px;
    height: 104px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dpad-cross {
    width: 96px;
    height: 96px;
    display: grid;
    grid-template-columns: 32px 32px 32px;
    grid-template-rows: 32px 32px 32px;
  }

  .dpad-btn {
    background-color: var(--ink);
    color: var(--paper);
    border: none;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.3);
  }

  .dpad-btn:active {
    background-color: var(--soil);
  }

  .dpad-btn.up {
    grid-column: 2;
    grid-row: 1;
    border-radius: 6px 6px 0 0;
  }

  .dpad-btn.left {
    grid-column: 1;
    grid-row: 2;
    border-radius: 6px 0 0 6px;
  }

  .dpad-center {
    grid-column: 2;
    grid-row: 2;
    background-color: var(--ink);
  }

  .dpad-btn.right {
    grid-column: 3;
    grid-row: 2;
    border-radius: 0 6px 6px 0;
  }

  .dpad-btn.down {
    grid-column: 2;
    grid-row: 3;
    border-radius: 0 0 6px 6px;
  }

  /* Center buttons */
  .center-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .pill-btn {
    background-color: var(--ink);
    color: var(--paper);
    font-size: 0.68rem;
    font-weight: bold;
    padding: 4px 14px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transform: rotate(-18deg);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  }

  .pill-btn:active {
    transform: rotate(-18deg) translateY(2px);
  }

  /* Action buttons */
  .action-buttons-container {
    display: flex;
    align-items: center;
    gap: 16px;
    transform: rotate(-14deg);
  }

  .round-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid var(--ink);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    box-shadow: 0 4px 0 var(--ink);
    transition: transform var(--fast) var(--spring);
  }

  .round-btn:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 var(--ink);
  }

  .btn-b {
    background-color: var(--turmeric);
    color: var(--ink);
    margin-top: 14px;
  }

  .btn-a {
    background-color: var(--chili);
    color: var(--paper);
  }

  @media (max-width: 420px) {
    .gba-gamepad-deck {
      padding: var(--space-2) var(--space-3);
      gap: var(--space-2);
    }
    .dpad-container {
      width: 92px;
      height: 92px;
    }
    .dpad-cross {
      width: 84px;
      height: 84px;
      grid-template-columns: 28px 28px 28px;
      grid-template-rows: 28px 28px 28px;
    }
    .round-btn {
      width: 42px;
      height: 42px;
    }
    .action-buttons-container {
      gap: 10px;
    }
  }
</style>
