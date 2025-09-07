import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerComponent as JeiColorPickerComponent } from "@jaimemartinmartin15/jei-devkit-angular-shared";
import { Subject, takeUntil } from 'rxjs';
import { ShapeListService } from '../../../services/shape-list.service';

@Component({
  selector: 'app-attribute-color-picker',
  templateUrl: './attribute-color-picker.component.html',
  styleUrls: ['./attribute-color-picker.component.scss'],
  imports: [JeiColorPickerComponent, ReactiveFormsModule]
})
export class AttributeColorPickerComponent implements OnInit {
  @ViewChild('label') label: ElementRef<HTMLSpanElement>;

  @Input()
  public attribute: 'stroke' | 'fill';

  @Input()
  public initialColor: string = '#000000ff';

  private readonly fallbackFormControl = new FormControl<string>(this.initialColor);

  private otherShapeIsSelected$ = new Subject<void>();

  public constructor(private readonly shapeListService: ShapeListService) { }

  public ngOnInit(): void {
    this.fallbackFormControl.setValue(this.initialColor);

    this.shapeListService.selectedShape$.subscribe((shapeHost) => {
      // end subscription to previous shape form
      this.otherShapeIsSelected$.next();

      if (!shapeHost) return;

      // listen to changes for next shape
      shapeHost.form.controls[this.attribute].valueChanges
        .pipe(takeUntil(this.otherShapeIsSelected$))
        .subscribe((v) => (this.fallbackFormControl.setValue(v)));

      if (!shapeHost.isShapeFinished) {
        // if it changes the shape and it is not finised (it is a new one), set last used colors in colorpicker
        shapeHost.form.controls[this.attribute].setValue(this.fallbackFormControl.value);
      } else {
        // if it selects another existing shape, set fallback form value so next shape picks colors of the existing one
        this.fallbackFormControl.setValue(shapeHost.form.controls[this.attribute].value);
      }
    })
  }

  public get form(): FormControl<string> {
    return (this.shapeListService.selectedShape?.form.controls[this.attribute] as FormControl<string>) ?? this.fallbackFormControl;
  }

  public showModal(dialog: HTMLDialogElement) {
    dialog.showModal()
    // because the modal was hidden, the color picker component can't place handlers 
    // in correct positions until a new value is set
    this.form.setValue(this.form.value)
  }

  public get positionDialog() {
    if (!this.label) return {};

    const label = this.label.nativeElement;

    return {
      margin: 0,
      marginLeft: `${label.offsetLeft + label.clientWidth / 2}px`,
      marginTop: `${label.offsetTop + label.clientHeight}px`,
      transform: 'translate(-50%, 10px)'
    };
  }
}
