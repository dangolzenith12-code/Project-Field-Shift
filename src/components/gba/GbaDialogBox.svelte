<script lang="ts">
  import { onMount } from 'svelte';
  import type { DialogueNode, DialogueChoice, PortraitId } from './types';

  interface Props {
    dialogue: DialogueNode;
    onAdvance?: () => void;
    onSelectChoice?: (choice: DialogueChoice) => void;
    onClose?: () => void;
  }

  let { dialogue, onAdvance, onSelectChoice, onClose }: Props = $props();

  let textPageIndex = $state(0);
  let displayedText = $state('');
  let isTyping = $state(true);
  let typingTimer: any = null;

  const currentFullText = $derived(dialogue.text[textPageIndex] || '');
  const isLastPage = $derived(textPageIndex >= dialogue.text.length - 1);
  const hasChoices = $derived(isLastPage && (dialogue.choices?.length ?? 0) > 0);

  // Typewriter effect
  function startTypewriter(targetText: string) {
    if (typingTimer) clearInterval(typingTimer);
    displayedText = '';
    isTyping = true;
    let charIdx = 0;

    typingTimer = setInterval(() => {
      if (charIdx < targetText.length) {
        displayedText += targetText[charIdx];
        charIdx++;
      } else {
        isTyping = false;
        clearInterval(typingTimer);
      }
    }, 22);
  }

  $effect(() => {
    // When dialogue or text page changes, restart typewriter
    startTypewriter(dialogue.text[textPageIndex] || '');
    return () => {
      if (typingTimer) clearInterval(typingTimer);
    };
  });

  // Handle player pressing Action button
  export function handleActionPress() {
    if (isTyping) {
      // Fast-forward to end of text
      displayedText = currentFullText;
      isTyping = false;
      if (typingTimer) clearInterval(typingTimer);
      return;
    }

    if (!isLastPage) {
      textPageIndex++;
      onAdvance?.();
    } else if (!hasChoices) {
      onClose?.();
    }
  }

  function handleChoiceClick(choice: DialogueChoice) {
    onSelectChoice?.(choice);
  }
</script>

<div 
  class="gba-dialog-frame" 
  onclick={handleActionPress} 
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActionPress(); }}
  role="dialog" 
  tabindex="0"
  aria-modal="true"
>
  <!-- Character Portrait on Left -->
  <div class="portrait-container">
    <div class="portrait-inner">
      {#if dialogue.portrait === 'amma_wise' || dialogue.portrait === 'amma_smile'}
        <!-- Amma Illustrated Portrait -->
        <svg viewBox="0 0 64 64" width="60" height="60" class="portrait-svg">
          <!-- Background circle -->
          <circle cx="32" cy="32" r="28" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <!-- Amma Hair Bun (Silver Grey) -->
          <circle cx="44" cy="22" r="10" fill="#B0A8A0" stroke="var(--ink)" stroke-width="2" />
          <!-- Amma Face -->
          <circle cx="32" cy="32" r="16" fill="#D29A72" stroke="var(--ink)" stroke-width="2" />
          <!-- Silver hair strands -->
          <path d="M 18 26 C 22 16 42 16 46 26" stroke="#B0A8A0" stroke-width="4.5" fill="none" />
          <!-- Bindi -->
          <circle cx="32" cy="26" r="1.5" fill="var(--chili)" />
          <!-- Eyes & Warm Smile -->
          <path d="M 26 31 Q 28 29 30 31" stroke="var(--ink)" stroke-width="1.8" fill="none" />
          <path d="M 34 31 Q 36 29 38 31" stroke="var(--ink)" stroke-width="1.8" fill="none" />
          <path d="M 28 37 Q 32 41 36 37" stroke="var(--ink)" stroke-width="1.8" fill="none" />
          <!-- Sari draping around shoulder (Turmeric/Paddy) -->
          <path d="M 16 48 C 22 40 42 40 48 48 L 48 60 L 16 60 Z" fill="var(--dusk)" stroke="var(--ink)" stroke-width="2" />
        </svg>
      {:else if dialogue.portrait === 'amma_worry'}
        <!-- Amma Worried Face -->
        <svg viewBox="0 0 64 64" width="60" height="60" class="portrait-svg">
          <circle cx="32" cy="32" r="28" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <circle cx="44" cy="22" r="10" fill="#B0A8A0" stroke="var(--ink)" stroke-width="2" />
          <circle cx="32" cy="32" r="16" fill="#D29A72" stroke="var(--ink)" stroke-width="2" />
          <path d="M 18 26 C 22 16 42 16 46 26" stroke="#B0A8A0" stroke-width="4.5" fill="none" />
          <circle cx="32" cy="26" r="1.5" fill="var(--chili)" />
          <!-- Worried eyes -->
          <ellipse cx="27" cy="31" rx="2" ry="1.5" fill="var(--ink)" />
          <ellipse cx="37" cy="31" rx="2" ry="1.5" fill="var(--ink)" />
          <!-- Inverted mouth / concern -->
          <path d="M 28 39 Q 32 36 36 39" stroke="var(--ink)" stroke-width="2" fill="none" />
          <path d="M 16 48 C 22 40 42 40 48 48 L 48 60 L 16 60 Z" fill="var(--dusk)" stroke="var(--ink)" stroke-width="2" />
        </svg>
      {:else if dialogue.portrait === 'agronomist'}
        <!-- Dr. Rao Extension Agronomist -->
        <svg viewBox="0 0 64 64" width="60" height="60" class="portrait-svg">
          <circle cx="32" cy="32" r="28" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <!-- Face -->
          <circle cx="32" cy="34" r="15" fill="#C8926B" stroke="var(--ink)" stroke-width="2" />
          <!-- Field Khaki Hat -->
          <ellipse cx="32" cy="22" rx="22" ry="6" fill="#C2A676" stroke="var(--ink)" stroke-width="2" />
          <path d="M 20 22 C 22 14 42 14 44 22 Z" fill="#A88B57" stroke="var(--ink)" stroke-width="2" />
          <!-- Spectacles -->
          <circle cx="27" cy="33" r="4" fill="none" stroke="var(--ink)" stroke-width="1.5" />
          <circle cx="37" cy="33" r="4" fill="none" stroke="var(--ink)" stroke-width="1.5" />
          <line x1="31" y1="33" x2="33" y2="33" stroke="var(--ink)" stroke-width="1.5" />
          <!-- Mustache & smile -->
          <path d="M 26 40 Q 32 44 38 40" stroke="var(--ink)" stroke-width="2" fill="none" />
        </svg>
      {:else if dialogue.portrait === 'satellite'}
        <!-- NASA Satellite Icon -->
        <svg viewBox="0 0 64 64" width="60" height="60" class="portrait-svg">
          <circle cx="32" cy="32" r="28" fill="color-mix(in srgb, var(--monsoon) 25%, var(--paper))" stroke="var(--ink)" stroke-width="2.5" />
          <!-- Satellite Body -->
          <rect x="24" y="24" width="16" height="16" fill="var(--turmeric)" stroke="var(--ink)" stroke-width="2" />
          <!-- Solar Wings -->
          <rect x="6" y="26" width="16" height="12" fill="var(--monsoon)" stroke="var(--ink)" stroke-width="1.5" />
          <rect x="42" y="26" width="16" height="12" fill="var(--monsoon)" stroke="var(--ink)" stroke-width="1.5" />
          <!-- Dish Antenna -->
          <path d="M 32 40 L 32 48 M 26 50 Q 32 44 38 50" stroke="var(--ink)" stroke-width="2" fill="none" />
          <!-- Radio Waves -->
          <path d="M 28 54 Q 32 58 36 54" stroke="var(--monsoon)" stroke-width="2" fill="none" />
        </svg>
      {:else}
        <!-- Young Grandchild Farmer -->
        <svg viewBox="0 0 64 64" width="60" height="60" class="portrait-svg">
          <circle cx="32" cy="32" r="28" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <!-- Face -->
          <circle cx="32" cy="32" r="16" fill="#D29A72" stroke="var(--ink)" stroke-width="2" />
          <!-- Modern haircut -->
          <path d="M 16 28 C 18 16 46 16 48 28" fill="var(--ink)" />
          <!-- Eyes & grin -->
          <circle cx="27" cy="31" r="2" fill="var(--ink)" />
          <circle cx="37" cy="31" r="2" fill="var(--ink)" />
          <path d="M 28 38 Q 32 42 36 38" stroke="var(--ink)" stroke-width="2" fill="none" />
          <!-- Green Farm Shirt -->
          <path d="M 16 48 C 22 42 42 42 48 48 L 48 60 L 16 60 Z" fill="var(--paddy)" stroke="var(--ink)" stroke-width="2" />
        </svg>
      {/if}
    </div>
  </div>

  <!-- Dialogue Text Area -->
  <div class="dialog-content">
    <div class="speaker-tag-row">
      <span class="speaker-name font-display">{dialogue.speaker}</span>
      {#if dialogue.speakerTitle}
        <span class="speaker-title font-data">[{dialogue.speakerTitle}]</span>
      {/if}
      {#if dialogue.nasaChip}
        <span class="nasa-chip font-data">🛰️ SATELLITE ACTIVE</span>
      {/if}
    </div>

    <!-- The Animated Text Line -->
    <div class="dialog-body font-body">
      {displayedText}
      {#if isTyping}
        <span class="typing-cursor">▌</span>
      {/if}
    </div>

    <!-- Interactive Choices (if last page and choices exist) -->
    {#if hasChoices}
      <div class="choices-container">
        <div class="choices-prompt font-data">SELECT AN OPTION:</div>
        <div class="choices-list">
          {#each dialogue.choices || [] as choice}
            <button 
              type="button" 
              class="choice-btn font-body" 
              onclick={(e) => { e.stopPropagation(); handleChoiceClick(choice); }}
            >
              <span class="choice-arrow">▶</span>
              <span class="choice-text">{choice.text}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Flashing Prompt Arrow when done typing and not choices -->
    {#if !isTyping && !hasChoices}
      <div class="prompt-arrow font-data" aria-hidden="true">
        {isLastPage ? '▼ [PRESS A / SPACE]' : '▼ NEXT'}
      </div>
    {/if}
  </div>
</div>

<style>
  .gba-dialog-frame {
    width: 100%;
    background-color: var(--paper);
    border: 3.5px solid var(--ink);
    border-radius: var(--radius);
    box-shadow: 0 6px 0 var(--ink);
    display: flex;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    position: relative;
    cursor: pointer;
    user-select: none;
    animation: gba-dialog-pop 200ms var(--spring) forwards;
  }

  @keyframes gba-dialog-pop {
    from {
      transform: translateY(12px) scale(0.98);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  .portrait-container {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .portrait-inner {
    border: 2.5px solid var(--ink);
    border-radius: var(--radius-sm);
    background-color: color-mix(in srgb, var(--paper) 80%, var(--turmeric));
    padding: 3px;
    box-shadow: 0 3px 0 var(--ink);
  }

  .portrait-svg {
    display: block;
  }

  .dialog-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 80px;
  }

  .speaker-tag-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    border-bottom: 2px dashed var(--ink);
    padding-bottom: 3px;
  }

  .speaker-name {
    font-size: 1.05rem;
    color: var(--ink);
    letter-spacing: 0.5px;
  }

  .speaker-title {
    font-size: 0.72rem;
    color: var(--soil);
  }

  .nasa-chip {
    font-size: 0.68rem;
    font-weight: bold;
    background-color: var(--monsoon);
    color: var(--paper);
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid var(--ink);
  }

  .dialog-body {
    font-size: 1.02rem;
    line-height: 1.45;
    color: var(--ink);
    min-height: 48px;
  }

  .typing-cursor {
    animation: blink 600ms infinite;
    color: var(--soil);
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* Choices Menu */
  .choices-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
    background-color: color-mix(in srgb, var(--paper) 90%, var(--turmeric));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
  }

  .choices-prompt {
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--soil);
  }

  .choices-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .choice-btn {
    background: none;
    border: none;
    text-align: left;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    border-radius: 4px;
    transition: background-color var(--fast) ease;
  }

  .choice-btn:hover {
    background-color: color-mix(in srgb, var(--turmeric) 45%, var(--paper));
  }

  .choice-arrow {
    color: var(--soil);
    font-size: 0.8rem;
  }

  .choice-text {
    flex-grow: 1;
  }

  /* Flashing indicator arrow */
  .prompt-arrow {
    align-self: flex-end;
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--chili);
    animation: float-arrow 700ms ease-in-out infinite alternate;
  }

  @keyframes float-arrow {
    from { transform: translateY(0); }
    to { transform: translateY(3px); }
  }
</style>
