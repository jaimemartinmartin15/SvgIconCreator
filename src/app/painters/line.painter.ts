import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainter } from './shape.painter';

export class LinePainter implements ShapePainter {
  private canvas: SVGSVGElement;
  private lineEl: SVGLineElement;

  private isLineStarted = false;
  private isLineCompleted = false;
  private isLineSelected = false;

  private isMouseDown = false;

  private svgEditPoints: SVGCircleElement[] = [];
  private svgSelectedEditPointIndex: number = -1;

  public shape = Shape.LINE;
  public name = 'line';
  public options: FormGroup = new FormGroup({
    x1: new FormControl(0),
    y1: new FormControl(0),
    x2: new FormControl(0),
    y2: new FormControl(0),
  });

  public constructor() {
    this.options.valueChanges.subscribe((v) => {
      this.drawLine(v.x1, v.y1, v.x2, v.y2);
      if (this.isShapeSelected()) {
        // adapt the position of the edit points
        this.svgEditPoints[0].setAttribute('cx', `${v.x1}`);
        this.svgEditPoints[0].setAttribute('cy', `${v.y1}`);
        this.svgEditPoints[1].setAttribute('cx', `${v.x2}`);
        this.svgEditPoints[1].setAttribute('cy', `${v.y2}`);
      }
    });
  }

  private getSvgAttribute(name: string, element: SVGElement = this.lineEl): number {
    return +element.getAttribute(name)!;
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.lineEl.setAttribute('x1', x1.toFixed(1));
    this.lineEl.setAttribute('y1', y1.toFixed(1));
    this.lineEl.setAttribute('x2', x2.toFixed(1));
    this.lineEl.setAttribute('y2', y2.toFixed(1));
  }
  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ x1: coord.x, y1: coord.y, x2: coord.x, y2: coord.y });

    this.lineEl.setAttribute('stroke', 'rebeccapurple'); // TODO
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    this.options.patchValue({ x2: coord.x, y2: coord.y });
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;
    this.options.patchValue({ x2: coord.x, y2: coord.y });
    this.isLineCompleted = true;
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseDownEdit(coord: Coord): void {
    const point1: Coord = { x: this.getSvgAttribute('x1'), y: this.getSvgAttribute('y1') };
    const point2: Coord = { x: this.getSvgAttribute('x2'), y: this.getSvgAttribute('y2') };

    // select control point to move
    const isPoint1 = Math.abs(point1.x - coord.x) < this.pointControlWidth() && Math.abs(point1.y - coord.y) < this.pointControlWidth();
    const isPoint2 = Math.abs(point2.x - coord.x) < this.pointControlWidth() && Math.abs(point2.y - coord.y) < this.pointControlWidth();

    if (isPoint1) this.svgSelectedEditPointIndex = 0;
    else if (isPoint2) this.svgSelectedEditPointIndex = 1;
    else this.svgSelectedEditPointIndex = -1;
  }

  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cx', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cy', `${coord.y}`);

    const pointNames = [
      ['x1', 'y1'],
      ['x2', 'y2'],
    ];
    this.options.patchValue({
      [pointNames[this.svgSelectedEditPointIndex][0]]: coord.x,
      [pointNames[this.svgSelectedEditPointIndex][1]]: coord.y,
    });
  }

  public onMouseUpEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cx', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cy', `${coord.y}`);

    const pointNames = [
      ['x1', 'y1'],
      ['x2', 'y2'],
    ];
    this.options.patchValue({
      [pointNames[this.svgSelectedEditPointIndex][0]]: coord.x,
      [pointNames[this.svgSelectedEditPointIndex][1]]: coord.y,
    });

    this.svgSelectedEditPointIndex = -1;
  }

  //#endregion mouse-events-edit

  //#region shape-state

  public isShapeStarted(): boolean {
    return this.isLineStarted;
  }

  public isShapeCompleted() {
    return this.isLineCompleted;
  }

  public isShapeSelected(): boolean {
    return this.isLineSelected;
  }

  public setShapeSelected(selected: boolean): void {
    this.isLineSelected = selected;
    if (selected) {
      const p1 = this.createPointControl({ x: this.getSvgAttribute('x1'), y: this.getSvgAttribute('y1') });
      this.svgEditPoints.push(p1);
      this.canvas.append(p1);
      const p2 = this.createPointControl({ x: this.getSvgAttribute('x2'), y: this.getSvgAttribute('y2') });
      this.svgEditPoints.push(p2);
      this.canvas.append(p2);
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
    this.lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.canvas.append(this.lineEl);
    this.isLineStarted = true;
  }
}
