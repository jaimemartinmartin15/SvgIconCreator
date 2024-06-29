import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CirclePainter } from './painters/circle.painter';
import { CubicBezierPainter } from './painters/cubic-bezier.painter';
import { LinePainter } from './painters/line.painter';
import { PathPainter } from './painters/path.painter';
import { RectPainter } from './painters/rect.painter';
import { ShapePainter } from './painters/shape.painter';
import { TextPainter } from './painters/text.painter';
import { Shape } from './shapes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  public canvasWidth = 100;
  public canvasHeight = 100;

  public Shape = Shape;
  public selectedShape: Shape = Shape.RECT;
  public shapePainter: ShapePainter = new RectPainter();
  public selectedShapePainter?: ShapePainter;
  public shapeList: ShapePainter[] = [];

  @ViewChild('canvas')
  private canvasRef: ElementRef<SVGElement>;
  private get canvas() {
    return this.canvasRef.nativeElement;
  }

  public ngAfterViewInit(): void {
    // default aspect ration 1:1
    this.canvas.setAttribute('viewBox', `0 0 ${this.canvasWidth} ${this.canvasHeight}`);

    this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
  }

  @HostListener('document:keypress', ['$event'])
  public onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'KeyF') {
      // finish path to start a new one
      if (this.shapePainter instanceof PathPainter) {
        this.shapePainter.setPathCompleted();
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

  public onChangeShape() {
    this.shapePainter = this.instantiateShapePainter();
  }

  private instantiateShapePainter(): ShapePainter {
    switch (this.selectedShape) {
      case Shape.LINE:
        return (this.shapePainter = new LinePainter());
      case Shape.PATH:
        return (this.shapePainter = new PathPainter());
      case Shape.CIRCLE:
        return (this.shapePainter = new CirclePainter());
      case Shape.TEXT:
        return (this.shapePainter = new TextPainter());
      case Shape.CUBIC_BEZIER:
        return (this.shapePainter = new CubicBezierPainter());
      case Shape.RECT:
      default:
        return (this.shapePainter = new RectPainter());
    }
  }

  private onPointerDown(e: PointerEvent) {
    if (this.selectedShapePainter) {
      this.selectedShapePainter.onMouseDownEdit(this.getCoordsInViewBox(e));
      return;
    }

    if (this.shapePainter.isShapeCompleted()) {
      // if the shape before is completed, create a new one
      this.shapePainter = this.instantiateShapePainter();
      this.shapeList.push(this.shapePainter);
    }

    if (!this.shapePainter.isShapeStarted()) {
      this.shapePainter.addToCanvas(this.canvas);
    }

    if (!this.shapeList.includes(this.shapePainter)) {
      this.shapeList.push(this.shapePainter);
    }

    this.shapePainter.onMouseDown(this.getCoordsInViewBox(e));
  }

  private onPointerMove(e: PointerEvent) {
    if (this.selectedShapePainter) {
      this.selectedShapePainter.onMouseMoveEdit(this.getCoordsInViewBox(e));
      return;
    }
    this.shapePainter.onMouseMove(this.getCoordsInViewBox(e));
  }

  private onPointerUp(e: PointerEvent) {
    if (this.selectedShapePainter) {
      this.selectedShapePainter.onMouseUpEdit(this.getCoordsInViewBox(e));
      return;
    }
    this.shapePainter.onMouseUp(this.getCoordsInViewBox(e));
  }

  public selectShapePainter(shapePainter: ShapePainter) {
    if (this.selectedShapePainter) {
      this.selectedShapePainter.setShapeSelected(false);
    }

    if (this.selectedShapePainter === shapePainter) {
      this.selectedShapePainter = undefined;
    } else {
      this.selectedShapePainter = shapePainter;
      this.shapePainter = shapePainter;
      this.selectedShapePainter.setShapeSelected(true);
    }
  }

  public onUpdateBackgroundImage(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    const file = inputEl.files![0];

    const imageBg = document.createElementNS('http://www.w3.org/2000/svg', 'image') as SVGImageElement;

    imageBg.setAttribute('x', '0');
    imageBg.setAttribute('y', '0');
    imageBg.setAttribute('width', `${this.canvasWidth}`);
    imageBg.setAttribute('height', `${this.canvasHeight}`);
    imageBg.setAttribute('href', URL.createObjectURL(file));
    this.canvas.append(imageBg);
  }

  public onChangeCanvasSize() {
    this.canvas.setAttribute('viewBox', `0 0 ${this.canvasWidth} ${this.canvasHeight}`);

    const parentCssWidth = this.canvas.parentElement!.clientWidth;
    let aspRat = parentCssWidth / this.canvasWidth;
    if (aspRat * this.canvasHeight > window.innerHeight) {
      aspRat = window.innerHeight / this.canvasHeight;
    }
    this.canvas.style.width = `${aspRat * this.canvasWidth}px`;
    this.canvas.style.height = `${aspRat * this.canvasHeight}px`;
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

  public downloadImage() {
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
}
