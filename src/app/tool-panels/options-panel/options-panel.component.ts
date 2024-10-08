import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, ColorPickerComponent } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Subject, takeUntil } from 'rxjs';
import { ShapePainter } from '../../painters/shape.painter';
import { Shape } from '../../shape';

@Component({
  selector: 'app-options-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, ColorPickerComponent],
  templateUrl: './options-panel.component.html',
  styleUrls: ['./options-panel.component.scss'],
})
export class OptionsPanelComponent implements OnChanges {
  public Shape = Shape;
  public colorFormControlName: 'stroke' | 'fill' = 'stroke';

  private otherShapeIsSelected$ = new Subject<void>();
  private lastUsedStrokeWidth: number = 1;
  private lastUsedStroke: string = '#FF0000'; // red
  private lastUsedFill: string = '#FF000000'; // red transparent

  @Input()
  public shapePainter: ShapePainter;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['shapePainter']) {
      // if shapePainter has changed

      // end subscription of previous shape form
      this.otherShapeIsSelected$.next();

      // listen to changes for next shape
      (this.shapePainter.options.controls['strokeWidth'] as FormControl).valueChanges
        .pipe(takeUntil(this.otherShapeIsSelected$))
        .subscribe((v) => (this.lastUsedStrokeWidth = v));
      (this.shapePainter.options.controls['stroke'] as FormControl).valueChanges
        .pipe(takeUntil(this.otherShapeIsSelected$))
        .subscribe((v) => (this.lastUsedStroke = v));
      (this.shapePainter.options.controls['fill'] as FormControl).valueChanges
        .pipe(takeUntil(this.otherShapeIsSelected$))
        .subscribe((v) => (this.lastUsedFill = v));
    }

    if (changes['shapePainter'] && !this.shapePainter.isShapeSelected()) {
      // if it changes the shapePainter and it is not selected (it is a new one), set last used colors in colorpicker
      this.shapePainter.options.controls['strokeWidth'].setValue(this.lastUsedStrokeWidth);
      this.shapePainter.options.controls['stroke'].setValue(this.lastUsedStroke);
      this.shapePainter.options.controls['fill'].setValue(this.lastUsedFill);
    }

    if (changes['shapePainter'] && this.shapePainter.isShapeType(Shape.LINE)) {
      this.colorFormControlName = 'stroke';
    }
  }

  public getColorFormControl(): FormControl {
    return this.shapePainter.options.controls[this.colorFormControlName] as FormControl;
  }
}
