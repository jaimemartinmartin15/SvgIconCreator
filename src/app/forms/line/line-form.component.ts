import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { LinePainter } from '../../painters/line.painter';

@Component({
  selector: 'app-line-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './line-form.component.html',
  styleUrls: ['../shared.scss'],
})
export class LineFormComponent {
  @Input()
  public linePainter: LinePainter;

  @Output()
  public onShapeSelected = new EventEmitter<LinePainter>();

  @Output()
  public onShapeDelete = new EventEmitter<LinePainter>();

  @HostListener('click')
  public toggleShapeSelected() {
    this.onShapeSelected.emit(this.linePainter);
  }

  @HostBinding('class.selected')
  public get isSelected() {
    return this.linePainter.isShapeSelected();
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.linePainter);
  }
}
