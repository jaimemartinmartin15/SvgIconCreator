import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { fromEvent } from 'rxjs';
import { isPathInstruction } from '../models/path.model';
import { Shape } from '../models/shape';
import { CanvasEventsService } from '../services/canvas-events.service';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { CircleHost } from '../shapes/circle-host';
import { LineHost } from '../shapes/line-host';
import { PathHost } from '../shapes/path-host';
import { RectHost } from '../shapes/rect-host';
import { ShapeHost } from '../shapes/shape-host';
import { TextHost } from '../shapes/text-host';
import { AttributesComponent } from './attributes/attributes.component';
import { CanvasComponent } from './canvas/canvas.component';
import { ShapeListComponent } from './shape-list/shape-list.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

function isArrowKey(key: string) {
  return ['ARROWUP', 'ARROWRIGHT', 'ARROWDOWN', 'ARROWLEFT'].includes(key);
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [ReactiveFormsModule, ToolbarComponent, CanvasComponent, ShapeListComponent, AttributesComponent],
})
export class EditorComponent {
  public strokeBindingForm = new FormControl<string>('', { nonNullable: true });
  public fillBindingForm = new FormControl<string>('', { nonNullable: true });
  public strokeWidthBindingForm = new FormControl<string>('', { nonNullable: true });
  public strokeDasharrayBindingForm = new FormControl<string>('', { nonNullable: true });

  public constructor(
    private readonly shapeListService: ShapeListService,
    private readonly canvasEventsService: CanvasEventsService,
    private readonly elementsRefService: ElementsRefService,
    private readonly formsService: FormsService,
  ) {}

  public ngOnInit(): void {
    //#region bindings forms
    this.shapeListService.selectedShape$.subscribe((newShape) => {
      this.strokeBindingForm.setValue(newShape?.getBindingProperty('strokeBinding') ?? '');
      this.fillBindingForm.setValue(newShape?.getBindingProperty('fillBinding') ?? '');
      this.strokeWidthBindingForm.setValue(newShape?.getBindingProperty('strokeWidthBinding') ?? '');
      this.strokeDasharrayBindingForm.setValue(newShape?.getBindingProperty('strokeDasharrayBinding') ?? '');
    });
    this.strokeBindingForm.valueChanges.subscribe((value) => {
      this.shapeListService.selectedShape?.onBindingChanged('strokeBinding', value);
    });
    this.fillBindingForm.valueChanges.subscribe((value) => {
      this.shapeListService.selectedShape?.onBindingChanged('fillBinding', value);
    });
    this.strokeWidthBindingForm.valueChanges.subscribe((value) => {
      this.shapeListService.selectedShape?.onBindingChanged('strokeWidthBinding', value);
    });
    this.strokeDasharrayBindingForm.valueChanges.subscribe((value) => {
      this.shapeListService.selectedShape?.onBindingChanged('strokeDasharrayBinding', value);
    });
    //#endregion

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
      // allow to change path command using the keyboard
      this.handleKeyboardEventsForPath(event);

      // allow to move all points of the selected shape using the arrows
      this.handleKeyboardEventsToMoveShapes(event);
    });
  }

  private handleKeyboardEventsForPath(event: KeyboardEvent) {
    const key = event.key.toUpperCase();

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

  private handleKeyboardEventsToMoveShapes(event: KeyboardEvent) {
    const key = event.key.toUpperCase();

    // if the arrow is pressed when editing the input form, avoid moving the shape
    if (!isArrowKey(key) || event.target instanceof HTMLInputElement) return;

    // avoid navigating back when it is alt + left/right arrow, navigator tries to navigate previous/next page
    event.preventDefault();

    if (this.shapeListService.selectedShape) {
      // move only selected shape
      this.shapeListService.selectedShape?.moveShape(event);
    } else {
      // move all shapes
      this.shapeListService.shapeList.forEach((shapeHost) => shapeHost.moveShape(event));
    }
  }

  private instantiateNewShapeHost(): ShapeHost {
    switch (this.formsService.shapeSelectorForm.value) {
      case Shape.RECT:
        return new RectHost(this.elementsRefService, this.formsService, this.shapeListService);
      case Shape.LINE:
        return new LineHost(this.elementsRefService, this.formsService, this.shapeListService);
      case Shape.PATH:
        return new PathHost(this.elementsRefService, this.formsService, this.shapeListService);
      case Shape.CIRCLE:
        return new CircleHost(this.elementsRefService, this.formsService, this.shapeListService);
      case Shape.TEXT:
        return new TextHost(this.elementsRefService, this.formsService, this.shapeListService);
    }
  }
}
