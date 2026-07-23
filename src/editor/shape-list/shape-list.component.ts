import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { GroupHost } from '../../shapes/group-host';
import { ShapeHost } from '../../shapes/shape-host';
import { ShapeElementComponent } from './shape-element/shape-element.component';
import { ShapeGroupComponent } from './shape-group/shape-group.component';

@Component({
  selector: 'app-shape-list',
  templateUrl: './shape-list.component.html',
  styleUrls: ['./shape-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CdkDrag, CdkDropList, ShapeGroupComponent, ShapeElementComponent],
})
export class ShapeListComponent {
  @Output()
  public openBindingsDialog = new EventEmitter<void>();

  public constructor(
    private readonly elementsRefService: ElementsRefService,
    private readonly formsService: FormsService,
    private readonly shapeListService: ShapeListService,
  ) {}

  //#region header
  public newGroup(): void {
    const group = new GroupHost(this.elementsRefService, this.formsService, this.shapeListService);
    this.shapeListService.addShape(group);
    this.shapeListService.selectedGroup = group;
  }

  public duplicateShape(): void {
    // TODO
    alert('Method not implemented');
  }
  //#endregion

  //#region list
  public get shapes(): ShapeHost[] {
    return this.shapeListService.shapeList;
  }

  public get cdkListIds(): string[] {
    const ids = this.shapeListService.recursiveListIds();
    return ids;
  }

  public shapeIsGroup(shape: ShapeHost): shape is GroupHost {
    return shape instanceof GroupHost;
  }

  public onDroppedListElement(event: CdkDragDrop<any[]>) {
    this.shapeListService.removeAllShapesFromCanvas();

    if (event.container === event.previousContainer) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

    this.shapeListService.addAllShapesToCanvas();
  }
  //#endregion
}
