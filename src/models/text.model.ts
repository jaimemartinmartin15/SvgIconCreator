import { ShapeModel } from './shape.model';

export interface TextModel extends ShapeModel {
  x: number;
  y: number;
  text: string;
  fontSize: number;
}
