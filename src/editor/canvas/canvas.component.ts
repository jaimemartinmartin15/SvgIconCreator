import { Component } from '@angular/core';
import { Coord, CoordWithDelta, ElementRefDirective, SvgMouseEventsDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { CanvasEventsService } from '../../services/canvas-events.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  imports: [ElementRefDirective, SvgMouseEventsDirective]
})
export class CanvasComponent {
  public constructor(
    private readonly canvasEventsService: CanvasEventsService,
  ) { }

  public onMouseMove(coord: Coord) {
    this.canvasEventsService.canvasPointerMove$.next(coord)
  }

  public onMouseUp(coord: CoordWithDelta) {
    this.canvasEventsService.canvasPointerUp$.next(coord)
  }

  public onMouseDrag(coord: CoordWithDelta) {
    this.canvasEventsService.canvasPointerDrag$.next(coord)
  }

  public onMouseDown(coord: Coord) {
    this.canvasEventsService.canvasPointerDown$.next(coord)
  }
}
