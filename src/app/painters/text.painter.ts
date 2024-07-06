import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainter } from './shape.painter';

export class TextPainter implements ShapePainter {
  private canvas: SVGSVGElement;
  private textEl: SVGTextElement;

  private isTextStarted = false;
  private isTextCompleted = false;
  private isTextSelected = false;

  private isMouseDown = false;

  private svgEditPoints: SVGCircleElement[] = [];
  private svgSelectedEditPointIndex: number = -1;

  public shape = Shape.TEXT;
  public name = 'text';
  public options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(0.3),
    fill: new FormControl('#FFFFFF'),
    x: new FormControl(0),
    y: new FormControl(0),
    text: new FormControl('text'),
    fontSize: new FormControl(10),
  });

  public constructor() {
    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.drawText(v.x, v.y, v.text, v.fontSize);
      this.textEl.setAttribute('stroke', v.stroke);
      this.textEl.setAttribute('stroke-width', v.strokeWidth);
      this.textEl.setAttribute('fill', v.fill);
      if (this.isShapeSelected()) {
        this.svgEditPoints[0].setAttribute('cx', `${v.x}`);
        this.svgEditPoints[0].setAttribute('cy', `${v.y}`);
      }
    });
  }

  private getSvgAttribute(name: string, element: SVGElement = this.textEl): number {
    return +element.getAttribute(name)!;
  }

  private drawText(x: number, y: number, text: string, fontSize: number) {
    this.textEl.setAttribute('x', `${x}`);
    this.textEl.setAttribute('y', `${y}`);
    this.textEl.setAttribute('font-size', `${fontSize}`);
    this.textEl.innerHTML = text || this.name;
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ x: coord.x, y: coord.y });
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    this.options.patchValue({ x: coord.x, y: coord.y });
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    this.options.patchValue({ x: coord.x, y: coord.y });

    this.isTextCompleted = true;
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseDownEdit(coord: Coord): void {
    const position: Coord = { x: this.getSvgAttribute('x'), y: this.getSvgAttribute('y') };

    const isPosition = Math.abs(position.x - coord.x) < this.pointControlWidth() && Math.abs(position.y - coord.y) < this.pointControlWidth();
    if (isPosition) this.svgSelectedEditPointIndex = 0;
    else this.svgSelectedEditPointIndex = -1;
  }

  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('x', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('y', `${coord.y}`);

    this.options.patchValue({
      x: coord.x,
      y: coord.y,
    });
  }
  public onMouseUpEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('x', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('y', `${coord.y}`);

    this.options.patchValue({
      x: coord.x,
      y: coord.y,
    });

    this.svgSelectedEditPointIndex = -1;
  }

  //#endregion mouse-events-edit

  //#region shape-state

  public isShapeStarted(): boolean {
    return this.isTextStarted;
  }

  public isShapeCompleted() {
    return this.isTextCompleted;
  }

  public isShapeSelected(): boolean {
    return this.isTextSelected;
  }

  public setShapeSelected(selected: boolean): void {
    this.isTextSelected = selected;
    if (selected) {
      const c1 = this.createPointControl({ x: this.getSvgAttribute('x'), y: this.getSvgAttribute('y') });
      this.svgEditPoints.push(c1);
      this.canvas.append(c1);
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
    this.textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.textEl.innerHTML = 'text';
    this.canvas.append(this.textEl);
    this.isTextStarted = true;
  }
}
