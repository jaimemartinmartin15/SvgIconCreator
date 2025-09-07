import { FormControl, FormGroup } from "@angular/forms";
import { Coord } from "../models/coord";
import { CoordWithDelta } from "../models/coord-with-delta";
import { RectModel } from "../models/rect.model";
import { Shape } from "../models/shape";
import { ConvertToForm } from "../utils/convert-to-form";
import { ShapeHost } from "./shape-host";

export class RectHost extends ShapeHost {
  //#region rect host vars
  // the opposite rect corner of the edit point that was started to being move
  private pivot: Coord;
  //#endregion

  public override readonly type = Shape.RECT;
  public override svg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  public override readonly form: ConvertToForm<RectModel> = new FormGroup({
    name: new FormControl('rect', { nonNullable: true }),
    stroke: new FormControl('#000000ff', { nonNullable: true }),
    strokeWidth: new FormControl(1, { nonNullable: true }),
    fill: new FormControl('#ffffffff', { nonNullable: true }),
    x: new FormControl(0, { nonNullable: true }),
    y: new FormControl(0, { nonNullable: true }),
    width: new FormControl(0, { nonNullable: true }),
    height: new FormControl(0, { nonNullable: true }),
    rx: new FormControl(0, { nonNullable: true }),
    ry: new FormControl(0, { nonNullable: true }),
  });

  //#region svg attributes
  public override updateSvgAttributes(model: RectModel) {
    super.updateSvgAttributes(model);

    this.setSvgAttribute('x', model.x);
    this.setSvgAttribute('y', model.y);
    this.setSvgAttribute('width', model.width);
    this.setSvgAttribute('height', model.height);
    this.setSvgAttribute('rx', model.rx);
    this.setSvgAttribute('ry', model.ry);
  }

  public override updatePositionSvgEditPoints(model: RectModel) {
    if (this.svgEditPoints.length !== 4) return;

    // this methods "sorts" the array: top left, top right, bottom right, bottom left

    // top left
    this.setSvgAttribute('cx', model.x, this.svgEditPoints[0]);
    this.setSvgAttribute('cy', model.y, this.svgEditPoints[0]);
    // top right
    this.setSvgAttribute('cx', model.x + model.width, this.svgEditPoints[1]);
    this.setSvgAttribute('cy', model.y, this.svgEditPoints[1]);
    // bottom right
    this.setSvgAttribute('cx', model.x + model.width, this.svgEditPoints[2]);
    this.setSvgAttribute('cy', model.y + model.height, this.svgEditPoints[2]);
    // bottom left
    this.setSvgAttribute('cx', model.x, this.svgEditPoints[3]);
    this.setSvgAttribute('cy', model.y + model.height, this.svgEditPoints[3]);
  }
  //#endregion

  //#region mouse
  public override mouseDown(coord: Coord): void {
    this.canvas.append(this.svg);
    this.updateFormWithCoords([coord]);
  }

  public override mouseDrag(coord: CoordWithDelta): void {
    const x1 = this.toFixed(coord.x - coord.dx);
    const y1 = this.toFixed(coord.y - coord.dy);
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

    const { x, y, width, height } = this.form.value as RectModel;
    switch (this.selectedEditPointIndex) {
      case 0: // top left
        this.pivot = { x: x + width, y: y + height };
        break;
      case 1: // top right
        this.pivot = { x, y: y + height };
        break;
      case 2: // bottom right
        this.pivot = { x, y };
        break;
      case 3: // bottom left
        this.pivot = { x: x + width, y };
        break;
    }
  }
  //#endregion

  //#region mouse drag edit
  public override mouseDragEdit(coord: CoordWithDelta): void {
    let x = coord.x < this.pivot.x ? coord.x : this.pivot.x;
    let y = coord.y < this.pivot.y ? coord.y : this.pivot.y;
    let width = Math.abs(coord.x - this.pivot.x);
    let height = Math.abs(coord.y - this.pivot.y);

    // update the selected edit point index if it crosses the pivot
    this.selectedEditPointIndex = this.getEditPointIndexUnderCoord(coord);
    this.highlightSelectedEditPoint('red');

    this.updateFormWithCoords([
      { x, y },
      { x: x + width, y: y + height },
    ]);
  }
  //#endregion

  //#region edit point
  protected override getEditPointsCoordsFromForm(): Coord[] {
    const x = this.form.controls.x.value;
    const y = this.form.controls.y.value;
    const width = this.form.controls.width.value;
    const height = this.form.controls.height.value;

    // this is the position they will have in svgEditPoints
    return [
      { x, y }, // top left
      { x: x + width, y }, // top right
      { x: x + width, y: y + height }, // bottom right
      { x, y: y + height }, // bottom left
    ];
  }
  //#endregion

  //#region import
  public override loadFromElement(svg: SVGRectElement) {
    this.svg = svg;
    this.form.setValue({
      name: this.svg.getAttribute('name') || 'rect',
      stroke: this.svg.getAttribute('stroke') || '#000000ff',
      strokeWidth: this.getSvgAttribute('stroke-width'),
      fill: this.svg.getAttribute('fill') || '#ffffffff',
      x: this.getSvgAttribute('x'),
      y: this.getSvgAttribute('y'),
      width: this.getSvgAttribute('width'),
      height: this.getSvgAttribute('height'),
      rx: this.getSvgAttribute('rx'),
      ry: this.getSvgAttribute('ry'),
    });

    super.loadFromElement(svg)
  }
  //#endregion

  //#region export
  protected override isShapeVisible(): boolean {
    const { width, height } = this.form.controls;

    let isVisible = super.isShapeVisible();
    let hasSize = width.value > 0 && height.value > 0;

    return isVisible && hasSize;
  }

  public override parseCustomOptimizedStringAndCloseShape(): string {
    const { x, y, width, height, rx, ry } = this.form.controls;

    let rectAttr = '';

    // add if they are not the default value
    if (x.value !== 0) rectAttr += ` x="${x.value}"`;
    if (y.value !== 0) rectAttr += ` y="${y.value}"`;

    // always present, otherwise not visible
    rectAttr += ` width="${width.value}"`;
    rectAttr += ` height="${height.value}"`;

    // rx and ry both have to be different than 0, and if they are the same, add only one of both
    if (rx.value === ry.value && rx.value !== 0) rectAttr += ` rx="${rx.value}"`;
    else if (rx.value !== 0 && ry.value !== 0) rectAttr += ` rx="${rx.value}" ry="${ry.value}"`;

    return `${rectAttr} />`;
  }
  //#endregion

  //#region rect host
  private updateFormWithCoords(coords: Coord[]) {
    const x = Math.min(...coords.map(c => c.x));
    const y = Math.min(...coords.map(c => c.y));
    const width = this.toFixed(Math.max(...coords.map(c => c.x)) - x);
    const height = this.toFixed(Math.max(...coords.map(c => c.y)) - y);

    const patchValue: RectModel = { ...this.form.value, x, y, width, height } as RectModel;
    this.form.setValue(patchValue);
  }
  //#endregion
}
