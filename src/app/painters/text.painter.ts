import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class TextPainter implements ShapePainter {
  private canvas: SVGElement;
  private textEl: SVGTextElement;

  private isTextStarted = false;
  private isTextCompleted = false;
  private isMouseDown = false;

  public options: FormGroup = new FormGroup({
    x: new FormControl(0),
    y: new FormControl(0),
    text: new FormControl('text'),
  });

  public constructor() {
    this.options.valueChanges.subscribe((value) => {
      this.textEl.setAttribute('x', `${value.x}`);
      this.textEl.setAttribute('y', `${value.y}`);
      this.textEl.innerHTML = value.text;
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

  //#region shape-state

  public isShapeStarted(): boolean {
    return this.isTextStarted;
  }

  public isShapeCompleted() {
    return this.isTextCompleted;
  }

  public isShapeSelected(): boolean {
    throw new Error('Method not implemented.');
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
