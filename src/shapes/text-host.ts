import { FormControl } from '@angular/forms';
import { Coord, CoordWithDelta, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../models/shape';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { ShapeHost } from './shape-host';

export class TextHost extends ShapeHost {
  public override readonly tag = Shape.TEXT;
  public override svg: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', Shape.TEXT);

  public constructor(elementsRefService: ElementsRefService, formsService: FormsService, shapeListService: ShapeListService) {
    super(elementsRefService, formsService, shapeListService);

    this.name = `text_${ShapeHost.shapeCounter++}`;
  }

  //#region mouse
  public override mouseDown(coord: Coord): void {
    this.shapeListService.addShape(this);
    this.mouseDrag({ ...coord, dx: 0, dy: 0 });
  }

  public override mouseDrag(coord: CoordWithDelta): void {
    this.formsService.xForm.setValue(coord.x);
    this.formsService.yForm.setValue(coord.y);
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
    this.updatePositionSvgEditPoints();
  }
  //#endregion

  //#region edit point
  protected override getEditPointCoords(): Coord[] {
    return [{ x: this.x, y: this.y }];
  }

  public override updatePositionSvgEditPoints() {
    if (this.svgEditPoints.length !== 1) return; // TODO improvement allow second point to scalate font size

    this.setSvgAttribute('cx', this.x, this.svgEditPoints[0]);
    this.setSvgAttribute('cy', this.y, this.svgEditPoints[0]);
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
    this.text = this.formsService.textForm.value.trim();
    this.fontSize = this.formsService.fontSizeForm.value;
    this.fontFamily = this.formsService.fontFamilyForm.value;
    this.textAnchor = this.formsService.textAnchorForm.value;
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
    this.formsService.textForm.setValue(this.text.trim());
    this.formsService.fontSizeForm.setValue(this.fontSize);
    this.formsService.fontFamilyForm.setValue(this.fontFamily);
    this.formsService.textAnchorForm.setValue(this.textAnchor);
  }
  //#endregion

  //#region export
  public override parseShapeToString(indentationLevel: number = 1, indentationSize: number = 2): string {
    let textToString = `${' '.repeat(indentationLevel * indentationSize)}<text`;

    textToString += ` name="${this.name}"`;
    textToString += ` x="${this.x}"`;
    textToString += ` y="${this.y}"`;
    textToString += ` font-size="${this.fontSize}"`;
    textToString += ` font-family="${this.fontFamily}"`;
    textToString += ` fill="${this.fill}"`;
    textToString += ` text-anchor="${this.textAnchor}"`;
    textToString += ` stroke="${this.stroke}"`;
    textToString += ` stroke-width="${this.strokeWidth}"`;
    textToString += ` stroke-linecap="${this.strokeLinecap}"`;
    textToString += ` stroke-linejoin="${this.strokeLinejoin}"`;
    textToString += ` stroke-dasharray="${this.strokeDasharray}"`;
    textToString += this.parseDataBindingAttributes();

    return `${textToString}>
${' '.repeat((indentationLevel + 1) * indentationSize)}${this.text}
${' '.repeat(indentationLevel * indentationSize)}</text>`;
  }
  //#endregion

  //#region clone
  public clone(): TextHost {
    const textHost = new TextHost(this.elementsRefService, this.formsService, this.shapeListService);
    textHost.svg = this.svg.cloneNode(true) as SVGTextElement;
    textHost.isShapeFinished = true;
    return textHost;
  }
  //#endregion
}
