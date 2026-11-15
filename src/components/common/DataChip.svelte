<script lang="ts">
  import type { SatelliteNote } from '../../types/game';

  interface Props {
    note: SatelliteNote;
    value?: string;
  }

  let { note, value }: Props = $props();
  let showPopover = $state(false);

  function togglePopover(e: MouseEvent) {
    e.stopPropagation();
    showPopover = !showPopover;
  }

  function closePopover() {
    showPopover = false;
  }
</script>

<span class="chip-container">
  <button 
    type="button" 
    class="data-chip font-data" 
    onclick={togglePopover}
    title="Click to view NASA Satellite Note"
    aria-expanded={showPopover}
  >
    <span class="satellite-icon">🛰️</span>
    <span class="tag-name">[{note.dataset}]</span>
    {#if value}
      <span class="val">{value}</span>
    {/if}
  </button>

  {#if showPopover}
    <div class="popover-backdrop" onclick={closePopover} role="presentation"></div>
    <div class="satellite-note-card sticker-card" role="dialog" aria-modal="true">
      <div class="note-header">
        <span class="badge font-data">NASA {note.dataset} DATA</span>
        <button class="close-btn" onclick={closePopover} aria-label="Close note">✕</button>
      </div>
      
      <h4 class="note-title font-display">{note.title}</h4>
      <div class="sensor-tag font-data">Sensor: {note.sensor}</div>

      <div class="plain-box">
        <div class="box-label font-display">Farmer's Version</div>
        <p class="farmer-text">{note.farmerExplanation}</p>
      </div>

      <div class="science-box">
        <div class="box-label font-data">Scientific Measurement</div>
        <p class="science-text font-data">{note.scientificValue}</p>
      </div>
    </div>
  {/if}
</span>

<style>
  .chip-container {
    position: relative;
    display: inline-block;
  }

  .data-chip {
    font-family: var(--font-data);
    font-size: 0.75rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background-color: var(--monsoon);
    color: var(--paper);
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 0.15em 0.55em;
    box-shadow: 0 2px 0 var(--ink);
    cursor: pointer;
    line-height: 1.2;
    transition: transform var(--fast) var(--spring), box-shadow var(--fast) var(--spring);
  }

  .data-chip:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 0 var(--ink);
  }

  .data-chip:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--ink);
  }

  .satellite-icon {
    font-size: 0.8rem;
  }

  .val {
    background-color: rgba(255, 255, 255, 0.25);
    padding: 0 4px;
    border-radius: 3px;
  }

  .popover-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }

  .satellite-note-card {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    width: 290px;
    background-color: var(--paper);
    border: 3px solid var(--ink);
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    padding: var(--space-3);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
    animation: popover-in 180ms cubic-bezier(.34, 1.56, .64, 1);
  }

  @keyframes popover-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .badge {
    background-color: var(--monsoon);
    color: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 0.68rem;
    font-weight: bold;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: bold;
    color: var(--ink);
  }

  .note-title {
    font-size: 1.05rem;
    color: var(--ink);
    margin: 0;
  }

  .sensor-tag {
    font-size: 0.7rem;
    color: color-mix(in srgb, var(--ink) 75%, transparent);
  }

  .plain-box {
    background-color: color-mix(in srgb, var(--turmeric) 18%, var(--paper));
    border: 2px solid var(--ink);
    border-radius: 8px;
    padding: 6px 10px;
  }

  .box-label {
    font-size: 0.78rem;
    margin-bottom: 2px;
  }

  .farmer-text {
    font-size: 0.85rem;
    line-height: 1.35;
    color: var(--ink);
  }

  .science-box {
    background-color: color-mix(in srgb, var(--monsoon) 12%, var(--paper));
    border: 1.5px solid var(--ink);
    border-radius: 6px;
    padding: 6px 8px;
  }

  .science-text {
    font-size: 0.72rem;
    line-height: 1.3;
    color: var(--ink);
  }
</style>
