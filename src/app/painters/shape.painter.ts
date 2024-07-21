import { FormGroup } from '@angular/forms';
import { addAlphaToColor } from '../color.utils';
import { Coord } from '../coord';
import { ShapePainterMapping } from './shape-painter-mapping';

export abstract class ShapePainter {
  protected abstract canvas: SVGSVGElement;
  protected shapeEl: SVGElement;

  // mouse events when creating the element
  public abstract onMouseDown(coord: Coord): void;
  public abstract onMouseMove(coord: Coord): void;
  public onMouseUp(coord: Coord): void {
    this.onMouseMove(coord);
    this.isMouseDown = false;
    this._isShapeCompleted = true;
  }

  // mouse events when editing the element
  public onMouseDownEdit(coord: Coord): void {
    const editPointsCoords = this.getShapeEditPointsCoords();
    this.svgSelectedEditPointIndex = editPointsCoords.findIndex(
      (p) => Math.abs(p.x - coord.x) < this.pointControlWidth() && Math.abs(p.y - coord.y) < this.pointControlWidth()
    );
  }
  public abstract onMouseMoveEdit(coord: Coord): void;
  public onMouseUpEdit(coord: Coord): void {
    this.onMouseMoveEdit(coord);
    this.svgSelectedEditPointIndex = -1;
  }

  // shape state
  protected _isShapeStarted = false;
  protected _isShapeCompleted = false;
  protected _isShapeSelected = false;
  public isShapeStarted(): boolean {
    return this._isShapeStarted;
  }
  public setShapeStarted(): void {
    this._isShapeStarted = true;
  }
  public isShapeCompleted(): boolean {
    return this._isShapeCompleted;
  }
  public setShapeCompleted(): void {
    this._isShapeCompleted = true;
  }
  public isShapeSelected(): boolean {
    return this._isShapeSelected;
  }
  public setShapeSelected(selected: boolean): void {
    this._isShapeSelected = selected;
    if (selected) {
      const editPointsCoords = this.getShapeEditPointsCoords();
      editPointsCoords.forEach((epc) => {
        const editPointEl = this.createPointControl(epc);
        this.svgEditPoints.push(editPointEl);
        this.canvas.append(editPointEl);
      });
    } else {
      this.svgEditPoints.forEach((e) => e.remove());
      this.svgEditPoints.length = 0;
    }
  }

  // drawing and editing the shape
  public abstract drawShape(model: any): void;
  public abstract getShapeEditPointsCoords(): Coord[];

  public options: FormGroup;
  public setFormListener() {
    this.options.valueChanges.subscribe((v) => {
      // commom options
      this.shapeEl.setAttribute('stroke-width', v.strokeWidth);
      this.shapeEl.setAttribute('stroke', addAlphaToColor(v.stroke, v.strokeAlpha));
      this.shapeEl.setAttribute('fill', addAlphaToColor(v.fill, v.fillAlpha));

      // shape options
      this.drawShape(v);

      // edit points
      if (this.isShapeSelected()) {
        const editPointsCoords = this.getShapeEditPointsCoords();
        this.svgEditPoints.forEach((pEl, i) => {
          pEl.setAttribute('cx', `${editPointsCoords[i].x}`);
          pEl.setAttribute('cy', `${editPointsCoords[i].y}`);
        });
      }
    });
  }

  protected toFixed(n: number, def: number = 0) {
    // when form is cleared, n can be null
    return (n ?? def).toFixed(1);
  }

  protected isMouseDown = false;

  protected svgEditPoints: SVGCircleElement[] = [];
  protected svgSelectedEditPointIndex: number = -1;

  public abstract isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]>;

  public addToCanvas() {
    this.canvas.append(this.shapeEl);
    this._isShapeStarted = true;
    // wait all shapes to be added to the canvas, and then paint the edit points on top of all shapes
    setTimeout(() => this.svgEditPoints.forEach((ep) => this.canvas.append(ep)), 0);
  }

  public removeFromCanvas() {
    this.shapeEl.remove();
    this.svgEditPoints.forEach((ep) => ep.remove());
  }

  protected getSvgAttribute(name: string, element: SVGElement = this.shapeEl): number {
    return +element.getAttribute(name)!;
  }

  protected createPointControl(coord: Coord): SVGCircleElement {
    const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c1.setAttribute('cx', `${coord.x}`);
    c1.setAttribute('cy', `${coord.y}`);
    c1.setAttribute('r', this.pointControlWidth().toFixed(1));
    c1.setAttribute('stroke', 'blue');
    c1.setAttribute('stroke-width', (this.pointControlWidth() / 2).toFixed(1));
    c1.setAttribute('fill', 'white');
    return c1;
  }

  protected pointControlWidth(): number {
    return this.canvas.viewBox.baseVal.width * 0.01;
  }
}
