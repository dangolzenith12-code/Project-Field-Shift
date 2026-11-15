<script lang="ts">
  interface Props {
    text?: string;
    subtext?: string;
    angle?: number;
    size?: 'sm' | 'md' | 'lg';
  }

  let { 
    text = "ASK A LOCAL EXPERT", 
    subtext = "Supports, doesn't replace farmers",
    angle = -7,
    size = 'md' 
  }: Props = $props();
</script>

<div 
  class="stamp-wrapper size-{size}"
  style:--stamp-angle="{angle}deg"
>
  <div class="rubber-stamp-box">
    <div class="stamp-inner-border">
      <span class="stamp-main font-display">{text}</span>
      {#if subtext}
        <span class="stamp-sub font-data">{subtext}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .stamp-wrapper {
    display: inline-block;
    user-select: none;
    transform: rotate(var(--stamp-angle, -7deg));
    animation: stamp-thud 450ms cubic-bezier(.34, 1.56, .64, 1) forwards;
  }

  @keyframes stamp-thud {
    0% {
      transform: scale(1.6) rotate(var(--stamp-angle, -7deg));
      opacity: 0;
    }
    60% {
      transform: scale(0.92) rotate(calc(var(--stamp-angle, -7deg) + 2deg));
      opacity: 1;
    }
    80% {
      transform: scale(1.04) rotate(calc(var(--stamp-angle, -7deg) - 1deg));
    }
    100% {
      transform: scale(1) rotate(var(--stamp-angle, -7deg));
    }
  }

  .rubber-stamp-box {
    border: 3.5px solid var(--chili);
    border-radius: 8px;
    padding: 3px;
    background-color: color-mix(in srgb, var(--chili) 6%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--chili) 20%, transparent);
  }

  .stamp-inner-border {
    border: 1.5px dashed var(--chili);
    border-radius: 4px;
    padding: 4px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    text-align: center;
  }

  .stamp-main {
    color: var(--chili);
    font-size: 0.92rem;
    line-height: 1.1;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .stamp-sub {
    color: var(--chili);
    font-size: 0.62rem;
    letter-spacing: 0.4px;
    opacity: 0.9;
  }

  .size-sm .stamp-main { font-size: 0.78rem; }
  .size-sm .stamp-sub { font-size: 0.55rem; }

  .size-lg .stamp-main { font-size: 1.15rem; }
  .size-lg .stamp-sub { font-size: 0.72rem; }
</style>
