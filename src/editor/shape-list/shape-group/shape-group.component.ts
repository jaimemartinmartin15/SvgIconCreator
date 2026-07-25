import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { adaptWidthOfInputToWidthOfText, CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ShapeListService } from '../../../services/shape-list.service';
import { GroupHost } from '../../../shapes/group-host';
import { ShapeHost } from '../../../shapes/shape-host';
import { BurgerSvgComponent } from '../../../svg-output/burger.component';
import { ChevronSvgComponent } from '../../../svg-output/chevron.component';
import { ShapeElementComponent } from '../shape-element/shape-element.component';

@Component({
  selector: 'app-shape-group',
  templateUrl: './shape-group.component.html',
  styleUrls: ['./shape-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CdkDrag, CdkDragHandle, CdkDropList, NgClass, ReactiveFormsModule, CollapsibleModule, ShapeElementComponent, ChevronSvgComponent, BurgerSvgComponent],
})
export class ShapeGroupComponent implements OnInit, AfterViewInit {
  @Input()
  public groupHost: GroupHost;

  @Output()
  public openBindingsDialog = new EventEmitter<void>();

  @ViewChild('shapeName')
  public shapeNameInput: ElementRef<HTMLInputElement>;

  public nameForm = new FormControl<string>('', { nonNullable: true });

  public constructor(private readonly shapeListService: ShapeListService) {}

  public ngOnInit() {
    this.nameForm.valueChanges.subscribe((v) => (this.groupHost.name = v));
    this.nameForm.setValue(this.groupHost.name);
  }

  public ngAfterViewInit(): void {
    adaptWidthOfInputToWidthOfText(this.shapeNameInput.nativeElement);
  }

  public adaptShapeNameSize(event: Event) {
    adaptWidthOfInputToWidthOfText(event.target as HTMLInputElement);
  }

  public get isThisSelectedGroup() {
    return this.shapeListService.selectedGroup === this.groupHost;
  }

  public selectGroup(): void {
    this.shapeListService.selectedShape?.clearEditPoints();
    this.shapeListService.selectedShape = undefined;

    if (this.shapeListService.selectedGroup === this.groupHost) {
      this.shapeListService.selectedGroup = undefined;
      return;
    }

    this.shapeListService.selectedGroup = this.groupHost;
  }

  public deleteGroup(event: MouseEvent): void {
    event.stopPropagation();

    // ask confirmation only if the group has shapes
    if (this.groupHost.shapes.length > 0) {
      const answer = confirm(`¿Eliminar el grupo ${this.groupHost.name}?`);
      if (!answer) return;
    }

    this.groupHost.delete();
  }

  public onDroppedListElement(event: CdkDragDrop<any, any, any>) {
    this.shapeListService.removeAllShapesFromCanvas();

    if (event.container === event.previousContainer) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

    this.shapeListService.addAllShapesToCanvas();
    this.shapeListService.selectedShape?.createEditPoints();
  }

  public get cdkListIds(): string[] {
    const ids = this.shapeListService.recursiveListIds();
    return [...ids, 'main-cdk-drop-list'].filter((id) => id !== this.groupHost.cdkDropListId);
  }

  public shapeIsGroup(shape: ShapeHost): shape is GroupHost {
    return shape instanceof GroupHost;
  }
}
