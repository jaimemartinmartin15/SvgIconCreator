import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { adaptWidthOfInputToWidthOfText, CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ShapeListService } from '../../../services/shape-list.service';
import { GroupHost } from '../../../shapes/group-host';
import { ShapeHost } from '../../../shapes/shape-host';
import { BurgerSvgComponent } from '../../../svg-output/burger.component';
import { CheckListSvgComponent } from '../../../svg-output/check-list.component';
import { ChevronSvgComponent } from '../../../svg-output/chevron.component';
import { TrashCanSvgComponent } from '../../../svg-output/trash-can.component';
import { ShapeElementComponent } from '../shape-element/shape-element.component';

@Component({
  selector: 'app-shape-group',
  templateUrl: './shape-group.component.html',
  styleUrls: ['./shape-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    NgClass,
    ReactiveFormsModule,
    CollapsibleModule,
    ShapeElementComponent,
    ChevronSvgComponent,
    BurgerSvgComponent,
    CheckListSvgComponent,
    TrashCanSvgComponent,
  ],
})
export class ShapeGroupComponent implements OnInit, AfterViewInit {
  @Input()
  public group: GroupHost;

  @ViewChild('shapeName')
  public shapeNameInput: ElementRef<HTMLInputElement>;

  public nameForm = new FormControl<string>('', { nonNullable: true });

  public constructor(private readonly shapeListService: ShapeListService) {}

  public ngOnInit() {
    this.nameForm.valueChanges.subscribe((v) => (this.group.name = v));
    this.nameForm.setValue(this.group.name);
  }

  public ngAfterViewInit(): void {
    adaptWidthOfInputToWidthOfText(this.shapeNameInput.nativeElement);
  }

  public adaptShapeNameSize(event: Event) {
    adaptWidthOfInputToWidthOfText(event.target as HTMLInputElement);
  }

  public get shapes(): ShapeHost[] {
    return this.group.shapes;
  }

  public onReorderingShapes(event: CdkDragDrop<ShapeHost[]>) {
    if (event.previousContainer === event.container) {
      this.group.shapes.forEach((shape) => shape.removeFromCanvas());
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.group.shapes.forEach((shape) => this.group.svg.append(shape.svg));
    } else {
      this.shapeListService.groupsList.forEach((group) => group.shapes.forEach((shape) => shape.removeFromCanvas()));
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.shapeListService.groupsList.forEach((group) => {
        group.addToCanvas();
        group.shapes.forEach((shape) => group.svg.append(shape.svg));
      });
    }
  }

  public selectGroup(): void {
    this.shapeListService.selectedGroup = this.group;
  }

  public deleteGroup(event: MouseEvent): void {
    event.stopPropagation();
    const answer = confirm(`¿Eliminar el grupo ${this.group.name}?`);
    throw new Error('Method not implemented. Answer was: ' + answer);
    // TODO
  }
}
