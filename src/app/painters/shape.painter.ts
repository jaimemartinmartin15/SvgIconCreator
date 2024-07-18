import { FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { ShapePainterMapping } from './shape-painter-mapping';

export abstract class ShapePainter {
  protected abstract shapeEl: SVGElement;
  protected abstract canvas: SVGSVGElement;

  protected isMouseDown = false;

  protected svgEditPoints: SVGCircleElement[] = [];
  protected svgSelectedEditPointIndex: number = -1;

  public options: FormGroup;

  public abstract onMouseDown(coord: Coord): void;
  public abstract onMouseMove(coord: Coord): void;
  public abstract onMouseUp(coord: Coord): void;

  public abstract onMouseDownEdit(coord: Coord): void;
  public abstract onMouseMoveEdit(coord: Coord): void;
  public abstract onMouseUpEdit(coord: Coord): void;

  public abstract isShapeStarted(): boolean;
  public abstract isShapeCompleted(): boolean;
  public abstract isShapeSelected(): boolean;
  public abstract setShapeSelected(selected: boolean): void;

  // public abstract isShapeType<T extends Shape>(shape: T): this is T extends Shape.RECT ? RectPainter : T extends Shape.CIRCLE ? CirclePainter : never;
  public abstract isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]>;

  public addToCanvas() {
    // TODO
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
