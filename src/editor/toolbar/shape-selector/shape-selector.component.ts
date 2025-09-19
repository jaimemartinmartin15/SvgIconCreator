import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Shape } from '../../../models/shape';
import { FormsService } from '../../../services/forms.service';
import { ShapeListService } from '../../../services/shape-list.service';

@Component({
  selector: 'app-shape-selector',
  templateUrl: './shape-selector.component.html',
  styleUrls: ['./shape-selector.component.scss'],
  imports: [ReactiveFormsModule],
})
export class ShapeSelectorComponent implements OnInit {
  public Shape: typeof Shape = Shape;

  public constructor(
    private readonly formsService: FormsService,
    private readonly shapeListService: ShapeListService,
  ) {}

  public ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.isShapeFinished = true;
        this.shapeListService.selectedShape.clearEditPoints();
        this.shapeListService.selectedShape = undefined;
      }
    });
  }

  public get form(): FormControl<Shape> {
    return this.formsService.shapeSelectorForm;
  }
}
