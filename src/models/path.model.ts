import { Coord } from '@jaimemartinmartin15/jei-devkit-angular-shared';

export const PATH_INSTRUCTIONS = ['M', 'm', 'L', 'l', 'H', 'h', 'V', 'v', 'C', 'c', 'S', 's', 'Q', 'q', 'T', 't', 'A', 'a', 'Z', 'z'] as const;

export type PathInstruction = (typeof PATH_INSTRUCTIONS)[number];

export function isPathInstruction(key: string): key is PathInstruction {
  return PATH_INSTRUCTIONS.includes(key as PathInstruction);
}

export interface Command {
  instruction: PathInstruction;
  parameters: number[];
}

interface CommandSpec {
  arity: number;
  drawingStepsIndexes: number[][];
  parametersPerRow: number;
  defaultParams: (c: Coord) => number[];
  getNewPositionAfterMove: (params: number[], currentPosition: Coord) => Coord;
  getEditPointPositions: (params: number[], currentPosition: Coord) => Coord[];
}

export const COMMAND_SPECS: { [K in PathInstruction]: CommandSpec } = {
  M: {
    arity: 2,
    drawingStepsIndexes: [[0, 1]],
    parametersPerRow: 6,
    defaultParams: (c: Coord) => [c.x, c.y],
    getNewPositionAfterMove: (params: number[]) => ({ x: params[0], y: params[1] }),
    getEditPointPositions: (params: number[]) => [{ x: params[0], y: params[1] }],
  },
  m: {
    arity: 2,
    drawingStepsIndexes: [[0, 1]],
    parametersPerRow: 6,
    defaultParams: (c: Coord) => [c.x, c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: currentPosition.x + params[0], y: currentPosition.y + params[1] }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [{ x: currentPosition.x + params[0], y: currentPosition.y + params[1] }],
  },
  L: {
    arity: 2,
    drawingStepsIndexes: [[0, 1]],
    parametersPerRow: 6,
    defaultParams: (c: Coord) => [c.x, c.y],
    getNewPositionAfterMove: (params: number[]) => ({ x: params[0], y: params[1] }),
    getEditPointPositions: (params: number[]) => [{ x: params[0], y: params[1] }],
  },
  l: {
    arity: 2,
    drawingStepsIndexes: [[0, 1]],
    parametersPerRow: 6,
    defaultParams: (c: Coord) => [c.x, c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: currentPosition.x + params[0], y: currentPosition.y + params[1] }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [{ x: currentPosition.x + params[0], y: currentPosition.y + params[1] }],
  },
  H: {
    arity: 1,
    drawingStepsIndexes: [[0]],
    parametersPerRow: 5,
    defaultParams: (c: Coord) => [c.x],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: params[0], y: currentPosition.y }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [{ x: params[0], y: currentPosition.y }],
  },
  h: {
    arity: 1,
    drawingStepsIndexes: [[0]],
    parametersPerRow: 5,
    defaultParams: (c: Coord) => [c.x],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: currentPosition.x + params[0], y: currentPosition.y }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [{ x: currentPosition.x + params[0], y: currentPosition.y }],
  },
  V: {
    arity: 1,
    drawingStepsIndexes: [[0]],
    parametersPerRow: 5,
    defaultParams: (c: Coord) => [c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: currentPosition.x, y: params[0] }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [{ x: currentPosition.x, y: params[0] }],
  },
  v: {
    arity: 1,
    drawingStepsIndexes: [[0]],
    parametersPerRow: 5,
    defaultParams: (c: Coord) => [c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: currentPosition.x, y: currentPosition.y + params[0] }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [{ x: currentPosition.x, y: currentPosition.y + params[0] }],
  },
  C: {
    arity: 6,
    drawingStepsIndexes: [
      [4, 5],
      [0, 1],
      [2, 3],
    ],
    parametersPerRow: 6,
    defaultParams: (c: Coord) => [c.x, c.y, c.x, c.y, c.x, c.y],
    getNewPositionAfterMove: (params: number[]) => ({ x: params[4], y: params[5] }),
    getEditPointPositions: (params: number[]) => [
      { x: params[0], y: params[1] },
      { x: params[2], y: params[3] },
      { x: params[4], y: params[5] },
    ],
  },
  c: {
    arity: 6,
    drawingStepsIndexes: [
      [4, 5],
      [0, 1],
      [2, 3],
    ],
    parametersPerRow: 6,
    defaultParams: (c: Coord) => [c.x, c.y, c.x, c.y, c.x, c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({
      x: currentPosition.x + params[4],
      y: currentPosition.y + params[5],
    }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [
      { x: currentPosition.x + params[0], y: currentPosition.y + params[1] },
      { x: currentPosition.x + params[2], y: currentPosition.y + params[3] },
      { x: currentPosition.x + params[4], y: currentPosition.y + params[5] },
    ],
  },
  S: {
    arity: 4,
    drawingStepsIndexes: [
      [2, 3],
      [0, 1],
    ],
    parametersPerRow: 4,
    defaultParams: (c: Coord) => [c.x, c.y, c.x, c.y],
    getNewPositionAfterMove: (params: number[]) => ({ x: params[2], y: params[3] }),
    getEditPointPositions: (params: number[]) => [
      { x: params[0], y: params[1] },
      { x: params[2], y: params[3] },
    ],
  },
  s: {
    arity: 4,
    drawingStepsIndexes: [
      [2, 3],
      [0, 1],
    ],
    parametersPerRow: 4,
    defaultParams: (c: Coord) => [c.x, c.y, c.x, c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: currentPosition.x + params[2], y: currentPosition.y + params[3] }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [
      { x: currentPosition.x + params[0], y: currentPosition.y + params[1] },
      { x: currentPosition.x + params[2], y: currentPosition.y + params[3] },
    ],
  },
  Q: {
    arity: 4,
    drawingStepsIndexes: [
      [2, 3],
      [0, 1],
    ],
    parametersPerRow: 4,
    defaultParams: (c: Coord) => [c.x, c.y, c.x, c.y],
    getNewPositionAfterMove: (params: number[]) => ({ x: params[2], y: params[3] }),
    getEditPointPositions: (params: number[]) => [
      { x: params[0], y: params[1] },
      { x: params[2], y: params[3] },
    ],
  },
  q: {
    arity: 4,
    drawingStepsIndexes: [
      [2, 3],
      [0, 1],
    ],
    parametersPerRow: 4,
    defaultParams: (c: Coord) => [c.x, c.y, c.x, c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: currentPosition.x + params[2], y: currentPosition.y + params[3] }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [
      { x: currentPosition.x + params[0], y: currentPosition.y + params[1] },
      { x: currentPosition.x + params[2], y: currentPosition.y + params[3] },
    ],
  },
  T: {
    arity: 2,
    drawingStepsIndexes: [[0, 1]],
    parametersPerRow: 6,
    defaultParams: (c: Coord) => [c.x, c.y],
    getNewPositionAfterMove: (params: number[]) => ({ x: params[0], y: params[1] }),
    getEditPointPositions: (params: number[]) => [{ x: params[0], y: params[1] }],
  },
  t: {
    arity: 2,
    drawingStepsIndexes: [[0, 1]],
    parametersPerRow: 6,
    defaultParams: (c: Coord) => [c.x, c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({ x: currentPosition.x + params[0], y: currentPosition.y + params[1] }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [{ x: currentPosition.x + params[0], y: currentPosition.y + params[1] }],
  },
  A: {
    arity: 7,
    drawingStepsIndexes: [[5, 6]],
    parametersPerRow: 7,
    defaultParams: (c: Coord) => [4, 2, 0, 0, 0, c.x, c.y],
    getNewPositionAfterMove: (params: number[]) => ({ x: params[5], y: params[6] }),
    getEditPointPositions: (params: number[]) => [{ x: params[5], y: params[6] }],
  },
  a: {
    arity: 7,
    drawingStepsIndexes: [[5, 6]],
    parametersPerRow: 7,
    defaultParams: (c: Coord) => [4, 2, 0, 0, 0, c.x, c.y],
    getNewPositionAfterMove: (params: number[], currentPosition: Coord) => ({
      x: currentPosition.x + params[5],
      y: currentPosition.y + params[6],
    }),
    getEditPointPositions: (params: number[], currentPosition: Coord) => [{ x: currentPosition.x + params[5], y: currentPosition.y + params[6] }],
  },
  Z: {
    arity: 0,
    drawingStepsIndexes: [],
    parametersPerRow: 0,
    defaultParams: () => [],
    getNewPositionAfterMove: (_: number[], currentPosition: Coord) => currentPosition,
    getEditPointPositions: () => [],
  },
  z: {
    arity: 0,
    drawingStepsIndexes: [],
    parametersPerRow: 0,
    defaultParams: () => [],
    getNewPositionAfterMove: (_: number[], currentPosition: Coord) => currentPosition,
    getEditPointPositions: () => [],
  },
};
