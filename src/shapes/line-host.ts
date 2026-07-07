import { FormControl } from '@angular/forms';
import { Coord, CoordWithDelta, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../models/shape';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { ShapeHost } from './shape-host';

export class LineHost extends ShapeHost {
  public override readonly tag = Shape.LINE;
  public override svg: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', Shape.LINE);

  public constructor(elementsRefService: ElementsRefService, formsService: FormsService, shapeListService: ShapeListService) {
    super(elementsRefService, formsService, shapeListService);

    this.name = `line_${ShapeHost.shapeCounter++}`;
  }

  //#region mouse
  public override mouseDown(coord: Coord): void {
    this.canvas.append(this.svg);
    this.mouseDrag({ ...coord, dx: 0, dy: 0 });
  }

  public override mouseDrag(coord: CoordWithDelta): void {
    const x1 = coord.x - coord.dx;
    const y1 = coord.y - coord.dy;
    const x2 = coord.x;
    const y2 = coord.y;
    this.updateFormWithCoords([
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ]);
  }

  public override mouseUp(coord: CoordWithDelta): void {
    this.mouseDrag(coord);
    this.isShapeFinished = true;
    this.createEditPoints();
  }
  //#endregion

  //#region mouse drag edit
  public override mouseDragEdit(coord: CoordWithDelta): void {
    if (this.selectedEditPointIndex === 0) {
      this.updateFormWithCoords([
        { x: coord.x, y: coord.y },
        { x: this.x2, y: this.y2 },
      ]);
    } else {
      this.updateFormWithCoords([
        { x: this.x1, y: this.y1 },
        { x: coord.x, y: coord.y },
      ]);
    }
    this.updatePositionSvgEditPoints();
  }
  //#endregion

  //#region edit point
  protected override getEditPointCoords(): Coord[] {
    const p1: Coord = { x: this.x1, y: this.y1 }; // start point
    const p2: Coord = { x: this.x2, y: this.y2 }; // end point
    return [p1, p2];
  }

  public override updatePositionSvgEditPoints() {
    if (this.svgEditPoints.length !== 2) return;

    // start point
    this.setSvgAttribute('cx', this.x1, this.svgEditPoints[0]);
    this.setSvgAttribute('cy', this.y1, this.svgEditPoints[0]);

    // end point
    this.setSvgAttribute('cx', this.x2, this.svgEditPoints[1]);
    this.setSvgAttribute('cy', this.y2, this.svgEditPoints[1]);
  }
  //#endregion

  //#region move shape
  public override moveShapeUp(amount: number): void {
    this.y1 -= amount;
    this.y2 -= amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.y1Form.setValue(this.y1);
      this.formsService.y2Form.setValue(this.y2);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeRight(amount: number): void {
    this.x1 += amount;
    this.x2 += amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.x1Form.setValue(this.x1);
      this.formsService.x2Form.setValue(this.x2);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeDown(amount: number): void {
    this.y1 += amount;
    this.y2 += amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.y1Form.setValue(this.y1);
      this.formsService.y2Form.setValue(this.y2);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeLeft(amount: number): void {
    this.x1 -= amount;
    this.x2 -= amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.x1Form.setValue(this.x1);
      this.formsService.x2Form.setValue(this.x2);
      this.updatePositionSvgEditPoints();
    }
  }
  //#endregion

  //#region svg form binding
  public override onCreatingNewShape(): void {
    this.stroke = this.formsService.strokeForm.value;
    this.fill = this.formsService.fillForm.value;
    this.strokeWidth = this.formsService.strokeWidthForm.value;
    this.strokeLinecap = this.formsService.strokeLinecapForm.value;
    this.strokeDasharray = this.formsService.strokeDasharrayForm.value;
    this.x1 = this.formsService.x1Form.value;
    this.y1 = this.formsService.y1Form.value;
    this.x2 = this.formsService.x2Form.value;
    this.y2 = this.formsService.y2Form.value;
  }

  public override onEditingExistingShape(): void {
    this.formsService.strokeForm.setValue(this.stroke);
    this.formsService.fillForm.setValue(this.fill);
    this.formsService.strokeWidthForm.setValue(this.strokeWidth);
    this.formsService.strokeLinecapForm.setValue(this.strokeLinecap);
    this.formsService.strokeDasharrayForm.clear({ emitEvent: false });
    this.strokeDasharray.forEach((d) => this.formsService.strokeDasharrayForm.push(new FormControl<number>(d, { nonNullable: true })));
    this.formsService.x1Form.setValue(this.x1);
    this.formsService.y1Form.setValue(this.y1);
    this.formsService.x2Form.setValue(this.x2);
    this.formsService.y2Form.setValue(this.y2);
  }
  //#endregion

  //#region export
  public override parseShapeToString(): string {
    let lineToString = '<line';

    lineToString += ` name="${this.name}"`;
    lineToString += ` x1="${this.x1}"`;
    lineToString += ` y1="${this.y1}"`;
    lineToString += ` x2="${this.x2}"`;
    lineToString += ` y2="${this.y2}"`;
    lineToString += ` stroke="${this.stroke}"`;
    lineToString += ` stroke-width="${this.strokeWidth}"`;
    lineToString += ` stroke-linecap="${this.strokeLinecap}"`;
    lineToString += ` stroke-dasharray="${this.strokeDasharray}"`;

    return `${lineToString} />`;
  }
  //#endregion

  //#region line host
  private updateFormWithCoords(coords: Coord[]) {
    this.formsService.x1Form.setValue(coords[0].x);
    this.formsService.y1Form.setValue(coords[0].y);
    this.formsService.x2Form.setValue(coords[1].x);
    this.formsService.y2Form.setValue(coords[1].y);

    this.updatePositionSvgEditPoints();
  }
  //#endregion
}
