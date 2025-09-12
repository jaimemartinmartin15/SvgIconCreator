import { Component } from '@angular/core';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { fromEvent } from 'rxjs';
import { Shape } from '../models/shape';
import { CanvasEventsService } from '../services/canvas-events.service';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { CircleHost } from '../shapes/circle-host';
import { LineHost } from '../shapes/line-host';
import { isPathInstruction, PathHost } from '../shapes/path-host';
import { RectHost } from '../shapes/rect-host';
import { ShapeHost } from '../shapes/shape-host';
import { TextHost } from '../shapes/text-host';
import { CanvasComponent } from './canvas/canvas.component';
import { ShapeListComponent } from './shape-list/shape-list.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [ToolbarComponent, CanvasComponent, ShapeListComponent],
})
export class EditorComponent {
  public constructor(
    private readonly shapeListService: ShapeListService,
    private readonly canvasEventsService: CanvasEventsService,
    private readonly elementsRefService: ElementsRefService,
    private readonly formsService: FormsService,
  ) {}

  public ngOnInit(): void {
    this.canvasEventsService.canvasPointerDown$.subscribe((coord) => {
      if (this.shapeListService.selectedShape?.getEditPointUnderMousePoint(coord) !== undefined) {
        this.shapeListService.selectedShape.mouseDownEdit(coord);
      } else if (this.shapeListService.selectedShape !== undefined && !this.shapeListService.selectedShape.isShapeFinished) {
        this.shapeListService.selectedShape.mouseDown(coord);
      } else {
        this.shapeListService.selectedShape?.clearEditPoints();
        const newShape = this.instantiateNewShapeHost();
        this.shapeListService.selectedShape = newShape;
        this.shapeListService.shapeList.push(newShape);
        this.shapeListService.selectedShape.mouseDown(coord);
      }
    });

    this.canvasEventsService.canvasPointerDrag$.subscribe((coord) => {
      if (!this.shapeListService.selectedShape!.isShapeFinished) {
        this.shapeListService.selectedShape!.mouseDrag(coord);
      } else {
        this.shapeListService.selectedShape!.mouseDragEdit(coord);
      }
    });

    this.canvasEventsService.canvasPointerUp$.subscribe((coord) => {
      if (!this.shapeListService.selectedShape!.isShapeFinished) {
        this.shapeListService.selectedShape!.mouseUp(coord);
      } else {
        this.shapeListService.selectedShape!.mouseUpEdit(coord);
      }
    });

    this.canvasEventsService.canvasPointerMove$.subscribe((coord) => {
      this.shapeListService.selectedShape?.mouseMove(coord);
    });

    fromEvent<KeyboardEvent>(window, 'keydown').subscribe((event) => {
      const key = event.key.toUpperCase();

      // allow to change path command using the keyboard
      this.handleKeyboardEventsForPath(key);
    });
  }

  private handleKeyboardEventsForPath(key: string) {
    if (!(this.shapeListService.selectedShape instanceof PathHost)) return;

    if (key === 'F') {
      this.shapeListService.selectedShape.isShapeFinished = true;
      this.shapeListService.selectedShape.createEditPoints();
    } else if (key === 'Z') {
      this.shapeListService.selectedShape.closePath();
    } else if (isPathInstruction(key)) {
      this.shapeListService.selectedShape.currentCommand = key;
    }
  }

  private instantiateNewShapeHost(): ShapeHost {
    switch (this.formsService.shapeSelectorForm.value) {
      case Shape.RECT:
        return new RectHost(this.elementsRefService, this.shapeListService);
      case Shape.LINE:
        return new LineHost(this.elementsRefService, this.shapeListService);
      case Shape.PATH:
        return new PathHost(this.elementsRefService, this.shapeListService);
      case Shape.CIRCLE:
        return new CircleHost(this.elementsRefService, this.shapeListService);
      case Shape.TEXT:
        return new TextHost(this.elementsRefService, this.shapeListService);
    }
  }
}
