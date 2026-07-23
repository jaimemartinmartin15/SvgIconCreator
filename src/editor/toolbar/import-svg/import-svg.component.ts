import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { FormsService } from '../../../services/forms.service';
import { ShapeListService } from '../../../services/shape-list.service';
import { CircleHost } from '../../../shapes/circle-host';
import { GroupHost } from '../../../shapes/group-host';
import { LineHost } from '../../../shapes/line-host';
import { PathHost } from '../../../shapes/path-host';
import { RectHost } from '../../../shapes/rect-host';
import { TextHost } from '../../../shapes/text-host';
import { BurgerSvgComponent } from '../../../svg-output/burger.component';
import { IconsSvgModule } from '../../../svg-output/icons-svg.module';
import { PlusSvgComponent } from '../../../svg-output/plus.component';

@Component({
  selector: 'app-import-svg',
  templateUrl: './import-svg.component.html',
  styleUrls: ['./import-svg.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, IconsSvgModule, PlusSvgComponent, BurgerSvgComponent, CdkDrag, CdkDragHandle],
})
export class ImportSvgComponent {
  @ViewChild('importSvgDialog')
  public importSvgDialogElRef: ElementRef<HTMLDialogElement>;

  public readonly createNewGroupForm = new FormControl<boolean>(false, { nonNullable: true });

  public loadedFile?: File;

  public constructor(
    private readonly elementsRefService: ElementsRefService,
    private readonly shapeListService: ShapeListService,
    private readonly formsService: FormsService,
  ) {}

  private get canvas(): SVGSVGElement {
    return this.elementsRefService.getNativeElement('canvas');
  }

  public showDialog() {
    this.importSvgDialogElRef.nativeElement.showModal();
    if (this.shapeListService.selectedShape) {
      this.shapeListService.selectedShape.isShapeFinished = true;
      this.shapeListService.selectedShape.createEditPoints();
    }
  }

  public loadSvgText(svgText: string) {
    if (!svgText.includes('<svg')) {
      alert('No es posible cargar el svg. Asegúrate que es válido.');
      this.loadedFile = undefined;
      return;
    }

    const mockDiv = document.createElement('div');
    mockDiv.innerHTML = svgText;
    const svg: SVGSVGElement = mockDiv.querySelector('svg') as SVGSVGElement;

    // TODO update viewBox to fit all shapes
    if (this.shapeListService.shapeList.length === 0) {
      const viewBox = svg.viewBox.baseVal;
      this.formsService.canvasOptionsViewBoxForm.setValue({
        x: viewBox.x,
        y: viewBox.y,
        width: viewBox.width,
        height: viewBox.height,
      });
    }

    let parentSvg: SVGSVGElement | GroupHost;
    if (this.createNewGroupForm.value) {
      const groupHost = new GroupHost(this.elementsRefService, this.formsService, this.shapeListService);
      this.canvas.append(groupHost.svg);
      this.shapeListService.shapeList.push(groupHost);
      parentSvg = groupHost;
    } else {
      parentSvg = this.canvas;
    }

    Array.from(svg.children).forEach((svgShape) => {
      switch (svgShape.tagName) {
        case 'rect':
          const rectHost = new RectHost(this.elementsRefService, this.formsService, this.shapeListService);
          rectHost.loadFromElementIntoParent(svgShape as SVGRectElement, parentSvg);
          break;
        case 'line':
          const lineHost = new LineHost(this.elementsRefService, this.formsService, this.shapeListService);
          lineHost.loadFromElementIntoParent(svgShape as SVGLineElement, parentSvg);
          break;
        case 'path':
          const pathHost = new PathHost(this.elementsRefService, this.formsService, this.shapeListService);
          pathHost.loadFromElementIntoParent(svgShape as SVGPathElement, parentSvg);
          break;
        case 'circle':
          const circleHost = new CircleHost(this.elementsRefService, this.formsService, this.shapeListService);
          circleHost.loadFromElementIntoParent(svgShape as SVGCircleElement, parentSvg);
          break;
        case 'text':
          const textHost = new TextHost(this.elementsRefService, this.formsService, this.shapeListService);
          textHost.loadFromElementIntoParent(svgShape as SVGTextElement, parentSvg);
          break;
        case 'g':
          const groupHost = new GroupHost(this.elementsRefService, this.formsService, this.shapeListService);
          groupHost.loadFromElementIntoParent(svgShape as SVGGElement, parentSvg);
          break;
      }
    });

    // close dialog after importing the svg file or text
    this.importSvgDialogElRef.nativeElement.close();
  }

  public loadFile(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    this.loadedFile = inputEl.files![0];
    if (!this.loadedFile) return; // after pressing cancel

    const reader = new FileReader();
    reader.onload = (evt) => this.loadSvgText(evt.target?.result as string);
    reader.onerror = () => (this.loadedFile = undefined);
    reader.readAsText(this.loadedFile, 'UTF-8');
  }
}
