<script lang="ts">
  import type { DialogueNode, DialogueChoice } from './types';

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
    }, 18);
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
  <!-- Floating Speech Tail pointing up toward NPC -->
  <div class="speech-bubble-tail"></div>

  <!-- Character Portrait on Left -->
  <div class="portrait-container">
    <div class="portrait-inner">
      {#if dialogue.portrait === 'amma_wise' || dialogue.portrait === 'amma_smile'}
        <!-- Amma Illustrated Portrait -->
        <svg viewBox="0 0 64 64" width="68" height="68" class="portrait-svg">
          <!-- Background circle -->
          <circle cx="32" cy="32" r="29" fill="#14261B" stroke="#00FF66" stroke-width="2.5" />
          <!-- Amma Hair Bun (Silver Grey) -->
          <circle cx="44" cy="22" r="10" fill="#B0A8A0" stroke="#0B140D" stroke-width="2" />
          <!-- Amma Face -->
          <circle cx="32" cy="32" r="16" fill="#D29A72" stroke="#0B140D" stroke-width="2" />
          <!-- Silver hair strands -->
          <path d="M 18 26 C 22 16 42 16 46 26" stroke="#DCD7D0" stroke-width="4.5" fill="none" />
          <!-- Bindi (Vermilion) -->
          <circle cx="32" cy="26" r="2" fill="#E63946" />
          <!-- Eyes & Warm Smile -->
          <path d="M 26 31 Q 28 29 30 31" stroke="#0B140D" stroke-width="2" fill="none" />
          <path d="M 34 31 Q 36 29 38 31" stroke="#0B140D" stroke-width="2" fill="none" />
          <path d="M 28 37 Q 32 41 36 37" stroke="#0B140D" stroke-width="2" fill="none" />
          <!-- Sari draping around shoulder (Royal Amethyst Purple) -->
          <path d="M 16 48 C 22 40 42 40 48 48 L 48 60 L 16 60 Z" fill="#7B4FA3" stroke="#0B140D" stroke-width="2" />
        </svg>
      {:else if dialogue.portrait === 'amma_worry'}
        <!-- Amma Worried Face -->
        <svg viewBox="0 0 64 64" width="68" height="68" class="portrait-svg">
          <circle cx="32" cy="32" r="29" fill="#14261B" stroke="#FFB703" stroke-width="2.5" />
          <circle cx="44" cy="22" r="10" fill="#B0A8A0" stroke="#0B140D" stroke-width="2" />
          <circle cx="32" cy="32" r="16" fill="#D29A72" stroke="#0B140D" stroke-width="2" />
          <path d="M 18 26 C 22 16 42 16 46 26" stroke="#DCD7D0" stroke-width="4.5" fill="none" />
          <circle cx="32" cy="26" r="2" fill="#E63946" />
          <!-- Worried eyes -->
          <ellipse cx="27" cy="31" rx="2" ry="1.5" fill="#0B140D" />
          <ellipse cx="37" cy="31" rx="2" ry="1.5" fill="#0B140D" />
          <!-- Inverted mouth / concern -->
          <path d="M 28 39 Q 32 36 36 39" stroke="#0B140D" stroke-width="2" fill="none" />
          <path d="M 16 48 C 22 40 42 40 48 48 L 48 60 L 16 60 Z" fill="#7B4FA3" stroke="#0B140D" stroke-width="2" />
        </svg>
      {:else if dialogue.portrait === 'agronomist'}
        <!-- Dr. Rao Extension Agronomist -->
        <svg viewBox="0 0 64 64" width="68" height="68" class="portrait-svg">
          <circle cx="32" cy="32" r="29" fill="#14261B" stroke="#00FF66" stroke-width="2.5" />
          <!-- Face -->
          <circle cx="32" cy="34" r="15" fill="#C88756" stroke="#0B140D" stroke-width="2" />
          <!-- Field Khaki Hat -->
          <ellipse cx="32" cy="22" rx="22" ry="6" fill="#D4B483" stroke="#0B140D" stroke-width="2" />
          <path d="M 20 22 C 22 14 42 14 44 22 Z" fill="#B89762" stroke="#0B140D" stroke-width="2" />
          <!-- Spectacles -->
          <circle cx="27" cy="33" r="4" fill="none" stroke="#00E5FF" stroke-width="1.8" />
          <circle cx="37" cy="33" r="4" fill="none" stroke="#00E5FF" stroke-width="1.8" />
          <line x1="31" y1="33" x2="33" y2="33" stroke="#00E5FF" stroke-width="1.8" />
          <!-- Mustache & smile -->
          <path d="M 26 40 Q 32 44 38 40" stroke="#0B140D" stroke-width="2.2" fill="none" />
        </svg>
      {:else if dialogue.portrait === 'satellite'}
        <!-- NASA Satellite Icon -->
        <svg viewBox="0 0 64 64" width="68" height="68" class="portrait-svg">
          <circle cx="32" cy="32" r="29" fill="#0D1E30" stroke="#00E5FF" stroke-width="2.5" />
          <!-- Satellite Gold Body -->
          <rect x="24" y="24" width="16" height="16" fill="#FFD166" stroke="#0B140D" stroke-width="2" />
          <!-- Dual Blue Solar Wings -->
          <rect x="6" y="26" width="16" height="12" fill="#1E88E5" stroke="#64B5F6" stroke-width="1.5" />
          <rect x="42" y="26" width="16" height="12" fill="#1E88E5" stroke="#64B5F6" stroke-width="1.5" />
          <!-- Dish Antenna -->
          <path d="M 32 40 L 32 48 M 26 50 Q 32 44 38 50" stroke="#ECEFF1" stroke-width="2" fill="none" />
          <!-- Radio Waves -->
          <path d="M 28 54 Q 32 58 36 54" stroke="#00FF66" stroke-width="2" fill="none" />
        </svg>
      {:else}
        <!-- Young Grandchild Farmer -->
        <svg viewBox="0 0 64 64" width="68" height="68" class="portrait-svg">
          <circle cx="32" cy="32" r="29" fill="#14261B" stroke="#00FF66" stroke-width="2.5" />
          <!-- Face -->
          <circle cx="32" cy="32" r="16" fill="#D29A72" stroke="#0B140D" stroke-width="2" />
          <!-- Turban / Hair -->
          <path d="M 16 26 C 18 14 46 14 48 26" fill="#F4A261" stroke="#0B140D" stroke-width="2" />
          <!-- Eyes & grin -->
          <circle cx="27" cy="31" r="2" fill="#0B140D" />
          <circle cx="37" cy="31" r="2" fill="#0B140D" />
          <path d="M 28 38 Q 32 42 36 38" stroke="#0B140D" stroke-width="2" fill="none" />
          <!-- Kurta -->
          <path d="M 16 48 C 22 42 42 42 48 48 L 48 60 L 16 60 Z" fill="#F8F9FA" stroke="#0B140D" stroke-width="2" />
        </svg>
      {/if}
    </div>
  </div>

  <!-- Dialogue Text Area -->
  <div class="dialog-content">
    <div class="speaker-tag-row">
      <span class="speaker-name font-pixel">{dialogue.speaker}</span>
      {#if dialogue.speakerTitle}
        <span class="speaker-title font-data">[{dialogue.speakerTitle}]</span>
      {/if}
      {#if dialogue.nasaChip}
        <span class="nasa-chip font-data">🛰️ NASA SATELLITE ACTIVE</span>
      {/if}
      <button 
        type="button" 
        class="dialog-close-btn font-pixel" 
        onclick={(e) => { e.stopPropagation(); onClose?.(); }}
        aria-label="Close dialogue"
      >
        ✕ CLOSE
      </button>
    </div>

    <!-- The Animated Text Line -->
    <div class="dialog-body font-body">
      {displayedText}
      {#if isTyping}
        <span class="typing-cursor font-pixel">▌</span>
      {/if}
    </div>

    <!-- Interactive Choices (if last page and choices exist) -->
    {#if hasChoices}
      <div class="choices-container">
        <div class="choices-prompt font-pixel">⚡ SELECT AN ACTION / RESPONSE:</div>
        <div class="choices-list">
          {#each dialogue.choices || [] as choice}
            <button 
              type="button" 
              class="choice-btn font-data" 
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
      <div class="prompt-arrow font-pixel" aria-hidden="true">
        {isLastPage ? '▼ [PRESS SPACE / CLICK TO EXIT]' : '▼ NEXT [SPACE / CLICK]'}
      </div>
    {/if}
  </div>
</div>

<style>
  .gba-dialog-frame {
    width: 100%;
    background: linear-gradient(180deg, #0C1A11 0%, #060E09 100%);
    border: 3px solid #00FF66;
    border-radius: 8px;
    box-shadow: 0 0 24px rgba(0, 255, 102, 0.45), 0 10px 32px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    gap: 16px;
    padding: 14px 18px;
    position: relative;
    cursor: pointer;
    user-select: none;
    color: #F8F9FA;
    animation: floatDialog 2.6s ease-in-out infinite alternate;
  }

  @keyframes floatDialog {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
  }

  /* Floating speech tail pointing toward character */
  .speech-bubble-tail {
    position: absolute;
    top: -12px;
    left: 48px;
    width: 0;
    height: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 12px solid #00FF66;
  }

  .speech-bubble-tail::after {
    content: '';
    position: absolute;
    top: 3px;
    left: -7px;
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 9px solid #0C1A11;
  }

  .portrait-container {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .portrait-inner {
    border: 2px solid #00FF66;
    border-radius: 6px;
    background-color: #050B07;
    padding: 3px;
    box-shadow: 0 0 12px rgba(0, 255, 102, 0.25);
  }

  .portrait-svg {
    display: block;
  }

  .dialog-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 85px;
  }

  .speaker-tag-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    border-bottom: 1.5px dashed #1E4628;
    padding-bottom: 6px;
  }

  .speaker-name {
    font-size: 13px;
    color: #FFD166;
    letter-spacing: 0.5px;
  }

  .speaker-title {
    font-size: 11px;
    color: #52B788;
  }

  .nasa-chip {
    font-size: 10px;
    font-weight: bold;
    background-color: #0D2B45;
    color: #00E5FF;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #00E5FF;
  }

  .dialog-close-btn {
    margin-left: auto;
    background: #2E1515;
    border: 1px solid #FF5A5A;
    color: #FF8585;
    font-size: 9px;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .dialog-close-btn:hover {
    background: #FF5A5A;
    color: #000;
  }

  .dialog-body {
    font-size: 14.5px;
    line-height: 1.6;
    color: #F0FDF4;
    min-height: 48px;
    font-weight: 500;
  }

  .typing-cursor {
    animation: blinkCursor 600ms infinite;
    color: #00FF66;
    margin-left: 2px;
  }

  @keyframes blinkCursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* Choices Menu */
  .choices-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 6px;
    background-color: #0E1D13;
    border: 2px solid #285434;
    border-radius: 6px;
    padding: 10px 14px;
  }

  .choices-prompt {
    font-size: 11px;
    color: #FFB703;
    margin-bottom: 2px;
  }

  .choices-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .choice-btn {
    background: #14281B;
    border: 1.5px solid #2E5A38;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #FFFFFF;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    transition: all 0.15s ease;
  }

  .choice-btn:hover {
    background-color: #00FF66;
    border-color: #00FF66;
    color: #000000;
    transform: translateX(4px);
    box-shadow: 0 0 10px rgba(0, 255, 102, 0.4);
  }

  .choice-btn:hover .choice-arrow {
    color: #000000;
  }

  .choice-arrow {
    color: #00FF66;
    font-size: 11px;
    transition: color 0.15s ease;
  }

  .choice-text {
    flex-grow: 1;
  }

  /* Flashing indicator arrow */
  .prompt-arrow {
    align-self: flex-end;
    font-size: 10px;
    color: #FFD166;
    animation: bouncePrompt 700ms ease-in-out infinite alternate;
    margin-top: 2px;
  }

  @keyframes bouncePrompt {
    from { transform: translateY(0); }
    to { transform: translateY(3px); }
  }
</style>
