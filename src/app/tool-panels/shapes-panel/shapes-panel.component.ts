import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../../shape';

const KEY_MAPPING: { [key: string]: Shape } = {
  KeyR: Shape.RECT,
  KeyL: Shape.LINE,
  KeyC: Shape.CIRCLE,
  KeyP: Shape.PATH,
  KeyT: Shape.TEXT,
};

@Component({
  selector: 'app-shapes-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule],
  templateUrl: './shapes-panel.component.html',
  styleUrls: ['./shapes-panel.component.scss'],
})
export class ShapesPanelComponent {
  public Shape = Shape;
  public shapesPanelForm;

  @Input()
  public pathCommand: string;

  @Output()
  public onSelectShape = new EventEmitter<Shape>();

  public constructor(readonly nonNullableFormBuilder: NonNullableFormBuilder) {
    this.shapesPanelForm = nonNullableFormBuilder.group({
      shape: [Shape.RECT],
    });
  }

  @HostListener('document:keypress', ['$event'])
  public onKeypressHandler(event: KeyboardEvent) {
    if (!event.shiftKey) {
      return;
    }

    if (!(event.code in KEY_MAPPING)) {
      return;
    }

    const selectedShape = KEY_MAPPING[event.code];
    this.onSelectShape.emit(selectedShape);
    this.shapesPanelForm.setValue({ shape: selectedShape });
  }
}
