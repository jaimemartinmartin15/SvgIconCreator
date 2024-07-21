import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { CirclePainter } from '../../painters/circle.painter';

@Component({
  selector: 'app-circle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './circle-form.component.html',
  styleUrls: ['../shared.scss'],
})
export class CircleFormComponent {
  @Input()
  public circlePainter: CirclePainter;

  @Output()
  public onShapeSelected = new EventEmitter<CirclePainter>();

  @Output()
  public onShapeDelete = new EventEmitter<CirclePainter>();

  @HostListener('click')
  public toggleShapeSelected() {
    this.onShapeSelected.emit(this.circlePainter);
  }

  @HostBinding('class.selected')
  public get isSelected() {
    return this.circlePainter.isShapeSelected();
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.circlePainter);
  }
}
