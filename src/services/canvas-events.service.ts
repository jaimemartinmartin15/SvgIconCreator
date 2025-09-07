import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Coord } from '../models/coord';
import { CoordWithDelta } from '../models/coord-with-delta';

@Injectable({
  providedIn: 'root'
})
export class CanvasEventsService {
  public canvasPointerDown$: Subject<Coord> = new Subject<Coord>();
  public canvasPointerDrag$: Subject<CoordWithDelta> = new Subject<CoordWithDelta>();
  public canvasPointerUp$: Subject<CoordWithDelta> = new Subject<CoordWithDelta>();
  public canvasPointerMove$: Subject<Coord> = new Subject<Coord>();
}
