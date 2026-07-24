import { Injectable } from '@angular/core';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Subject } from 'rxjs';
import { GroupHost } from '../shapes/group-host';
import { ShapeHost } from '../shapes/shape-host';

@Injectable({
  providedIn: 'root',
})
export class ShapeListService {
  public constructor(private readonly elementsRefService: ElementsRefService) {}

  private get canvas(): SVGSVGElement {
    return this.elementsRefService.getNativeElement('canvas');
  }

  public readonly shapeList: ShapeHost[] = [];

  public selectedGroup?: GroupHost;

  public readonly selectedShape$ = new Subject<ShapeHost | undefined>();

  private _selectedShape?: ShapeHost;
  public get selectedShape(): ShapeHost | undefined {
    return this._selectedShape;
  }
  public set selectedShape(shape: ShapeHost | undefined) {
    this._selectedShape = shape;
    this.selectedShape$.next(this._selectedShape);
  }

  public findListAndIndexOfShape(shapeHost: ShapeHost, shapeList: ShapeHost[] = this.shapeList): { shapeList: ShapeHost[]; index: number } {
    if (shapeList.indexOf(shapeHost) >= 0) {
      return { shapeList, index: shapeList.indexOf(shapeHost) };
    }

    for (let i = 0; i < shapeList.length; i++) {
      const shape = shapeList[i];

      if (!(shape instanceof GroupHost)) {
        continue;
      }

      try {
        return this.findListAndIndexOfShape(shapeHost, shape.shapes);
      } catch (e) {
        // fail silently, it might be that the shape is not found
        // in the first group but it is in the next group
      }
    }

    // this should never happen after iterating all groups recusively
    throw new Error('Shape was not found recursively in the shape list.');
  }

  public addShape(shapeHost: ShapeHost) {
    if (this.selectedGroup) {
      this.selectedGroup.svg.append(shapeHost.svg);
      this.selectedGroup.shapes.push(shapeHost);
      return;
    }

    this.canvas.append(shapeHost.svg);
    this.shapeList.push(shapeHost);
  }

  public removeAllShapesFromCanvas(shapeList = this.shapeList): void {
    shapeList.forEach((shape) => {
      shape.removeFromCanvas();
      if (shape instanceof GroupHost) {
        this.removeAllShapesFromCanvas(shape.shapes);
      }
    });
  }

  public addAllShapesToCanvas(shapeList = this.shapeList, parentToAdd: SVGElement = this.canvas): void {
    shapeList.forEach((shape) => {
      parentToAdd.append(shape.svg);
      if (shape instanceof GroupHost) {
        this.addAllShapesToCanvas(shape.shapes, shape.svg);
      }
    });
  }

  public recursiveListIds(list: ShapeHost[] = this.shapeList): string[] {
    const ids: string[] = [];

    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (element instanceof GroupHost) {
        ids.push(element.cdkDropListId);
        ids.push(...this.recursiveListIds(element.shapes));
      }
    }

    return ids.sort((a, b) => b.length - a.length);
  }
}
