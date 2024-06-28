import { Coord } from '../coord';
import { ShapePainter } from './shape.painter';

export class CubicBezierPainter implements ShapePainter {
  private cubicBezier: SVGPathElement;
  private points: Coord[] = [];
  private state: number = 0; // 0 -> no points added, 1 -> start point added, 2 -> end point added, 3 -> control point 1 added, 4 -> control point 2 added
  private isMouseDown = false;

  public constructor(private readonly canvas: SVGElement) {
    this.cubicBezier = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.canvas.append(this.cubicBezier);

    this.cubicBezier.setAttribute('fill', 'none'); // TODO
    this.cubicBezier.setAttribute('stroke', 'black'); // TODO
  }

  private calculatePath() {
    const p1 = this.points[0]; // start point
    const p2 = this.points[1] ?? p1; // point control 1
    const p3 = this.points[2] ?? p1; // point control 2
    const p4 = this.points[3] ?? p1; // end point
    return `M${p1.x},${p1.y}C${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;
  }

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;

    if (this.state === 0) {
      this.points[0] = coord;
      this.state = 1;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    if (this.state === 2) {
      this.points[1] = coord;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    if (this.state === 3) {
      this.points[2] = coord;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    // TODO set input options too
  }

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) {
      return;
    }

    if (this.state === 1) {
      this.points[1] = this.points[2] = this.points[3] = coord;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    if (this.state === 2) {
      this.points[1] = coord;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    if (this.state === 3) {
      this.points[2] = coord;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    // TODO set input options too
  }

  public onMouseUp(coord: Coord) {
    this.isMouseDown = false;

    if (this.state === 3) {
      this.points[2] = coord;
      this.state = 4;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    if (this.state === 2) {
      this.points[1] = coord;
      this.state = 3;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    if (this.state === 1) {
      this.points[1] = this.points[2] = this.points[3] = coord;
      this.state = 2;
      this.cubicBezier.setAttribute('d', this.calculatePath());
    }

    // TODO set input options too
  }

  public isShapeCompleted() {
    // TODO: create variable that indicates the path has finished to start a new one
    // for example, pressing a key, finishes the path and allows to start a new one
    return this.state >= 4;
  }
}
