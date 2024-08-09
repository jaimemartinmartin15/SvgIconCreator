import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleModule, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-size-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleModule],
  templateUrl: './size-panel.component.html',
  styleUrls: ['./size-panel.component.scss'],
})
export class SizePanelComponent implements OnInit, AfterViewInit {
  private canvas: SVGSVGElement;
  public viewBoxForm = new FormGroup({
    x: new FormControl(0),
    y: new FormControl(0),
    width: new FormControl(100),
    height: new FormControl(100),
  });

  public constructor(private readonly elementsRefService: ElementsRefService) {}

  public ngOnInit(): void {
    this.viewBoxForm.valueChanges.pipe(debounceTime(200)).subscribe((v) => {
      // ensure they are valid numbers (input[type="number"] allows values like -1- or --1 -> v.property = null)
      v.x = +(v.x ?? 0);
      v.y = +(v.y ?? 0);
      v.width = Math.abs(+(v.width ?? 0));
      v.height = Math.abs(+(v.height ?? 0));
      this.viewBoxForm.setValue(v as Required<typeof v>, { emitEvent: false });

      this.canvas.setAttribute('viewBox', `${v.x} ${v.y} ${v.width} ${v.height}`);
      this.canvas.style.aspectRatio = `${v.width} / ${v.height}`;
    });
  }

  public ngAfterViewInit() {
    this.canvas = this.elementsRefService.getNativeElement<SVGSVGElement>('canvas');

    // check if the viewBox changes when importing a file
    const viewBoxObserver = new MutationObserver(() => {
      const viewBox = this.canvas.viewBox.baseVal;
      this.viewBoxForm.setValue({ x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height }, { emitEvent: false });
    });
    viewBoxObserver.observe(this.canvas, { attributeFilter: ['viewBox'] });
  }
}
