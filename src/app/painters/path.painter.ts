import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { Shape } from '../shapes';
import { ShapePainter } from './shape.painter';

export class PathPainter implements ShapePainter {
  private canvas: SVGSVGElement;
  private pathEl: SVGPathElement;

  private isPathStarted = false;
  private isPathCompleted: boolean = false;
  private isPathSelected: boolean = false;

  private isMouseDown = false;

  private svgEditPoints: SVGCircleElement[] = [];
  private svgSelectedEditPointIndex: number = -1;

  public shape = Shape.PATH;
  public name = 'path';
  public options: FormGroup = new FormGroup({
    name: new FormControl(this.name),
    stroke: new FormControl('#000000'),
    strokeWidth: new FormControl(1),
    fill: new FormControl('#FFFFFF'),
    points: new FormArray([]),
  });

  public constructor() {
    this.options.valueChanges.subscribe((v) => {
      this.name = v.name;
      this.drawPath(v.points);
      this.pathEl.setAttribute('stroke', v.stroke);
      this.pathEl.setAttribute('stroke-width', v.strokeWidth);
      this.pathEl.setAttribute('fill', v.fill);

      if (this.isShapeSelected()) {
        v.points.forEach((p: Coord, i: number) => {
          this.svgEditPoints[i].setAttribute('cx', `${p.x}`);
          this.svgEditPoints[i].setAttribute('cy', `${p.y}`);
        });
      }
    });
  }

  private drawPath(coords: Coord[]) {
    this.pathEl.setAttribute('d', `M${coords.map((p) => `${p.x},${p.y}`).join(' ')}`);
  }

  private getPathPointsFromAttribute(): Coord[] {
    const pointsString = (this.pathEl.getAttribute('d') ?? '').substring(1);
    return pointsString
      .split(' ')
      .filter((s) => s.includes(','))
      .map((pointString) => ({
        x: +pointString.split(',')[0],
        y: +pointString.split(',')[1],
      }));
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;

    const coords = this.getPathPointsFromAttribute();
    coords.push(coord);

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

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    const lastCoordIndex = (this.options.controls['points'] as FormArray).controls.length - 1;
    (this.options.controls['points'] as FormArray).at(lastCoordIndex).patchValue({
      x: coord.x,
      y: coord.y,
    });
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseDownEdit(coord: Coord): void {
    const existingCoords = this.getPathPointsFromAttribute();
    this.svgSelectedEditPointIndex = existingCoords.findIndex(
      (p) => Math.abs(p.x - coord.x) < this.pointControlWidth() && Math.abs(p.y - coord.y) < this.pointControlWidth()
    );
  }
  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    const pointsFormArray: FormArray = this.options.controls['points'] as FormArray;
    pointsFormArray.at(this.svgSelectedEditPointIndex).patchValue({
      x: coord.x,
      y: coord.y,
    });
  }

  public onMouseUpEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    const pointsFormArray: FormArray = this.options.controls['points'] as FormArray;
    pointsFormArray.at(this.svgSelectedEditPointIndex).patchValue({
      x: coord.x,
      y: coord.y,
    });

    this.svgSelectedEditPointIndex = -1;
  }

  //#endregion mouse-events-edit

  //#region shape-state

  public isShapeStarted(): boolean {
    return this.isPathStarted;
  }

  public setPathCompleted() {
    this.isPathCompleted = true;
  }

  public isShapeCompleted() {
    return this.isPathCompleted;
  }

  public isShapeSelected(): boolean {
    return this.isPathSelected;
  }

  public setShapeSelected(selected: boolean): void {
    this.isPathSelected = selected;
    if (selected) {
      const coords = this.getPathPointsFromAttribute();
      coords.forEach((p) => {
        const svgPoint = this.createPointControl({ x: p.x, y: p.y });
        this.svgEditPoints.push(svgPoint);
        this.canvas.append(svgPoint);
      });
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
    this.pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.canvas.append(this.pathEl);
    this.isPathStarted = true;
  }
}
