import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainter } from './shape.painter';

export class CubicBezierPainter implements ShapePainter {
  private canvas: SVGElement;
  private cubicBezierEl: SVGPathElement;

  private isCubicBezierStarted = false;
  private isCubicBezierCompleted = false;
  private isCubicBezierSelected = false;
  private isMouseDown = false;
  private points: Coord[] = [];
  private state: number = 0; // 0 -> no points added, 1 -> start point added, 2 -> end point added, 3 -> control point 1 added, 4 -> control point 2 added

  public shape = Shape.CUBIC_BEZIER;
  public name = 'cubic-bezier';
  public options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(1),
    fill: new FormControl('#FFFFFF'),
    x1: new FormControl(0),
    y1: new FormControl(0),
    c1x: new FormControl(0),
    c1y: new FormControl(0),
    c2x: new FormControl(0),
    c2y: new FormControl(0),
    x2: new FormControl(0),
    y2: new FormControl(0),
  });

  public constructor() {
    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.points[0] = { x: v.x1, y: v.y1 };
      this.points[1] = { x: v.c1x, y: v.c1y };
      this.points[2] = { x: v.c2x, y: v.c2y };
      this.points[3] = { x: v.x2, y: v.y2 };
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
      this.cubicBezierEl.setAttribute('stroke', v.stroke);
      this.cubicBezierEl.setAttribute('stroke-width', v.strokeWidth);
      this.cubicBezierEl.setAttribute('fill', v.fill);
    });
  }

  private calculatePath() {
    const p1 = this.points[0]; // start point
    const p2 = this.points[1] ?? p1; // point control 1
    const p3 = this.points[2] ?? p1; // point control 2
    const p4 = this.points[3] ?? p1; // end point
    return `M${p1.x},${p1.y}C${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;

    if (this.state === 0) {
      this.points[0] = this.points[1] = this.points[2] = this.points[3] = coord;
      this.state = 1;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
    }

    if (this.state === 2) {
      this.points[1] = coord;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
    }

    if (this.state === 3) {
      this.points[2] = coord;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
    }

    this.options.patchValue(
      {
        x1: this.points[0].x,
        y1: this.points[0].y,
        c1x: this.points[1].x,
        c1y: this.points[1].y,
        c2x: this.points[2].x,
        c2y: this.points[2].y,
        x2: this.points[3].x,
        y2: this.points[3].y,
      },
      { emitEvent: false }
    );
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    if (this.state === 1) {
      this.points[1] = this.points[2] = this.points[3] = coord;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
    }

    if (this.state === 2) {
      this.points[1] = coord;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
    }

    if (this.state === 3) {
      this.points[2] = coord;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
    }

    this.options.patchValue(
      {
        x1: this.points[0].x,
        y1: this.points[0].y,
        c1x: this.points[1].x,
        c1y: this.points[1].y,
        c2x: this.points[2].x,
        c2y: this.points[2].y,
        x2: this.points[3].x,
        y2: this.points[3].y,
      },
      { emitEvent: false }
    );
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    if (this.state === 3) {
      this.points[2] = coord;
      this.state = 4;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
      this.isCubicBezierCompleted = true;
    }

    if (this.state === 2) {
      this.points[1] = coord;
      this.state = 3;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
    }

    if (this.state === 1) {
      this.points[1] = this.points[2] = this.points[3] = coord;
      this.state = 2;
      this.cubicBezierEl.setAttribute('d', this.calculatePath());
    }

    this.options.patchValue(
      {
        x1: this.points[0].x,
        y1: this.points[0].y,
        c1x: this.points[1].x,
        c1y: this.points[1].y,
        c2x: this.points[2].x,
        c2y: this.points[2].y,
        x2: this.points[3].x,
        y2: this.points[3].y,
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
    return this.isCubicBezierStarted;
  }

  public isShapeCompleted() {
    return this.isCubicBezierCompleted;
  }

  public isShapeSelected(): boolean {
    return this.isCubicBezierSelected;
  }

  public setShapeSelected(selected: boolean): void {
    this.isCubicBezierSelected = selected;
  }

  //#endregion shape-state

  public addToCanvas(canvas: SVGElement) {
    this.canvas = canvas;
    this.cubicBezierEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.canvas.append(this.cubicBezierEl);
    this.isCubicBezierStarted = true;
  }
}
