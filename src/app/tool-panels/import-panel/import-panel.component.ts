import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CollapsibleModule, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { CirclePainter } from '../../painters/circle.painter';
import { LinePainter } from '../../painters/line.painter';
import { PathPainter } from '../../painters/path.painter';
import { RectPainter } from '../../painters/rect.painter';
import { ShapePainter } from '../../painters/shape.painter';
import { TextPainter } from '../../painters/text.painter';

@Component({
  selector: 'app-import-panel',
  standalone: true,
  imports: [CommonModule, CollapsibleModule],
  templateUrl: './import-panel.component.html',
  styleUrls: ['./import-panel.component.scss'],
})
export class ImportPanelComponent {
  private canvas: SVGSVGElement;
  public loadedFile?: File;

  @Input()
  public shapeList: ShapePainter[];

  public constructor(private readonly elementsRefService: ElementsRefService) {}

  public ngAfterViewInit() {
    this.canvas = this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  public loadSvgText(svgText: string) {
    const mockDiv = document.createElement('div');
    mockDiv.innerHTML = svgText;

    const svg: SVGSVGElement = mockDiv.querySelector('svg') as SVGSVGElement;
    const viewBox = svg.viewBox.baseVal;
    this.canvas.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    this.canvas.style.aspectRatio = `${viewBox.width} / ${viewBox.height}`;

    Array.from(svg.children).forEach((shape) => {
      this.canvas.append(shape);
      switch (shape.tagName) {
        case 'rect':
          const rectPainter = new RectPainter(this.canvas);
          rectPainter.loadFromElement(shape as SVGRectElement);
          this.shapeList.push(rectPainter);
          break;
        case 'line':
          const linePainter = new LinePainter(this.canvas);
          linePainter.loadFromElement(shape as SVGLineElement);
          this.shapeList.push(linePainter);
          break;
        case 'path':
          const pathPainter = new PathPainter(this.canvas);
          pathPainter.loadFromElement(shape as SVGPathElement);
          this.shapeList.push(pathPainter);
          break;
        case 'circle':
          const circlePainter = new CirclePainter(this.canvas);
          circlePainter.loadFromElement(shape as SVGCircleElement);
          this.shapeList.push(circlePainter);
          break;
        case 'text':
          const textPainter = new TextPainter(this.canvas);
          textPainter.loadFromElement(shape as SVGTextElement);
          this.shapeList.push(textPainter);
          break;
      }
    });
  }

  public loadFile(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    this.loadedFile = inputEl.files![0];

    const reader = new FileReader();
    reader.readAsText(this.loadedFile, 'UTF-8');
    reader.onload = (evt) => this.loadSvgText(evt.target?.result as string);
    reader.onerror = () => (this.loadedFile = undefined);
  }
}
