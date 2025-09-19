import { FormGroup } from '@angular/forms';
import { Coord, CoordWithDelta, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../models/shape';
import { ShapeModel } from '../models/shape.model';
import { ShapeListService } from '../services/shape-list.service';

export abstract class ShapeHost {
  public constructor(
    protected readonly elementsRefService: ElementsRefService,
    protected readonly shapeListService: ShapeListService,
  ) {}

  public abstract readonly type: Shape;
  public abstract readonly form: FormGroup;
  public abstract svg: SVGElement;

  public isShapeFinished: boolean = false;

  //#region svg attributes
  public updateSvgAttributes(model: ShapeModel): void {
    this.svg.setAttribute('name', model.name);
    this.setSvgAttribute('stroke-width', model.strokeWidth);
    this.svg.setAttribute('stroke', model.stroke);
    this.svg.setAttribute('fill', model.fill);
  }
  public abstract updatePositionSvgEditPoints(model: ShapeModel): void;
  //#endregion

  //#region mouse
  public abstract mouseDown(coord: Coord): void;
  public abstract mouseDrag(coord: CoordWithDelta): void;
  public abstract mouseUp(coord: CoordWithDelta): void;
  //#endregion

  //#region mouse move
  public mouseMove(coord: Coord): void {
    this.selectedEditPointIndex = this.getEditPointIndexUnderCoord(coord);
    this.highlightSelectedEditPoint('orange');
  }
  //#endregion

  //#region mouse edit
  public mouseDownEdit(_: Coord): void {
    this.highlightSelectedEditPoint('red');
  }
  public abstract mouseDragEdit(coord: CoordWithDelta): void;
  public mouseUpEdit(coord: CoordWithDelta): void {
    this.mouseDragEdit(coord);
  }
  //#endregion

  //#region edit points
  public svgEditPoints: SVGCircleElement[] = [];
  protected selectedEditPointIndex: number = -1;

  protected abstract getEditPointsCoordsFromForm(): Coord[];
  protected getEditPointsCoordsFromSvg(): Coord[] {
    return this.svgEditPoints.map((p) => ({ x: this.getSvgAttribute('cx', p), y: this.getSvgAttribute('cy', p) }));
  }

  public createEditPoints(): void {
    const editPointsCoords = this.getEditPointsCoordsFromForm();
    editPointsCoords.forEach((epc) => {
      const editPointEl = this.createEditPoint(epc);
      this.svgEditPoints.push(editPointEl);
      this.canvas.append(editPointEl);
    });
  }

  public clearEditPoints(): void {
    this.svgEditPoints.forEach((ep) => ep.remove());
    this.svgEditPoints.length = 0;
  }

  private getEditPointWidth(): number {
    return Math.max(this.canvas.viewBox.baseVal.width, this.canvas.viewBox.baseVal.height) * 0.01;
  }

  private createEditPoint(coord: Coord): SVGCircleElement {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', `${coord.x}`);
    c.setAttribute('cy', `${coord.y}`);
    c.setAttribute('r', this.getEditPointWidth().toFixed(1));
    c.setAttribute('stroke', 'blue');
    c.setAttribute('stroke-width', (this.getEditPointWidth() / 2).toFixed(1));
    c.setAttribute('fill', 'white');
    return c;
  }

  protected getEditPointIndexUnderCoord(coord: Coord): number {
    return this.getEditPointsCoordsFromForm().findIndex((c) => Math.abs(c.x - coord.x) < this.getEditPointWidth() && Math.abs(c.y - coord.y) < this.getEditPointWidth());
  }

  public getEditPointUnderMousePoint(mousePoint: Coord): SVGCircleElement | undefined {
    return this.svgEditPoints[this.getEditPointIndexUnderCoord(mousePoint)];
  }

  protected highlightSelectedEditPoint(color: 'orange' | 'red'): void {
    // reset color of all points and highlight only the one under the mouse (if it exists)
    this.svgEditPoints.forEach((p) => p.setAttribute('stroke', 'blue'));
    this.svgEditPoints[this.selectedEditPointIndex]?.setAttribute('stroke', color);
  }
  //#endregion

  //#region canvas
  public addToCanvas() {
    this.canvas.append(this.svg);
    if (this.shapeListService.selectedShape === this) {
      // wait all shapes to be added to the canvas, and then paint the edit points on top of all shapes
      setTimeout(() => this.svgEditPoints.forEach((ep) => this.canvas.append(ep)), 0);
    }
  }

  public removeFromCanvas() {
    this.svg.remove();
    this.svgEditPoints.forEach((ep) => ep.remove());
  }

  public setVisibility(isVisible: boolean) {
    const display = isVisible ? '' : 'none';
    this.svg.style.display = display;
    this.svgEditPoints.forEach((p) => (p.style.display = display));
  }

  public delete(): void {
    const index = this.shapeListService.shapeList.indexOf(this);
    this.shapeListService.shapeList.splice(index, 1);

    if (this.shapeListService.selectedShape === this) {
      this.shapeListService.selectedShape = undefined;
    }

    this.svg.remove();
    this.clearEditPoints();
  }
  //#endregion

  //#region import
  public loadFromElement(_: SVGElement) {
    // ... previous code is executed for each shape

    this.shapeListService.shapeList.push(this);
    this.addToCanvas();
    this.isShapeFinished = true;
  }
  //#endregion

  //#region export
  protected abstract parseCustomOptimizedStringAndCloseShape(): string;

  public parseOptimizedString(): string {
    if (!this.isShapeVisible()) return '';

    const { strokeWidth, stroke, fill } = this.form.controls;

    let parsedShape = `<${this.type} `;

    // if stroke-width is 1, do not add it (it is the default)
    // if the stroke is transparent, do not add it neither
    if (strokeWidth.value !== 1 && !stroke.value.endsWith('00')) {
      parsedShape += ` stroke-width="${strokeWidth.value}"`;
    }

    // if stroke-width is 0, do not add it
    // if the stroke is transparent, do not add it neither
    if (strokeWidth.value !== 0 && !stroke.value.endsWith('00')) {
      parsedShape += ` stroke="${stroke.value}"`;
    }

    // if the shape is a line, do not add it
    // if the fill is black, do not add it (it is the default)
    if (!(this.type === Shape.LINE) && !(fill.value.toLowerCase() === '#000000ff')) {
      parsedShape += ` fill="${fill.value}"`;
    }

    parsedShape += this.parseCustomOptimizedStringAndCloseShape();

    return parsedShape
      .replaceAll(/(#[0-9a-fA-F]{6})(ff|FF)/g, '$1') // remove transparency from colors value when it is ff
      .replaceAll(/\s{2,}/g, ' ') // reduce two or more spaces between the attributes or path points to one space
      .replaceAll(/(\.\d*?)0+(,| |")/g, '$1$2') // Remove 0 at the end behind the dot
      .replaceAll(/\.(,| |")/g, '$1'); // Remove the dot if necessary
  }

  protected isShapeVisible(): boolean {
    const { strokeWidth, stroke, fill } = this.form.controls;
    return !fill.value.endsWith('00') || (!stroke.value.endsWith('00') && strokeWidth.value !== 0);
  }
  //#endregion

  //#region utils
  protected get canvas(): SVGSVGElement {
    return this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  protected toFixed(n: number, def: number = 0): number {
    // when form is cleared, n can be null
    return +(n ?? def).toFixed(1);
  }

  protected getSvgAttribute(name: string, element: SVGElement = this.svg): number {
    return +element.getAttribute(name)!;
  }

  protected setSvgAttribute(name: string, value: number = 0, element: SVGElement = this.svg): void {
    element.setAttribute(name, `${value}`);
  }
  //#endregion
}
