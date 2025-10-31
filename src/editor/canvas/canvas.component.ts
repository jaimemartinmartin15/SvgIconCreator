import { Component, HostListener } from '@angular/core';
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
  //#region utils
  private get canvasEl(): SVGSVGElement {
    return this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  private keysDown = new Set<string>();
  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent) {
    this.keysDown.add(event.key);
  }
  @HostListener('window:keyup', ['$event'])
  protected onKeyUp(event: KeyboardEvent) {
    this.keysDown.delete(event.key);
  }
  private get shiftKey() {
    return this.keysDown.has('Shift');
  }

  private isDraggingCanvas = false;
  //#endregion

  public constructor(
    private readonly canvasEventsService: CanvasEventsService,
    private readonly elementsRefService: ElementsRefService,
  ) {}

  //#region events
  public onMouseDown(coord: Coord) {
    if (this.shiftKey) {
      this.isDraggingCanvas = true;
      return;
    }

    this.canvasEventsService.canvasPointerDown$.next(coord);
  }

  public onMouseDrag(coord: CoordWithDelta) {
    if (this.isDraggingCanvas) {
      // update the position of the svg
      const actualViewbox = this.canvasEl.viewBox.baseVal;
      const newX = actualViewbox.x - coord.dx;
      const newY = actualViewbox.y - coord.dy;
      this.canvasEl.setAttribute('viewBox', `${newX} ${newY} ${actualViewbox.width} ${actualViewbox.height}`);
      return;
    }

    this.canvasEventsService.canvasPointerDrag$.next(coord);
  }

  public onMouseUp(coord: CoordWithDelta) {
    if (this.isDraggingCanvas) {
      this.isDraggingCanvas = false;
      return;
    }
    this.canvasEventsService.canvasPointerUp$.next(coord);
  }

  public onMouseMove(coord: Coord) {
    this.canvasEventsService.canvasPointerMove$.next(coord);
  }

  public onWheel(coord: CoordWithDirection) {
    // this method handles zoom in and zoom out, just rolling the wheel

    const { x, y, width, height } = this.canvasEl.viewBox.baseVal;

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

    this.canvasEl.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
  }
  //#endregion
}
