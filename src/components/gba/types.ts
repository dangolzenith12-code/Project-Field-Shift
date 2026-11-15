// GBA Top-Down RPG Engine Types for Amma's Field

export type Direction = 'down' | 'up' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: Direction;
  isMoving: boolean;
  frame: number; // 0, 1, 2 for walk cycle
}

export type EntityType = 
  | 'npc_amma' 
  | 'tubewell' 
  | 'weather_station' 
  | 'crop_plot_north' 
  | 'crop_plot_south' 
  | 'banyan_tree' 
  | 'farmhouse' 
  | 'seed_shed'
  | 'grain_urns'
  | 'water_channel';

export interface InteractiveEntity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  promptText: string; // e.g. "Talk to Amma", "Inspect Tubewell"
  interactionRadius: number;
  dialogueId: string;
  collisionBox?: { x: number; y: number; width: number; height: number };
}

export interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PortraitId = 'amma_smile' | 'amma_worry' | 'amma_wise' | 'agronomist' | 'satellite' | 'grandchild';

export interface DialogueChoice {
  text: string;
  nextDialogueId?: string;
  action?: 'open_compare' | 'open_nasa' | 'advance_season' | 'inspect_well' | 'close' | string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerTitle?: string;
  portrait: PortraitId;
  text: string[];
  choices?: DialogueChoice[];
  nasaChip?: string; // e.g. "SMAP_SOIL", "GRACE_WATER", "POWER_RAIN"
}

export interface GbaGameEvent {
  type: 'dialogue_start' | 'open_compare' | 'open_nasa' | 'open_styleguide' | 'advance_era' | 'season_change';
  payload?: any;
}
