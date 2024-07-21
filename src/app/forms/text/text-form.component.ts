import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { TextPainter } from '../../painters/text.painter';

@Component({
  selector: 'app-text-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './text-form.component.html',
  styleUrls: ['../shared.scss'],
})
export class TextFormComponent {
  @Input()
  public textPainter: TextPainter;

  @Output()
  public onShapeSelected = new EventEmitter<TextPainter>();

  @Output()
  public onShapeDelete = new EventEmitter<TextPainter>();

  @HostListener('click')
  public toggleShapeSelected() {
    this.onShapeSelected.emit(this.textPainter);
  }

  @HostBinding('class.selected')
  public get isSelected() {
    return this.textPainter.isShapeSelected();
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.textPainter);
  }
}
