import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, ElementRefDirective, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { CircleFormComponent } from './forms/circle/circle-form.component';
import { LineFormComponent } from './forms/line/line-form.component';
import { PathFormComponent } from './forms/path/path-form.component';
import { RectFormComponent } from './forms/rect/rect-form.component';
import { TextFormComponent } from './forms/text/text-form.component';
import { ShapePainterMapping } from './painters/shape-painter-mapping';
import { ShapePainter } from './painters/shape.painter';
import { Shape } from './shape';
import { BackgroundPanelComponent } from './tool-panels/background-panel/background-panel.component';
import { ExportPanelComponent } from './tool-panels/export-panel/export-panel.component';
import { ImportPanelComponent } from './tool-panels/import-panel/import-panel.component';
import { OptionsPanelComponent } from './tool-panels/options-panel/options-panel.component';
import { ShapesPanelComponent } from './tool-panels/shapes-panel/shapes-panel.component';
import { SizePanelComponent } from './tool-panels/size-panel/size-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // angular
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    // jei-devkit
    CollapsibleModule,
    ElementRefDirective,
    // panels
    BackgroundPanelComponent,
    ExportPanelComponent,
    ImportPanelComponent,
    OptionsPanelComponent,
    ShapesPanelComponent,
    SizePanelComponent,
    // shape list form components
    CircleFormComponent,
    LineFormComponent,
    PathFormComponent,
    RectFormComponent,
    TextFormComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  public Shape = Shape;
  public shapeToDraw: Shape = Shape.RECT;
  public shapePainter: ShapePainter;
  public shapeList: ShapePainter[] = [];

  private canvas: SVGSVGElement;

  public constructor(private readonly elementsRefService: ElementsRefService) {}

  public ngAfterViewInit(): void {
    this.canvas = this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');

    setTimeout(() => {
      // avoid error ExpressionChangedAfterItHasBeenCheckedError
      this.shapePainter = this.instantiateShapePainter();

      // avoid triggering these events before the instance is instantiated
      this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
      this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
    }, 0);
  }

  @HostListener('document:keypress', ['$event'])
  public onKeypressHandler(event: KeyboardEvent) {
    if (!this.shapePainter.isShapeType(Shape.PATH) || this.shapePainter.isShapeSelected()) {
      return;
    }

    if (event.code === 'KeyM') {
      this.shapePainter.moveTo();
      return;
    }

    if (event.code === 'KeyL') {
      this.shapePainter.lineTo();
      return;
    }

    if (event.code === 'KeyC') {
      this.shapePainter.cubizBezier();
      return;
    }

    if (event.code === 'KeyZ') {
      this.shapePainter.closePath();
      this.shapePainter = this.instantiateShapePainter();
      return;
    }

    if (event.code === 'KeyF') {
      this.shapePainter.setShapeCompleted();
      this.shapePainter = this.instantiateShapePainter();
      return;
    }
  }

  private getCoordsInViewBox(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // convert mouse coordinates to viewBox coordinate system
    const xInViewBox = (x / rect.width) * this.canvas.viewBox.baseVal.width + this.canvas.viewBox.baseVal.x;
    const yInViewBox = (y / rect.height) * this.canvas.viewBox.baseVal.height + this.canvas.viewBox.baseVal.y;

    return { x: +xInViewBox.toFixed(1), y: +yInViewBox.toFixed(1) };
  }

  public onChangeShapeToDraw(shape: Shape) {
    this.shapeToDraw = shape;
    this.shapePainter.setShapeSelected(false);
    this.shapePainter.setShapeCompleted();
    this.shapePainter = this.instantiateShapePainter();
  }

  private instantiateShapePainter(): ShapePainter {
    return new ShapePainterMapping[this.shapeToDraw](this.canvas);
  }

  //#region mouse event handlers

  private onPointerDown(e: PointerEvent) {
    if (this.shapePainter.isShapeSelected()) {
      this.shapePainter.onMouseDownEdit(this.getCoordsInViewBox(e));
      return;
    }

    if (this.shapePainter.isShapeCompleted()) {
      // if the shape before is completed, create a new one
      this.shapePainter = this.instantiateShapePainter();
    }

    if (!this.shapePainter.isShapeStarted()) {
      this.shapePainter.addToCanvas();
      this.shapeList.push(this.shapePainter);
    }

    this.shapePainter.onMouseDown(this.getCoordsInViewBox(e));
  }

  private onPointerMove(e: PointerEvent) {
    if (this.shapePainter.isShapeSelected()) {
      this.shapePainter.onMouseMoveEdit(this.getCoordsInViewBox(e));
      return;
    }
    this.shapePainter.onMouseMove(this.getCoordsInViewBox(e));
  }

  private onPointerUp(e: PointerEvent) {
    if (this.shapePainter.isShapeSelected()) {
      this.shapePainter.onMouseUpEdit(this.getCoordsInViewBox(e));
      return;
    }
    this.shapePainter.onMouseUp(this.getCoordsInViewBox(e));

    if (this.shapePainter.isShapeCompleted()) {
      this.shapePainter = this.instantiateShapePainter();
    }
  }

  //#endregion mouse event handlers

  public selectShapePainter(shapePainter: ShapePainter) {
    this.shapePainter.setShapeCompleted();

    if (shapePainter.isShapeSelected()) {
      shapePainter.setShapeSelected(false);
      this.shapePainter = this.instantiateShapePainter();
      return;
    }

    this.shapePainter.setShapeSelected(false);
    shapePainter.setShapeSelected(true);
    this.shapePainter = shapePainter;
  }

  public onReorderingShapes(event: CdkDragDrop<string[]>) {
    this.shapeList.forEach((sp) => sp.removeFromCanvas());
    moveItemInArray(this.shapeList, event.previousIndex, event.currentIndex);
    this.shapeList.forEach((sp) => sp.addToCanvas());
  }

  public deleteShape(shapePainter: ShapePainter) {
    this.shapeList.splice(this.shapeList.indexOf(shapePainter), 1);
    shapePainter.removeFromCanvas();
    this.shapePainter = this.instantiateShapePainter();
  }
}
