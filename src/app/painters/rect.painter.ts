import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class RectPainter implements ShapePainter {
  private rectEl: SVGRectElement;
  private startCoord?: Coord;
  private endCoord?: Coord;

  public constructor(private readonly canvas: SVGElement) {
    this.rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.canvas.append(this.rectEl);
  }

  public onMouseDown(coord: Coord) {
    this.startCoord = coord;

    this.rectEl.setAttribute('x', `${coord.x}`);
    this.rectEl.setAttribute('y', `${coord.y}`);
    this.rectEl.setAttribute('width', '0');
    this.rectEl.setAttribute('height', '0');

    // TODO set input options too
  }

  public onMouseMove(coord: Coord) {
    this.endCoord = coord;

    const width = Math.abs(this.startCoord!.x - coord.x);
    const height = Math.abs(this.startCoord!.y - coord.y);
    this.rectEl.setAttribute('width', width.toFixed(1));
    this.rectEl.setAttribute('height', height.toFixed(1));

    this.rectEl.setAttribute('x', `${Math.min(coord.x, this.startCoord!.x)}`);
    this.rectEl.setAttribute('y', `${Math.min(coord.y, this.startCoord!.y)}`);

    // TODO set input options too
  }

  public onMouseUp(coord: Coord) {
    this.endCoord = coord;

    const width = Math.abs(this.startCoord!.x - coord.x);
    const height = Math.abs(this.startCoord!.y - coord.y);
    this.rectEl.setAttribute('width', width.toFixed(1));
    this.rectEl.setAttribute('height', height.toFixed(1));

    this.rectEl.setAttribute('x', `${Math.min(coord.x, this.startCoord!.x)}`);
    this.rectEl.setAttribute('y', `${Math.min(coord.y, this.startCoord!.y)}`);

    // TODO set input options too
  }

  public isShapeCompleted() {
    return true;
  }
}
