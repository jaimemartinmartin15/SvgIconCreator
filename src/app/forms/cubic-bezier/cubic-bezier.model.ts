import { SharedModel } from '../shared.model';

export interface CubicBezierModel extends SharedModel {
  x1: number;
  y1: number;
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
  x2: number;
  y2: number;
}
