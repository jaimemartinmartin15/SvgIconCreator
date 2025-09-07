import { Injectable } from '@angular/core';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { ConvertToForm } from '../utils/convert-to-form';
import { Shape } from '../models/shape';
import { ViewBoxModel } from '../models/view-box.model';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  public readonly shapeSelectorForm: FormControl<Shape>;
  public readonly strokePickerForm: FormControl<string>;
  public readonly fillPickerForm: FormControl<string>;
  public readonly strokeWidthSelectorForm: FormControl<number>;
  public readonly canvasOptionsViewBoxForm: ConvertToForm<ViewBoxModel>;

  public constructor(
    readonly nonNullableFormBuilder: NonNullableFormBuilder,
  ) {
    this.shapeSelectorForm = nonNullableFormBuilder.control<Shape>(Shape.RECT);
    this.strokePickerForm = nonNullableFormBuilder.control<string>('#ff0000');
    this.fillPickerForm = nonNullableFormBuilder.control<string>('#FF000000');
    this.strokeWidthSelectorForm = nonNullableFormBuilder.control<number>(1);
    this.canvasOptionsViewBoxForm = nonNullableFormBuilder.group<ViewBoxModel>({ x: 0, y: 0, width: 100, height: 100, })
  }
}
