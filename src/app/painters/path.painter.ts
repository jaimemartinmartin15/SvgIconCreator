import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainter } from './shape.painter';

export class PathPainter implements ShapePainter {
  private canvas: SVGElement;
  private pathEl: SVGPathElement;

  private isPathStarted = false;
  private isPathCompleted: boolean = false;
  private isPathSelected: boolean = false;
  private isMouseDown = false;
  private points: Coord[] = [];

  public shape = Shape.PATH;
  public name = 'path';
  public options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(1),
    fill: new FormControl('#FFFFFF'),
    points: new FormArray([]),
  });

  public constructor() {
    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.pathEl.setAttribute('stroke', v.stroke);
      this.pathEl.setAttribute('stroke-width', v.strokeWidth);
      this.pathEl.setAttribute('fill', v.fill);

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

  //#region mouse-events-edit

  public onMouseDownEdit(coord: Coord): void {
    // TODO
  }
  public onMouseMoveEdit(coord: Coord): void {
    // TODO
  }
  public onMouseUpEdit(coord: Coord): void {
    // TODO
  }

  //#endregion mouse-events-edit

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
    return this.isPathSelected;
  }

  public setShapeSelected(selected: boolean): void {
    this.isPathSelected = selected;
  }

  //#endregion shape-state

  public addToCanvas(canvas: SVGElement) {
    this.canvas = canvas;
    this.pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.canvas.append(this.pathEl);
    this.isPathStarted = true;
  }
}
