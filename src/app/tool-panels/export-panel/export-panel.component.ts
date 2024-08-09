import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, ColorPickerComponent, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ShapePainter } from '../../painters/shape.painter';

enum ExportTypes {
  SvgOptimized,
  Svg,
  Png,
}

@Component({
  selector: 'app-export-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule, ColorPickerComponent],
  templateUrl: './export-panel.component.html',
  styleUrls: ['./export-panel.component.scss'],
})
export class ExportPanelComponent {
  private canvas: SVGSVGElement;

  public ExportTypes = ExportTypes;
  public DEFAULT_DOWNLOAD_FILE_NAME = 'mi_dibujo';
  public exportPanelForm = new FormGroup({
    fileName: new FormControl(),
    format: new FormControl(ExportTypes.SvgOptimized),
    pngSize: new FormGroup({
      width: new FormControl(100),
      height: new FormControl(100),
    }),
  });

  @Input()
  public shapeList: ShapePainter[];

  public constructor(private readonly elementsRefService: ElementsRefService) {}

  public ngAfterViewInit() {
    this.canvas = this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  public downloadDrawing(): void {
    const format = this.exportPanelForm.controls['format'].value;
    if (format === ExportTypes.SvgOptimized) return this.downloadOptimizedSvg();
    if (format === ExportTypes.Svg) return this.downloadSvg();
    if (format === ExportTypes.Png) return this.downloadPng();
  }

  public downloadOptimizedSvg() {
    // create a svg string from shapeList
    const svgVb = this.canvas.viewBox.baseVal;
    let svgTemplate = `<svg viewBox="${svgVb.x} ${svgVb.y} ${svgVb.width} ${svgVb.height}">
  ${this.shapeList
    .map((sp) => sp.parseAsString())
    .filter((s) => s !== '')
    .join('\n  ')}
</svg>`;

    // download the file
    const downloadLink = document.createElement('a');
    downloadLink.download = this.parseDownloadFileName('svg');
    const svgFileAsBlob = new Blob([svgTemplate], { type: 'text/plain' });
    downloadLink.href = window.webkitURL.createObjectURL(svgFileAsBlob);
    downloadLink.click();
  }

  public downloadSvg() {
    // avoid exporting circles of selected shape
    const selectedShape = this.shapeList.find((sp) => sp.isShapeSelected());
    selectedShape?.setShapeSelected(false);

    // convert the svg element to string (remove the background image)
    let svgString = new XMLSerializer().serializeToString(this.canvas);
    if (svgString.includes('<image ')) {
      svgString = svgString.slice(0, svgString.indexOf('<image ')) + svgString.slice(svgString.indexOf('/>') + 2);
    }

    // download the file
    const downloadLink = document.createElement('a');
    downloadLink.download = this.parseDownloadFileName('svg');
    const svgFileAsBlob = new Blob([svgString], { type: 'text/plain' });
    downloadLink.href = window.webkitURL.createObjectURL(svgFileAsBlob);
    downloadLink.click();

    // after it is exported, select the shape again
    selectedShape?.setShapeSelected(true);
  }

  public downloadPng() {
    // avoid exporting circles of selected shape
    const selectedShape = this.shapeList.find((sp) => sp.isShapeSelected());
    selectedShape?.setShapeSelected(false);

    // convert the svg element to string (remove the background image)
    let svgString = new XMLSerializer().serializeToString(this.canvas);
    if (svgString.includes('<image ')) {
      svgString = svgString.slice(0, svgString.indexOf('<image ')) + svgString.slice(svgString.indexOf('/>') + 2);
    }

    // create and image, and attach a listener to download it when it is loaded
    const img = new Image();
    img.onload = () => {
      // load the image into a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = this.exportPanelForm.controls['pngSize'].controls['width'].value ?? 0;
      canvas.height = this.exportPanelForm.controls['pngSize'].controls['height'].value ?? 0;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = this.parseDownloadFileName('png');
      downloadLink.click();

      // after it is exported, select the shape again
      selectedShape?.setShapeSelected(true);
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
  }

  private parseDownloadFileName(extension: 'svg' | 'png'): string {
    const enteredFileName = this.exportPanelForm.controls['fileName'].value;
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
