import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Shape } from '../../models/shape';
import { ShapeListService } from '../../services/shape-list.service';
import { ShapeHost } from '../../shapes/shape-host';
import { CircleFormComponent } from './circle/circle-form.component';
import { LineFormComponent } from './line/line-form.component';
import { PathFormComponent } from './path/path-form.component';
import { RectFormComponent } from './rect/rect-form.component';
import { TextFormComponent } from './text/text-form.component';

@Component({
  selector: 'app-shape-list',
  templateUrl: './shape-list.component.html',
  styleUrls: ['./shape-list.component.scss'],
  imports: [CdkDrag, CdkDragPlaceholder, CdkDropList, RectFormComponent, LineFormComponent, PathFormComponent, CircleFormComponent, TextFormComponent],
})
export class ShapeListComponent {
  public readonly Shape = Shape;

  public constructor(private readonly shapeListService: ShapeListService) {}

  public get shapes(): ShapeHost[] {
    return this.shapeListService.shapeList;
  }

  public onReorderingShapes(event: CdkDragDrop<string[]>) {
    this.shapes.forEach((shapeHost) => shapeHost.removeFromCanvas());
    moveItemInArray(this.shapes, event.previousIndex, event.currentIndex);
    this.shapes.forEach((shapeHost) => shapeHost.addToCanvas());
  }
}
