import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { CollapsibleModule, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';

@Component({
  selector: 'app-background-panel',
  standalone: true,
  imports: [CommonModule, CollapsibleModule],
  templateUrl: './background-panel.component.html',
  styleUrls: ['./background-panel.component.scss'],
})
export class BackgroundPanelComponent implements AfterViewInit {
  private canvas: SVGSVGElement;

  public backgroundImageFile?: File;
  private svgImage: SVGImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  private isImageVisible = true;

  public constructor(private readonly elementsRefService: ElementsRefService) {}

  public ngAfterViewInit() {
    this.canvas = this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  public onUpdateBackgroundImage(e: Event) {
    this.deleteBackground(); // remove previous background

    const inputEl = e.target as HTMLInputElement;

    this.backgroundImageFile = inputEl.files![0];

    if (!this.backgroundImageFile) {
      // if user cancels selection, it is undefined
      return;
    }

    this.svgImage.setAttribute('x', '0');
    this.svgImage.setAttribute('y', '0');
    this.svgImage.setAttribute('width', `${this.canvas.viewBox.baseVal.width}`);
    this.svgImage.setAttribute('height', `${this.canvas.viewBox.baseVal.height}`);
    this.svgImage.setAttribute('href', URL.createObjectURL(this.backgroundImageFile));

    if (this.isImageVisible) {
      this.canvas.prepend(this.svgImage);
    }
  }

  public deleteBackground(event?: Event) {
    event?.preventDefault();
    this.svgImage.remove();
    this.backgroundImageFile = undefined;
  }

  public showHideImage(event: Event) {
    this.isImageVisible = (event.target as any).checked;

    if (!this.backgroundImageFile) {
      return;
    }

    if (this.svgImage.parentElement !== null) {
      this.svgImage.remove();
    } else {
      this.canvas.prepend(this.svgImage);
    }
  }
}
