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
    <div class="satellite-note-card" role="dialog" aria-modal="true">
      <div class="note-header">
        <span class="badge font-data">NASA {note.dataset} DATA</span>
        <button class="close-btn" onclick={closePopover} aria-label="Close note">✕</button>
      </div>
      
      <h4 class="note-title font-pixel">{note.title}</h4>
      <div class="sensor-tag font-data">Sensor: {note.sensor}</div>

      <div class="plain-box">
        <div class="box-label font-pixel">FARMER'S VERSION</div>
        <p class="farmer-text font-body">{note.farmerExplanation}</p>
      </div>

      <div class="science-box">
        <div class="box-label font-data">SCIENTIFIC MEASUREMENT</div>
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
    gap: 5px;
    background-color: #0B253D;
    color: #00E5FF;
    border: 1.5px solid #00E5FF;
    border-radius: 4px;
    padding: 0.2em 0.65em;
    box-shadow: 0 0 8px rgba(0, 229, 255, 0.25);
    cursor: pointer;
    line-height: 1.2;
    transition: all 0.15s ease;
  }

  .data-chip:hover {
    background-color: #00E5FF;
    color: #000000;
    transform: translateY(-1px);
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
  }

  .satellite-icon {
    font-size: 0.85rem;
  }

  .val {
    background-color: rgba(0, 229, 255, 0.2);
    color: #FFFFFF;
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
    width: 300px;
    background-color: #0C1A11;
    border: 2.5px solid #00FF66;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 255, 102, 0.35), 0 8px 32px rgba(0, 0, 0, 0.85);
    padding: 14px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
    color: #FFFFFF;
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
    background-color: #0D2B45;
    color: #00E5FF;
    border: 1px solid #00E5FF;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.68rem;
    font-weight: bold;
  }

  .close-btn {
    background: #2E1515;
    border: 1px solid #FF5A5A;
    border-radius: 3px;
    font-size: 0.75rem;
    cursor: pointer;
    font-weight: bold;
    color: #FF8585;
    padding: 1px 5px;
  }

  .close-btn:hover {
    background: #FF5A5A;
    color: #000;
  }

  .note-title {
    font-size: 0.85rem;
    color: #FFD166;
    margin: 2px 0;
  }

  .sensor-tag {
    font-size: 0.72rem;
    color: #88C49D;
  }

  .plain-box {
    background-color: #152619;
    border: 1.5px solid #2E5A38;
    border-radius: 6px;
    padding: 8px 10px;
  }

  .box-label {
    font-size: 0.7rem;
    color: #FFB703;
    margin-bottom: 2px;
  }

  .farmer-text {
    font-size: 0.85rem;
    line-height: 1.4;
    color: #E8F5EE;
    margin: 0;
  }

  .science-box {
    background-color: #091C2E;
    border: 1.5px solid #00E5FF;
    border-radius: 6px;
    padding: 8px 10px;
  }

  .science-text {
    font-size: 0.74rem;
    line-height: 1.35;
    color: #BAE6FD;
    margin: 0;
  }
</style>
