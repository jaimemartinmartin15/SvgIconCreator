import { Coord } from '@jaimemartinmartin15/jei-devkit-angular-shared';

export type PathInstruction = 'M' | 'L' | 'C' | 'Z';

export function isPathInstruction(key: string): key is PathInstruction {
  return ['M', 'L', 'C', 'Z'].includes(key);
}

export const COMMANDS = {
  MOVE_TO: 'M',
  LINE_TO: 'L',
  CUBIC_BEZIER: 'C',
  CLOSE_PATH: 'Z',
} as const satisfies Record<string, PathInstruction>;

export interface Command {
  instruction: PathInstruction;
  coords: Coord[];
}
