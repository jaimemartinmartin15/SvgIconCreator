import { SharedModel } from '../shared.model';

export interface CircleModel extends SharedModel {
  cx: number;
  cy: number;
  r: number;
}
