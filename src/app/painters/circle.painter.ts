import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class CirclePainter implements ShapePainter {
  private circleEl: SVGCircleElement;
  private startCoord?: Coord;
  private endCoord?: Coord;

  public constructor(private readonly canvas: SVGElement) {
    this.circleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.canvas.append(this.circleEl);
  }

  private calculateRadius(): string {
    if (this.startCoord === undefined || this.endCoord === undefined) {
      return '0';
    }

    const c1Power2 = Math.pow(Math.abs(this.startCoord.x - this.endCoord.x), 2);
    const c2Power2 = Math.pow(Math.abs(this.startCoord.y - this.endCoord.y), 2);
    const squareRoot = Math.sqrt(c1Power2 + c2Power2);
    return squareRoot.toFixed(1);
  }

  public onMouseDown(coord: Coord) {
    this.startCoord = coord;

    this.circleEl.setAttribute('cx', `${coord.x}`);
    this.circleEl.setAttribute('cy', `${coord.y}`);

    // TODO set input options too
  }

  public onMouseMove(coord: Coord) {
    this.endCoord = coord;

    this.circleEl.setAttribute('r', this.calculateRadius());

    // TODO set input options too
  }

  public onMouseUp(coord: Coord) {
    this.endCoord = coord;

    this.circleEl.setAttribute('r', this.calculateRadius());

    // TODO set input options too
  }
}
