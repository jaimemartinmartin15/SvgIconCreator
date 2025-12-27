import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerComponent, InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Command } from '../../models/path.model';
import { Shape } from '../../models/shape';
import { AppEventsService } from '../../services/app-events.service';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { CircleHost } from '../../shapes/circle-host';
import { LineHost } from '../../shapes/line-host';
import { PathHost } from '../../shapes/path-host';
import { RectHost } from '../../shapes/rect-host';
import { TextHost } from '../../shapes/text-host';
import { BurgerSvgComponent } from '../../svg-output/burger.component';
import { PlusSvgComponent } from '../../svg-output/plus.component';
import { TrashCanSvgComponent } from '../../svg-output/trash-can.component';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss'],
  imports: [
    CommonModule,
    ColorPickerComponent,
    ReactiveFormsModule,
    InputNumberDirective,
    TrashCanSvgComponent,
    CdkDrag,
    CdkDragHandle,
    PlusSvgComponent,
    BurgerSvgComponent,
  ],
})
export class AttributesComponent implements OnInit {
  private svgEditPointIndexMouseOver: number = -1;
  public colorPickerForm: FormControl<string>;
  public isUsingEyeDropper: boolean = false;

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
    this.formsService.fontFamilyForm.valueChanges.subscribe((value) => {
      if (this.shapeListService.selectedShape) {
        this.shapeListService.selectedShape.fontFamily = value;
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

    AppEventsService.mouseOverSvgEditPoint$.subscribe((index) => {
      this.svgEditPointIndexMouseOver = index;
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
  public indexOfCommandWithMouseOver = -1;
  private indexOfParamWithMouseOver = -1;

  public deleteCommand(i: number, e: MouseEvent) {
    e.stopPropagation();
    this.formsService.dForm.removeAt(i);
  }

  public highlightInputPoint(cmdi: number, parmi: number): boolean {
    if (!(this.shapeListService.selectedShape instanceof PathHost)) return false;

    // if the mouse is over the svg edit point corresponding to the input, highlight it
    const svgEditPointIndex = this.shapeListService.selectedShape.calculateSvgEditPointIndexForCommandAndControl(cmdi, parmi);
    let mouseIsOverTheSvgEditPoint = this.svgEditPointIndexMouseOver === svgEditPointIndex;

    // if command is an arc, highlight only last two inputs
    if (this.shapeListService.selectedShape.d[cmdi].instruction.toLowerCase() === 'a') {
      mouseIsOverTheSvgEditPoint &&= parmi === 5 || parmi === 6;
    }

    let mouseIsOverTheInput = this.indexOfCommandWithMouseOver === cmdi;

    // the mouse is over the input itself or the other coordinate ( x and y )
    let secondParmi = parmi;
    if (parmi % 2 === 0) {
      secondParmi++;
    } else {
      secondParmi--;
    }
    mouseIsOverTheInput &&= this.indexOfParamWithMouseOver === parmi || this.indexOfParamWithMouseOver === secondParmi;

    // if command is an arc, highlight only last two inputs
    if (this.indexOfCommandWithMouseOver === cmdi && this.shapeListService.selectedShape.d[cmdi].instruction.toLowerCase() === 'a') {
      mouseIsOverTheInput = parmi === 5 || parmi === 6;
    }

    // if command is H or V, highlight only the input with the mouse over
    if (this.shapeListService.selectedShape.d[cmdi].instruction.toLowerCase() === 'h' || this.shapeListService.selectedShape.d[cmdi].instruction.toLowerCase() === 'v') {
      mouseIsOverTheInput &&= this.indexOfParamWithMouseOver === parmi;
    }

    return mouseIsOverTheSvgEditPoint || mouseIsOverTheInput;
  }

  public mouseEnterInputPoint(cmdi: number, parmi: number) {
    if (!(this.shapeListService.selectedShape instanceof PathHost)) return;
    this.indexOfParamWithMouseOver = parmi;
    const index = this.shapeListService.selectedShape.calculateSvgEditPointIndexForCommandAndControl(cmdi, parmi);
    this.shapeListService.selectedShape.highlightSvgEditPointAtIndex(index);
  }

  public mouseLeaveInputPoint() {
    if (!(this.shapeListService.selectedShape instanceof PathHost)) return;
    this.indexOfParamWithMouseOver = -1;
    // this methods resets all svg edit points before highligting the selected one
    this.shapeListService.selectedShape.highlightSvgEditPointAtIndex(-1);
  }
  //#endregion

  //#region text helpers
  public FONTS_LIST = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Trebuchet MS', 'Tahoma', 'Courier New', 'Comic Sans MS', 'Lucida Sans Unicode'];
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
