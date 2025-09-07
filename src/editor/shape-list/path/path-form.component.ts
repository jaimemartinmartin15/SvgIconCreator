import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { PathHost } from '../../../shapes/path-host';
import { ShapeInvokerComponent } from '../shape-invoker/shape-invoker.component';
import { ShapeFormComponent } from '../shape/shape-form.component';

@Component({
  selector: 'app-path-form',
  templateUrl: './path-form.component.html',
  styleUrls: ['../shape/shape-form.component.scss', './path-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, InputNumberDirective, ShapeInvokerComponent],
})
export class PathFormComponent extends ShapeFormComponent {
  public mouseHoverIndex = -1;

  public get pathHost(): PathHost {
    return this.host as PathHost;
  }

  public deleteCommand(i: number, e: MouseEvent) {
    e.stopPropagation();
    this.pathHost.form.controls['commands'].removeAt(i);
  }
}
