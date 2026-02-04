import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerComponent, InputNumberDirective, ToFormType } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Command, COMMAND_SPECS, PATH_INSTRUCTIONS, PathInstruction } from '../../models/path.model';
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
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef,
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
  // TODO review all TODOs in the project and this section region path helpers
  public PATH_INSTRUCTIONS = PATH_INSTRUCTIONS;
  public COMMAND_ARITY: { [K in PathInstruction]: number } = Object.fromEntries(Object.entries(COMMAND_SPECS).map(([key, value]) => [key, value.arity])) as {
    [K in PathInstruction]: number;
  };
  public NUMBER_OF_PARAMETERS_PER_ROW: { [K in PathInstruction]: number } = Object.fromEntries(
    Object.entries(COMMAND_SPECS).map(([key, value]) => [key, value.parametersPerRow]),
  ) as {
    [K in PathInstruction]: number;
  };

  public indexOfCommandWithMouseOver = -1;
  private indexOfParamWithMouseOver = -1;

  public mouseOverInstruction = -1;

  public deleteComposedCommand(cmdi: number) {
    const pathHost = this.shapeListService.selectedShape;
    if (!(pathHost instanceof PathHost)) return;

    pathHost.deleteComposedCommand(cmdi);

    this.mouseOverInstruction = -1;

    this.overlayRef.detach();
  }

  public deleteDecomposedCommand(cmdi: number, parmi: number): void {
    const pathHost = this.shapeListService.selectedShape;
    if (!(pathHost instanceof PathHost)) return;

    pathHost.deleteDecomposedCommand(cmdi, parmi);
  }

  public addNewCommandInPosition(instruction: PathInstruction, cmdi: number, parmi: number) {
    const pathHost = this.shapeListService.selectedShape;
    if (!(pathHost instanceof PathHost)) return;

    this.overlayRef.detach();

    const previousPosition = pathHost.getPreviousPosition(cmdi, parmi);
    const parameters = COMMAND_SPECS[instruction].defaultParams(previousPosition);
    pathHost.insertNewCommandAt(instruction, parameters, cmdi, parmi);

    if (pathHost.isShapeFinished) {
      pathHost.clearEditPoints();
      pathHost.createEditPoints();
    }
  }

  public highlightInputPoint(cmdi: number, parmi: number): boolean {
    if (!(this.shapeListService.selectedShape instanceof PathHost)) return false;

    // if the mouse is over the svg edit point corresponding to the input, highlight it
    const svgEditPointIndex = this.shapeListService.selectedShape.calculateSvgEditPointIndexForCommandAndControl(cmdi, parmi);
    let mouseIsOverTheSvgEditPoint = this.svgEditPointIndexMouseOver === svgEditPointIndex;

    // if command is an arc, highlight only last two inputs
    if (this.shapeListService.selectedShape.d[cmdi].instruction.toLowerCase() === 'a') {
      mouseIsOverTheSvgEditPoint &&= parmi % 7 === 5 || parmi % 7 === 6;
    }

    const mouseIsOverTheCommand = this.indexOfCommandWithMouseOver === cmdi;

    // the mouse is over the input itself or the other coordinate ( x and y )
    let secondParmi = parmi;
    if (parmi % 2 === 0) {
      secondParmi++;
    } else {
      secondParmi--;
    }
    let mouseIsOverTheInput = this.indexOfParamWithMouseOver === parmi || this.indexOfParamWithMouseOver === secondParmi;

    // if command is an arc, highlight only last two inputs
    if (this.shapeListService.selectedShape.d[cmdi].instruction.toLowerCase() === 'a') {
      const initRowIndexParam = Math.floor(this.indexOfParamWithMouseOver / 7) * 7;
      mouseIsOverTheInput = initRowIndexParam + 5 === parmi || initRowIndexParam + 6 === parmi;
    }

    // if command is H or V, highlight only the input with the mouse over
    if (this.shapeListService.selectedShape.d[cmdi].instruction.toLowerCase() === 'h' || this.shapeListService.selectedShape.d[cmdi].instruction.toLowerCase() === 'v') {
      mouseIsOverTheInput = this.indexOfParamWithMouseOver === parmi;
    }

    return mouseIsOverTheSvgEditPoint || (mouseIsOverTheCommand && mouseIsOverTheInput);
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

  public showDeleteButton(cmdi: number, parmi: number): boolean {
    const instruction = this.formsService.dForm.controls[cmdi].controls.instruction.value;
    const arity = COMMAND_SPECS[instruction].arity;
    const initRowIndexParam = Math.floor(this.indexOfParamWithMouseOver / arity) * arity;
    const mouseIsOverTheSegment = initRowIndexParam + arity - 1 === parmi;

    return this.indexOfCommandWithMouseOver === cmdi && mouseIsOverTheSegment;
  }

  public convertoToRelative(cmdi: number): void {
    // TODO decide if shape should keep looking the same
    const commandControl: ToFormType<Command> = this.formsService.dForm.controls[cmdi];
    const instruction = commandControl.controls.instruction.value.toLowerCase();
    commandControl.controls.instruction.setValue(instruction as never); // TODO fix this in the library

    this.overlayRef.detach();
  }

  public convertoToAbsolute(cmdi: number): void {
    // TODO decide if shape should keep looking the same
    const commandControl: ToFormType<Command> = this.formsService.dForm.controls[cmdi];
    const instruction = commandControl.controls.instruction.value.toUpperCase();
    commandControl.controls.instruction.setValue(instruction as never); // TODO fix this in the library

    this.overlayRef.detach();
  }

  private overlayRef: OverlayRef;

  @ViewChild('commandOptionsMenuTpl')
  public commandOptionsMenuTpl: TemplateRef<{ instruction: PathInstruction; cmdi: number }>;

  public showCommandOptionsMenu(event: MouseEvent, cmdi: number, instruction: PathInstruction) {
    const element = event.target as HTMLElement;
    this.overlayRef?.detach();

    const config: OverlayConfig = new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(element)
        .withPositions([{ originX: 'center', originY: 'center', overlayX: 'start', overlayY: 'center' }]),
    });

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.overlayRef.detach();
      }
    });
    const portal = new TemplatePortal(this.commandOptionsMenuTpl, this.viewContainerRef, { cmdi, instruction });

    this.overlayRef.attach(portal);
  }

  @ViewChild('newCommandMenuTpl')
  public newCommandMenuTpl: TemplateRef<{ instruction: PathInstruction; cmdi: number; parmi: number }>;

  public showNewCommandMenu(event: MouseEvent, cmdi: number, parmi: number) {
    const element = event.target as HTMLElement;
    this.overlayRef?.detach();

    const config: OverlayConfig = new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(element)
        .withPositions([{ originX: 'center', originY: 'center', overlayX: 'start', overlayY: 'center' }]),
    });

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.overlayRef.detach();
      }
    });
    const portal = new TemplatePortal(this.newCommandMenuTpl, this.viewContainerRef, { cmdi, instruction: 'A', parmi });

    this.overlayRef.attach(portal);
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
