import { FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { TextModel } from '../forms/text/text.model';
import { Shape } from '../shape';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

export class TextPainter extends ShapePainter {
  public constructor(protected readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    this.options = new FormGroup({
      name: new FormControl('text'),
      stroke: new FormControl('#000000'),
      strokeAlpha: new FormControl(1),
      strokeWidth: new FormControl(0.3),
      fill: new FormControl('#FFFFFF'),
      fillAlpha: new FormControl(1),
      x: new FormControl(0),
      y: new FormControl(0),
      text: new FormControl('text'),
      fontSize: new FormControl(10),
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
    this.options.patchValue({ x: coord.x, y: coord.y });
  }

  //#endregion mouse-events

  //#region mouse-events-edit

  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    this.options.patchValue({
      x: coord.x,
      y: coord.y,
    });
  }

  //#endregion mouse-events-edit

  public drawShape(model: TextModel): void {
    this.shapeEl.setAttribute('x', this.toFixed(model.x));
    this.shapeEl.setAttribute('y', this.toFixed(model.y));
    this.shapeEl.setAttribute('font-size', `${model.fontSize}`);
    this.shapeEl.innerHTML = model.text || this.options.controls['name'].value;
  }

  public getShapeEditPointsCoords(): Coord[] {
    const position = {
      x: this.getSvgAttribute('x'),
      y: this.getSvgAttribute('y'),
    };

    return [position];
  }

  public isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.TEXT;
  }
}
