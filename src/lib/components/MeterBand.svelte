<script lang="ts">
  interface Props {
    label: string;
    unit: string;
    /** p50 (most likely) value at the selected horizon. */
    value: number;
    /** p10 (low) band edge. */
    lo: number;
    /** p90 (high) band edge. */
    hi: number;
    min: number;
    max: number;
    digits: number;
  }
  let { label, unit, value, lo, hi, min, max, digits }: Props = $props();

  const span = $derived(Math.max(max - min, 1e-9));
  const p = (v: number) => Math.min(100, Math.max(0, ((v - min) / span) * 100));
  /** The shipped sim example marks the less favorable end p10 for directional meters
   *  (erosion risk, water use), so p10 may exceed p90 numerically. Render the interval. */
  const bandLo = $derived(Math.min(lo, hi));
  const bandHi = $derived(Math.max(lo, hi));
  const bandLeft = $derived(p(bandLo));
  const bandWidth = $derived(Math.max(p(bandHi) - p(bandLo), 1.5));
  const pinLeft = $derived(p(value));
  const fv = $derived(value.toFixed(digits));
  const flo = $derived(Math.min(lo, hi).toFixed(digits));
  const fhi = $derived(Math.max(lo, hi).toFixed(digits));
</script>

<div class="meter">
  <span class="meter-label">{label}</span>
  <span class="meter-track" role="img" aria-label="{label}: most likely {fv}, range {flo} to {fhi}">
    <span class="meter-band" style:left="{bandLeft}%" style:width="{bandWidth}%"></span>
    <span class="meter-pin" style:left="{pinLeft}%"></span>
  </span>
  <span class="meter-value">{fv}<small>{unit}</small></span>
</div>

<style>
  .meter {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: "label value" "track track";
    row-gap: 4px;
    column-gap: 10px;
    margin: 10px 0;
  }
  .meter-label {
    grid-area: label;
    align-self: end;
    font-size: 0.8rem;
    color: var(--meter-label-color, #52604c);
  }
  .meter-track {
    grid-area: track;
    position: relative;
    display: block;
    height: 10px;
    background: var(--meter-track-bg, #eceade);
    border-radius: 999px;
  }
  .meter-band {
    position: absolute;
    top: 0;
    height: 100%;
    background: var(--meter-band-bg, #b3c7a4);
    border-radius: 999px;
  }
  .meter-pin {
    position: absolute;
    top: -3px;
    width: 4px;
    height: 16px;
    background: var(--meter-pin-bg, #24372b);
    border-radius: 2px;
  }
  .meter-value {
    grid-area: value;
    align-self: end;
    font-weight: 600;
    font-size: 0.88rem;
    line-height: 1.1;
    text-align: right;
    color: var(--meter-value-color, #24372b);
  }
  .meter-value small {
    display: block;
    font-weight: 400;
    font-size: 0.62rem;
    letter-spacing: 0.02em;
    color: var(--meter-unit-color, #788064);
  }
</style>
