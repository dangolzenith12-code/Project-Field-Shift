<script lang="ts">
  interface Props {
    text: string;
    sublabel?: string;
  }

  let { text, sublabel = "Amma's Wisdom" }: Props = $props();
</script>

<div class="amma-bubble-wrapper">
  <div class="amma-avatar-badge font-display" aria-hidden="true">
    👵🏾
  </div>
  <div class="speech-bubble">
    <div class="bubble-header font-display">{sublabel}</div>
    <p class="bubble-text">{text}</p>
    <div class="pointer-tail" aria-hidden="true"></div>
  </div>
</div>

<style>
  .amma-bubble-wrapper {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    max-width: 680px;
    margin: 0 auto;
    position: relative;
  }

  .amma-avatar-badge {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--dusk);
    color: var(--paper);
    border: 3px solid var(--ink);
    box-shadow: 0 4px 0 var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .speech-bubble {
    position: relative;
    background-color: color-mix(in srgb, var(--dusk) 14%, var(--paper));
    border: 3px solid var(--dusk);
    border-radius: var(--radius);
    padding: var(--space-3) var(--space-4);
    box-shadow: 0 4px 0 var(--dusk);
  }

  .bubble-header {
    font-size: 0.85rem;
    color: var(--dusk);
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .bubble-text {
    font-size: 1rem;
    font-style: italic;
    line-height: 1.45;
    color: var(--ink);
  }

  /* Hand-drawn pointer tail */
  .pointer-tail {
    position: absolute;
    top: 14px;
    left: -12px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 12px solid var(--dusk);
  }

  .pointer-tail::after {
    content: "";
    position: absolute;
    top: -6px;
    left: 2px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 10px solid color-mix(in srgb, var(--dusk) 14%, var(--paper));
  }
</style>
