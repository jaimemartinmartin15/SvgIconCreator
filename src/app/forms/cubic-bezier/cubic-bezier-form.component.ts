import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { CubicBezierPainter } from '../../painters/cubic-bezier.painter';

@Component({
  selector: 'app-cubic-bezier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule],
  templateUrl: './cubic-bezier-form.component.html',
  styleUrls: ['../shared.scss'],
})
export class CubicBezierFormComponent {
  @Input()
  public cubicBezierPainter: CubicBezierPainter;

  @Output()
  public onShapeSelected = new EventEmitter<CubicBezierPainter>();

  @HostListener('click')
  public toggleShapeSelected() {
    this.onShapeSelected.emit(this.cubicBezierPainter);
  }

  @HostBinding('class.selected')
  public get isSelected() {
    return this.cubicBezierPainter.isShapeSelected();
  }
}
