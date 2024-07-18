import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class TextPainter extends ShapePainter {
  protected override shapeEl: SVGTextElement;

  private isTextStarted = false;
  private isTextCompleted = false;
  private isTextSelected = false;

  public shape = Shape.TEXT;
  public name = 'text';

  public override options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(0.3),
    fill: new FormControl('#FFFFFF'),
    x: new FormControl(0),
    y: new FormControl(0),
    text: new FormControl('text'),
    fontSize: new FormControl(10),
  });

  public constructor(protected override readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.drawText(v.x, v.y, v.text, v.fontSize);
      this.shapeEl.setAttribute('stroke', v.stroke);
      this.shapeEl.setAttribute('stroke-width', v.strokeWidth);
      this.shapeEl.setAttribute('fill', v.fill);
      if (this.isShapeSelected()) {
        this.svgEditPoints[0].setAttribute('cx', `${v.x}`);
        this.svgEditPoints[0].setAttribute('cy', `${v.y}`);
      }
    });
  }

  private drawText(x: number, y: number, text: string, fontSize: number) {
    this.shapeEl.setAttribute('x', `${x}`);
    this.shapeEl.setAttribute('y', `${y}`);
    this.shapeEl.setAttribute('font-size', `${fontSize}`);
    this.shapeEl.innerHTML = text || this.name;
  }

  //#region mouse-events

  public override onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ x: coord.x, y: coord.y });
  }

  public override onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    this.options.patchValue({ x: coord.x, y: coord.y });
  }

  public override onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    this.options.patchValue({ x: coord.x, y: coord.y });

    this.isTextCompleted = true;
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public override onMouseDownEdit(coord: Coord): void {
    const position: Coord = { x: this.getSvgAttribute('x'), y: this.getSvgAttribute('y') };

    const isPosition = Math.abs(position.x - coord.x) < this.pointControlWidth() && Math.abs(position.y - coord.y) < this.pointControlWidth();
    if (isPosition) this.svgSelectedEditPointIndex = 0;
    else this.svgSelectedEditPointIndex = -1;
  }

  public override onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('x', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('y', `${coord.y}`);

    this.options.patchValue({
      x: coord.x,
      y: coord.y,
    });
  }
  public override onMouseUpEdit(coord: Coord): void {
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

  public override isShapeStarted(): boolean {
    return this.isTextStarted;
  }

  public override isShapeCompleted() {
    return this.isTextCompleted;
  }

  public override isShapeSelected(): boolean {
    return this.isTextSelected;
  }

  public override setShapeSelected(selected: boolean): void {
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

  public override isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.TEXT;
  }

  public override addToCanvas() {
    this.shapeEl.innerHTML = 'text';
    this.canvas.append(this.shapeEl);
    this.isTextStarted = true;
  }
}
