import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class LinePainter implements ShapePainter {
  private canvas: SVGElement;
  private lineEl: SVGLineElement;

  private isLineStarted = false;
  private isLineCompleted = false;
  private isMouseDown = false;

  public options: FormGroup = new FormGroup({
    x1: new FormControl(0),
    y1: new FormControl(0),
    x2: new FormControl(0),
    y2: new FormControl(0),
  });

  public constructor() {
    this.options.valueChanges.subscribe((value) => {
      this.lineEl.setAttribute('x1', `${value.x1}`);
      this.lineEl.setAttribute('y1', `${value.y1}`);
      this.lineEl.setAttribute('x2', `${value.x2}`);
      this.lineEl.setAttribute('y2', `${value.y2}`);
    });
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;

    this.lineEl.setAttribute('x1', `${coord.x}`);
    this.lineEl.setAttribute('y1', `${coord.y}`);
    this.lineEl.setAttribute('x2', `${coord.x}`);
    this.lineEl.setAttribute('y2', `${coord.y}`);

    this.lineEl.setAttribute('stroke', 'rebeccapurple'); // TODO

    this.options.patchValue(
      {
        x1: coord.x,
        y1: coord.y,
        x2: coord.x,
        y2: coord.y,
      },
      { emitEvent: false }
    );
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    this.lineEl.setAttribute('x2', `${coord.x}`);
    this.lineEl.setAttribute('y2', `${coord.y}`);

    this.options.patchValue(
      {
        x2: coord.x,
        y2: coord.y,
      },
      { emitEvent: false }
    );
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    this.lineEl.setAttribute('x2', `${coord.x}`);
    this.lineEl.setAttribute('y2', `${coord.y}`);

    this.options.patchValue(
      {
        x2: coord.x,
        y2: coord.y,
      },
      { emitEvent: false }
    );

    this.isLineCompleted = true;
  }

  //#endregion mouse-events

  //#region shape-state

  public isShapeStarted(): boolean {
    return this.isLineStarted;
  }

  public isShapeCompleted() {
    return this.isLineCompleted;
  }

  public isShapeSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  //#endregion shape-state

  public addToCanvas(canvas: SVGElement) {
    this.canvas = canvas;
    this.lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.canvas.append(this.lineEl);
    this.isLineStarted = true;
  }
}
