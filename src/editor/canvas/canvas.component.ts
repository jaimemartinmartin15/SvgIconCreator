import { Component } from '@angular/core';
import {
  Coord,
  CoordWithDelta,
  CoordWithDirection,
  ElementRefDirective,
  ElementsRefService,
  SvgMouseEventsDirective,
} from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { CanvasEventsService } from '../../services/canvas-events.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  imports: [ElementRefDirective, SvgMouseEventsDirective],
})
export class CanvasComponent {
  public constructor(
    private readonly canvasEventsService: CanvasEventsService,
    private readonly elementsRefService: ElementsRefService,
  ) {}

  public onMouseMove(coord: Coord) {
    this.canvasEventsService.canvasPointerMove$.next(coord);
  }

  public onMouseUp(coord: CoordWithDelta) {
    this.canvasEventsService.canvasPointerUp$.next(coord);
  }

  public onMouseDrag(coord: CoordWithDelta) {
    this.canvasEventsService.canvasPointerDrag$.next(coord);
  }

  public onMouseDown(coord: Coord) {
    this.canvasEventsService.canvasPointerDown$.next(coord);
  }

  public onWheel(coord: CoordWithDirection) {
    const svgCanvas = this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
    const { x, y, width, height } = svgCanvas.viewBox.baseVal;

    // calculate new size
    const zoomFactor = coord.direction === 'up' ? 0.8 : 1.2;
    const newWidth = width * zoomFactor;
    const newHeight = height * zoomFactor;

    // calculate the distance of the wheel event to adjust the position
    const dx = (coord.x - x) / width;
    const dy = (coord.y - y) / height;

    // adjust the origin to maintain the view in the wheel event position
    const newX = coord.x - dx * newWidth;
    const newY = coord.y - dy * newHeight;

    svgCanvas.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
  }
}
