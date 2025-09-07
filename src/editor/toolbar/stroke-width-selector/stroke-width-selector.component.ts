import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Subject, takeUntil } from 'rxjs';
import { ShapeListService } from '../../../services/shape-list.service';
import { TextHost } from '../../../shapes/text-host';

@Component({
  selector: 'app-stroke-width-selector',
  templateUrl: './stroke-width-selector.component.html',
  styleUrls: ['./stroke-width-selector.component.scss'],
  imports: [ReactiveFormsModule, InputNumberDirective],
})
export class StrokeWidthSelectorComponent implements OnInit {
  private readonly attributeName = 'strokeWidth';
  private readonly fallbackFormControl = new FormControl<number>(1);

  private otherShapeIsSelected$ = new Subject<void>();

  public constructor(private readonly shapeListService: ShapeListService) { }

  public ngOnInit(): void {
    this.fallbackFormControl.setValue(1);

    this.shapeListService.selectedShape$.subscribe((shapeHost) => {
      // end subscription to previous shape form
      this.otherShapeIsSelected$.next();

      if (!shapeHost) return;

      // listen to changes for next shape
      shapeHost.form.controls[this.attributeName].valueChanges
        .pipe(takeUntil(this.otherShapeIsSelected$))
        .subscribe((v) => (this.fallbackFormControl.setValue(v)));

      if (!shapeHost.isShapeFinished) {
        // if it changes the shape and it is not finised (it is a new one), set last used
        shapeHost.form.controls[this.attributeName].setValue(this.fallbackFormControl.value);

        // but if the new shape is Text, use default 0.4 stroke width
        if (shapeHost instanceof TextHost) {
          shapeHost.form.controls[this.attributeName].setValue(0.4);
        }
      } else {
        // if it selects another existing shape, set fallback form value so next shape picks strokeWidth of the existing one
        this.fallbackFormControl.setValue(shapeHost.form.controls[this.attributeName].value);
      }
    })
  }

  public get form(): FormControl<number> {
    return (this.shapeListService.selectedShape?.form.controls[this.attributeName] as FormControl<number>) ?? this.fallbackFormControl;
  }
}
