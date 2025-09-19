import { ShapeModel } from './shape.model';

export interface LineModel extends ShapeModel {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
