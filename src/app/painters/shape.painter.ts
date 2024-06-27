import { Coord } from '../coord';

export interface ShapePainter {
  onMouseDown(coord: Coord): void;
  onMouseMove(coord: Coord): void;
  onMouseUp(coord: Coord): void;

  isShapeCompleted(): boolean;
}
