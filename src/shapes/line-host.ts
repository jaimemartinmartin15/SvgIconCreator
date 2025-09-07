import { FormControl, FormGroup } from "@angular/forms";
import { Coord } from "../models/coord";
import { CoordWithDelta } from "../models/coord-with-delta";
import { LineModel } from "../models/line.model";
import { Shape } from "../models/shape";
import { ConvertToForm } from "../utils/convert-to-form";
import { ShapeHost } from "./shape-host";

export class LineHost extends ShapeHost {
  public override readonly type = Shape.LINE;
  public override svg: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  public override readonly form: ConvertToForm<LineModel> = new FormGroup({
    name: new FormControl('line', { nonNullable: true }),
    stroke: new FormControl('#000000ff', { nonNullable: true }),
    strokeWidth: new FormControl(1, { nonNullable: true }),
    fill: new FormControl('#ffffffff', { nonNullable: true }),
    x1: new FormControl(0, { nonNullable: true }),
    y1: new FormControl(0, { nonNullable: true }),
    x2: new FormControl(0, { nonNullable: true }),
    y2: new FormControl(0, { nonNullable: true }),
  });

  //#region svg attributes
  public override updateSvgAttributes(model: LineModel) {
    super.updateSvgAttributes(model);

    this.setSvgAttribute('x1', model.x1);
    this.setSvgAttribute('y1', model.y1);
    this.setSvgAttribute('x2', model.x2);
    this.setSvgAttribute('y2', model.y2);
  }

  public override updatePositionSvgEditPoints(model: LineModel) {
    if (this.svgEditPoints.length !== 2) return;

    // start point
    this.setSvgAttribute('cx', model.x1, this.svgEditPoints[0]);
    this.setSvgAttribute('cy', model.y1, this.svgEditPoints[0]);

    // end point
    this.setSvgAttribute('cx', model.x2, this.svgEditPoints[1]);
    this.setSvgAttribute('cy', model.y2, this.svgEditPoints[1]);
  }
  //#endregion

  //#region mouse
  public override mouseDown(coord: Coord): void {
    this.canvas.append(this.svg);
    this.mouseDrag({ ...coord, dx: 0, dy: 0 });
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

  //#region mouse drag edit
  public override mouseDragEdit(coord: CoordWithDelta): void {
    if (this.selectedEditPointIndex === 0) {
      this.form.patchValue({ x1: coord.x, y1: coord.y });
    } else {
      this.form.patchValue({ x2: coord.x, y2: coord.y });
    }
  }
  //#endregion

  //#region edit point
  protected override getEditPointsCoordsFromForm(): Coord[] {
    const x1 = this.form.controls.x1.value;
    const y1 = this.form.controls.y1.value;
    const x2 = this.form.controls.x2.value;
    const y2 = this.form.controls.y2.value;

    return [
      { x: x1, y: y1 }, // start point
      { x: x2, y: y2 }, // end point
    ];
  }
  //#endregion

  //#region import
  public override loadFromElement(svg: SVGLineElement) {
    this.svg = svg;
    this.form.setValue({
      name: this.svg.getAttribute('name') || 'line',
      stroke: this.svg.getAttribute('stroke') || '#000000ff',
      strokeWidth: this.getSvgAttribute('stroke-width'),
      fill: this.svg.getAttribute('fill') || '#ffffffff',
      x1: this.getSvgAttribute('x1'),
      y1: this.getSvgAttribute('y1'),
      x2: this.getSvgAttribute('x2'),
      y2: this.getSvgAttribute('y2'),
    });

    super.loadFromElement(svg)
  }
  //#endregion

  //#region export
  protected override isShapeVisible(): boolean {
    const { strokeWidth, stroke, x1, y1, x2, y2 } = this.form.controls;

    let isVisible = !stroke.value.endsWith('00') && strokeWidth.value !== 0;
    let hasSize = x1.value !== x2.value || x2.value !== y1.value || y1.value !== y2.value;

    return isVisible && hasSize;
  }

  public override parseCustomOptimizedStringAndCloseShape(): string {
    const { x1, y1, x2, y2 } = this.form.controls;

    let lineAttrs = '';

    // add if they are not the default value
    if (x1.value !== 0) lineAttrs += ` x1="${x1.value}"`;
    if (y1.value !== 0) lineAttrs += ` y1="${y1.value}"`;
    if (x2.value !== 0) lineAttrs += ` x2="${x2.value}"`;
    if (y2.value !== 0) lineAttrs += ` y2="${y2.value}"`;

    return `${lineAttrs} />`;
  }
  //#endregion

  //#region line host
  private updateFormWithCoords(coords: Coord[]) {
    const x1 = coords[0].x;
    const y1 = coords[0].y;
    const x2 = coords[1].x;
    const y2 = coords[1].y;

    this.form.setValue({ ...this.form.value, x1, y1, x2, y2 } as LineModel);
  }
  //#endregion
}
