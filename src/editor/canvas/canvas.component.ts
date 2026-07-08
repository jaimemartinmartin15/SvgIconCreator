import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import {
  Coord,
  CoordWithDelta,
  CoordWithDirection,
  ElementRefDirective,
  ElementsRefService,
  SvgMouseEventsDirective,
} from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ViewBoxModel } from '../../models/view-box.model';
import { AppEventsService } from '../../services/app-events.service';
import { CanvasEventsService } from '../../services/canvas-events.service';
import { FormsService } from '../../services/forms.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
    private readonly formsService: FormsService,
  ) {}

  //#region zoom utils
  private updateZoomViewBox(coord: CoordWithDirection) {
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

  public currentViewBox: ViewBoxModel;

  public get isZoomModified() {
    const viewBox = this.formsService.canvasOptionsViewBoxForm.value;
    this.currentViewBox = this.canvasEl?.viewBox.baseVal;

    // wait the view is initiated
    if (!this.currentViewBox) return false;

    const isModified = !(
      viewBox.x === this.currentViewBox.x &&
      viewBox.y === this.currentViewBox.y &&
      viewBox.width === this.currentViewBox.width &&
      viewBox.height === this.currentViewBox.height
    );

    // update the values to make them nice to see in the screen
    this.currentViewBox = {
      x: +this.currentViewBox.x.toFixed(1),
      y: +this.currentViewBox.y.toFixed(1),
      width: +this.currentViewBox.width.toFixed(1),
      height: +this.currentViewBox.height.toFixed(1),
    };

    return isModified;
  }

  public resetViewBox() {
    const { x, y, width, height } = this.formsService.canvasOptionsViewBoxForm.value;
    this.canvasEl.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    AppEventsService.zoomUpdated$.next();
  }
  //#endregion

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
    this.updateZoomViewBox(coord);
    AppEventsService.zoomUpdated$.next(coord);
  }
  //#endregion
}
