import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { TextHost } from '../../../shapes/text-host';
import { ShapeInvokerComponent } from '../shape-invoker/shape-invoker.component';
import { ShapeFormComponent } from '../shape/shape-form.component';

@Component({
  selector: 'app-text-form',
  templateUrl: './text-form.component.html',
  styleUrls: ['../shape/shape-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, InputNumberDirective, ShapeInvokerComponent],
})
export class TextFormComponent extends ShapeFormComponent {
  public get textHost(): TextHost {
    return this.host as TextHost;
  }
}
