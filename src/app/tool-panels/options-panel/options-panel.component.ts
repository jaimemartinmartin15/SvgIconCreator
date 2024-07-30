import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, ColorPickerComponent } from '@jaimemartinmartin15/jei-devkit-angular-shared';

@Component({
  selector: 'app-options-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, ColorPickerComponent],
  templateUrl: './options-panel.component.html',
  styleUrls: ['./options-panel.component.scss'],
})
export class OptionsPanelComponent {
  public colorFormControlName: 'stroke' | 'fill' = 'stroke';

  @Input()
  public shapeForm: FormGroup;

  public getColorFormControl(): FormControl {
    return this.shapeForm.controls[this.colorFormControlName] as FormControl;
  }
}
