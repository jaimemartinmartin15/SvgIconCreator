import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { ShapeListService } from '../../services/shape-list.service';
import { GroupHost } from '../../shapes/group-host';
import { PlusSvgComponent } from '../../svg-output/plus.component';
import { ShapeGroupComponent } from './shape-group/shape-group.component';

@Component({
  selector: 'app-shape-list',
  templateUrl: './shape-list.component.html',
  styleUrls: ['./shape-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CdkDrag, CdkDropListGroup, CdkDropList, ShapeGroupComponent, PlusSvgComponent],
})
export class ShapeListComponent implements AfterViewInit {
  @Output()
  public openBindingsDialog = new EventEmitter<void>();

  public get groups(): GroupHost[] {
    return this.shapeListService.groupsList;
  }

  public constructor(private readonly shapeListService: ShapeListService) {}

  public ngAfterViewInit(): void {
    // create always a new group on app launch
    this.newGroup();
  }

  //#region header buttons
  public newGroup(): void {
    const g = this.shapeListService.createNewGroup();
    this.shapeListService.selectedGroup = g;
  }

  public duplicateShape(): void {
    // TODO
    throw new Error('Method not implemented.');
  }
  //#endregion

  public onReorderingGroups(event: CdkDragDrop<GroupHost[]>) {
    this.groups.forEach((group) => group.removeFromCanvas());
    moveItemInArray(this.groups, event.previousIndex, event.currentIndex);
    this.groups.forEach((group) => group.addToCanvas());
  }
}
