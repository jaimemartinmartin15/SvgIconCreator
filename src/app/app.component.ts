import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { addAlphaToColor } from './color.utils';
import { CircleFormComponent } from './forms/circle/circle-form.component';
import { LineFormComponent } from './forms/line/line-form.component';
import { PathFormComponent } from './forms/path/path-form.component';
import { RectFormComponent } from './forms/rect/rect-form.component';
import { TextFormComponent } from './forms/text/text-form.component';
import { ShapePainterMapping } from './painters/shape-painter-mapping';
import { ShapePainter } from './painters/shape.painter';
import { Shape } from './shape';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CollapsibleModule,
    RectFormComponent,
    CircleFormComponent,
    LineFormComponent,
    PathFormComponent,
    TextFormComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  public backgroundImageFile?: File;

  public canvasWidth = 100;
  public canvasHeight = 100;

  public Shape = Shape;
  public shapeToDraw: Shape = Shape.RECT;
  public shapePainter: ShapePainter;
  public shapeList: ShapePainter[] = [];

  @ViewChild('canvas')
  private canvasRef: ElementRef<SVGSVGElement>;
  private get canvas() {
    return this.canvasRef.nativeElement;
  }

  public ngAfterViewInit(): void {
    this.canvas.setAttribute('viewBox', `0 0 ${this.canvasWidth} ${this.canvasHeight}`);

    this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));

    // avoid error ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => (this.shapePainter = this.instantiateShapePainter()), 0);
  }

  @HostListener('document:keypress', ['$event'])
  public onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'KeyF') {
      // finish path to start a new one
      if (this.shapePainter.isShapeType(Shape.PATH)) {
        this.shapePainter.setShapeCompleted();
      }
    }
  }

  private getCoordsInViewBox(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // convert mouse coordinates to viewBox coordinate system
    const xInViewBox = (x / rect.width) * this.canvasWidth;
    const yInViewBox = (y / rect.height) * this.canvasHeight;

    return { x: +xInViewBox.toFixed(1), y: +yInViewBox.toFixed(1) };
  }

  public onChangeShapeToDraw() {
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

  public getColorWithAlpha(formControlName: string): string {
    const color = this.shapePainter.options.controls[formControlName].value;
    const alpha = this.shapePainter.options.controls[`${formControlName}Alpha`].value;
    return addAlphaToColor(color, alpha);
  }

  public onUpdateBackgroundImage(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    this.backgroundImageFile = inputEl.files![0];

    const imageBg = document.createElementNS('http://www.w3.org/2000/svg', 'image') as SVGImageElement;

    imageBg.setAttribute('x', '0');
    imageBg.setAttribute('y', '0');
    imageBg.setAttribute('width', `${this.canvasWidth}`);
    imageBg.setAttribute('height', `${this.canvasHeight}`);
    imageBg.setAttribute('href', URL.createObjectURL(this.backgroundImageFile));
    this.canvas.append(imageBg);
  }

  public downloadSvg() {
    // convert the svg element to string
    const svgString = new XMLSerializer().serializeToString(this.canvas);
    var textFileAsBlob = new Blob([svgString], { type: 'text/plain' });

    // download the file with the svg string
    var downloadLink = document.createElement('a');
    // TODO allow to set custom name
    downloadLink.download = 'jaimeelingeniero-creador-de-iconos-svg.svg';
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    downloadLink.click();
  }

  public downloadPng() {
    const svgString = new XMLSerializer().serializeToString(this.canvas);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;
      ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);

      const enlace = document.createElement('a');
      enlace.href = canvas.toDataURL('image/png');
      // TODO allow to set custom name
      enlace.download = 'jaimeelingeniero-creador-de-iconos-svg.png';
      enlace.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
  }

  public getAsFormArray(form: AbstractControl): FormArray {
    return form as FormArray;
  }
}
