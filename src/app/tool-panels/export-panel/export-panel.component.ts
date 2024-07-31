import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, ColorPickerComponent, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ShapePainter } from '../../painters/shape.painter';

@Component({
  selector: 'app-export-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, ColorPickerComponent],
  templateUrl: './export-panel.component.html',
  styleUrls: ['./export-panel.component.scss'],
})
export class ExportPanelComponent {
  private canvas: SVGSVGElement;

  public DEFAULT_DOWNLOAD_FILE_NAME = 'nombre_del_archivo';
  public downloadFileNameForm = new FormGroup({
    optimizedSvg: new FormControl(),
    svg: new FormControl(),
    png: new FormControl(),
  });

  @Input()
  public shapeList: ShapePainter[];

  public constructor(private readonly elementsRefService: ElementsRefService) {}

  public ngAfterViewInit() {
    this.canvas = this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  public downloadOptimizedSvg() {
    // create a svg string from shapeList
    const svgVb = this.canvas.viewBox.baseVal;
    let svgTemplate = `<svg viewBox="${svgVb.x} ${svgVb.y} ${svgVb.width} ${svgVb.height}">
  ${this.shapeList
    .map((sp) => sp.asString())
    .filter((s) => s !== '')
    .join('\n  ')}
</svg>`;

    // download the file
    var downloadLink = document.createElement('a');
    downloadLink.download = this.parseDownloadFileName('optimizedSvg', 'svg');
    var svgFileAsBlob = new Blob([svgTemplate], { type: 'text/plain' });
    downloadLink.href = window.webkitURL.createObjectURL(svgFileAsBlob);
    downloadLink.click();
  }

  public downloadSvg() {
    // convert the svg element to string
    const svgString = new XMLSerializer().serializeToString(this.canvas);

    // download the file
    var downloadLink = document.createElement('a');
    downloadLink.download = this.parseDownloadFileName('svg', 'svg');
    var svgFileAsBlob = new Blob([svgString], { type: 'text/plain' });
    downloadLink.href = window.webkitURL.createObjectURL(svgFileAsBlob);
    downloadLink.click();
  }

  public downloadPng() {
    // convert the svg element to string
    const svgString = new XMLSerializer().serializeToString(this.canvas);

    // create and image, and attach a listener to download it when it is loaded
    const img = new Image();
    img.onload = () => {
      // load the image into a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = this.canvas.viewBox.baseVal.width;
      canvas.height = this.canvas.viewBox.baseVal.height;
      ctx.drawImage(img, 0, 0, this.canvas.viewBox.baseVal.width, this.canvas.viewBox.baseVal.height);

      // download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = this.parseDownloadFileName('png', 'png');
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
  }

  private parseDownloadFileName(controlName: 'optimizedSvg' | 'svg' | 'png', extension: 'svg' | 'png'): string {
    const enteredFileName = this.downloadFileNameForm.controls[controlName].value;
    let downloadFileName;
    if (!enteredFileName || enteredFileName === `.${extension}`) {
      downloadFileName = `${this.DEFAULT_DOWNLOAD_FILE_NAME}.${extension}`;
    } else if (enteredFileName?.endsWith(`.${extension}`)) {
      downloadFileName = enteredFileName;
    } else {
      downloadFileName = `${enteredFileName}.${extension}`;
    }
    return downloadFileName;
  }
}
