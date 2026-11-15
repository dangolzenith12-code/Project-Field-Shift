<script lang="ts">
  import type { FarmMeters, StrategyOption } from '../../types/game';
  import type { EquippedTool, TimeOfDay } from '../gba/types';
  import { sfx } from '../../utils/sound';
  import CompareScreen from '../compare/CompareScreen.svelte';
  import NasaDataView from '../nasa/NasaDataView.svelte';
  import JournalView from '../journal/JournalView.svelte';

  interface Props {
    isOpen: boolean;
    regionId?: string;
    meters?: FarmMeters;
    equippedTool?: EquippedTool;
    timeOfDay?: TimeOfDay;
    onClose: () => void;
    onEquipTool?: (tool: EquippedTool) => void;
    onToggleTimeOfDay?: () => void;
    onSelectStrategy?: (strat: StrategyOption) => void;
    onReturnToSelect?: () => void;
  }

  let {
    isOpen,
    regionId = 'punjab',
    meters,
    equippedTool = 'seeds',
    timeOfDay = 'noon',
    onClose,
    onEquipTool,
    onToggleTimeOfDay,
    onSelectStrategy,
    onReturnToSelect
  }: Props = $props();

  type TabId = 'strategies' | 'tools' | 'journal' | 'nasa' | 'controls';
  let activeTab = $state<TabId>('tools');

  function setTab(tab: TabId) {
    activeTab = tab;
    sfx.playSelect();
  }

  const toolDetails: { id: EquippedTool; name: string; tag: string; description: string; effect: string }[] = [
    {
      id: 'seeds',
      name: 'Seed Pouch (Cover & Heirloom Pulses)',
      tag: 'BIOLOGICAL SOIL COVER',
      description: 'Preserved desi moong, red clover, and pearl millet seeds. Broadcasting after main harvest shields soil from wind and fixes natural atmospheric nitrogen.',
      effect: '+15 Organic Carbon, −18 Soil Erosion Risk'
    },
    {
      id: 'water',
      name: 'AWD Irrigation Lota & Perforated Tube',
      tag: 'HYDROLOGY SENSOR',
      description: 'Alternate Wetting & Drying field tube. Lets standing floodwater drop 5 cm below soil before re-irrigating, aerating root tips and saving canal water.',
      effect: '−35% Water Consumption, Prevents Soil Waterlogging'
    },
    {
      id: 'probe',
      name: 'NASA SMAP Deep Root-Zone Probe',
      tag: 'SATELLITE CALIBRATED INSTRUMENT',
      description: 'Digital electronic capacitive penetrometer calibrated with NASA SMAP L4 radiometry. Measures moisture at 0-5 cm and root-zone wetness up to 100 cm depth.',
      effect: 'Detects Sub-Surface Soil Moisture Bands & Crust Compaction'
    },
    {
      id: 'almanac',
      name: 'Ancestral Crop Rotation Almanac',
      tag: 'AGRONOMIC RECORDS',
      description: 'Handwritten family logbook spanning 4 generations. Tracks historical sowing dates, lunar monsoon cues, and multi-crop harvest returns.',
      effect: 'Unlocks Comparative 3-Rotation Field Forecasts'
    }
  ];
</script>

{#if isOpen}
  <div 
    class="backpack-overlay-backdrop" 
    role="dialog" 
    aria-modal="true" 
    tabindex="-1"
    aria-labelledby="backpack-heading"
    onclick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div class="backpack-card">
      <!-- Backpack Header -->
      <div class="backpack-header">
        <div class="header-left">
          <div class="backpack-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z" fill="var(--journal-gold, #E5A93C)" stroke="var(--journal-ink, #1B2B1F)" />
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="var(--journal-ink, #1B2B1F)" />
              <rect x="7" y="11" width="10" height="6" rx="1.5" fill="#FAF6ED" stroke="var(--journal-ink, #1B2B1F)" />
              <line x1="12" y1="11" x2="12" y2="17" stroke="var(--journal-ink, #1B2B1F)" stroke-width="1.5" />
            </svg>
          </div>
          <div>
            <h2 id="backpack-heading" class="backpack-title font-display">FARMER'S FIELD PACK</h2>
            <p class="backpack-subtitle font-body">Strategies • Equipment • Field Journal • NASA Telemetry</p>
          </div>
        </div>

        <button 
          type="button" 
          class="close-backpack-btn font-data" 
          onclick={onClose}
          aria-label="Close Backpack"
          title="Close Backpack (Esc)"
        >
          <span>✕ Close</span>
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="backpack-tabs-bar" role="tablist">
        <button 
          type="button"
          role="tab"
          aria-selected={activeTab === 'tools'}
          class="tab-btn font-display {activeTab === 'tools' ? 'active' : ''}"
          onclick={() => setTab('tools')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span>Tools ({toolDetails.length})</span>
        </button>

        <button 
          type="button"
          role="tab"
          aria-selected={activeTab === 'strategies'}
          class="tab-btn font-display {activeTab === 'strategies' ? 'active' : ''}"
          onclick={() => setTab('strategies')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span>Strategies</span>
        </button>

        <button 
          type="button"
          role="tab"
          aria-selected={activeTab === 'journal'}
          class="tab-btn font-display {activeTab === 'journal' ? 'active' : ''}"
          onclick={() => setTab('journal')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Field Journal</span>
        </button>

        <button 
          type="button"
          role="tab"
          aria-selected={activeTab === 'nasa'}
          class="tab-btn font-display {activeTab === 'nasa' ? 'active' : ''}"
          onclick={() => setTab('nasa')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>NASA Telemetry</span>
        </button>

        <button 
          type="button"
          role="tab"
          aria-selected={activeTab === 'controls'}
          class="tab-btn font-display {activeTab === 'controls' ? 'active' : ''}"
          onclick={() => setTab('controls')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Options</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="backpack-body">
        {#if activeTab === 'tools'}
          <div class="tools-tab-content">
            <div class="tab-intro">
              <h3 class="font-display">EQUIPMENT & SENSORS</h3>
              <p class="font-body">Select a tool to equip. Equipped tools can be used during farm exploration and field checks.</p>
            </div>

            <div class="tools-grid">
              {#each toolDetails as tool}
                <div class="tool-card {equippedTool === tool.id ? 'equipped' : ''}">
                  <div class="tool-top">
                    <span class="tool-tag font-data">{tool.tag}</span>
                    {#if equippedTool === tool.id}
                      <span class="status-badge equipped-badge font-data">EQUIPPED</span>
                    {:else}
                      <span class="status-badge idle-badge font-data">IN PACK</span>
                    {/if}
                  </div>

                  <h4 class="tool-title font-display">{tool.name}</h4>
                  <p class="tool-desc font-body">{tool.description}</p>
                  
                  <div class="tool-effect font-data">
                    <span class="effect-label">Agronomic Impact:</span> {tool.effect}
                  </div>

                  <div class="tool-action-row">
                    {#if onEquipTool}
                      <button 
                        type="button"
                        class="equip-btn font-data {equippedTool === tool.id ? 'active' : ''}"
                        onclick={() => onEquipTool(tool.id)}
                      >
                        {equippedTool === tool.id ? '✓ Currently Equipped' : 'Equip Tool →'}
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>

        {:else if activeTab === 'strategies'}
          <div class="subview-scroll-container">
            <CompareScreen 
              {regionId}
              onSelectStrategy={(strat) => {
                if (onSelectStrategy) onSelectStrategy(strat);
                onClose();
              }}
              onBack={() => setTab('tools')}
            />
          </div>

        {:else if activeTab === 'journal'}
          <div class="subview-scroll-container">
            <JournalView onBack={() => setTab('tools')} />
          </div>

        {:else if activeTab === 'nasa'}
          <div class="subview-scroll-container">
            <NasaDataView onBack={() => setTab('tools')} />
          </div>

        {:else if activeTab === 'controls'}
          <div class="controls-tab-content">
            <div class="tab-intro">
              <h3 class="font-display">GAMEPLAY & ENVIRONMENT SETTINGS</h3>
              <p class="font-body">Adjust environmental simulation cues and game navigation.</p>
            </div>

            <div class="settings-list">
              <!-- Lighting Toggle -->
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-label font-display">Time of Day Lighting</div>
                  <div class="setting-desc font-body">Current: <strong>{timeOfDay.toUpperCase()}</strong>. Toggles diurnal sunlight filters on the farm.</div>
                </div>
                {#if onToggleTimeOfDay}
                  <button type="button" class="action-btn font-data" onclick={onToggleTimeOfDay}>
                    Toggle Lighting →
                  </button>
                {/if}
              </div>

              <!-- Farm Telemetry Meters Status -->
              {#if meters}
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label font-display">Current Soil Telemetry</div>
                    <div class="setting-desc font-data">
                      Moisture: {meters.soilMoisture}% • Organic Matter: {meters.organicMatter}% • Nitrogen: {meters.nitrogen} kg/ha • Water Use: {meters.waterUse} mm
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Return to Region Selection -->
              {#if onReturnToSelect}
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label font-display">Exit Farm Overworld</div>
                    <div class="setting-desc font-body">Return to the mode selection screen without losing your profile.</div>
                  </div>
                  <button type="button" class="action-btn exit-btn font-data" onclick={onReturnToSelect}>
                    Return to Selection →
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .backpack-overlay-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(12, 22, 15, 0.78);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    animation: fadeIn 0.18s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .backpack-card {
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 10px 0 var(--journal-ink, #1B2B1F), 0 20px 40px rgba(0, 0, 0, 0.4);
    border-radius: var(--radius-md, 10px);
    width: 100%;
    max-width: 960px;
    height: 90vh;
    max-height: 800px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .backpack-header {
    background: var(--journal-forest, #1F3825);
    color: #FAF6ED;
    border-bottom: 2.5px solid var(--journal-gold, #E5A93C);
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .backpack-icon-badge {
    background: var(--journal-forest-deep, #142418);
    border: 2px solid var(--journal-gold, #E5A93C);
    border-radius: 8px;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .backpack-title {
    font-size: 1.35rem;
    color: #FAF6ED;
    line-height: 1.1;
    margin: 0;
  }

  .backpack-subtitle {
    font-size: 0.8rem;
    color: var(--journal-gold, #E5A93C);
    margin: 2px 0 0 0;
  }

  .close-backpack-btn {
    background: #FAF6ED;
    color: var(--journal-ink, #1B2B1F);
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    padding: 6px 14px;
    font-size: 0.85rem;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.12s, box-shadow 0.12s;
  }

  .close-backpack-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
    background: #FFFFFF;
  }

  .close-backpack-btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--journal-ink, #1B2B1F);
  }

  .backpack-tabs-bar {
    display: flex;
    background: #EAE3D2;
    border-bottom: 2px solid var(--journal-ink, #1B2B1F);
    overflow-x: auto;
    gap: 4px;
    padding: 6px 12px 0 12px;
  }

  .tab-btn {
    background: #DFD7C2;
    color: var(--journal-ink, #1B2B1F);
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    padding: 8px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.12s ease;
  }

  .tab-btn:hover {
    background: #F1EADB;
  }

  .tab-btn.active {
    background: var(--journal-paper, #FAF6ED);
    border-bottom: 2px solid var(--journal-paper, #FAF6ED);
    margin-bottom: -2px;
    color: var(--journal-forest, #1F3825);
    font-weight: bold;
  }

  .backpack-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: var(--journal-paper, #FAF6ED);
  }

  .tab-intro {
    margin-bottom: 18px;
    border-bottom: 1.5px dashed var(--journal-ink-muted, #556E5C);
    padding-bottom: 12px;
  }

  .tab-intro h3 {
    color: var(--journal-forest, #1F3825);
    font-size: 1.25rem;
    margin-bottom: 4px;
  }

  .tab-intro p {
    color: var(--journal-ink-soft, #2D4233);
    font-size: 0.9rem;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 16px;
  }

  .tool-card {
    background: #FFFFFF;
    border: 2.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 0 var(--journal-ink, #1B2B1F);
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .tool-card.equipped {
    border-color: var(--journal-forest, #1F3825);
    background: #F4F8F4;
    box-shadow: 0 5px 0 var(--journal-forest, #1F3825);
  }

  .tool-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tool-tag {
    font-size: 0.72rem;
    color: var(--journal-sage, #4E7C5A);
    font-weight: bold;
    letter-spacing: 0.05em;
  }

  .status-badge {
    font-size: 0.7rem;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--journal-ink, #1B2B1F);
  }

  .equipped-badge {
    background: var(--journal-forest, #1F3825);
    color: #FAF6ED;
  }

  .idle-badge {
    background: #EAE3D2;
    color: var(--journal-ink, #1B2B1F);
  }

  .tool-title {
    font-size: 1.1rem;
    color: var(--journal-ink, #1B2B1F);
    margin: 0;
  }

  .tool-desc {
    font-size: 0.88rem;
    color: var(--journal-ink-soft, #2D4233);
    line-height: 1.4;
    flex: 1;
  }

  .tool-effect {
    font-size: 0.8rem;
    color: var(--journal-soil, #7E4A35);
    background: #F8F2E8;
    padding: 6px 10px;
    border-radius: 4px;
    border-left: 3px solid var(--journal-gold, #E5A93C);
  }

  .tool-effect .effect-label {
    font-weight: bold;
    color: var(--journal-ink, #1B2B1F);
  }

  .tool-action-row {
    margin-top: 4px;
  }

  .equip-btn {
    width: 100%;
    padding: 8px 14px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    background: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
    transition: transform 0.12s, box-shadow 0.12s;
  }

  .equip-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
  }

  .equip-btn.active {
    background: #EAE3D2;
    color: var(--journal-ink-muted, #556E5C);
    cursor: default;
    box-shadow: none;
    transform: none;
  }

  .subview-scroll-container {
    height: 100%;
  }

  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .setting-item {
    background: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 8px;
    padding: 14px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .setting-label {
    font-size: 1.05rem;
    color: var(--journal-forest, #1F3825);
  }

  .setting-desc {
    font-size: 0.85rem;
    color: var(--journal-ink-soft, #2D4233);
    margin-top: 2px;
  }

  .action-btn {
    padding: 8px 16px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: bold;
    background: var(--journal-paper, #FAF6ED);
    color: var(--journal-ink, #1B2B1F);
    cursor: pointer;
    white-space: nowrap;
    transition: transform 0.12s, box-shadow 0.12s;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
  }

  .action-btn.exit-btn {
    background: #FDF1ED;
    color: var(--journal-madder, #B83827);
    border-color: var(--journal-madder, #B83827);
    box-shadow: 0 3px 0 var(--journal-madder, #B83827);
  }
</style>
