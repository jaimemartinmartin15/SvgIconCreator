import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { CircleHost } from '../../../shapes/circle-host';
import { ShapeInvokerComponent } from '../shape-invoker/shape-invoker.component';
import { ShapeFormComponent } from '../shape/shape-form.component';

@Component({
  selector: 'app-circle-form',
  templateUrl: './circle-form.component.html',
  styleUrls: ['../shape/shape-form.component.scss'],
  imports: [ReactiveFormsModule, CollapsibleModule, InputNumberDirective, ShapeInvokerComponent],
})
export class CircleFormComponent extends ShapeFormComponent {
  public get circleHost(): CircleHost {
    return this.host as CircleHost;
  }
}
