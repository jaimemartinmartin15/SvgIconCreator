import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class CubicBezierPainter extends ShapePainter {
  protected override shapeEl: SVGPathElement;

  private isCubicBezierStarted = false;
  private isCubicBezierCompleted = false;
  private isCubicBezierSelected = false;

  /*
   * 0 -> no points added
   * 1 -> start point added
   * 2 -> end point added
   * 3 -> control point 1 added
   * 4 -> control point 2 added
   */
  private state: number = 0;

  public shape = Shape.CUBIC_BEZIER;
  public name = 'cubic-bezier';

  public override options: FormGroup = new FormGroup({
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

  public constructor(protected override readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.drawCubizBezier(v.x1, v.y1, v.c1x, v.c1y, v.c2x, v.c2y, v.x2, v.y2);
      this.shapeEl.setAttribute('stroke', v.stroke);
      this.shapeEl.setAttribute('stroke-width', v.strokeWidth);
      this.shapeEl.setAttribute('fill', v.fill);
      if (this.isShapeSelected()) {
        this.drawDotsForControlPoints();
      }
    });
  }

  private drawDotsForControlPoints() {
    const points = this.getPathPointsFromAttribute();
    points.forEach((coord, i) => {
      this.svgEditPoints[i].setAttribute('cx', `${coord.x}`);
      this.svgEditPoints[i].setAttribute('cy', `${coord.y}`);
    });
  }

  private drawCubizBezier(x1: number, y1: number, c1x: number, c1y: number, c2x: number, c2y: number, x2: number, y2: number) {
    this.shapeEl.setAttribute('d', `M${x1},${y1}C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`);
  }

  private getPathPointsFromAttribute(): Coord[] {
    const pointsString = (this.shapeEl.getAttribute('d') ?? '').substring(1).replace('C', ' ');
    return pointsString
      .split(' ')
      .filter((s) => s.includes(','))
      .map((pointString) => ({
        x: +pointString.split(',')[0],
        y: +pointString.split(',')[1],
      }));
  }

  //#region mouse-events

  public override onMouseDown(coord: Coord) {
    this.isMouseDown = true;

    if (this.state === 0) {
      this.state = 1;
      this.options.patchValue({ x1: coord.x, y1: coord.y, c1x: coord.x, c1y: coord.y, c2x: coord.x, c2y: coord.y, x2: coord.x, y2: coord.y });
    }

    if (this.state === 2) {
      this.options.patchValue({ c1x: coord.x, c1y: coord.y, c2x: coord.x, c2y: coord.y });
    }

    if (this.state === 3) {
      this.options.patchValue({ c2x: coord.x, c2y: coord.y });
    }
  }

  public override onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    if (this.state === 1) {
      this.options.patchValue({ x2: coord.x, y2: coord.y });
    }

    if (this.state === 2) {
      this.options.patchValue({ c1x: coord.x, c1y: coord.y, c2x: coord.x, c2y: coord.y });
    }

    if (this.state === 3) {
      this.options.patchValue({ c2x: coord.x, c2y: coord.y });
    }
  }

  public override onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    if (this.state === 3) {
      this.options.patchValue({ c2x: coord.x, c2y: coord.y });
      this.state = 4;
      this.isCubicBezierCompleted = true;
    }

    if (this.state === 2) {
      this.options.patchValue({ c1x: coord.x, c1y: coord.y, c2x: coord.x, c2y: coord.y });
      this.state = 3;
    }

    if (this.state === 1) {
      this.options.patchValue({ x2: coord.x, y2: coord.y });
      this.state = 2;
    }
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public override onMouseDownEdit(coord: Coord): void {
    const existingCoords = this.getPathPointsFromAttribute();
    this.svgSelectedEditPointIndex = existingCoords.findIndex(
      (p) => Math.abs(p.x - coord.x) < this.pointControlWidth() && Math.abs(p.y - coord.y) < this.pointControlWidth()
    );
  }

  public override onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    if (this.svgSelectedEditPointIndex === 0) {
      this.options.patchValue({ x1: coord.x, y1: coord.y });
    }

    if (this.svgSelectedEditPointIndex === 1) {
      this.options.patchValue({ c1x: coord.x, c1y: coord.y });
    }

    if (this.svgSelectedEditPointIndex === 2) {
      this.options.patchValue({ c2x: coord.x, c2y: coord.y });
    }

    if (this.svgSelectedEditPointIndex === 3) {
      this.options.patchValue({ x2: coord.x, y2: coord.y });
    }

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cx', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cy', `${coord.y}`);
  }

  public override onMouseUpEdit(coord: Coord): void {
    this.onMouseMove(coord);

    this.svgSelectedEditPointIndex = -1;
  }

  //#endregion mouse-events-edit

  //#region shape-state

  public override isShapeStarted(): boolean {
    return this.isCubicBezierStarted;
  }

  public override isShapeCompleted() {
    return this.isCubicBezierCompleted;
  }

  public override isShapeSelected(): boolean {
    return this.isCubicBezierSelected;
  }

  public override setShapeSelected(selected: boolean): void {
    this.isCubicBezierSelected = selected;
    if (selected) {
      const coords = this.getPathPointsFromAttribute();
      coords.forEach((p) => {
        const svgPoint = this.createPointControl({ x: p.x, y: p.y });
        this.svgEditPoints.push(svgPoint);
        this.canvas.append(svgPoint);
      });
    } else {
      this.svgEditPoints.forEach((e) => e.remove());
      this.svgEditPoints.length = 0;
    }
  }

  //#endregion shape-state

  public override isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.LINE;
  }

  public override addToCanvas() {
    this.canvas.append(this.shapeEl);
    this.isCubicBezierStarted = true;
  }
}
