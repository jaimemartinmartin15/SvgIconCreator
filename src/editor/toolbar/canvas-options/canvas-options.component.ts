import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ElementRefDirective, ElementsRefService, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { debounceTime, filter } from 'rxjs';
import { ViewBoxModel } from '../../../models/view-box.model';
import { AppEventsService } from '../../../services/app-events.service';
import { FormsService } from '../../../services/forms.service';
import { KeyboardService } from '../../../services/keyboard.service';
import { ShapeListService } from '../../../services/shape-list.service';
import { BurgerSvgComponent } from '../../../svg-output/burger.component';
import { IconsSvgModule } from '../../../svg-output/icons-svg.module';
import { PlusSvgComponent } from '../../../svg-output/plus.component';

@Component({
  selector: 'app-canvas-options',
  templateUrl: './canvas-options.component.html',
  styleUrls: ['./canvas-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, ElementRefDirective, IconsSvgModule, InputNumberDirective, CdkDrag, CdkDragHandle, PlusSvgComponent, BurgerSvgComponent],
})
export class CanvasOptionsComponent implements OnInit {
  @ViewChild('canvasOptionsDialog')
  public canvasOptionsDialogElRef: ElementRef<HTMLDialogElement>;

  private svgImageEl: SVGImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  private isImageVisible = true;

  public constructor(
    private readonly elementsRefService: ElementsRefService,
    private readonly shapeListService: ShapeListService,
    private readonly formsService: FormsService,
    private readonly keyboardService: KeyboardService,
  ) {}

  public showDialog() {
    this.canvasOptionsDialogElRef.nativeElement.showModal();
    if (this.shapeListService.selectedShape) {
      this.shapeListService.selectedShape.isShapeFinished = true;
      this.shapeListService.selectedShape.createEditPoints();
    }
  }

  public ngOnInit(): void {
    this.canvasOptionsViewBoxForm.valueChanges.pipe(debounceTime(200)).subscribe((v) => {
      this.updateCanvasSize(v);
      this.updateGridLines();
    });
    this.showGridForm.valueChanges.subscribe((v) => this.toggleGrid(v));
    AppEventsService.viewboxUpdated$.subscribe(() => this.updateGridLines());
    this.keyboardService.windowKeyUp$
      .pipe(
        filter((e) => {
          const isToggleGridKey = e.key.toUpperCase() === 'G';
          const isTypingInsideInputElement = e.target instanceof HTMLInputElement;
          const isTypingInsideTextAreaElement = e.target instanceof HTMLTextAreaElement;
          return isToggleGridKey && !isTypingInsideInputElement && !isTypingInsideTextAreaElement;
        }),
      )
      .subscribe(() => this.showGridForm.setValue(!this.showGridForm.value));
  }

  //#region getters
  public get canvasOptionsViewBoxForm() {
    return this.formsService.canvasOptionsViewBoxForm;
  }

  public get showGridForm() {
    return this.formsService.showGridForm;
  }

  private get canvasEl(): SVGSVGElement {
    return this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');
  }

  private get backgroundImageInputEl(): HTMLInputElement {
    return this.elementsRefService.getNativeElement<HTMLInputElement>('backgroundImageInputEl');
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

  //#region grid
  private createGridLine(x1: number, y1: number, x2: number, y2: number): void {
    const viewBox = this.canvasEl.viewBox.baseVal as ViewBoxModel;
    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.classList.add('grid-line');
    vLine.setAttribute('stroke', 'gray');
    vLine.setAttribute('stroke-width', `${(Math.max(viewBox.width, viewBox.height) / 100) * 0.05}`);
    vLine.setAttribute('x1', `${x1}`);
    vLine.setAttribute('y1', `${y1}`);
    vLine.setAttribute('x2', `${x2}`);
    vLine.setAttribute('y2', `${y2}`);
    this.canvasEl.append(vLine);
  }

  private toggleGrid(isVisible: boolean): void {
    if (!isVisible) {
      this.canvasEl.querySelectorAll('.grid-line').forEach((gridLine) => gridLine.remove());
      return;
    }

    this.paintGridLines();
  }

  private paintGridLines(): void {
    const viewBox = this.canvasEl.viewBox.baseVal as ViewBoxModel;
    const biggest = Math.max(viewBox.width, viewBox.height);
    const interval = 10 ** Math.floor(Math.log10(biggest) - 1);

    // add vertical lines
    for (let i = Math.ceil(viewBox.x / interval) * interval; i < viewBox.x + viewBox.width; i += interval) {
      this.createGridLine(i, viewBox.y, i, viewBox.y + viewBox.height);
    }
    // add horizontal lines
    for (let i = Math.ceil(viewBox.y / interval) * interval; i < viewBox.y + viewBox.height; i += interval) {
      this.createGridLine(viewBox.x, i, viewBox.x + viewBox.width, i);
    }
  }

  private updateGridLines(): void {
    if (!this.showGridForm.value) return;

    // remove all lines to paint them again
    this.canvasEl.querySelectorAll('.grid-line').forEach((gridLine) => gridLine.remove());
    this.paintGridLines();
  }
  //#endregion
}
