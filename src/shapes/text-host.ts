import { FormControl, FormGroup } from "@angular/forms";
import { Coord } from "../models/coord";
import { CoordWithDelta } from "../models/coord-with-delta";
import { Shape } from "../models/shape";
import { TextModel } from "../models/text.model";
import { ConvertToForm } from "../utils/convert-to-form";
import { ShapeHost } from "./shape-host";

export class TextHost extends ShapeHost {
  public override readonly type = Shape.TEXT;
  public override svg: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  public override readonly form: ConvertToForm<TextModel> = new FormGroup({
    name: new FormControl('text', { nonNullable: true }),
    stroke: new FormControl('#000000ff', { nonNullable: true }),
    strokeWidth: new FormControl(0.4, { nonNullable: true }),
    fill: new FormControl('#ffffffff', { nonNullable: true }),
    x: new FormControl(0, { nonNullable: true }),
    y: new FormControl(0, { nonNullable: true }),
    text: new FormControl('text', { nonNullable: true }),
    fontSize: new FormControl(8, { nonNullable: true }),
  });

  //#region svg attributes
  public override updateSvgAttributes(model: TextModel) {
    super.updateSvgAttributes(model);

    this.setSvgAttribute('x', model.x);
    this.setSvgAttribute('y', model.y);
    this.setSvgAttribute('font-size', model.fontSize);
    this.svg.innerHTML = model.text;
  }

  public override updatePositionSvgEditPoints(model: TextModel) {
    if (this.svgEditPoints.length !== 1) return; // TODO improvement allow second point to scalate font size

    this.setSvgAttribute('cx', model.x, this.svgEditPoints[0]);
    this.setSvgAttribute('cy', model.y, this.svgEditPoints[0]);
  }
  //#endregion

  //#region mouse
  public override mouseDown(coord: Coord): void {
    this.canvas.append(this.svg);
    this.mouseDrag({ ...coord, dx: 0, dy: 0 });
  }

  public override mouseDrag(coord: CoordWithDelta): void {
    this.form.patchValue({ x: coord.x, y: coord.y, })
  }

  public override mouseUp(coord: CoordWithDelta): void {
    this.mouseDrag(coord);
    this.isShapeFinished = true;
    this.createEditPoints();
  }
  //#endregion

  //#region mouse drag edit
  public override mouseDragEdit(coord: CoordWithDelta): void {
    this.mouseDrag(coord);
  }
  //#endregion

  //#region edit point
  protected override getEditPointsCoordsFromForm(): Coord[] {
    return [{ x: this.form.controls.x.value, y: this.form.controls.y.value }];
  }
  //#endregion

  //#region import
  public override loadFromElement(svg: SVGTextElement) {
    this.svg = svg;
    this.form.setValue({
      name: this.svg.getAttribute('name') || 'text',
      stroke: this.svg.getAttribute('stroke') || '#000000ff',
      strokeWidth: this.getSvgAttribute('stroke-width'),
      fill: this.svg.getAttribute('fill') || '#ffffffff',
      x: this.getSvgAttribute('x'),
      y: this.getSvgAttribute('y'),
      text: this.svg.textContent || '',
      fontSize: this.getSvgAttribute('font-size'),
    });

    super.loadFromElement(svg)
  }
  //#endregion

  //#region export
  protected override isShapeVisible(): boolean {
    const { text, fontSize } = this.form.controls;

    const isVisible = super.isShapeVisible();
    const hasSize = text.value.trim() !== '' && fontSize.value > 0;

    return isVisible && hasSize;
  }

  public override parseCustomOptimizedStringAndCloseShape(): string {
    const { x, y, text, fontSize } = this.form.controls;

    let textAttr = '';

    // add if they are not the default value
    if (x.value !== 0) textAttr += ` x="${x.value}"`;
    if (y.value !== 0) textAttr += ` y="${y.value}"`;

    // always present, otherwise not visible
    textAttr += ` font-size="${fontSize.value}"`;
    return `${textAttr} >${text.value}</text>`;
  }
  //#endregion
}
