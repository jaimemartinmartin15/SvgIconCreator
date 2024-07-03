import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainter } from './shape.painter';

export class CirclePainter implements ShapePainter {
  private canvas: SVGElement;
  private circleEl: SVGCircleElement;

  private isCircleStarted = false;
  private isCircleCompleted = false;
  private isCircleSelected = false;
  private isMouseDown = false;
  private startCoord: Coord;
  private endCoord: Coord;

  public shape = Shape.CIRCLE;
  public name = 'circle';
  public options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(1),
    fill: new FormControl('#FFFFFF'),
    cx: new FormControl(0),
    cy: new FormControl(0),
    r: new FormControl(0),
  });

  public constructor() {
    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.circleEl.setAttribute('cx', `${v.cx}`);
      this.circleEl.setAttribute('cy', `${v.cy}`);
      this.circleEl.setAttribute('r', `${v.r}`);
      this.circleEl.setAttribute('stroke', v.stroke);
      this.circleEl.setAttribute('stroke-width', v.strokeWidth);
      this.circleEl.setAttribute('fill', v.fill);
    });
  }

  private calculateRadius(): string {
    if (this.startCoord === undefined || this.endCoord === undefined) {
      return '0';
    }

    const c1Power2 = Math.pow(Math.abs(this.startCoord.x - this.endCoord.x), 2);
    const c2Power2 = Math.pow(Math.abs(this.startCoord.y - this.endCoord.y), 2);
    const squareRoot = Math.sqrt(c1Power2 + c2Power2);
    return squareRoot.toFixed(1);
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.startCoord = coord;

    this.circleEl.setAttribute('cx', `${coord.x}`);
    this.circleEl.setAttribute('cy', `${coord.y}`);

    this.options.patchValue(
      {
        cx: coord.x,
        cy: coord.y,
        r: 0,
      },
      { emitEvent: false }
    );
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    this.endCoord = coord;

    const radius = this.calculateRadius();
    this.circleEl.setAttribute('r', radius);

    this.options.patchValue(
      {
        cx: this.startCoord.x,
        cy: this.startCoord.y,
        r: radius,
      },
      { emitEvent: false }
    );
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    this.endCoord = coord;

    const radius = this.calculateRadius();
    this.circleEl.setAttribute('r', radius);

    this.options.patchValue(
      {
        cx: this.startCoord.x,
        cy: this.startCoord.y,
        r: radius,
      },
      { emitEvent: false }
    );

    this.isCircleCompleted = true;
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
    return this.isCircleStarted;
  }

  public isShapeCompleted() {
    return this.isCircleCompleted;
  }

  public isShapeSelected(): boolean {
    return this.isCircleSelected;
  }

  public setShapeSelected(selected: boolean): void {
    this.isCircleSelected = selected;
  }

  //#endregion shape-state

  public addToCanvas(canvas: SVGElement) {
    this.canvas = canvas;
    this.circleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.canvas.append(this.circleEl);
    this.isCircleStarted = true;
  }
}
