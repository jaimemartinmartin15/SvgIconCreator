import { Injectable } from '@angular/core';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Subject } from 'rxjs';
import { GroupHost } from '../shapes/group-host';
import { ShapeHost } from '../shapes/shape-host';
import { FormsService } from './forms.service';

@Injectable({
  providedIn: 'root',
})
export class ShapeListService {
  public constructor(
    private readonly elementsRefService: ElementsRefService,
    private readonly formsService: FormsService,
  ) {
    (window as any).shapelistservice= this;
  }

  public createNewGroup(): GroupHost {
    const group = new GroupHost(this.elementsRefService, this.formsService, this);
    this.groupsList.push(group);
    group.addToCanvas();
    return group;
  }

  public readonly groupsList: GroupHost[] = [];
  public selectedGroup: GroupHost;

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

  public addShapeToSelectedGroup(shapeHost: ShapeHost): void {
    this.selectedGroup.svg.append(shapeHost.svg);
    this.selectedGroup.shapes.push(shapeHost);
  }
}
