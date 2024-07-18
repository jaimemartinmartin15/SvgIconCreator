import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class CirclePainter extends ShapePainter {
  protected override shapeEl: SVGCircleElement;

  private isCircleStarted = false;
  private isCircleCompleted = false;
  private isCircleSelected = false;

  public shape = Shape.CIRCLE;
  public name = 'circle';
  public override options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(1),
    fill: new FormControl('#FFFFFF'),
    cx: new FormControl(0),
    cy: new FormControl(0),
    r: new FormControl(0),
  });

  public constructor(protected override readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.drawCircle(v.cx, v.cy, v.r);
      this.shapeEl.setAttribute('stroke', v.stroke);
      this.shapeEl.setAttribute('stroke-width', v.strokeWidth);
      this.shapeEl.setAttribute('fill', v.fill);
      if (this.isShapeSelected()) {
        // adapt the position of the edit points
        this.svgEditPoints[0].setAttribute('cx', `${v.cx}`);
        this.svgEditPoints[0].setAttribute('cy', `${v.cy}`);
        this.svgEditPoints[1].setAttribute('cx', `${v.cx}`);
        this.svgEditPoints[1].setAttribute('cy', `${v.cy + v.r}`);
      }
    });
  }

  private drawCircle(cx: number, cy: number, r: number) {
    this.shapeEl.setAttribute('cx', cx.toFixed(1) ?? 0);
    this.shapeEl.setAttribute('cy', cy.toFixed(1) ?? 0);
    this.shapeEl.setAttribute('r', r.toFixed(1) ?? 0);
  }

  private calculateRadius(p1: Coord, p2: Coord): number {
    const c1Power2 = Math.pow(Math.abs(p1.x - p2.x), 2);
    const c2Power2 = Math.pow(Math.abs(p1.y - p2.y), 2);
    const squareRoot = Math.sqrt(c1Power2 + c2Power2);
    return +squareRoot.toFixed(1);
  }

  //#region mouse-events

  public override onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ cx: coord.x, cy: coord.y, r: 0 });
  }

  public override onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    const center: Coord = { x: this.getSvgAttribute('cx'), y: this.getSvgAttribute('cy') };
    const radius = this.calculateRadius(center, coord);
    this.options.patchValue({ r: radius });
  }

  public override onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    const center: Coord = { x: this.getSvgAttribute('cx'), y: this.getSvgAttribute('cy') };
    const radius = this.calculateRadius(center, coord);
    this.options.patchValue({ r: radius });

    this.isCircleCompleted = true;
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public override onMouseDownEdit(coord: Coord): void {
    const center: Coord = { x: this.getSvgAttribute('cx'), y: this.getSvgAttribute('cy') };
    const extPoint = { ...center, y: center.y + this.getSvgAttribute('r') };

    // select control point to move
    const isCenter = Math.abs(center.x - coord.x) < this.pointControlWidth() && Math.abs(center.y - coord.y) < this.pointControlWidth();
    const isExtPoint = Math.abs(extPoint.x - coord.x) < this.pointControlWidth() && Math.abs(extPoint.y - coord.y) < this.pointControlWidth();

    if (isCenter) this.svgSelectedEditPointIndex = 0;
    else if (isExtPoint) this.svgSelectedEditPointIndex = 1;
    else this.svgSelectedEditPointIndex = -1;
  }

  public override onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cx', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cy', `${coord.y}`);

    if (this.svgSelectedEditPointIndex === 0) {
      this.options.patchValue({ cx: coord.x, cy: coord.y });
      this.svgEditPoints[1].setAttribute('cx', `${coord.x}`);
      this.svgEditPoints[1].setAttribute('cy', `${coord.y + this.getSvgAttribute('r')}`);
    } else {
      const center: Coord = { x: this.getSvgAttribute('cx'), y: this.getSvgAttribute('cy') };
      const radius = this.calculateRadius(center, coord);
      this.options.patchValue({ r: radius });
    }
  }
  public override onMouseUpEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cx', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cy', `${coord.y}`);

    if (this.svgSelectedEditPointIndex === 0) {
      this.options.patchValue({ cx: coord.x, cy: coord.y });
    } else {
      const center: Coord = { x: this.getSvgAttribute('cx'), y: this.getSvgAttribute('cy') };
      const radius = this.calculateRadius(center, coord);
      this.options.patchValue({ r: radius });
    }

    this.svgSelectedEditPointIndex = -1;
  }

  //#endregion mouse-events-edit

  //#region shape-state

  public override isShapeStarted(): boolean {
    return this.isCircleStarted;
  }

  public override isShapeCompleted() {
    return this.isCircleCompleted;
  }

  public override isShapeSelected(): boolean {
    return this.isCircleSelected;
  }

  public override setShapeSelected(selected: boolean): void {
    this.isCircleSelected = selected;
    if (selected) {
      const center: Coord = { x: this.getSvgAttribute('cx'), y: this.getSvgAttribute('cy') };
      const c1 = this.createPointControl(center);
      this.svgEditPoints.push(c1);
      this.canvas.append(c1);
      const c2 = this.createPointControl({
        x: center.x,
        y: center.y + this.getSvgAttribute('r'),
      });
      this.svgEditPoints.push(c2);
      this.canvas.append(c2);
    } else {
      this.svgEditPoints.forEach((e) => e.remove());
      this.svgEditPoints.length = 0;
    }
  }

  //#endregion shape-state

  public override isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.CIRCLE;
  }

  public override addToCanvas() {
    this.canvas.append(this.shapeEl);
    this.isCircleStarted = true;
  }
}
