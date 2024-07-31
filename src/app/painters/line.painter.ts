import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { LineModel } from '../forms/line/line.model';
import { Shape } from '../shape';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class LinePainter extends ShapePainter {
  public constructor(protected readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    this.options = new FormGroup({
      name: new FormControl('line'),
      stroke: new FormControl('#000000'),
      strokeAlpha: new FormControl(1),
      strokeWidth: new FormControl(1),
      fill: new FormControl('#FFFFFF'),
      fillAlpha: new FormControl(0),
      x1: new FormControl(0),
      y1: new FormControl(0),
      x2: new FormControl(0),
      y2: new FormControl(0),
    });
    this.setFormListener();
  }

  //#region mouse-events

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.options.patchValue({ x1: coord.x, y1: coord.y, x2: coord.x, y2: coord.y });
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    this.options.patchValue({ x2: coord.x, y2: coord.y });
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    const pointNames = [
      ['x1', 'y1'],
      ['x2', 'y2'],
    ];
    this.options.patchValue({
      [pointNames[this.svgSelectedEditPointIndex][0]]: coord.x,
      [pointNames[this.svgSelectedEditPointIndex][1]]: coord.y,
    });
  }

  //#endregion mouse-events-edit

  public drawShape(model: LineModel): void {
    this.shapeEl.setAttribute('x1', this.toFixed(model.x1));
    this.shapeEl.setAttribute('y1', this.toFixed(model.y1));
    this.shapeEl.setAttribute('x2', this.toFixed(model.x2));
    this.shapeEl.setAttribute('y2', this.toFixed(model.y2));
  }

  public getShapeEditPointsCoords(): Coord[] {
    const startPoint = {
      x: this.getSvgAttribute('x1'),
      y: this.getSvgAttribute('y1'),
    };

    const endPoint = {
      x: this.getSvgAttribute('x2'),
      y: this.getSvgAttribute('y2'),
    };

    return [startPoint, endPoint];
  }

  public isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.LINE;
  }

  protected getSvgString(): string {
    const { strokeWidth, stroke, fill, x1, y1, x2, y2 } = this.options.controls;

    const strokeWidthAttr = `stroke-width="${strokeWidth.value}"`;
    const strokeAttr = `stroke="${stroke.value}"`;
    const fillAttr = `fill="${fill.value}"`;
    const x1Attr = `x1="${x1.value}"`;
    const y1Attr = `y1="${y1.value}"`;
    const x2Attr = `x2="${x2.value}"`;
    const y2Attr = `y2="${y2.value}"`;

    return `<line ${strokeWidthAttr} ${strokeAttr} ${fillAttr} ${x1Attr} ${y1Attr} ${x2Attr} ${y2Attr} />`;
  }
}
