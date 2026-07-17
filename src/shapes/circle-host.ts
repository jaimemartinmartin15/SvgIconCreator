import { FormControl } from '@angular/forms';
import { Coord, CoordWithDelta, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../models/shape';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { ShapeHost } from './shape-host';

export class CircleHost extends ShapeHost {
  public override readonly tag = Shape.CIRCLE;
  public override svg: SVGCircleElement = document.createElementNS('http://www.w3.org/2000/svg', Shape.CIRCLE);

  public constructor(elementsRefService: ElementsRefService, formsService: FormsService, shapeListService: ShapeListService) {
    super(elementsRefService, formsService, shapeListService);

    this.name = `circle_${ShapeHost.shapeCounter++}`;
  }

  //#region mouse
  public override mouseDown(coord: Coord): void {
    this.shapeListService.addShapeToSelectedGroup(this);
    this.mouseDrag({ ...coord, dx: 0, dy: 0 });
  }

  public override mouseDrag(coord: CoordWithDelta): void {
    const cx = coord.x - coord.dx;
    const cy = coord.y - coord.dy;
    const radius = this.calculateRadius({ x: cx, y: cy }, coord);

    this.updateForm({ x: cx, y: cy }, radius);
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
      this.updateForm(coord, this.r);
    } else {
      const center = { x: this.cx, y: this.cy };
      const radius = this.calculateRadius(center, coord);
      this.updateForm(center, radius);
    }
  }
  //#endregion

  //#region edit point
  protected override getEditPointCoords(): Coord[] {
    return [
      { x: this.cx, y: this.cy }, // center
      { x: this.cx + this.r, y: this.cy }, // perimeter
    ];
  }

  public override updatePositionSvgEditPoints() {
    if (this.svgEditPoints.length !== 2) return;

    // center
    this.setSvgAttribute('cx', this.cx, this.svgEditPoints[0]);
    this.setSvgAttribute('cy', this.cy, this.svgEditPoints[0]);

    // perimeter
    this.setSvgAttribute('cx', this.cx + this.r, this.svgEditPoints[1]);
    this.setSvgAttribute('cy', this.cy, this.svgEditPoints[1]);
  }
  //#endregion

  //#region move shape
  public override moveShapeUp(amount: number): void {
    this.cy -= amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.cyForm.setValue(this.cy);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeRight(amount: number): void {
    this.cx += amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.cxForm.setValue(this.cx);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeDown(amount: number): void {
    this.cy += amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.cyForm.setValue(this.cy);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeLeft(amount: number): void {
    this.cx -= amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.cxForm.setValue(this.cx);
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
    this.cx = this.formsService.cxForm.value;
    this.cy = this.formsService.cyForm.value;
    this.r = this.formsService.rForm.value;
  }

  public override onEditingExistingShape(): void {
    this.formsService.strokeForm.setValue(this.stroke);
    this.formsService.fillForm.setValue(this.fill);
    this.formsService.strokeWidthForm.setValue(this.strokeWidth);
    this.formsService.strokeLinecapForm.setValue(this.strokeLinecap);
    this.formsService.strokeDasharrayForm.clear({ emitEvent: false });
    this.strokeDasharray.forEach((d) => this.formsService.strokeDasharrayForm.push(new FormControl<number>(d, { nonNullable: true })));
    this.formsService.cxForm.setValue(this.cx);
    this.formsService.cyForm.setValue(this.cy);
    this.formsService.rForm.setValue(this.r);
  }
  //#endregion

  //#region export
  public override parseShapeToString(): string {
    let circleToString = '<circle';

    circleToString += ` name="${this.name}"`;
    circleToString += ` cx="${this.cx}"`;
    circleToString += ` cy="${this.cy}"`;
    circleToString += ` r="${this.r}"`;
    circleToString += ` fill="${this.fill}"`;
    circleToString += ` stroke="${this.stroke}"`;
    circleToString += ` stroke-width="${this.strokeWidth}"`;
    circleToString += ` stroke-linecap="${this.strokeLinecap}"`;
    circleToString += ` stroke-dasharray="${this.strokeDasharray}"`;
    circleToString += this.parseDataBindingAttributes();

    return `${circleToString} />`;
  }
  //#endregion

  //#region circle host
  private calculateRadius(p1: Coord, p2: Coord): number {
    const c1Power2 = Math.pow(Math.abs(p1.x - p2.x), 2);
    const c2Power2 = Math.pow(Math.abs(p1.y - p2.y), 2);
    const squareRoot = Math.sqrt(c1Power2 + c2Power2);
    return +squareRoot.toFixed(1);
  }

  private updateForm(center: Coord, radius: number) {
    this.formsService.cxForm.setValue(center.x);
    this.formsService.cyForm.setValue(center.y);
    this.formsService.rForm.setValue(radius);

    this.updatePositionSvgEditPoints();
  }
  //#endregion
}
