import { Coord, CoordWithDelta, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Command, isPathInstruction } from '../models/path.model';
import { Shape } from '../models/shape';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';

export const EDIT_POINT_COLORS = {
  FILL_NORMAL: '#FFF5',
  STROKE_NORMAL: '#00f5',
  STROKE_HOVER: '#ffa50055',
  STROKE_HOVER_FORM: '#0f0',
  STROKE_DRAGGING: '#f005',
} as const;

export abstract class ShapeHost {
  public constructor(
    protected readonly elementsRefService: ElementsRefService,
    protected readonly formsService: FormsService,
    protected readonly shapeListService: ShapeListService,
  ) {}

  public abstract readonly tag: Shape;
  public abstract svg: SVGElement;
  /** Just an index to set different names to shapes when they are created */
  protected static shapeCounter: number = 1;

  public isShapeFinished: boolean = false;

  //#region mouse
  public abstract mouseDown(coord: Coord): void;
  public abstract mouseDrag(coord: CoordWithDelta): void;
  public abstract mouseUp(coord: CoordWithDelta): void;
  //#endregion

  //#region mouse move
  public mouseMove(coord: Coord): void {
    this.selectedEditPointIndex = this.getEditPointIndexUnderCoord(coord);
    this.highlightSelectedEditPoint(EDIT_POINT_COLORS.STROKE_HOVER);
  }
  //#endregion

  //#region mouse edit
  public mouseDownEdit(_: Coord): void {
    this.highlightSelectedEditPoint(EDIT_POINT_COLORS.STROKE_DRAGGING);
  }
  public abstract mouseDragEdit(coord: CoordWithDelta): void;
  public mouseUpEdit(coord: CoordWithDelta): void {
    this.mouseDragEdit(coord);
  }
  //#endregion

  //#region edit points
  public svgEditPoints: SVGCircleElement[] = [];
  protected selectedEditPointIndex: number = -1;

  protected abstract getEditPointCoords(): Coord[];
  public abstract updatePositionSvgEditPoints(): void;

  public createEditPoints(): void {
    const editPointsCoords = this.getEditPointCoords();
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
    c.setAttribute('stroke', EDIT_POINT_COLORS.STROKE_NORMAL);
    c.setAttribute('stroke-width', (this.getEditPointWidth() / 2).toFixed(1));
    c.setAttribute('fill', EDIT_POINT_COLORS.FILL_NORMAL);
    return c;
  }

  protected getEditPointIndexUnderCoord(coord: Coord): number {
    return this.getEditPointCoords().findIndex((c) => Math.abs(c.x - coord.x) < this.getEditPointWidth() && Math.abs(c.y - coord.y) < this.getEditPointWidth());
  }

  public getEditPointUnderMousePoint(mousePoint: Coord): SVGCircleElement | undefined {
    return this.svgEditPoints[this.getEditPointIndexUnderCoord(mousePoint)];
  }

  protected highlightSelectedEditPoint(color: (typeof EDIT_POINT_COLORS)[keyof typeof EDIT_POINT_COLORS]): void {
    // reset color of all points and highlight only the one under the mouse (if it exists)
    this.svgEditPoints.forEach((p) => p.setAttribute('stroke', EDIT_POINT_COLORS.STROKE_NORMAL));
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

  //#region move shape
  public moveShape(event: KeyboardEvent): void {
    let amountToMove = 1;
    if (event.shiftKey) amountToMove = 10;
    else if (event.altKey) amountToMove = 0.1;

    switch (event.key.toUpperCase()) {
      case 'ARROWUP':
        this.moveShapeUp(amountToMove);
        break;
      case 'ARROWRIGHT':
        this.moveShapeRight(amountToMove);
        break;
      case 'ARROWDOWN':
        this.moveShapeDown(amountToMove);
        break;
      case 'ARROWLEFT':
        this.moveShapeLeft(amountToMove);
        break;
    }
  }

  public abstract moveShapeUp(amount: number): void;
  public abstract moveShapeRight(amount: number): void;
  public abstract moveShapeDown(amount: number): void;
  public abstract moveShapeLeft(amount: number): void;
  //#endregion

  //#region import
  public loadFromElement(svg: SVGElement) {
    this.svg = svg;
    this.shapeListService.shapeList.push(this);
    this.addToCanvas();
    this.isShapeFinished = true;
  }
  //#endregion

  //#region export
  public abstract parseShapeToString(): string;
  //#endregion

  //#region utils
  protected get canvas(): SVGSVGElement {
    return this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  protected toFixed(n: number, def: number = 0): number {
    // when form is cleared, n can be null
    return +(n ?? def).toFixed(1);
  }

  protected getSvgAttributeAsNumber(name: string, element: SVGElement = this.svg): number {
    return +element.getAttribute(name)!;
  }

  protected getSvgAttributeAsString(name: string, element: SVGElement = this.svg): string {
    return element.getAttribute(name)!;
  }

  protected setSvgAttribute(name: string, value: number | string = 0, element: SVGElement = this.svg): void {
    element.setAttribute(name, `${value}`);
  }
  //#endregion

  //#region svg form binding
  public abstract onEditingExistingShape(): void;
  public abstract onCreatingNewShape(): void;
  //#endregion

  //#region animation
  public onBindingChanged(bindings: Partial<{ attribute: string; binding: string }>[]): void {
    // delete all existing data-*-binding attributes
    [...this.svg.attributes].filter((a) => a.name.startsWith('data-') && a.name.endsWith('-binding')).forEach((attr) => this.svg.removeAttribute(attr.name));

    // add new data-*-binding attributes
    bindings.filter((b) => b.attribute?.trim() && b.binding?.trim()).forEach((binding) => (this.svg.dataset[`${binding.attribute}Binding`] = binding.binding));
  }

  public getBindingProperties(): { attribute: string; binding: string }[] {
    return [...this.svg.attributes]
      .filter((a) => a.name.startsWith('data-') && a.name.endsWith('-binding'))
      .map((a) => ({ attribute: a.name.replace('data-', '').replace('-binding', ''), binding: a.value }));
  }
  //#endregion

  //#region attributes
  public get name(): string {
    return this.getSvgAttributeAsString('name');
  }

  public set name(value: string) {
    this.setSvgAttribute('name', value);
  }

  public get stroke(): string {
    return this.getSvgAttributeAsString('stroke');
  }

  public set stroke(value: string) {
    this.setSvgAttribute('stroke', value);
  }

  public get fill(): string {
    return this.getSvgAttributeAsString('fill');
  }

  public set fill(value: string) {
    this.setSvgAttribute('fill', value);
  }

  public get strokeWidth(): number {
    return this.getSvgAttributeAsNumber('stroke-width');
  }

  public set strokeWidth(value: number) {
    this.setSvgAttribute('stroke-width', value);
  }

  public get strokeLinecap(): string {
    return this.getSvgAttributeAsString('stroke-linecap') ?? 'butt';
  }

  public set strokeLinecap(value: string) {
    this.setSvgAttribute('stroke-linecap', value);
  }

  public get strokeLinejoin(): string {
    return this.getSvgAttributeAsString('stroke-linejoin') ?? 'miter';
  }

  public set strokeLinejoin(value: string) {
    this.setSvgAttribute('stroke-linejoin', value);
  }

  public get strokeDasharray(): number[] {
    const strokeDasharrayValue = this.getSvgAttributeAsString('stroke-dasharray');
    if (!strokeDasharrayValue || strokeDasharrayValue === 'none') return [];
    return strokeDasharrayValue.split(' ').map((v) => parseFloat(v));
  }

  public set strokeDasharray(value: number[]) {
    if (value.length === 0) {
      this.setSvgAttribute('stroke-dasharray', 'none');
    } else {
      this.setSvgAttribute('stroke-dasharray', value.join(' '));
    }
  }

  public get x(): number {
    return this.getSvgAttributeAsNumber('x');
  }

  public set x(value: number) {
    this.setSvgAttribute('x', value);
  }

  public get y(): number {
    return this.getSvgAttributeAsNumber('y');
  }

  public set y(value: number) {
    this.setSvgAttribute('y', value);
  }

  public get width(): number {
    return this.getSvgAttributeAsNumber('width');
  }

  public set width(value: number) {
    this.setSvgAttribute('width', value);
  }

  public get height(): number {
    return this.getSvgAttributeAsNumber('height');
  }

  public set height(value: number) {
    this.setSvgAttribute('height', value);
  }

  public get rx(): number {
    return this.getSvgAttributeAsNumber('rx');
  }

  public set rx(value: number) {
    this.setSvgAttribute('rx', value);
  }

  public get ry(): number {
    return this.getSvgAttributeAsNumber('ry');
  }

  public set ry(value: number) {
    this.setSvgAttribute('ry', value);
  }

  public get x1(): number {
    return this.getSvgAttributeAsNumber('x1');
  }

  public set x1(value: number) {
    this.setSvgAttribute('x1', value);
  }

  public get y1(): number {
    return this.getSvgAttributeAsNumber('y1');
  }

  public set y1(value: number) {
    this.setSvgAttribute('y1', value);
  }

  public get x2(): number {
    return this.getSvgAttributeAsNumber('x2');
  }

  public set x2(value: number) {
    this.setSvgAttribute('x2', value);
  }

  public get y2(): number {
    return this.getSvgAttributeAsNumber('y2');
  }

  public set y2(value: number) {
    this.setSvgAttribute('y2', value);
  }

  public get d(): Command[] {
    const commands: Command[] = [];
    const d = this.getSvgAttributeAsString('d');

    for (let i = 0; i < d.length; i++) {
      const c = d.charAt(i);
      if (isPathInstruction(c)) {
        // find the start and the end indexes of the command
        const init = i;
        let end = i + 1;
        while (!isPathInstruction(d.charAt(end)) && end < d.length) {
          end++;
        }
        i = end - 1;

        commands.push({
          instruction: c,
          parameters: d
            .substring(init + 1, end)
            .split(/ |,/) // split numbers
            .filter((c) => c !== '')
            .map((v) => +v),
        });
      }
    }

    return commands;
  }

  public set d(value: Command[]) {
    const d = value.map((c) => `${c.instruction}${c.parameters.join(' ')}`).join('');
    this.setSvgAttribute('d', d);
  }

  public get cx(): number {
    return this.getSvgAttributeAsNumber('cx');
  }

  public set cx(value: number) {
    this.setSvgAttribute('cx', value);
  }

  public get cy(): number {
    return this.getSvgAttributeAsNumber('cy');
  }

  public set cy(value: number) {
    this.setSvgAttribute('cy', value);
  }

  public get r(): number {
    return this.getSvgAttributeAsNumber('r');
  }

  public set r(value: number) {
    this.setSvgAttribute('r', value);
  }

  public get text(): string {
    return this.svg.innerHTML;
  }

  public set text(value: string) {
    this.svg.innerHTML = value;
  }

  public get fontSize(): number {
    return this.getSvgAttributeAsNumber('font-size');
  }

  public set fontSize(value: number) {
    this.setSvgAttribute('font-size', value);
  }

  public get fontFamily(): string {
    return this.getSvgAttributeAsString('font-family');
  }

  public set fontFamily(value: string) {
    this.setSvgAttribute('font-family', value);
  }
  //#endregion
}
