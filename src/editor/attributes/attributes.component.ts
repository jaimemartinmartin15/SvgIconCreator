import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerComponent, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { takeUntil } from 'rxjs';
import { Shape } from '../../models/shape';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss'],
  imports: [ColorPickerComponent, ReactiveFormsModule, InputNumberDirective],
})
export class AttributesComponent implements OnInit {
  private _mockStrokeForm = new FormControl<string>('#000000ff', { nonNullable: true });
  private _mockFillForm = new FormControl<string>('#ffffffff', { nonNullable: true });
  public colorPickerForm: FormControl<string> = this._mockStrokeForm;
  private _mockStrokeWidthForm = new FormControl<number>(1, { nonNullable: true });

  constructor(
    public readonly shapeListService: ShapeListService,
    private readonly formsService: FormsService,
  ) {}

  public ngOnInit(): void {
    this.shapeListService.selectedShape$.subscribe((selectedShape) => {
      if (selectedShape && !selectedShape.isShapeFinished) {
        // it is creating a new shape, use last used colors
        selectedShape.form.controls['stroke'].setValue(this._mockStrokeForm.value);
        selectedShape.form.controls['fill'].setValue(this._mockFillForm.value);
        selectedShape.form.controls['strokeWidth'].setValue(this._mockStrokeWidthForm.value);
      }

      if (selectedShape) {
        // _mock[Stroke|Fill]Form must have same values that the current selectedShape
        this._mockStrokeForm.setValue(selectedShape.form.controls['stroke'].value);
        selectedShape.form.controls['stroke'].valueChanges
          .pipe(takeUntil(this.shapeListService.selectedShape$))
          .subscribe((newStrokeColor) => this._mockStrokeForm.setValue(newStrokeColor));
        this._mockFillForm.setValue(selectedShape.form.controls['fill'].value);
        selectedShape.form.controls['fill'].valueChanges
          .pipe(takeUntil(this.shapeListService.selectedShape$))
          .subscribe((newFillColor) => this._mockFillForm.setValue(newFillColor));
        this._mockStrokeWidthForm.setValue(selectedShape.form.controls['strokeWidth'].value);
        selectedShape.form.controls['strokeWidth'].valueChanges
          .pipe(takeUntil(this.shapeListService.selectedShape$))
          .subscribe((newStrokeWidth) => this._mockStrokeWidthForm.setValue(newStrokeWidth));
      }
    });
  }

  //#region form getters
  public get strokeForm(): FormControl<string> {
    return (this.shapeListService.selectedShape?.form.controls['stroke'] as FormControl<string>) ?? this._mockStrokeForm;
  }

  public get fillForm(): FormControl<string> {
    return (this.shapeListService.selectedShape?.form.controls['fill'] as FormControl<string>) ?? this._mockFillForm;
  }

  public get strokeWidthForm(): FormControl<string> {
    return (this.shapeListService.selectedShape?.form.controls['strokeWidth'] as FormControl<string>) ?? this._mockStrokeWidthForm;
  }
  //#endregion

  public showColorPickerDialog(dialog: HTMLDialogElement, attribute: 'stroke' | 'fill') {
    this.colorPickerForm = attribute === 'stroke' ? this.strokeForm : this.fillForm;
    dialog.showModal();
    // because the modal was hidden, the color picker component can't place handlers
    // in correct positions until a new value is set
    this.colorPickerForm.setValue(this.colorPickerForm.value);
  }

  get isDrawingLine(): boolean {
    return this.formsService.shapeSelectorForm.value === Shape.LINE;
  }
}
