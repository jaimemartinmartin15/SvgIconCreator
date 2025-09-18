import { Coord } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ShapeModel } from './shape.model';

export type PathInstruction = 'M' | 'L' | 'C' | 'Z';

export interface Command {
  instruction: PathInstruction;
  coords: Coord[];
}

export interface PathModel extends ShapeModel {
  commands: Command[];
}
