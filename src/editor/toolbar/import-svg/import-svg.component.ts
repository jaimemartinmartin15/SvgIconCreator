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
import { ShapeHost } from '../../../shapes/shape-host';
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

    this.loadSvgShapesRecursively(svg.children, parentSvg);

    // close dialog after importing the svg file or text
    this.importSvgDialogElRef.nativeElement.close();
  }

  private loadSvgShapesRecursively(svgChildren: HTMLCollection, parent: SVGSVGElement | GroupHost): void {
    Array.from(svgChildren).forEach((svgShape) => {
      let shapeHost: ShapeHost;
      switch (svgShape.tagName) {
        case 'rect':
          shapeHost = new RectHost(this.elementsRefService, this.formsService, this.shapeListService);
          break;
        case 'line':
          shapeHost = new LineHost(this.elementsRefService, this.formsService, this.shapeListService);
          break;
        case 'path':
          shapeHost = new PathHost(this.elementsRefService, this.formsService, this.shapeListService);
          break;
        case 'circle':
          shapeHost = new CircleHost(this.elementsRefService, this.formsService, this.shapeListService);
          break;
        case 'text':
          shapeHost = new TextHost(this.elementsRefService, this.formsService, this.shapeListService);
          break;
        case 'g':
          shapeHost = new GroupHost(this.elementsRefService, this.formsService, this.shapeListService);
          break;
        default:
          console.error(`SVG with shapes of type ${svgShape.tagName} are not supported.`);
          return;
      }

      shapeHost.svg = svgShape as SVGSVGElement;
      shapeHost.isShapeFinished = true;

      if (parent instanceof SVGSVGElement) {
        parent.append(shapeHost.svg);
        this.shapeListService.shapeList.push(shapeHost);
      } else if (parent instanceof GroupHost) {
        parent.svg.append(shapeHost.svg);
        parent.shapes.push(shapeHost);
      }

      if (shapeHost instanceof GroupHost) {
        this.loadSvgShapesRecursively(shapeHost.svg.children, shapeHost);
      }
    });
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
