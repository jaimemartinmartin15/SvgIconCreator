import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, ElementsRefService, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ShapeListService } from '../../../services/shape-list.service';
import { BurgerSvgComponent } from '../../../svg-output/burger.component';
import { IconsSvgModule } from '../../../svg-output/icons-svg.module';
import { PlusSvgComponent } from '../../../svg-output/plus.component';

enum ExportTypes {
  SvgOptimized,
  Svg,
  Png,
}

@Component({
  selector: 'app-export-svg',
  templateUrl: './export-svg.component.html',
  styleUrls: ['./export-svg.component.scss'],
  imports: [ReactiveFormsModule, CollapsibleModule, IconsSvgModule, InputNumberDirective, CdkDrag, CdkDragHandle, PlusSvgComponent, BurgerSvgComponent],
})
export class ExportSvgComponent {
  @ViewChild('exportSvgDialog')
  public exportSvgDialogElRef: ElementRef<HTMLDialogElement>;

  public ExportTypes = ExportTypes;
  public DEFAULT_DOWNLOAD_FILE_NAME = 'mi_svg';
  public exportSvgForm = new FormGroup({
    fileName: new FormControl('', { nonNullable: true }),
    format: new FormControl(ExportTypes.SvgOptimized, { nonNullable: true }),
    pngSize: new FormGroup({
      width: new FormControl(100, { nonNullable: true }),
      height: new FormControl(100, { nonNullable: true }),
    }),
  });

  private get canvas(): SVGSVGElement {
    return this.elementsRefService.getNativeElement('canvas');
  }

  public constructor(
    private readonly elementsRefService: ElementsRefService,
    private readonly shapeListService: ShapeListService,
  ) {}

  public showDialog() {
    this.exportSvgDialogElRef.nativeElement.showModal();
    if (this.shapeListService.selectedShape) {
      this.shapeListService.selectedShape.isShapeFinished = true;
      this.shapeListService.selectedShape.createEditPoints();
    }
  }

  public downloadDrawing(): void {
    const format = this.exportSvgForm.controls.format.value;
    if (format === ExportTypes.SvgOptimized) return this.downloadOptimizedSvg();
    if (format === ExportTypes.Svg) return this.downloadSvg();
    if (format === ExportTypes.Png) return this.downloadPng();
  }

  public downloadOptimizedSvg() {
    // create a svg string from shapeList
    const svgVb = this.canvas.viewBox.baseVal;
    const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgVb.x} ${svgVb.y} ${svgVb.width} ${svgVb.height}">
  ${this.shapeListService.shapeList
    .map((sp) => sp.parseOptimizedString())
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
    this.shapeListService.selectedShape?.clearEditPoints();

    // convert the svg element to string (remove the background image)
    let svgString = new XMLSerializer().serializeToString(this.canvas);
    if (svgString.includes('<image ')) {
      // the first closing (/>) is always the image
      svgString = svgString.slice(0, svgString.indexOf('<image ')) + svgString.slice(svgString.indexOf('/>') + 2);
    }

    // download the file
    const downloadLink = document.createElement('a');
    downloadLink.download = this.parseDownloadFileName('svg');
    const svgFileAsBlob = new Blob([svgString], { type: 'text/plain' });
    downloadLink.href = window.webkitURL.createObjectURL(svgFileAsBlob);
    downloadLink.click();

    // after it is exported, select the shape again
    this.shapeListService.selectedShape?.createEditPoints();
  }

  public downloadPng() {
    // avoid exporting circles of selected shape
    this.shapeListService.selectedShape?.clearEditPoints();

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
      canvas.width = this.exportSvgForm.controls['pngSize'].controls['width'].value ?? 0;
      canvas.height = this.exportSvgForm.controls['pngSize'].controls['height'].value ?? 0;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = this.parseDownloadFileName('png');
      downloadLink.click();

      // after it is exported, select the shape again
      this.shapeListService.selectedShape?.createEditPoints();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
  }

  private parseDownloadFileName(extension: 'svg' | 'png'): string {
    const enteredFileName = this.exportSvgForm.controls.fileName.value;
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
