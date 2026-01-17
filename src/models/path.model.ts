export const PATH_INSTRUCTIONS = ['M', 'm', 'L', 'l', 'H', 'h', 'V', 'v', 'C', 'c', 'S', 's', 'Q', 'q', 'T', 't', 'A', 'a', 'Z', 'z'] as const;

export type PathInstruction = (typeof PATH_INSTRUCTIONS)[number];

export function isPathInstruction(key: string): key is PathInstruction {
  return PATH_INSTRUCTIONS.includes(key as PathInstruction);
}

export interface Command {
  instruction: PathInstruction;
  parameters: number[];
}

export const COMMAND_SEGMENT_LENGTH: Record<PathInstruction, number> = {
  M: 2,
  m: 2,
  L: 2,
  l: 2,
  H: 1,
  h: 1,
  V: 1,
  v: 1,
  C: 6,
  c: 6,
  S: 4,
  s: 4,
  Q: 4,
  q: 4,
  T: 2,
  t: 2,
  A: 7,
  a: 7,
  Z: 0,
  z: 0,
};

export const NUMBER_OF_PARAMETERS_PER_COLUMN: Record<PathInstruction, number> = {
  M: 6,
  m: 6,
  L: 6,
  l: 6,
  H: 5,
  h: 5,
  V: 5,
  v: 5,
  C: 6,
  c: 6,
  S: 4,
  s: 4,
  Q: 4,
  q: 4,
  T: 6,
  t: 6,
  A: 7,
  a: 7,
  Z: 0,
  z: 0,
};
