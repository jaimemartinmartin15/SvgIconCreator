import { Coord } from '../../coord';
import { SharedModel } from '../shared.model';

export interface PathModel extends SharedModel {
  points: Coord[];
}
