import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CollapsibleModule, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { FormsService } from '../../../services/forms.service';
import { ShapeListService } from '../../../services/shape-list.service';
import { CircleHost } from '../../../shapes/circle-host';
import { LineHost } from '../../../shapes/line-host';
import { PathHost } from '../../../shapes/path-host';
import { RectHost } from '../../../shapes/rect-host';
import { TextHost } from '../../../shapes/text-host';
import { IconsSvgModule } from '../../../svg-output/icons-svg.module';

@Component({
  selector: 'app-import-svg',
  templateUrl: './import-svg.component.html',
  styleUrls: ['./import-svg.component.scss'],
  imports: [CommonModule, CollapsibleModule, IconsSvgModule],
})
export class ImportSvgComponent {
  public loadedFile?: File;

  private get canvas(): SVGSVGElement {
    return this.elementsRefService.getNativeElement('canvas');
  }

  public constructor(
    private readonly elementsRefService: ElementsRefService,
    private readonly shapeListService: ShapeListService,
    private readonly formsService: FormsService,
  ) {}

  public loadSvgText(svgText: string) {
    if (!svgText.includes('svg')) return;

    const mockDiv = document.createElement('div');
    mockDiv.innerHTML = svgText;
    const svg: SVGSVGElement = mockDiv.querySelector('svg') as SVGSVGElement;

    // update viewBox size
    const viewBox = svg.viewBox.baseVal;
    this.formsService.canvasOptionsViewBoxForm.setValue({
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height,
    });

    Array.from(svg.children).forEach((svgShape) => {
      switch (svgShape.tagName) {
        case 'rect':
          const rectHost = new RectHost(this.elementsRefService, this.shapeListService);
          rectHost.loadFromElement(svgShape as SVGRectElement);
          break;
        case 'line':
          const lineHost = new LineHost(this.elementsRefService, this.shapeListService);
          lineHost.loadFromElement(svgShape as SVGLineElement);
          break;
        case 'path':
          const pathHost = new PathHost(this.elementsRefService, this.shapeListService);
          pathHost.loadFromElement(svgShape as SVGPathElement);
          break;
        case 'circle':
          const circleHost = new CircleHost(this.elementsRefService, this.shapeListService);
          circleHost.loadFromElement(svgShape as SVGCircleElement);
          break;
        case 'text':
          const textHost = new TextHost(this.elementsRefService, this.shapeListService);
          textHost.loadFromElement(svgShape as SVGTextElement);
          break;
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
