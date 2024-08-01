import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { adaptWidthOfInputToWidthOfText, CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { TextPainter } from '../../painters/text.painter';

@Component({
  selector: 'app-text-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './text-form.component.html',
  styleUrls: ['../shared.scss'],
})
export class TextFormComponent implements AfterViewInit {
  @ViewChild('shapeName')
  public shapeNameInput: ElementRef<HTMLInputElement>;

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

  public ngAfterViewInit(): void {
    adaptWidthOfInputToWidthOfText(this.shapeNameInput.nativeElement);
  }

  public adaptShapeNameSize(event: Event) {
    adaptWidthOfInputToWidthOfText(event.target as HTMLInputElement);
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.textPainter);
  }

  public getAsFormControl(form: AbstractControl): FormControl {
    return form as FormControl;
  }
}
