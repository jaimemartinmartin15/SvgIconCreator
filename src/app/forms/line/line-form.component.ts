import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { adaptWidthOfInputToWidthOfText, CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { LinePainter } from '../../painters/line.painter';

@Component({
  selector: 'app-line-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, CdkDragHandle],
  templateUrl: './line-form.component.html',
  styleUrls: ['../shared.scss'],
})
export class LineFormComponent implements AfterViewInit {
  @ViewChild('shapeName')
  public shapeNameInput: ElementRef<HTMLInputElement>;

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

  public ngAfterViewInit(): void {
    adaptWidthOfInputToWidthOfText(this.shapeNameInput.nativeElement);
  }

  public adaptShapeNameSize(event: Event) {
    adaptWidthOfInputToWidthOfText(event.target as HTMLInputElement);
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.onShapeDelete.emit(this.linePainter);
  }

  public getAsFormControl(form: AbstractControl): FormControl {
    return form as FormControl;
  }
}
