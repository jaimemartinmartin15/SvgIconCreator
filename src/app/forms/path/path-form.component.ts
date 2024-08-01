import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { adaptWidthOfInputToWidthOfText, CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { PathPainter } from '../../painters/path.painter';

@Component({
  selector: 'app-path-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './path-form.component.html',
  styleUrls: ['../shared.scss', './path-form.component.scss'],
})
export class PathFormComponent implements AfterViewInit {
  @ViewChild('shapeName')
  public shapeNameInput: ElementRef<HTMLInputElement>;

  public mouseHoverIndex = -1;

  @Input()
  public pathPainter: PathPainter;

  @Output()
  public onShapeSelected = new EventEmitter<PathPainter>();

  @Output()
  public onShapeDelete = new EventEmitter<PathPainter>();

  @HostListener('click')
  public toggleShapeSelected() {
    this.onShapeSelected.emit(this.pathPainter);
  }

  @HostBinding('class.selected')
  public get isSelected() {
    return this.pathPainter.isShapeSelected();
  }

  public ngAfterViewInit(): void {
    adaptWidthOfInputToWidthOfText(this.shapeNameInput.nativeElement);
  }

  public adaptShapeNameSize(event: Event) {
    adaptWidthOfInputToWidthOfText(event.target as HTMLInputElement);
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.pathPainter);
  }

  public deleteCommand(i: number, e: MouseEvent) {
    e.stopPropagation();
    this.pathPainter.deleteCommand(i);
  }

  public getAsFormArray(form: AbstractControl): FormArray {
    return form as FormArray;
  }

  public getAsFormControl(form: AbstractControl): FormControl {
    return form as FormControl;
  }
}
