<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'paddy' | 'chili';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    children?: Snippet;
  }

  let { 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    onclick, 
    type = 'button',
    class: className = '',
    children 
  }: Props = $props();
</script>

<button 
  {type}
  class="vintage-btn btn-{variant} size-{size} {className}" 
  {disabled}
  {onclick}
>
  {@render children?.()}
</button>

<style>
  .vintage-btn {
    font-family: var(--font-display);
    border: var(--outline);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    line-height: 1;
    transition: transform var(--fast) var(--spring), box-shadow var(--fast) var(--spring), background-color var(--fast) ease;
  }

  .size-sm {
    padding: 0.4em 0.9em;
    font-size: 0.88rem;
  }

  .size-md {
    padding: 0.6em 1.4em;
    font-size: 1.05rem;
  }

  .size-lg {
    padding: 0.75em 1.9em;
    font-size: 1.25rem;
  }

  .btn-primary {
    background-color: var(--turmeric);
    color: var(--ink);
  }

  .btn-secondary {
    background-color: var(--paper);
    color: var(--ink);
  }

  .btn-paddy {
    background-color: var(--paddy);
    color: var(--paper);
  }

  .btn-chili {
    background-color: var(--chili);
    color: var(--paper);
  }

  .vintage-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 7px 0 var(--ink);
  }

  .vintage-btn:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 1px 0 var(--ink);
  }

  .vintage-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: 0 2px 0 var(--ink);
    transform: none;
  }
</style>
