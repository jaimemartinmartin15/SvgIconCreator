import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { PathModel } from '../forms/path/path.model';
import { Shape } from '../shape';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class PathPainter extends ShapePainter {
  public constructor(protected readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    this.options = new FormGroup({
      name: new FormControl('path'),
      stroke: new FormControl('#000000'),
      strokeAlpha: new FormControl(1),
      strokeWidth: new FormControl(1),
      fill: new FormControl('#FFFFFF'),
      fillAlpha: new FormControl(0),
      points: new FormArray([]),
    });
    this.setFormListener();
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;

    (this.options.controls['points'] as FormArray).push(
      new FormGroup({
        x: new FormControl(coord.x),
        y: new FormControl(coord.y),
      })
    );
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    const pointsFormArray: FormArray = this.options.controls['points'] as FormArray;
    if (pointsFormArray.controls.length === 1) {
      // allows to draw first segment with one single click and drag
      pointsFormArray.push(
        new FormGroup({
          x: new FormControl(coord.x),
          y: new FormControl(coord.y),
        })
      );
      return;
    }

    const lastCoordIndex = pointsFormArray.controls.length - 1;
    pointsFormArray.at(lastCoordIndex).patchValue({
      x: coord.x,
      y: coord.y,
    });
  }

  public override onMouseUp(coord: Coord) {
    super.onMouseUp(coord);
    // avoid super class to complete the shape
    this._isShapeCompleted = false;
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    const pointsFormArray: FormArray = this.options.controls['points'] as FormArray;
    pointsFormArray.at(this.svgSelectedEditPointIndex).patchValue({
      x: coord.x,
      y: coord.y,
    });
  }

  //#endregion mouse-events-edit

  public drawShape(model: PathModel): void {
    this.shapeEl.setAttribute('d', `M${model.points.map((p) => `${p.x},${p.y}`).join(' ')}`);
  }

  public getShapeEditPointsCoords(): Coord[] {
    const pointsString = (this.shapeEl.getAttribute('d') ?? '').substring(1);
    return pointsString
      .split(' ')
      .filter((s) => s.includes(','))
      .map((pointString) => ({
        x: +pointString.split(',')[0],
        y: +pointString.split(',')[1],
      }));
  }

  public isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.PATH;
  }
}
