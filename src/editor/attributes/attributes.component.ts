import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerComponent, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Command } from '../../models/path.model';
import { Shape } from '../../models/shape';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { CircleHost } from '../../shapes/circle-host';
import { LineHost } from '../../shapes/line-host';
import { PathHost } from '../../shapes/path-host';
import { RectHost } from '../../shapes/rect-host';
import { TextHost } from '../../shapes/text-host';
import { TrashCanSvgComponent } from '../../svg-output/trash-can.component';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss'],
  imports: [ColorPickerComponent, ReactiveFormsModule, InputNumberDirective, TrashCanSvgComponent],
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
    this.formsService.strokeLinecapForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.strokeLinecap = value;
      }
    });
    this.formsService.strokeLinejoinForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.strokeLinejoin = value;
      }
    });
    this.formsService.strokeDasharrayForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.strokeDasharray = value;
      }
    });
    this.formsService.xForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.x = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.yForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.y = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.widthForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.width = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.heightForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.height = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
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
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.y1Form.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.y1 = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.x2Form.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.x2 = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.y2Form.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.y2 = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.dForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.d = value as Command[];
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.cxForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.cx = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.cyForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.cy = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
      }
    });
    this.formsService.rForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.r = value;
        this.shapeListService.selectedShape.updatePositionSvgEditPoints();
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
        // it is creating a new shape, set the current form values to the svg attributes to imitate last used shape
        selectedShape.onCreatingNewShape();
        return;
      }

      if (selectedShape && selectedShape.isShapeFinished) {
        // it is editing an existing shape, set the values of the svg attributes in the form
        selectedShape.onEditingExistingShape();
        return;
      }
    });
  }

  //#region color helpers
  public showColorPickerDialog(dialog: HTMLDialogElement, attribute: 'stroke' | 'fill') {
    this.colorPickerForm = attribute === 'stroke' ? this.formsService.strokeForm : this.formsService.fillForm;
    dialog.showModal();
    // because the modal was hidden, the color picker component cannot place handlers
    // in correct positions until a new value is set
    this.colorPickerForm.setValue(this.colorPickerForm.value);
  }
  //#endregion

  //#region stroke dasharray
  public addNewStrokeDasharray() {
    this.formsService.strokeDasharrayForm.push(new FormControl<number>(0, { nonNullable: true }));
  }

  public deleteStrokeDasharray(index: number) {
    this.formsService.strokeDasharrayForm.removeAt(index);
  }
  //#endregion

  //#region path helpers
  public mouseHoverIndex = -1;

  public deleteCommand(i: number, e: MouseEvent) {
    e.stopPropagation();
    this.formsService.dForm.removeAt(i);
  }
  //#endregion

  //#region shape selector helper
  public get shapeSelectorIsRect(): boolean {
    return this.formsService.shapeSelectorForm.value === Shape.RECT && !this.shapeListService.selectedShape;
  }

  public get shapeSelectorIsLine(): boolean {
    return this.formsService.shapeSelectorForm.value === Shape.LINE && !this.shapeListService.selectedShape;
  }

  public get shapeSelectorIsPath(): boolean {
    return this.formsService.shapeSelectorForm.value === Shape.PATH && !this.shapeListService.selectedShape;
  }

  public get shapeSelectorIsCircle(): boolean {
    return this.formsService.shapeSelectorForm.value === Shape.CIRCLE && !this.shapeListService.selectedShape;
  }

  public get shapeSelectorIsText(): boolean {
    return this.formsService.shapeSelectorForm.value === Shape.TEXT && !this.shapeListService.selectedShape;
  }
  //#endregion

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
