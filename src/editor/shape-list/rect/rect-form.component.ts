import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { RectHost } from '../../../shapes/rect-host';
import { ShapeInvokerComponent } from "../shape-invoker/shape-invoker.component";
import { ShapeFormComponent } from '../shape/shape-form.component';

@Component({
  selector: 'app-rect-form',
  templateUrl: './rect-form.component.html',
  styleUrls: ['../shape/shape-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, InputNumberDirective, ShapeInvokerComponent],
})
export class RectFormComponent extends ShapeFormComponent {
  public get rectHost(): RectHost {
    return this.host as RectHost;
  }
}
