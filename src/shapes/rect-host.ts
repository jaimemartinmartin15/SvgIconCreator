import { FormControl } from '@angular/forms';
import { Coord, CoordWithDelta, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../models/shape';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { EDIT_POINT_COLORS, ShapeHost } from './shape-host';

export class RectHost extends ShapeHost {
  //#region rect host vars
  /** The opposite rect corner of the edit point that was started to being move */
  private pivot: Coord;
  //#endregion

  public override readonly tag = Shape.RECT;
  public override svg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', Shape.RECT);

  public constructor(elementsRefService: ElementsRefService, formsService: FormsService, shapeListService: ShapeListService) {
    super(elementsRefService, formsService, shapeListService);

    this.name = `rect_${ShapeHost.shapeCounter++}`;
  }

  //#region mouse
  public override mouseDown(coord: Coord): void {
    this.canvas.append(this.svg);
    this.updateFormWithCoords([coord]);
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

  //#region mouse down edit
  public override mouseDownEdit(coord: Coord): void {
    super.mouseDownEdit(coord);

    switch (this.selectedEditPointIndex) {
      case 0: // top left
        this.pivot = { x: this.x + this.width, y: this.y + this.height };
        break;
      case 1: // top right
        this.pivot = { x: this.x, y: this.y + this.height };
        break;
      case 2: // bottom right
        this.pivot = { x: this.x, y: this.y };
        break;
      case 3: // bottom left
        this.pivot = { x: this.x + this.width, y: this.y };
        break;
    }
  }
  //#endregion

  //#region mouse drag edit
  public override mouseDragEdit(coord: CoordWithDelta): void {
    const x = coord.x < this.pivot.x ? coord.x : this.pivot.x;
    const y = coord.y < this.pivot.y ? coord.y : this.pivot.y;
    const width = Math.abs(coord.x - this.pivot.x);
    const height = Math.abs(coord.y - this.pivot.y);

    // update the selected edit point index if it crosses the pivot
    this.selectedEditPointIndex = this.getEditPointIndexUnderCoord(coord);
    this.highlightSelectedEditPoint(EDIT_POINT_COLORS.STROKE_DRAGGING);

    this.updateFormWithCoords([
      { x, y },
      { x: x + width, y: y + height },
    ]);
    this.updatePositionSvgEditPoints();
  }
  //#endregion

  //#region edit point
  protected override getEditPointCoords(): Coord[] {
    const p1: Coord = { x: this.x, y: this.y }; // top left
    const p2: Coord = { x: this.x + this.width, y: this.y }; // top right
    const p3: Coord = { x: this.x + this.width, y: this.y + this.height }; // bottom right
    const p4: Coord = { x: this.x, y: this.y + this.height }; // bottom left
    return [p1, p2, p3, p4];
  }

  public override updatePositionSvgEditPoints() {
    if (this.svgEditPoints.length !== 4) return;

    // this methods "sorts" the array: top left, top right, bottom right, bottom left

    // top left
    this.setSvgAttribute('cx', this.x, this.svgEditPoints[0]);
    this.setSvgAttribute('cy', this.y, this.svgEditPoints[0]);
    // top right
    this.setSvgAttribute('cx', this.x + this.width, this.svgEditPoints[1]);
    this.setSvgAttribute('cy', this.y, this.svgEditPoints[1]);
    // bottom right
    this.setSvgAttribute('cx', this.x + this.width, this.svgEditPoints[2]);
    this.setSvgAttribute('cy', this.y + this.height, this.svgEditPoints[2]);
    // bottom left
    this.setSvgAttribute('cx', this.x, this.svgEditPoints[3]);
    this.setSvgAttribute('cy', this.y + this.height, this.svgEditPoints[3]);
  }
  //#endregion

  //#region move shape
  public override moveShapeUp(amount: number): void {
    this.y -= amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.yForm.setValue(this.y);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeRight(amount: number): void {
    this.x += amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.xForm.setValue(this.x);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeDown(amount: number): void {
    this.y += amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.yForm.setValue(this.y);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeLeft(amount: number): void {
    this.x -= amount;
    if (this.shapeListService.selectedShape === this) {
      this.formsService.xForm.setValue(this.x);
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
    this.strokeLinejoin = this.formsService.strokeLinejoinForm.value;
    this.strokeDasharray = this.formsService.strokeDasharrayForm.value;
    this.x = this.formsService.xForm.value;
    this.y = this.formsService.yForm.value;
    this.width = this.formsService.widthForm.value;
    this.height = this.formsService.heightForm.value;
    this.rx = this.formsService.rxForm.value;
    this.ry = this.formsService.ryForm.value;
  }

  public override onEditingExistingShape(): void {
    this.formsService.strokeForm.setValue(this.stroke);
    this.formsService.fillForm.setValue(this.fill);
    this.formsService.strokeWidthForm.setValue(this.strokeWidth);
    this.formsService.strokeLinecapForm.setValue(this.strokeLinecap);
    this.formsService.strokeLinejoinForm.setValue(this.strokeLinejoin);
    this.formsService.strokeDasharrayForm.clear({ emitEvent: false });
    this.strokeDasharray.forEach((d) => this.formsService.strokeDasharrayForm.push(new FormControl<number>(d, { nonNullable: true })));
    this.formsService.xForm.setValue(this.x);
    this.formsService.yForm.setValue(this.y);
    this.formsService.widthForm.setValue(this.width);
    this.formsService.heightForm.setValue(this.height);
    this.formsService.rxForm.setValue(this.rx);
    this.formsService.ryForm.setValue(this.ry);
  }
  //#endregion

  //#region export
  public override parseShapeToString(): string {
    let rectToString = '<rect';

    rectToString += ` name="${this.name}"`;
    rectToString += ` x="${this.x}"`;
    rectToString += ` y="${this.y}"`;
    rectToString += ` width="${this.width}"`;
    rectToString += ` height="${this.height}"`;
    rectToString += ` rx="${this.rx}"`;
    rectToString += ` ry="${this.ry}"`;
    rectToString += ` fill="${this.fill}"`;
    rectToString += ` stroke="${this.stroke}"`;
    rectToString += ` stroke-width="${this.strokeWidth}"`;
    rectToString += ` stroke-linecap="${this.strokeLinecap}"`;
    rectToString += ` stroke-linejoin="${this.strokeLinejoin}"`;
    rectToString += ` stroke-dasharray="${this.strokeDasharray}"`;
    rectToString += this.parseDataBindingAttributes();

    return `${rectToString} />`;
  }
  //#endregion

  //#region rect host
  private updateFormWithCoords(coords: Coord[]) {
    const x = Math.min(...coords.map((c) => c.x));
    const y = Math.min(...coords.map((c) => c.y));
    const width = Math.max(...coords.map((c) => c.x)) - x;
    const height = Math.max(...coords.map((c) => c.y)) - y;

    this.formsService.xForm.setValue(x);
    this.formsService.yForm.setValue(y);
    this.formsService.widthForm.setValue(width);
    this.formsService.heightForm.setValue(height);

    this.updatePositionSvgEditPoints();
  }
  //#endregion
}
