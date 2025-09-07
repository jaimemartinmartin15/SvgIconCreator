import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ShapeHost } from '../shapes/shape-host';

@Injectable({
  providedIn: 'root'
})
export class ShapeListService {
  public readonly shapeList: ShapeHost[] = [];

  public readonly selectedShape$ = new Subject<ShapeHost | undefined>();

  private _selectedShape?: ShapeHost;
  public get selectedShape(): ShapeHost | undefined {
    return this._selectedShape;
  }
  public set selectedShape(shape: ShapeHost | undefined) {
    this._selectedShape = shape;
    this.selectedShape$.next(this._selectedShape);
  }
}
