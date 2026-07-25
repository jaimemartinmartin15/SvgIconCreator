import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
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

interface DownloablePng {
  width: number;
  height: number;
  fileName: string;
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
      this.downloadSinglePng();
    }
  }

  public downloadPredefinedSizes(): void {
    // no checkboxes selected
    if (this.exportSvgForm.controls.predefinedSizes.value.every((v) => v === false)) return;

    const pngListToDownload: DownloablePng[] = this.PREDEFINED_SIZES.filter((_, i) => this.exportSvgForm.controls.predefinedSizes.value[i]).map((size) => ({
      width: +size.name.split('x')[0],
      height: +size.name.split('x')[1],
      fileName: `${this.parseDownloadFileName('png').replaceAll(/\.png$/g, '')}${size.name}.png`,
    }));
    this.downloadPngs(pngListToDownload);
  }

  private downloadSvg() {
    // create a svg string from shapeList
    const svgVb = this.canvas.viewBox.baseVal;
    const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgVb.x} ${svgVb.y} ${svgVb.width} ${svgVb.height}">
${this.shapeListService.shapeList.map((sp) => sp.parseShapeToString(1, 2)).join('\n')}
</svg>`;

    // download the file
    const downloadLink = document.createElement('a');
    downloadLink.download = this.parseDownloadFileName('svg');
    const svgFileAsBlob = new Blob([svgTemplate], { type: 'text/plain' });
    downloadLink.href = window.webkitURL.createObjectURL(svgFileAsBlob);
    downloadLink.click();
  }

  private downloadSinglePng() {
    const pngToDownload: DownloablePng = {
      width: this.exportSvgForm.controls['pngSize'].controls['width'].value,
      height: this.exportSvgForm.controls['pngSize'].controls['height'].value,
      fileName: this.parseDownloadFileName('png'),
    };
    this.downloadPngs([pngToDownload]);
  }

  private downloadPngs(pngListToDownload: DownloablePng[]): void {
    // avoid exporting circles of selected shape
    this.shapeListService.selectedShape?.clearEditPoints();

    // avoid exporting lines of grid
    const gridLines = this.canvas.querySelectorAll('.grid-line');
    gridLines.forEach((gridLine) => gridLine.remove());

    // convert the svg element to string (remove the background image)
    let svgString = new XMLSerializer().serializeToString(this.canvas);
    if (svgString.includes('<image ')) {
      // Note: the '<image />' is always the first child, thus first index of '/>' corresponds always to the self-closing image tag
      svgString = svgString.slice(0, svgString.indexOf('<image ')) + svgString.slice(svgString.indexOf('/>') + 2);
    }

    // create and image, and attach a listener to download ALL SIZES it when it is loaded
    const img = new Image();
    img.onload = () => {
      pngListToDownload.forEach((pngToDownload) => {
        // load the image into a canvas of the requested size
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = pngToDownload.width;
        canvas.height = pngToDownload.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // download the file
        const downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = pngToDownload.fileName;
        downloadLink.click();
      });

      // after images are exported, select the shape again (above loop is sync)
      this.shapeListService.selectedShape?.createEditPoints();

      // and show the grid lines back
      gridLines.forEach((gridLine) => this.canvas.append(gridLine));
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
