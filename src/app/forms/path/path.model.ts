import { Coord } from '../../coord';
import { SharedModel } from '../shared.model';

export interface Command {
  type: string;
  coords: Coord[];
}

export interface PathModel extends SharedModel {
  commands: Command[];
}
