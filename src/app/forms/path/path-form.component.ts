import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { PathPainter } from '../../painters/path.painter';

@Component({
  selector: 'app-path-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './path-form.component.html',
  styleUrls: ['../shared.scss', './path-form.component.scss'],
})
export class PathFormComponent {
  @Input()
  public pathPainter: PathPainter;

  public getAsFormArray(form: AbstractControl): FormArray {
    return form as FormArray;
  }

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

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.pathPainter);
  }
}
