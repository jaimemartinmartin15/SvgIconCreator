import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Output } from '@angular/core';
import { ShapeListService } from '../../services/shape-list.service';
import { ShapeHost } from '../../shapes/shape-host';
import { ShapeElementComponent } from './shape-element/shape-element.component';

@Component({
  selector: 'app-shape-list',
  templateUrl: './shape-list.component.html',
  styleUrls: ['./shape-list.component.scss'],
  imports: [CdkDrag, CdkDragPlaceholder, CdkDropList, ShapeElementComponent],
})
export class ShapeListComponent {
  @Output()
  public openAnimationsDialog = new EventEmitter<void>();

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
