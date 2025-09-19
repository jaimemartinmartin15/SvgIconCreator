import { Injectable } from '@angular/core';
import { Coord, CoordWithDelta } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CanvasEventsService {
  public canvasPointerDown$: Subject<Coord> = new Subject<Coord>();
  public canvasPointerDrag$: Subject<CoordWithDelta> = new Subject<CoordWithDelta>();
  public canvasPointerUp$: Subject<CoordWithDelta> = new Subject<CoordWithDelta>();
  public canvasPointerMove$: Subject<Coord> = new Subject<Coord>();
}
