import { SharedModel } from '../shared.model';

export interface RectModel extends SharedModel {
  x: number;
  y: number;
  width: number;
  height: number;
  roundCornerX: number;
  roundCornerY: number;
  name: string;
}
