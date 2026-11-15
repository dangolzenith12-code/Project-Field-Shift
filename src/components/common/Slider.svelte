<script lang="ts">
  interface Props {
    label: string;
    icon?: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    formatValue?: (val: number) => string;
    onchange?: (val: number) => void;
  }

  let { 
    label, 
    icon = '⚙️', 
    value = $bindable(), 
    min, 
    max, 
    step = 1, 
    unit = '', 
    formatValue,
    onchange 
  }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const num = parseFloat(target.value);
    value = num;
    onchange?.(num);
  }

  const displayVal = $derived(
    formatValue ? formatValue(value) : `${value > 0 && unit.includes('%') ? '+' : ''}${value}${unit}`
  );

  const fillPercent = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="vintage-slider-container">
  <div class="slider-header">
    <span class="slider-label">
      <span class="icon">{icon}</span>
      <span class="text">{label}</span>
    </span>
    <span class="slider-badge font-data">{displayVal}</span>
  </div>

  <div class="slider-track-wrap">
    <div class="track-fill" style:width="{fillPercent}%"></div>
    <input 
      type="range" 
      {min} 
      {max} 
      {step} 
      {value} 
      oninput={handleInput}
      class="vintage-slider"
      aria-label={label}
    />
  </div>

  <div class="tick-bar" aria-hidden="true">
    <span>{min}{unit}</span>
    <span>{min + (max - min)/2}{unit}</span>
    <span>{max}{unit}</span>
  </div>
</div>

<style>
  .vintage-slider-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
  }

  .slider-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: var(--ink);
  }

  .slider-label .icon {
    font-size: 1.1rem;
  }

  .slider-badge {
    background-color: var(--paper);
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 2px 8px;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--ink);
    box-shadow: 0 2px 0 var(--ink);
  }

  .slider-track-wrap {
    position: relative;
    height: 20px;
    display: flex;
    align-items: center;
  }

  .track-fill {
    position: absolute;
    left: 0;
    height: 10px;
    background-color: var(--paddy);
    border: 2.5px solid var(--ink);
    border-right: none;
    border-radius: 6px 0 0 6px;
    pointer-events: none;
    z-index: 1;
  }

  .vintage-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 10px;
    background: color-mix(in srgb, var(--soil) 25%, var(--paper));
    border: 2.5px solid var(--ink);
    border-radius: 6px;
    outline: none;
    margin: 0;
    position: relative;
    z-index: 2;
    cursor: pointer;
  }

  /* Custom round turmeric knob with grip texture */
  .vintage-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--turmeric);
    border: 3px solid var(--ink);
    box-shadow: 0 3px 0 var(--ink);
    cursor: grab;
    transition: transform var(--fast) var(--spring);
    /* Grip stripes pattern */
    background-image: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 3px,
      var(--ink) 3px,
      var(--ink) 5px
    );
  }

  .vintage-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  .vintage-slider::-webkit-slider-thumb:active {
    cursor: grabbing;
    transform: scale(1.05);
    box-shadow: 0 1px 0 var(--ink);
  }

  .vintage-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--turmeric);
    border: 3px solid var(--ink);
    box-shadow: 0 3px 0 var(--ink);
    cursor: grab;
  }

  .tick-bar {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-data);
    font-size: 0.7rem;
    color: color-mix(in srgb, var(--ink) 70%, transparent);
    padding: 0 2px;
  }
</style>
