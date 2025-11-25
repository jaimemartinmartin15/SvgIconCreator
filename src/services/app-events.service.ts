import { Subject } from 'rxjs';

export class AppEventsService {
  public static readonly mouseOverSvgEditPoint$: Subject<number> = new Subject<number>();
}
