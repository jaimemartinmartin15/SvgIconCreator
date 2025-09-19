import { ShapeModel } from './shape.model';

export interface CircleModel extends ShapeModel {
  cx: number;
  cy: number;
  r: number;
}
