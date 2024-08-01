import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { CollapsibleModule, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';

@Component({
  selector: 'app-size-panel',
  standalone: true,
  imports: [CommonModule, CollapsibleModule],
  templateUrl: './size-panel.component.html',
  styleUrls: ['./size-panel.component.scss'],
})
export class SizePanelComponent implements AfterViewInit {
  private canvas: SVGSVGElement;

  public constructor(private readonly elementsRefService: ElementsRefService) {}

  public ngAfterViewInit() {
    this.canvas = this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  public onChangeViewBox({ event, property }: { event: Event; property: 'x' | 'y' | 'width' | 'height' }) {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    const viewBox = {
      x: this.canvas.viewBox.baseVal.x,
      y: this.canvas.viewBox.baseVal.y,
      width: this.canvas.viewBox.baseVal.width,
      height: this.canvas.viewBox.baseVal.height,
      [property]: newValue,
    };

    this.canvas.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    this.canvas.style.aspectRatio = `${viewBox.width} / ${viewBox.height}`;
  }
}
