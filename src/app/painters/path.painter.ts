import { FormArray, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class PathPainter implements ShapePainter {
  private canvas: SVGElement;
  private pathEl: SVGPathElement;

  private isPathStarted = false;
  private isPathCompleted: boolean = false;
  private isMouseDown = false;
  private points: Coord[] = [];

  public options: FormGroup = new FormGroup({
    points: new FormArray([]),
  });

  public constructor() {
    this.options.valueChanges.subscribe((value) => {
      // TODO
      console.log('Path form values');
    });
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.points.push(coord);

    this.pathEl.setAttribute('d', `M${this.points.map((p) => `${p.x},${p.y}`).join(' ')}`);

    this.options.patchValue(
      {
        points: this.points,
      },
      { emitEvent: false }
    );
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    // allows to draw first segment with one single click and drag
    const index = this.points.length === 1 ? this.points.length : this.points.length - 1;
    this.points[index] = coord;

    this.pathEl.setAttribute('d', `M${this.points.map((p) => `${p.x},${p.y}`).join(' ')}`);

    this.options.patchValue(
      {
        points: this.points,
      },
      { emitEvent: false }
    );
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;
    this.points[this.points.length - 1] = coord;

    this.pathEl.setAttribute('d', `M${this.points.map((p) => `${p.x},${p.y}`).join(' ')}`);

    this.options.patchValue(
      {
        points: this.points,
      },
      { emitEvent: false }
    );
  }

  //#endregion mouse-events

  //#region shape-state

  public isShapeStarted(): boolean {
    return this.isPathStarted;
  }

  public setPathCompleted() {
    this.isPathCompleted = true;
  }

  public isShapeCompleted() {
    return this.isPathCompleted;
  }

  public isShapeSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  //#endregion shape-state

  public addToCanvas(canvas: SVGElement) {
    this.canvas = canvas;
    this.pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.canvas.append(this.pathEl);
    this.isPathStarted = true;

    this.pathEl.setAttribute('fill', 'none'); // TODO
    this.pathEl.setAttribute('stroke', 'orange'); // TODO
  }
}
