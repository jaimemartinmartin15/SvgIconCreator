import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { RectModel } from '../forms/rect/rect.model';
import { Shape } from '../shape';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class RectPainter extends ShapePainter {
  public constructor(protected readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    this.options = new FormGroup({
      name: new FormControl('rect'),
      stroke: new FormControl('#000000'),
      strokeAlpha: new FormControl(1),
      strokeWidth: new FormControl(1),
      fill: new FormControl('#FFFFFF'),
      fillAlpha: new FormControl(0),
      x: new FormControl(0),
      y: new FormControl(0),
      width: new FormControl(0),
      height: new FormControl(0),
      rx: new FormControl(0),
      ry: new FormControl(0),
    });
    this.setFormListener();
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ x: coord.x, y: coord.y });
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    const x = this.getSvgAttribute('x');
    const y = this.getSvgAttribute('y');
    const width = +this.toFixed(Math.abs(x - coord.x));
    const height = +this.toFixed(Math.abs(y - coord.y));

    this.options.patchValue({
      x: Math.min(x, coord.x),
      y: Math.min(y, coord.y),
      width,
      height,
    });
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cx', `${coord.x}`);
    this.svgEditPoints[this.svgSelectedEditPointIndex].setAttribute('cy', `${coord.y}`);

    this.options.patchValue({
      x: Math.min(this.getSvgAttribute('cx', this.svgEditPoints[0]), this.getSvgAttribute('cx', this.svgEditPoints[1])),
      y: Math.min(this.getSvgAttribute('cy', this.svgEditPoints[0]), this.getSvgAttribute('cy', this.svgEditPoints[1])),
      width: +this.toFixed(Math.abs(this.getSvgAttribute('cx', this.svgEditPoints[0]) - this.getSvgAttribute('cx', this.svgEditPoints[1]))),
      height: +this.toFixed(Math.abs(this.getSvgAttribute('cy', this.svgEditPoints[0]) - this.getSvgAttribute('cy', this.svgEditPoints[1]))),
    });
  }

  //#endregion mouse-events-edit

  public drawShape(model: RectModel): void {
    this.shapeEl.setAttribute('x', this.toFixed(model.x));
    this.shapeEl.setAttribute('x', this.toFixed(model.x));
    this.shapeEl.setAttribute('y', this.toFixed(model.y));
    this.shapeEl.setAttribute('width', this.toFixed(model.width));
    this.shapeEl.setAttribute('height', this.toFixed(model.height));
    this.shapeEl.setAttribute('rx', this.toFixed(model.rx));
    this.shapeEl.setAttribute('ry', this.toFixed(model.ry));
  }

  public getShapeEditPointsCoords(): Coord[] {
    const topLeftCorner = {
      x: this.getSvgAttribute('x'),
      y: this.getSvgAttribute('y'),
    };

    const bottomRightCorner = {
      x: topLeftCorner.x + this.getSvgAttribute('width'),
      y: topLeftCorner.y + this.getSvgAttribute('height'),
    };

    return [topLeftCorner, bottomRightCorner];
  }

  public isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.RECT;
  }

  protected getSvgString(): string {
    const { strokeWidth, stroke, fill, x, y, width, height, rx, ry } = this.options.controls;

    const strokeWidthAttr = `stroke-width="${strokeWidth.value}"`;
    const strokeAttr = `stroke="${stroke.value}"`;
    const fillAttr = `fill="${fill.value}"`;
    const xAttr = `x="${x.value}"`;
    const yAttr = `y="${y.value}"`;
    const widthAttr = `width="${width.value}"`;
    const heightAttr = `height="${height.value}"`;
    const rxAttr = `rx="${rx.value}"`;
    const ryAttr = `ry="${ry.value}"`;

    return `<rect ${strokeWidthAttr} ${strokeAttr} ${fillAttr} ${xAttr} ${yAttr} ${widthAttr} ${heightAttr} ${rxAttr} ${ryAttr} />`;
  }
}
