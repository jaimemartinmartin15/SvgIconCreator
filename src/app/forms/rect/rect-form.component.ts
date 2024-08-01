import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { adaptWidthOfInputToWidthOfText, CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { RectPainter } from '../../painters/rect.painter';

@Component({
  selector: 'app-rect-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './rect-form.component.html',
  styleUrls: ['../shared.scss'],
})
export class RectFormComponent implements AfterViewInit {
  @ViewChild('shapeName')
  public shapeNameInput: ElementRef<HTMLInputElement>;

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

  public ngAfterViewInit(): void {
    adaptWidthOfInputToWidthOfText(this.shapeNameInput.nativeElement);
  }

  public adaptShapeNameSize(event: Event) {
    adaptWidthOfInputToWidthOfText(event.target as HTMLInputElement);
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.rectPainter);
  }

  public getAsFormControl(form: AbstractControl): FormControl {
    return form as FormControl;
  }
}
