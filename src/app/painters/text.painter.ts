import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainter } from './shape.painter';

export class TextPainter implements ShapePainter {
  private canvas: SVGElement;
  private textEl: SVGTextElement;

  private isTextStarted = false;
  private isTextCompleted = false;
  private isTextSelected = false;
  private isMouseDown = false;

  public shape = Shape.TEXT;
  public name = 'text';
  public options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(1),
    fill: new FormControl('#FFFFFF'),
    x: new FormControl(0),
    y: new FormControl(0),
    text: new FormControl('text'),
  });

  public constructor() {
    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.textEl.setAttribute('x', `${v.x}`);
      this.textEl.setAttribute('y', `${v.y}`);
      this.textEl.setAttribute('stroke', v.stroke);
      this.textEl.setAttribute('stroke-width', v.strokeWidth);
      this.textEl.setAttribute('fill', v.fill);
      this.textEl.innerHTML = v.text;
    });
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;

    this.textEl.setAttribute('x', `${coord.x}`);
    this.textEl.setAttribute('y', `${coord.y}`);

    this.options.patchValue(
      {
        x: coord.x,
        y: coord.y,
      },
      { emitEvent: false }
    );
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    this.textEl.setAttribute('x', `${coord.x}`);
    this.textEl.setAttribute('y', `${coord.y}`);

    this.options.patchValue(
      {
        x: coord.x,
        y: coord.y,
      },
      { emitEvent: false }
    );
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    this.textEl.setAttribute('x', `${coord.x}`);
    this.textEl.setAttribute('y', `${coord.y}`);

    this.options.patchValue(
      {
        x: coord.x,
        y: coord.y,
      },
      { emitEvent: false }
    );

    this.isTextCompleted = true;
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
  }

  //#endregion shape-state

  public addToCanvas(canvas: SVGElement) {
    this.canvas = canvas;
    this.textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.textEl.innerHTML = 'text';
    this.canvas.append(this.textEl);
    this.isTextStarted = true;
  }
}
