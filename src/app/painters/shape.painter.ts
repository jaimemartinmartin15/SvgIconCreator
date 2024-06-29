import { FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';

export interface ShapePainter {
  // form
  shape: Shape;
  name: string;
  options: FormGroup;

  // mouse events
  onMouseDown(coord: Coord): void;
  onMouseMove(coord: Coord): void;
  onMouseUp(coord: Coord): void;

  // edition of shape
  onMouseDownEdit(coord: Coord): void;
  onMouseMoveEdit(coord: Coord): void;
  onMouseUpEdit(coord: Coord): void;

  // state of the shape
  isShapeStarted(): boolean;
  isShapeCompleted(): boolean;
  isShapeSelected(): boolean;
  setShapeSelected(selected: boolean): void;

  // add the shape to the canvas
  addToCanvas(canvas: SVGElement): void;
  // removeFromCanvas(): void;
}
