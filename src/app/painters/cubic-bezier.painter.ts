import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { CubicBezierModel } from '../forms/cubic-bezier/cubic-bezier.model';
import { Shape } from '../shape';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class CubicBezierPainter extends ShapePainter {
  /*
   * 0 -> no points added
   * 1 -> start point added
   * 2 -> end point added
   * 3 -> control point 1 added
   * 4 -> control point 2 added
   */
  private state: number = 0;

  public constructor(protected readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    this.options = new FormGroup({
      name: new FormControl('cubic-bezier'),
      stroke: new FormControl('#000000'),
      strokeAlpha: new FormControl(1),
      strokeWidth: new FormControl(1),
      fill: new FormControl('#FFFFFF'),
      fillAlpha: new FormControl(0),
      x1: new FormControl(0),
      y1: new FormControl(0),
      c1x: new FormControl(0),
      c1y: new FormControl(0),
      c2x: new FormControl(0),
      c2y: new FormControl(0),
      x2: new FormControl(0),
      y2: new FormControl(0),
    });
    this.setFormListener();
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
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

  public onMouseMove(coord: Coord) {
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
    super.onMouseUp(coord);
    this.state++;
    if (this.state !== 4) {
      // avoid super class to complete the shape
      this._isShapeCompleted = false;
    }
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseMoveEdit(coord: Coord): void {
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
  }

  //#endregion mouse-events-edit

  public drawShape(model: CubicBezierModel): void {
    this.shapeEl.setAttribute('d', `M${model.x1},${model.y1}C${model.c1x},${model.c1y} ${model.c2x},${model.c2y} ${model.x2},${model.y2}`);
  }

  public getShapeEditPointsCoords(): Coord[] {
    const pointsString = (this.shapeEl.getAttribute('d') ?? '').substring(1).replace('C', ' ');
    return pointsString
      .split(' ')
      .filter((s) => s.includes(','))
      .map((pointString) => ({
        x: +pointString.split(',')[0],
        y: +pointString.split(',')[1],
      }));
  }

  public isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.CUBIC_BEZIER;
  }
}
