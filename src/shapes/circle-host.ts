import { FormControl, FormGroup } from "@angular/forms";
import { CircleModel } from "../models/circle.model";
import { Coord } from "../models/coord";
import { CoordWithDelta } from "../models/coord-with-delta";
import { Shape } from "../models/shape";
import { ConvertToForm } from "../utils/convert-to-form";
import { ShapeHost } from "./shape-host";

export class CircleHost extends ShapeHost {
  public override readonly type = Shape.CIRCLE;
  public override svg: SVGCircleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  public override readonly form: ConvertToForm<CircleModel> = new FormGroup({
    name: new FormControl('circle', { nonNullable: true }),
    stroke: new FormControl('#000000ff', { nonNullable: true }),
    strokeWidth: new FormControl(1, { nonNullable: true }),
    fill: new FormControl('#ffffffff', { nonNullable: true }),
    cx: new FormControl(0, { nonNullable: true }),
    cy: new FormControl(0, { nonNullable: true }),
    r: new FormControl(0, { nonNullable: true }),
  });

  //#region svg attributes
  public override updateSvgAttributes(model: CircleModel) {
    super.updateSvgAttributes(model);

    this.setSvgAttribute('cx', model.cx);
    this.setSvgAttribute('cy', model.cy);
    this.setSvgAttribute('r', model.r);
  }

  public override updatePositionSvgEditPoints(model: CircleModel) {
    if (this.svgEditPoints.length !== 2) return;

    // center
    this.setSvgAttribute('cx', model.cx, this.svgEditPoints[0]);
    this.setSvgAttribute('cy', model.cy, this.svgEditPoints[0]);

    // perimeter
    this.setSvgAttribute('cx', model.cx + model.r, this.svgEditPoints[1]);
    this.setSvgAttribute('cy', model.cy, this.svgEditPoints[1]);
  }
  //#endregion

  //#region mouse
  public override mouseDown(coord: Coord): void {
    this.canvas.append(this.svg);
    this.mouseDrag({ ...coord, dx: 0, dy: 0 });
  }

  public override mouseDrag(coord: CoordWithDelta): void {
    const cx = this.toFixed(coord.x - coord.dx);
    const cy = this.toFixed(coord.y - coord.dy);
    const radius = this.calculateRadius({ x: cx, y: cy }, coord)

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
      this.form.patchValue({ cx: coord.x, cy: coord.y });
    } else {
      const center = { x: this.form.controls.cx.value, y: this.form.controls.cy.value };
      const radius = this.calculateRadius(center, coord);
      this.form.patchValue({ r: radius });
    }
  }
  //#endregion

  //#region edit point
  protected override getEditPointsCoordsFromForm(): Coord[] {
    const cx = this.form.controls.cx.value;
    const cy = this.form.controls.cy.value;
    const r = this.form.controls.r.value;

    return [
      { x: cx, y: cy }, // center
      { x: cx + r, y: cy }, // perimeter
    ];
  }
  //#endregion

  //#region import
  public override loadFromElement(svg: SVGCircleElement) {
    this.svg = svg;
    this.form.setValue({
      name: this.svg.getAttribute('name') || 'Circle',
      stroke: this.svg.getAttribute('stroke') || '#000000ff',
      strokeWidth: this.getSvgAttribute('stroke-width'), // TODO fix issue when attribute is not present (default is 1, and this returns 0)
      fill: this.svg.getAttribute('fill') || '#ffffffff',
      cx: this.getSvgAttribute('cx'),
      cy: this.getSvgAttribute('cy'),
      r: this.getSvgAttribute('r'),
    });

    super.loadFromElement(svg)
  }
  //#endregion

  //#region export
  protected override isShapeVisible(): boolean {
    const { r } = this.form.controls;

    let isVisible = super.isShapeVisible();
    let hasSize = r.value > 0;

    return isVisible && hasSize;
  }

  public override parseCustomOptimizedStringAndCloseShape(): string {
    const { cx, cy, r } = this.form.controls;

    let circleAttr = '';

    // add if they are not the default value
    if (cx.value !== 0) circleAttr += ` cx="${cx.value}"`;
    if (cy.value !== 0) circleAttr += ` cy="${cy.value}"`;

    // always present, otherwise not visible
    circleAttr += ` r="${r.value}"`;

    return `${circleAttr} />`;
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
    this.form.setValue({
      ...this.form.value,
      cx: center.x,
      cy: center.y,
      r: radius
    } as CircleModel
    );
  }
  //#endregion
}
