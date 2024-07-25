import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { RectPainter } from '../../painters/rect.painter';

@Component({
  selector: 'app-rect-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './rect-form.component.html',
  styleUrls: ['../shared.scss'],
})
export class RectFormComponent {
  @Input()
  public rectPainter: RectPainter;

  @Output()
  public onShapeSelected = new EventEmitter<RectPainter>();

  @Output()
  public onShapeDelete = new EventEmitter<RectPainter>();

  @HostListener('click')
  public toggleShapeSelected() {
    this.onShapeSelected.emit(this.rectPainter);
  }

  @HostBinding('class.selected')
  public get isSelected() {
    return this.rectPainter.isShapeSelected();
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.rectPainter);
  }

  public getAsFormControl(form: AbstractControl): FormControl {
    return form as FormControl;
  }
}
