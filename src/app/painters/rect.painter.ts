import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainter } from './shape.painter';

export class RectPainter implements ShapePainter {
  private canvas: SVGSVGElement;
  private rectEl: SVGRectElement;

  private isRectStarted = false;
  private isRectCompleted = false;
  private isRectSelected = false;

  private isMouseDown = false;

  private svgEditPoints: SVGCircleElement[] = [];
  private svgSelectedEditPointIndex: number = -1;

  public shape = Shape.RECT;
  public name = 'rect';
  public options: FormGroup = new FormGroup({
    x: new FormControl(0),
    y: new FormControl(0),
    width: new FormControl(0),
    height: new FormControl(0),
    roundCornerX: new FormControl(0),
    roundCornerY: new FormControl(0),
  });

  public constructor() {
    this.options.valueChanges.subscribe((v) => {
      this.drawRect(v.x, v.y, v.width, v.height, v.roundCornerX, v.roundCornerY);
      if (this.isShapeSelected()) {
        // adapt the position of the edit points
        this.svgEditPoints[0].setAttribute('cx', `${v.x}`);
        this.svgEditPoints[0].setAttribute('cy', `${v.y}`);
        this.svgEditPoints[1].setAttribute('cx', `${v.x + v.width}`);
        this.svgEditPoints[1].setAttribute('cy', `${v.y + v.height}`);
      }
    });
  }

  private getSvgAttribute(name: string, element: SVGElement = this.rectEl): number {
    return +element.getAttribute(name)!;
  }

  private drawRect(x: number, y: number, width: number, height: number, rx: number, ry: number) {
    this.rectEl.setAttribute('x', x?.toFixed(1) ?? '0');
    this.rectEl.setAttribute('y', y?.toFixed(1) ?? '0');
    this.rectEl.setAttribute('width', width?.toFixed(1) ?? '0');
    this.rectEl.setAttribute('height', height?.toFixed(1) ?? '0');
    this.rectEl.setAttribute('rx', rx?.toFixed(1) ?? '0');
    this.rectEl.setAttribute('ry', ry?.toFixed(1) ?? '0');
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ x: coord.x, y: coord.y });
  }

  public onMouseMove(coord: Coord) {
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

  public onMouseUp(coord: Coord) {
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

  public onMouseDownEdit(coord: Coord): void {
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

  public onMouseMoveEdit(coord: Coord): void {
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

  public onMouseUpEdit(coord: Coord): void {
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

  public isShapeStarted(): boolean {
    return this.isRectStarted;
  }

  public isShapeCompleted() {
    return this.isRectCompleted;
  }

  public isShapeSelected(): boolean {
    return this.isRectSelected;
  }

  public setShapeSelected(selected: boolean): void {
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

  private createPointControl(coord: Coord): SVGCircleElement {
    const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c1.setAttribute('cx', `${coord.x}`);
    c1.setAttribute('cy', `${coord.y}`);
    c1.setAttribute('r', this.pointControlWidth().toFixed(1));
    c1.setAttribute('stroke', 'blue');
    c1.setAttribute('stroke-width', (this.pointControlWidth() / 2).toFixed(1));
    c1.setAttribute('fill', 'white');
    return c1;
  }

  private pointControlWidth(): number {
    return this.canvas.viewBox.baseVal.width * 0.01;
  }

  public addToCanvas(canvas: SVGSVGElement) {
    this.canvas = canvas;
    this.rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.canvas.append(this.rectEl);
    this.isRectStarted = true;
  }
}
