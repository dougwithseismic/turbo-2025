export const VALID_KEYS = [
  'Enter',
  'Escape',
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'Backspace',
  'Delete',
  'Tab',
  'Space',
  ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
] as const;

export type ValidKey = (typeof VALID_KEYS)[number];

export const VALID_ACTIONS = [
  'click',
  'type',
  'hover',
  'select',
  'focus',
  'blur',
  'press',
  'wait',
  'screenshot',
  'scroll',
  'clear',
  'doubleClick',
  'rightClick',
  'dragAndDrop',
] as const;

export type ValidAction = (typeof VALID_ACTIONS)[number];

export interface ScrollOptions {
  behavior?: 'auto' | 'smooth';
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
}

export interface InteractionOptions {
  delay?: number;
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  force?: boolean;
  timeout?: number;
  targetSelector?: string;
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
  scroll?: ScrollOptions;
  steps?: number;
}

export interface Interaction {
  selector: string;
  action: ValidAction;
  value?: string;
  waitAfter?: number;
  options?: InteractionOptions;
}

export interface SyntheticSessionResult {
  screenshots: string[];
  completedInteractions: string[];
  error?: string;
}
