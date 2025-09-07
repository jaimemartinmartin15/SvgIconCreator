import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { LineHost } from '../../../shapes/line-host';
import { ShapeInvokerComponent } from '../shape-invoker/shape-invoker.component';
import { ShapeFormComponent } from '../shape/shape-form.component';

@Component({
  selector: 'app-line-form',
  templateUrl: './line-form.component.html',
  styleUrls: ['../shape/shape-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, InputNumberDirective, ShapeInvokerComponent],
})
export class LineFormComponent extends ShapeFormComponent {
  public get lineHost(): LineHost {
    return this.host as LineHost;
  }
}
