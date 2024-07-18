import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class RectPainter extends ShapePainter {
  protected override shapeEl: SVGRectElement;

  private isRectStarted = false;
  private isRectCompleted = false;
  private isRectSelected = false;

  public shape = Shape.RECT;
  public name = 'rect';

  public override options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(1),
    fill: new FormControl('#FFFFFF'),
    x: new FormControl(0),
    y: new FormControl(0),
    width: new FormControl(0),
    height: new FormControl(0),
    roundCornerX: new FormControl(0),
    roundCornerY: new FormControl(0),
  });

  public constructor(protected override readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.drawRect(v.x, v.y, v.width, v.height, v.roundCornerX, v.roundCornerY);
      this.shapeEl.setAttribute('stroke', v.stroke);
      this.shapeEl.setAttribute('stroke-width', v.strokeWidth);
      this.shapeEl.setAttribute('fill', v.fill);
      if (this.isShapeSelected()) {
        // adapt the position of the edit points
        this.svgEditPoints[0].setAttribute('cx', `${v.x}`);
        this.svgEditPoints[0].setAttribute('cy', `${v.y}`);
        this.svgEditPoints[1].setAttribute('cx', `${v.x + v.width}`);
        this.svgEditPoints[1].setAttribute('cy', `${v.y + v.height}`);
      }
    });
  }

  private drawRect(x: number, y: number, width: number, height: number, rx: number, ry: number) {
    this.shapeEl.setAttribute('x', x?.toFixed(1) ?? '0');
    this.shapeEl.setAttribute('y', y?.toFixed(1) ?? '0');
    this.shapeEl.setAttribute('width', width?.toFixed(1) ?? '0');
    this.shapeEl.setAttribute('height', height?.toFixed(1) ?? '0');
    this.shapeEl.setAttribute('rx', rx?.toFixed(1) ?? '0');
    this.shapeEl.setAttribute('ry', ry?.toFixed(1) ?? '0');
  }

  //#region mouse-events

  public override onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ x: coord.x, y: coord.y });
  }

  public override onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    const x = this.getSvgAttribute('x');
    const y = this.getSvgAttribute('y');
    const width = Math.abs(x - coord.x);
    const height = Math.abs(y - coord.y);

    this.options.patchValue({
      x: Math.min(x, coord.x),
      y: Math.min(y, coord.y),
      width,
      height,
    });
  }

  public override onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    const x = this.getSvgAttribute('x');
    const y = this.getSvgAttribute('y');
    const width = Math.abs(x - coord.x);
    const height = Math.abs(y - coord.y);

    this.options.patchValue({
      x: Math.min(x, coord.x),
      y: Math.min(y, coord.y),
      width,
      height,
    });

    this.isRectCompleted = true;
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public override onMouseDownEdit(coord: Coord): void {
    const topLeftPoint: Coord = { x: this.getSvgAttribute('x'), y: this.getSvgAttribute('y') };
    const bottomRightPoint: Coord = { x: topLeftPoint.x + this.getSvgAttribute('width'), y: topLeftPoint.y + this.getSvgAttribute('height') };

    // select control point to move
    const isTopLeftPoint =
      Math.abs(topLeftPoint.x - coord.x) < this.pointControlWidth() && Math.abs(topLeftPoint.y - coord.y) < this.pointControlWidth();
    const isBottomRightPoint =
      Math.abs(bottomRightPoint.x - coord.x) < this.pointControlWidth() && Math.abs(bottomRightPoint.y - coord.y) < this.pointControlWidth();

    if (isTopLeftPoint) this.svgSelectedEditPointIndex = 0;
    else if (isBottomRightPoint) this.svgSelectedEditPointIndex = 1;
    else this.svgSelectedEditPointIndex = -1;
  }

  public override onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cx', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cy', `${coord.y}`);

    this.options.patchValue({
      x: Math.min(this.getSvgAttribute('cx', this.svgEditPoints[0]), this.getSvgAttribute('cx', this.svgEditPoints[1])),
      y: Math.min(this.getSvgAttribute('cy', this.svgEditPoints[0]), this.getSvgAttribute('cy', this.svgEditPoints[1])),
      width: Math.abs(this.getSvgAttribute('cx', this.svgEditPoints[0]) - this.getSvgAttribute('cx', this.svgEditPoints[1])),
      height: Math.abs(this.getSvgAttribute('cy', this.svgEditPoints[0]) - this.getSvgAttribute('cy', this.svgEditPoints[1])),
    });
  }

  public override onMouseUpEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cx', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cy', `${coord.y}`);

    this.options.patchValue({
      x: Math.min(this.getSvgAttribute('cx', this.svgEditPoints[0]), this.getSvgAttribute('cx', this.svgEditPoints[1])),
      y: Math.min(this.getSvgAttribute('cy', this.svgEditPoints[0]), this.getSvgAttribute('cy', this.svgEditPoints[1])),
      width: Math.abs(this.getSvgAttribute('cx', this.svgEditPoints[0]) - this.getSvgAttribute('cx', this.svgEditPoints[1])),
      height: Math.abs(this.getSvgAttribute('cy', this.svgEditPoints[0]) - this.getSvgAttribute('cy', this.svgEditPoints[1])),
    });

    this.svgSelectedEditPointIndex = -1;
  }

  //#endregion mouse-events-edit

  //#region shape-state

  public override isShapeStarted(): boolean {
    return this.isRectStarted;
  }

  public override isShapeCompleted() {
    return this.isRectCompleted;
  }

  public override isShapeSelected(): boolean {
    return this.isRectSelected;
  }

  public override setShapeSelected(selected: boolean): void {
    this.isRectSelected = selected;
    if (selected) {
      const c1 = this.createPointControl({ x: this.getSvgAttribute('x'), y: this.getSvgAttribute('y') });
      this.svgEditPoints.push(c1);
      this.canvas.append(c1);
      const c2 = this.createPointControl({
        x: this.getSvgAttribute('x') + this.getSvgAttribute('width'),
        y: this.getSvgAttribute('y') + this.getSvgAttribute('height'),
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
    return shape === Shape.RECT;
  }

  public override addToCanvas() {
    this.canvas.append(this.shapeEl);
    this.isRectStarted = true;
  }
}
