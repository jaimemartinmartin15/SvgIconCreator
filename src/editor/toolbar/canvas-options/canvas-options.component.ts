import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ElementRefDirective, ElementsRefService, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { debounceTime } from 'rxjs';
import { ViewBoxModel } from '../../../models/view-box.model';
import { FormsService } from '../../../services/forms.service';
import { IconsSvgModule } from '../../../svg-output/icons-svg.module';

@Component({
  selector: 'app-canvas-options',
  templateUrl: './canvas-options.component.html',
  styleUrls: ['./canvas-options.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, ElementRefDirective, IconsSvgModule, InputNumberDirective]
})
export class CanvasOptionsComponent implements OnInit {
  private svgImageEl: SVGImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  private isImageVisible = true;

  public constructor(
    private readonly elementsRefService: ElementsRefService,
    private readonly formsService: FormsService,
  ) { }

  public ngOnInit(): void {
    this.canvasOptionsViewBoxForm.valueChanges.pipe(debounceTime(200)).subscribe((v) => this.updateCanvasSize(v));
  }

  //#region getters
  public get canvasOptionsViewBoxForm() {
    return this.formsService.canvasOptionsViewBoxForm;
  }

  private get canvasEl(): SVGSVGElement {
    return this.elementsRefService.getNativeElement<SVGSVGElement>('canvas')
  }

  private get backgroundImageInputEl(): HTMLInputElement {
    return this.elementsRefService.getNativeElement<HTMLInputElement>('backgroundImageInputEl')
  }

  public get backgroundImageFile(): File | undefined {
    return this.backgroundImageInputEl?.files?.[0];
  }
  //#endregion

  //#region canvas
  private updateCanvasSize(v: Partial<ViewBoxModel>) {
    this.canvasEl.setAttribute('viewBox', `${v.x} ${v.y} ${v.width} ${v.height}`);
    this.canvasEl.style.aspectRatio = `${v.width} / ${v.height}`;
  }
  //#endregion

  //#region background image
  public onUpdateBackgroundImage() {
    if (!this.backgroundImageFile) {
      // if user cancels selection, it is undefined
      return;
    }

    this.svgImageEl.setAttribute('x', '0');
    this.svgImageEl.setAttribute('y', '0');
    this.svgImageEl.setAttribute('width', `${this.canvasEl.viewBox.baseVal.width}`);
    this.svgImageEl.setAttribute('height', `${this.canvasEl.viewBox.baseVal.height}`);
    this.svgImageEl.setAttribute('href', URL.createObjectURL(this.backgroundImageFile));

    if (this.isImageVisible) {
      this.canvasEl.prepend(this.svgImageEl);
    }
  }

  public deleteBackground() {
    this.backgroundImageInputEl.value = '';
    this.svgImageEl.setAttribute('href', '');
    this.svgImageEl.remove();
  }

  public toggleBackgroundImage() {
    this.isImageVisible = !this.isImageVisible;

    if (this.isImageVisible) {
      // add/show image
      this.canvasEl.prepend(this.svgImageEl);
    } else {
      // remove/hide image
      this.svgImageEl.remove();
    }
  }
  //#endregion
}
