export const PATH_INSTRUCTIONS = ['M', 'm', 'L', 'l', 'H', 'h', 'V', 'v', 'C', 'c', 'S', 's', 'Q', 'q', 'T', 't', 'A', 'a', 'Z', 'z'] as const;

export type PathInstruction = (typeof PATH_INSTRUCTIONS)[number];

export function isPathInstruction(key: string): key is PathInstruction {
  return PATH_INSTRUCTIONS.includes(key as PathInstruction);
}

export interface Command {
  instruction: PathInstruction;
  parameters: number[];
}
