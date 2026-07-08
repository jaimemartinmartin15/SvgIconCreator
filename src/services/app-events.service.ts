import { CoordWithDirection } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Subject } from 'rxjs';

export class AppEventsService {
  public static readonly mouseOverSvgEditPoint$: Subject<number> = new Subject<number>();
  public static readonly zoomUpdated$: Subject<CoordWithDirection | void> = new Subject<CoordWithDirection | void>();
}
