import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { CircleModel } from '../forms/circle/circle.model';
import { Shape } from '../shape';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class CirclePainter extends ShapePainter {
  public constructor(protected readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

    this.options = new FormGroup({
      name: new FormControl('circle'),
      stroke: new FormControl('#000000'),
      strokeWidth: new FormControl(1),
      fill: new FormControl('#FFFFFF'),
      cx: new FormControl(0),
      cy: new FormControl(0),
      r: new FormControl(0),
    });
    this.setFormListener();
  }

  public loadFromElement(shape: SVGCircleElement) {
    this.shapeEl = shape;
    this.options.setValue({
      name: this.shapeEl.getAttribute('name'),
      stroke: this.shapeEl.getAttribute('stroke'),
      strokeWidth: this.getSvgAttribute('stroke-width'),
      fill: this.shapeEl.getAttribute('fill'),
      cx: this.getSvgAttribute('cx'),
      cy: this.getSvgAttribute('cy'),
      r: this.getSvgAttribute('r'),
    });
  }

  private calculateRadius(p1: Coord, p2: Coord): number {
    const c1Power2 = Math.pow(Math.abs(p1.x - p2.x), 2);
    const c2Power2 = Math.pow(Math.abs(p1.y - p2.y), 2);
    const squareRoot = Math.sqrt(c1Power2 + c2Power2);
    return +squareRoot.toFixed(1);
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ cx: coord.x, cy: coord.y, r: 0 });
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    const center: Coord = { x: this.getSvgAttribute('cx'), y: this.getSvgAttribute('cy') };
    const radius = this.calculateRadius(center, coord);
    this.options.patchValue({ r: radius });
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    if (this.svgSelectedEditPointIndex === 0) {
      // moving the center
      this.options.patchValue({ cx: coord.x, cy: coord.y });
    } else {
      // moving the radius
      const center: Coord = { x: this.getSvgAttribute('cx'), y: this.getSvgAttribute('cy') };
      const radius = this.calculateRadius(center, coord);
      this.options.patchValue({ r: radius });
    }
  }

  //#endregion mouse-events-edit

  public drawShape(model: CircleModel): void {
    this.shapeEl.setAttribute('cx', this.toFixed(model.cx));
    this.shapeEl.setAttribute('cy', this.toFixed(model.cy));
    this.shapeEl.setAttribute('r', this.toFixed(model.r));
  }

  public getShapeEditPointsCoords(): Coord[] {
    const center = {
      x: this.getSvgAttribute('cx'),
      y: this.getSvgAttribute('cy'),
    };

    const radius = {
      x: center.x + this.getSvgAttribute('r'),
      y: center.y,
    };

    return [center, radius];
  }

  public isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.CIRCLE;
  }

  //#region Parse Svg String

  protected tag = Shape.CIRCLE;

  protected parseCustomAttributesAndCloseShape(): string {
    const { cx, cy, r } = this.options.controls;

    let circleAttr = '';

    // add if they are not the default value
    if (cx.value !== 0) circleAttr += ` cx="${cx.value}"`;
    if (cy.value !== 0) circleAttr += ` cy="${cy.value}"`;

    // always present, otherwise not visible
    circleAttr += ` r="${r.value}"`;

    return `${circleAttr} />`;
  }

  protected override isShapeVisible(): boolean {
    const { r } = this.options.controls;

    let isVisible = super.isShapeVisible();
    let hasSize = r.value > 0;

    return isVisible && hasSize;
  }

  //#endregion Parse Svg String
}
