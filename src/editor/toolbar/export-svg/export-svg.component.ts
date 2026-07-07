import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, ElementsRefService, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { ShapeListService } from '../../../services/shape-list.service';
import { BurgerSvgComponent } from '../../../svg-output/burger.component';
import { IconsSvgModule } from '../../../svg-output/icons-svg.module';
import { PlusSvgComponent } from '../../../svg-output/plus.component';

enum ExportTypes {
  Svg,
  Png,
}

@Component({
  selector: 'app-export-svg',
  templateUrl: './export-svg.component.html',
  styleUrls: ['./export-svg.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, CollapsibleModule, IconsSvgModule, InputNumberDirective, CdkDrag, CdkDragHandle, PlusSvgComponent, BurgerSvgComponent],
})
export class ExportSvgComponent {
  @ViewChild('exportSvgDialog')
  public exportSvgDialogElRef: ElementRef<HTMLDialogElement>;

  public ExportTypes = ExportTypes;
  public DEFAULT_DOWNLOAD_FILE_NAME = 'mi_svg';
  public PREDEFINED_SIZES: { name: `${number}x${number}`; selectedByDefault: boolean }[] = [
    { name: '16x16', selectedByDefault: true },
    { name: '32x32', selectedByDefault: true },
    { name: '48x48', selectedByDefault: false },
    { name: '96x96', selectedByDefault: true },
    { name: '144x144', selectedByDefault: true },
    { name: '180x180', selectedByDefault: false },
    { name: '192x192', selectedByDefault: false },
    { name: '194x194', selectedByDefault: true },
    { name: '512x512', selectedByDefault: false },
  ];
  public exportSvgForm = new FormGroup({
    fileName: new FormControl('', { nonNullable: true }),
    format: new FormControl(ExportTypes.Svg, { nonNullable: true }),
    pngSize: new FormGroup({
      width: new FormControl(100, { nonNullable: true }),
      height: new FormControl(100, { nonNullable: true }),
    }),
    predefinedSizes: new FormArray(this.PREDEFINED_SIZES.map((size) => new FormControl<boolean>(size.selectedByDefault, { nonNullable: true }))),
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
    if (format === ExportTypes.Svg) {
      this.downloadSvg();
    } else if (format === ExportTypes.Png) {
      this.downloadPng();
    }
  }

  public downloadSvg() {
    // create a svg string from shapeList
    const svgVb = this.canvas.viewBox.baseVal;
    const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgVb.x} ${svgVb.y} ${svgVb.width} ${svgVb.height}">
  ${this.shapeListService.shapeList.map((sp) => sp.parseShapeToString()).join('\n  ')}
</svg>`;

    // download the file
    const downloadLink = document.createElement('a');
    downloadLink.download = this.parseDownloadFileName('svg');
    const svgFileAsBlob = new Blob([svgTemplate], { type: 'text/plain' });
    downloadLink.href = window.webkitURL.createObjectURL(svgFileAsBlob);
    downloadLink.click();
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

  public downloadPredefinedSizes(): void {
    // no checkboxes selected
    if (this.exportSvgForm.controls.predefinedSizes.value.every((v) => v === false)) return;

    // avoid exporting circles of selected shape
    this.shapeListService.selectedShape?.clearEditPoints();

    // convert the svg element to string (remove the background image)
    let svgString = new XMLSerializer().serializeToString(this.canvas);
    if (svgString.includes('<image ')) {
      svgString = svgString.slice(0, svgString.indexOf('<image ')) + svgString.slice(svgString.indexOf('/>') + 2);
    }

    // create and image, and attach a listener to download ALL SIZES it when it is loaded
    const img = new Image();
    img.onload = () => {
      this.PREDEFINED_SIZES.forEach((size, i) => {
        if (!this.exportSvgForm.controls.predefinedSizes.value[i]) return;

        // load the image into a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = +size.name.split('x')[0];
        canvas.height = +size.name.split('x')[1];
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // download the file
        const downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = `favicon-${size.name}.png`;
        downloadLink.click();
      });

      // after images are exported, select the shape again (above loop is sync)
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
