import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  public canvasWidth = 100;
  public canvasHeight = 100;

  public selectedShape: string = 'rect';

  @ViewChild('canvas')
  private canvasRef: ElementRef<SVGElement>;
  private get canvas() {
    return this.canvasRef.nativeElement;
  }

  public ngAfterViewInit(): void {
    // default aspect ration 1:1
    this.canvas.setAttribute('viewBox', ' 0 0 100 100');
  }

  public onUpdateBackgroundImage(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    const file = inputEl.files![0];

    const imageBg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'image'
    ) as SVGImageElement;

    imageBg.setAttribute('x', '0');
    imageBg.setAttribute('y', '0');
    imageBg.setAttribute('width', `${this.canvasWidth}`);
    imageBg.setAttribute('height', `${this.canvasHeight}`);
    imageBg.setAttribute('href', URL.createObjectURL(file));
    this.canvas.append(imageBg);
  }

  public onChangeCanvasSize() {
    this.canvas.setAttribute(
      'viewBox',
      `0 0 ${this.canvasWidth} ${this.canvasHeight}`
    );

    const parentCssWidth = this.canvas.parentElement!.clientWidth;
    let aspRat = parentCssWidth / this.canvasWidth;
    if (aspRat * this.canvasHeight > window.innerHeight) {
      aspRat = window.innerHeight / this.canvasHeight;
    }
    this.canvas.style.width = `${aspRat * this.canvasWidth}px`;
    this.canvas.style.height = `${aspRat * this.canvasHeight}px`;
  }
}
