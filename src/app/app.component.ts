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
  public aspectRatioWidth = 1;
  public aspectRatioHeight = 1;

  @ViewChild('canvas')
  private canvasRef: ElementRef<HTMLCanvasElement>;
  private get canvas() {
    return this.canvasRef.nativeElement;
  }

  public ngAfterViewInit(): void {
    // default aspect ration 1:1
    this.canvas.height = this.canvas.width = 100;
  }

  public onUpdateBackgroundImage(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    let ctx = this.canvas.getContext('2d');
    let img = new Image();
    img.src = URL.createObjectURL(inputEl.files![0]);
    img.onload = () => {
      ctx!.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        this.aspectRatioWidth,
        this.aspectRatioHeight
      );
    };
  }

  public onChangeAspectRatio() {
    const parentCssWidth = this.canvas.parentElement!.clientWidth;
    let aspRat = parentCssWidth / this.aspectRatioWidth;
    if (aspRat * this.aspectRatioHeight > window.innerHeight) {
      aspRat = window.innerHeight / this.aspectRatioHeight;
    }
    this.canvas.style.width = `${aspRat * this.aspectRatioWidth}px`;
    this.canvas.style.height = `${aspRat * this.aspectRatioHeight}px`;
  }
}
