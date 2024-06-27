import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class PathPainter implements ShapePainter {
  private pathEl: SVGPathElement;
  private points: Coord[] = [];
  private isPathCompleted: boolean = false;
  private isMouseDown = false;

  public constructor(private readonly canvas: SVGElement) {
    this.pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.canvas.append(this.pathEl);

    this.pathEl.setAttribute('fill', 'none'); // TODO
    this.pathEl.setAttribute('stroke', 'black'); // TODO
  }

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;
    this.points.push(coord);

    this.pathEl.setAttribute('d', `M${this.points.map((p) => `${p.x},${p.y}`).join(' ')}`);

    // TODO set input options too
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    // allows to draw first segment with one single click and drag
    const index = this.points.length === 1 ? this.points.length : this.points.length - 1;
    this.points[index] = coord;

    this.pathEl.setAttribute('d', `M${this.points.map((p) => `${p.x},${p.y}`).join(' ')}`);

    // TODO set input options too
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;
    this.points[this.points.length - 1] = coord;

    this.pathEl.setAttribute('d', `M${this.points.map((p) => `${p.x},${p.y}`).join(' ')}`);

    // TODO set input options too
  }

  public isShapeCompleted() {
    // TODO: create variable that indicates the path has finished to start a new one
    // for example, pressing a key, finishes the path and allows to start a new one
    return this.isPathCompleted;
  }
}
