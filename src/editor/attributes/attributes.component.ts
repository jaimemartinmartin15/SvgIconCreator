import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerComponent, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../../models/shape';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { CircleHost } from '../../shapes/circle-host';
import { LineHost } from '../../shapes/line-host';
import { PathHost } from '../../shapes/path-host';
import { RectHost } from '../../shapes/rect-host';
import { TextHost } from '../../shapes/text-host';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss'],
  imports: [ColorPickerComponent, ReactiveFormsModule, InputNumberDirective],
})
export class AttributesComponent implements OnInit {
  public colorPickerForm: FormControl<string>;

  constructor(
    public readonly shapeListService: ShapeListService,
    public readonly formsService: FormsService,
  ) {
    this.colorPickerForm = this.formsService.strokeForm;
  }

  public ngOnInit(): void {
    //#region form listeners
    this.formsService.strokeForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.stroke = value;
      }
    });
    this.formsService.fillForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.fill = value;
      }
    });
    this.formsService.strokeWidthForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.strokeWidth = value;
      }
    });
    this.formsService.xForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.x = value;
      }
    });
    this.formsService.yForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.y = value;
      }
    });
    this.formsService.widthForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.width = value;
      }
    });
    this.formsService.heightForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.height = value;
      }
    });
    this.formsService.rxForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.rx = value;
      }
    });
    this.formsService.ryForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.ry = value;
      }
    });
    this.formsService.x1Form.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.x1 = value;
      }
    });
    this.formsService.y1Form.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.y1 = value;
      }
    });
    this.formsService.x2Form.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.x2 = value;
      }
    });
    this.formsService.y2Form.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.y2 = value;
      }
    });
    // TODO subscribe path form
    // this.formsService.dForm.valueChanges.subscribe((value) => { ...TODO... })
    this.formsService.cxForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.cx = value;
      }
    });
    this.formsService.cyForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.cy = value;
      }
    });
    this.formsService.rForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.r = value;
      }
    });
    this.formsService.textForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.text = value;
      }
    });
    this.formsService.fontSizeForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.fontSize = value;
      }
    });
    //#endregion

    this.shapeListService.selectedShape$.subscribe((selectedShape) => {
      if (selectedShape && !selectedShape.isShapeFinished) {
        // it is creating a new shape
        selectedShape.setSvgAttributesWithSvgAttributeForms();
        return;
      }

      if (selectedShape && selectedShape.isShapeFinished) {
        // it is editing an existing shape
        selectedShape.setSvgAttributeFormsWithSvgAttributes();
        return;
      }
    });
  }

  public showColorPickerDialog(dialog: HTMLDialogElement, attribute: 'stroke' | 'fill') {
    this.colorPickerForm = attribute === 'stroke' ? this.formsService.strokeForm : this.formsService.fillForm;
    dialog.showModal();
    // because the modal was hidden, the color picker component cannot place handlers
    // in correct positions until a new value is set
    this.colorPickerForm.setValue(this.colorPickerForm.value);
  }

  public get shapeSelectorIsLine(): boolean {
    return this.formsService.shapeSelectorForm.value === Shape.LINE;
  }

  //#region type of shape
  get selectedShapeIsRect(): boolean {
    return this.shapeListService.selectedShape instanceof RectHost;
  }

  get selectedShapeIsLine(): boolean {
    return this.shapeListService.selectedShape instanceof LineHost;
  }

  get selectedShapeIsPath(): boolean {
    return this.shapeListService.selectedShape instanceof PathHost;
  }

  get selectedShapeIsCircle(): boolean {
    return this.shapeListService.selectedShape instanceof CircleHost;
  }

  get selectedShapeIsText(): boolean {
    return this.shapeListService.selectedShape instanceof TextHost;
  }
  //#endregion
}
