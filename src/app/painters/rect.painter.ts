import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class RectPainter implements ShapePainter {
  private canvas: SVGElement;
  private rectEl: SVGRectElement;

  private isRectStarted = false;
  private isRectCompleted = false;
  private isMouseDown = false;
  private startCoord: Coord;

  public options: FormGroup = new FormGroup({
    x: new FormControl(0),
    y: new FormControl(0),
    width: new FormControl(0),
    height: new FormControl(0),
    roundCornerX: new FormControl(0),
    roundCornerY: new FormControl(0),
  });

  public constructor() {
    this.options.valueChanges.subscribe((value) => {
      this.rectEl.setAttribute('x', `${value.x}`);
      this.rectEl.setAttribute('y', `${value.y}`);
      this.rectEl.setAttribute('width', `${value.width}`);
      this.rectEl.setAttribute('height', `${value.height}`);
      this.rectEl.setAttribute('rx', `${value.roundCornerX}`);
      this.rectEl.setAttribute('ry', `${value.roundCornerY}`);
    });
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.startCoord = coord;

    this.rectEl.setAttribute('x', `${coord.x}`);
    this.rectEl.setAttribute('y', `${coord.y}`);
    this.rectEl.setAttribute('width', '0');
    this.rectEl.setAttribute('height', '0');

    this.options.patchValue(
      {
        x: coord.x,
        y: coord.y,
        width: 0,
        height: 0,
      },
      { emitEvent: false }
    );
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    const width = Math.abs(this.startCoord.x - coord.x);
    const height = Math.abs(this.startCoord.y - coord.y);
    this.rectEl.setAttribute('width', width.toFixed(1));
    this.rectEl.setAttribute('height', height.toFixed(1));

    const minX = Math.min(coord.x, this.startCoord.x);
    const minY = Math.min(coord.y, this.startCoord.y);
    this.rectEl.setAttribute('x', `${minX}`);
    this.rectEl.setAttribute('y', `${minY}`);

    this.options.patchValue(
      {
        x: minX,
        y: minY,
        width: width.toFixed(1),
        height: height.toFixed(1),
      },
      { emitEvent: false }
    );
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    const width = Math.abs(this.startCoord.x - coord.x);
    const height = Math.abs(this.startCoord.y - coord.y);
    this.rectEl.setAttribute('width', width.toFixed(1));
    this.rectEl.setAttribute('height', height.toFixed(1));

    const minX = Math.min(coord.x, this.startCoord.x);
    const minY = Math.min(coord.y, this.startCoord.y);
    this.rectEl.setAttribute('x', `${minX}`);
    this.rectEl.setAttribute('y', `${minY}`);

    this.options.patchValue(
      {
        x: minX,
        y: minY,
        width: width.toFixed(1),
        height: height.toFixed(1),
      },
      { emitEvent: false }
    );

    this.isRectCompleted = true;
  }

  //#endregion mouse-events

  //#region shape-state

  public isShapeStarted(): boolean {
    return this.isRectStarted;
  }

  public isShapeCompleted() {
    return this.isRectCompleted;
  }

  public isShapeSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  //#endregion shape-state

  public addToCanvas(canvas: SVGElement) {
    this.canvas = canvas;
    this.rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.canvas.append(this.rectEl);
    this.isRectStarted = true;
  }
}
