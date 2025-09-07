import { ShapeModel } from "./shape.model";

export interface RectModel extends ShapeModel {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
}
