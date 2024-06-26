import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class LinePainter implements ShapePainter {
  private lineEl: SVGLineElement;
  private startCoord?: Coord;
  private endCoord?: Coord;

  public constructor(private readonly canvas: SVGElement) {
    this.lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.canvas.append(this.lineEl);
  }

  public onMouseDown(coord: Coord) {
    this.startCoord = coord;

    this.lineEl.setAttribute('x1', `${coord.x}`);
    this.lineEl.setAttribute('y1', `${coord.y}`);
    this.lineEl.setAttribute('x2', `${coord.x}`);
    this.lineEl.setAttribute('y2', `${coord.y}`);

    this.lineEl.setAttribute('stroke', 'rebeccapurple'); // TODO

    // TODO set input options too
  }

  public onMouseMove(coord: Coord) {
    this.endCoord = coord;

    this.lineEl.setAttribute('x2', `${coord.x}`);
    this.lineEl.setAttribute('y2', `${coord.y}`);

    // TODO set input options too
  }

  public onMouseUp(coord: Coord) {
    this.endCoord = coord;

    this.lineEl.setAttribute('x2', `${coord.x}`);
    this.lineEl.setAttribute('y2', `${coord.y}`);

    // TODO set input options too
  }
}
