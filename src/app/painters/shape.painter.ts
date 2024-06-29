import { FormGroup } from '@angular/forms';
import { Coord } from '../coord';

export interface ShapePainter {
  // form
  options: FormGroup;

  // mouse events
  onMouseDown(coord: Coord): void;
  onMouseMove(coord: Coord): void;
  onMouseUp(coord: Coord): void;

  // state of the shape
  isShapeStarted(): boolean;
  isShapeCompleted(): boolean;
  isShapeSelected(): boolean;

  // add the shape to the canvas
  addToCanvas(canvas: SVGElement): void;
  // removeFromCanvas(): void;
}
