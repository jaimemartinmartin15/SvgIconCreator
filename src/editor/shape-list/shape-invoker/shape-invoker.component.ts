import { Component, ElementRef, HostBinding, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { adaptWidthOfInputToWidthOfText, CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ShapeListService } from '../../../services/shape-list.service';
import { ShapeHost } from '../../../shapes/shape-host';

@Component({
  selector: 'app-shape-invoker',
  templateUrl: './shape-invoker.component.html',
  styleUrls: ['./shape-invoker.component.scss'],
  imports: [CollapsibleModule, ReactiveFormsModule],
})
export class ShapeInvokerComponent {
  @ViewChild('shapeName')
  public shapeNameInput: ElementRef<HTMLInputElement>;

  @Input()
  @HostBinding('class.expanded')
  public isExpanded: boolean = true;

  @Input()
  public host: ShapeHost;

  public constructor(private readonly shapeListService: ShapeListService) {}

  public ngAfterViewInit(): void {
    adaptWidthOfInputToWidthOfText(this.shapeNameInput.nativeElement);
  }

  public toggleVisibility(event: Event): void {
    this.host.setVisibility((event.target as HTMLInputElement).checked);
  }

  public adaptShapeNameSize(event: Event) {
    adaptWidthOfInputToWidthOfText(event.target as HTMLInputElement);
  }

  public getAsFormControl(control: AbstractControl): FormControl<string> {
    return control as FormControl<string>;
  }

  public selectShape(event: MouseEvent | FocusEvent) {
    const ctrlKey = event instanceof MouseEvent ? event.ctrlKey : false;

    // whether if it is selecting other shape or just unselecting current one, finish the shape
    if (this.shapeListService.selectedShape) {
      this.shapeListService.selectedShape.isShapeFinished = true;
    }

    if (this.shapeListService.selectedShape === this.host && ctrlKey) {
      this.shapeListService.selectedShape?.clearEditPoints();
      this.shapeListService.selectedShape = undefined;
    } else {
      this.shapeListService.selectedShape?.clearEditPoints();
      this.shapeListService.selectedShape = this.host;
      this.host.createEditPoints();
    }
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.host.delete();
  }
}
