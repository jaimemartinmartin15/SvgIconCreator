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
    // const inputEl = e.target as HTMLInputElement;
    // let ctx = this.canvas.getContext('2d');
    // let img = new Image();
    // img.src = URL.createObjectURL(inputEl.files![0]);
    // img.onload = () => {
    //   ctx!.drawImage(
    //     img,
    //     0,
    //     0,
    //     img.width,
    //     img.height,
    //     0,
    //     0,
    //     this.canvas.width,
    //     this.canvas.height
    //   );
    // };
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
