import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Coord, CoordWithDelta, ElementsRefService, ToFormType } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Command, COMMAND_SPECS, PathInstruction } from '../models/path.model';
import { Shape } from '../models/shape';
import { AppEventsService } from '../services/app-events.service';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { EDIT_POINT_COLORS, ShapeHost } from './shape-host';

const A_LENGTH = 7;

export class PathHost extends ShapeHost {
  //#region path host vars
  private drawingStep: number = 0;

  private pivotDragEditPoint: Coord;

  private _currentInstruction: PathInstruction = 'M';
  public get currentInstruction(): PathInstruction {
    return this._currentInstruction;
  }
  public set currentInstruction(instruction: PathInstruction) {
    if (this.isShapeFinished) return;

    this.drawingStep = 0;
    this._currentInstruction = instruction;
  }
  //#endregion

  public override readonly tag = Shape.PATH;
  public override svg: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  public constructor(elementsRefService: ElementsRefService, formsService: FormsService, shapeListService: ShapeListService) {
    super(elementsRefService, formsService, shapeListService);

    this.name = `path_${ShapeHost.shapeCounter++}`;
  }

  //#region mouse down
  public override mouseDown(coord: Coord): void {
    if (this.svg.parentElement === null) {
      this.shapeListService.addShapeToSelectedGroup(this);
    }

    if (this.drawingStep === 0) {
      // create a new command

      let coordToParameter = coord;
      if (this.isCurrentInstructionRelative) {
        const lastPosition = this.getAbsolutePathPositions().at(-1)!;
        coordToParameter = { x: coord.x - lastPosition.x, y: coord.y - lastPosition.y };
      }

      const commands = this.d;
      commands.push({ instruction: this.currentInstruction, parameters: COMMAND_SPECS[this.currentInstruction].defaultParams(coordToParameter) });

      if (['M', 'm'].includes(this.currentInstruction)) {
        // after M or m instructions, set other command by default
        // to start drawing on mouseDrag
        this.currentInstruction = 'L';
        commands.push({ instruction: this.currentInstruction, parameters: COMMAND_SPECS[this.currentInstruction].defaultParams(coordToParameter) });
      }

      this.resetDForm(this.composeCommands(commands));
      return;
    }

    // * bellow code only should run for C, c, S, s, Q, q

    // adapt corresponding parameters of last command
    this.mouseDrag(coord as CoordWithDelta);
  }
  //#endregion

  //#region mouse drag
  public override mouseDrag(coord: CoordWithDelta): void {
    let coordToParameter = coord as Coord;
    if (this.isCurrentInstructionRelative) {
      const lastPosition = this.getAbsolutePathPositions().at(-2)!;
      coordToParameter = { x: coord.x - lastPosition.x, y: coord.y - lastPosition.y };
    }

    // adapt corresponding parameter of last command
    const decomposed = this.decomposedCommands;
    const lastCommand = decomposed[decomposed.length - 1];

    const commandSpec = COMMAND_SPECS[lastCommand.instruction];

    if (['H', 'h'].includes(lastCommand.instruction)) {
      lastCommand.parameters[0] = coordToParameter.x;
    } else if (['V', 'v'].includes(lastCommand.instruction)) {
      lastCommand.parameters[0] = coordToParameter.y;
    } else {
      for (let i = this.drawingStep; i < commandSpec.drawingStepsIndexes.length; i++) {
        lastCommand.parameters[commandSpec.drawingStepsIndexes[i][0]] = coordToParameter.x;
        lastCommand.parameters[commandSpec.drawingStepsIndexes[i][1]] = coordToParameter.y;
      }
    }

    this.formsService.dForm.setValue(this.composeCommands(decomposed));
  }
  //#endregion

  //#region mouse up
  public override mouseUp(coord: CoordWithDelta): void {
    this.mouseDrag(coord);

    this.drawingStep++;
    if (this.drawingStep === COMMAND_SPECS[this.currentInstruction].drawingStepsIndexes.length) {
      this.drawingStep = 0;
    }
  }
  //#endregion

  //#region mouse move
  public override mouseMove(coord: Coord): void {
    super.mouseMove(coord);

    AppEventsService.mouseOverSvgEditPoint$.next(this.selectedEditPointIndex);
  }
  //#endregion

  //#region  mouse down edit
  public override mouseDownEdit(coord: Coord): void {
    super.mouseDownEdit(coord);

    if (this.selectedEditPointIndex !== -1) {
      // save the position of the coord in the form before starting to drag the edit point
      this.pivotDragEditPoint = this.getFormControlValueForEditPoint();
    }
  }
  //#endregion

  //#region mouse drag edit
  public override mouseDragEdit(coord: CoordWithDelta): void {
    const controls = this.getFormControlsForSelectedEditPointIndex();
    controls[0].setValue(this.pivotDragEditPoint.x + coord.dx);
    controls[1].setValue(this.pivotDragEditPoint.y + coord.dy);
  }
  //#endregion

  //#region edit point
  protected override getEditPointCoords(): Coord[] {
    // init with mock coord in case first command is relative: 'm', and remove it before return
    const coords: Coord[] = [{ x: 0, y: 0 }];

    const commands: Command[] = this.decomposedCommands;
    for (let c = 0; c < commands.length; c++) {
      const { instruction, parameters } = commands[c];
      const editPointCoords = COMMAND_SPECS[instruction].getEditPointPositions(parameters, coords.at(-1)!);
      coords.push(...editPointCoords);
    }

    coords.shift(); // remove the initial mock coord (0, 0)
    return coords;
  }

  public override updatePositionSvgEditPoints() {
    if (this.svgEditPoints.length === 0) return;

    this.getEditPointCoords().forEach((c, i) => {
      this.setSvgAttribute('cx', c.x, this.svgEditPoints[i]);
      this.setSvgAttribute('cy', c.y, this.svgEditPoints[i]);
    });
  }
  //#endregion

  //#region move shape
  public override moveShapeUp(amount: number): void {
    const decomposed = this.decomposedCommands;
    for (const command of decomposed) {
      COMMAND_SPECS[command.instruction].moveY(command.parameters, -amount);
    }

    this.d = this.composeCommands(decomposed);

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.d);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeRight(amount: number): void {
    const decomposed = this.decomposedCommands;
    for (const command of decomposed) {
      COMMAND_SPECS[command.instruction].moveX(command.parameters, amount);
    }

    this.d = this.composeCommands(decomposed);

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.d);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeDown(amount: number): void {
    const decomposed = this.decomposedCommands;
    for (const command of decomposed) {
      COMMAND_SPECS[command.instruction].moveY(command.parameters, amount);
    }

    this.d = this.composeCommands(decomposed);

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.d);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeLeft(amount: number): void {
    const decomposed = this.decomposedCommands;
    for (const command of decomposed) {
      COMMAND_SPECS[command.instruction].moveX(command.parameters, -amount);
    }

    this.d = this.composeCommands(decomposed);

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.d);
      this.updatePositionSvgEditPoints();
    }
  }
  //#endregion

  //#region svg form binding
  public override onCreatingNewShape(): void {
    this.stroke = this.formsService.strokeForm.value;
    this.fill = this.formsService.fillForm.value;
    this.strokeWidth = this.formsService.strokeWidthForm.value;
    this.strokeLinecap = this.formsService.strokeLinecapForm.value;
    this.strokeLinejoin = this.formsService.strokeLinejoinForm.value;
    this.strokeDasharray = this.formsService.strokeDasharrayForm.value;
    // This method is called when the shape is being created after another one
    // do not copy coordinates
    this.formsService.dForm.clear();
    this.d = [];
  }

  public override onEditingExistingShape(): void {
    this.formsService.strokeForm.setValue(this.stroke);
    this.formsService.fillForm.setValue(this.fill);
    this.formsService.strokeWidthForm.setValue(this.strokeWidth);
    this.formsService.strokeLinecapForm.setValue(this.strokeLinecap);
    this.formsService.strokeLinejoinForm.setValue(this.strokeLinejoin);
    this.formsService.strokeDasharrayForm.clear({ emitEvent: false });
    this.strokeDasharray.forEach((d) => this.formsService.strokeDasharrayForm.push(new FormControl<number>(d, { nonNullable: true })));
    // this method is called when an existing shape is selected
    // reset the dForm to show the coords of the selected path
    this.resetDForm(this.d);
  }
  //#endregion

  //#region export
  public override parseShapeToString(): string {
    let pathToString = '<path';

    pathToString += ` name="${this.name}"`;
    pathToString += ` d="${this.d.map((command) => `${command.instruction}${command.parameters.join(' ')}`).join('')}"`;
    pathToString += ` fill="${this.fill}"`;
    pathToString += ` stroke="${this.stroke}"`;
    pathToString += ` stroke-width="${this.strokeWidth}"`;
    pathToString += ` stroke-linecap="${this.strokeLinecap}"`;
    pathToString += ` stroke-linejoin="${this.strokeLinejoin}"`;
    pathToString += ` stroke-dasharray="${this.strokeDasharray}"`;
    pathToString += this.parseDataBindingAttributes();

    return `${pathToString} />`;
  }
  //#endregion

  //#region path host
  private getFormControlsForSelectedEditPointIndex(): [FormControl<number>, FormControl<number>] {
    const commandControls = this.formsService.dForm.controls;
    const mockFormControl = new FormControl<number>(0, { nonNullable: true });

    let counter = 0;
    for (let c = 0; c < commandControls.length; c++) {
      const instruction = commandControls[c].controls.instruction;
      const parameters = commandControls[c].controls.parameters;

      if (['M', 'm', 'L', 'l', 'C', 'c', 'S', 's', 'Q', 'q', 'T', 't'].includes(instruction.value)) {
        for (let i = 0; i < parameters.length; i += 2) {
          if (counter === this.selectedEditPointIndex) {
            return [parameters.controls[i], parameters.controls[i + 1]];
          } else {
            counter++;
          }
        }
        continue;
      }

      if (['H', 'h'].includes(instruction.value)) {
        for (let i = 0; i < parameters.length; i++) {
          if (counter === this.selectedEditPointIndex) {
            return [parameters.controls[i], mockFormControl];
          } else {
            counter++;
          }
        }
        continue;
      }

      if (['V', 'v'].includes(instruction.value)) {
        for (let i = 0; i < parameters.length; i++) {
          if (counter === this.selectedEditPointIndex) {
            return [mockFormControl, parameters.controls[i]];
          } else {
            counter++;
          }
        }
        continue;
      }

      if (['A', 'a'].includes(instruction.value)) {
        for (let i = 5; i < parameters.length; i += 7) {
          if (counter === this.selectedEditPointIndex) {
            return [parameters.controls[i], parameters.controls[i + 1]];
          } else {
            counter++;
          }
        }
        continue;
      }
    }

    return [mockFormControl, mockFormControl]; // should never return this
  }

  private getFormControlValueForEditPoint(): Coord {
    const controls = this.getFormControlsForSelectedEditPointIndex();
    return { x: controls[0].value, y: controls[1].value };
  }

  private get isCurrentInstructionRelative(): boolean {
    return this.currentInstruction === this.currentInstruction.toLowerCase();
  }

  public closePath() {
    if (this.formsService.dForm.controls.length === 0) return;
    if (['Z', 'z'].includes(this.formsService.dForm.controls.at(-1)!.value.instruction!)) return;
    this.formsService.dForm.push(this.createCommandFormWithParameters('Z', []));
    this.currentInstruction = 'M';
  }

  public createCommandFormWithParameters(instruction: PathInstruction, parameters: number[]): ToFormType<Command> {
    return new FormGroup({
      instruction: new FormControl(instruction, { nonNullable: true }) as ToFormType<PathInstruction>,
      parameters: new FormArray(parameters.map((v) => new FormControl(v, { nonNullable: true }))),
    });
  }

  public calculateSvgEditPointIndexForCommandAndControl(cmdi: number, parmi: number): number {
    const commands = this.d;

    let svgEditPointIndex = 0;
    let i = 0;

    // count edit points of previous commands
    while (i < cmdi) {
      if (['A', 'a'].includes(commands[i].instruction)) {
        svgEditPointIndex += commands[i].parameters.length / A_LENGTH;
      } else if (['H', 'h', 'V', 'v'].includes(commands[i].instruction)) {
        svgEditPointIndex += commands[i].parameters.length;
      } else {
        svgEditPointIndex += commands[i].parameters.length / 2;
      }
      i++;
    }

    // i is now the index of the command that contains the edit point to calculate the index

    if (['A', 'a'].includes(commands[i].instruction)) {
      return svgEditPointIndex + Math.floor(parmi / A_LENGTH);
    }

    if (['H', 'h', 'V', 'v'].includes(commands[i].instruction)) {
      // for H and V, each control (parmi) is a single edit point
      return svgEditPointIndex + parmi;
    }

    return (svgEditPointIndex += Math.floor(parmi / 2));
  }

  public highlightSvgEditPointAtIndex(index: number): void {
    // reset color of all points and highlight only the one for the control
    this.svgEditPoints.forEach((p) => p.setAttribute('stroke', EDIT_POINT_COLORS.STROKE_NORMAL));
    this.svgEditPoints[index]?.setAttribute('stroke', EDIT_POINT_COLORS.STROKE_HOVER_FORM);
  }

  private resetDForm(commands: Command[]): void {
    // clear the form array (without emiting valueChanges)
    this.formsService.dForm.clear({ emitEvent: false });

    // create new controls
    const newControls = commands.map((c) => this.createCommandFormWithParameters(c.instruction, c.parameters));

    // add the controls to the form array (without emiting valueChanges)
    newControls.forEach((c) => this.formsService.dForm.push(c, { emitEvent: false }));

    // trigger valueChanges form event
    this.formsService.dForm.updateValueAndValidity({ emitEvent: true });
  }

  private get decomposedCommands(): Command[] {
    const result: Command[] = [];
    const commands = this.d;

    for (const command of commands) {
      if (['Z', 'z'].includes(command.instruction)) {
        // Z does not iterate in the for loop because does not have parameters length
        result.push({ instruction: command.instruction, parameters: [] });
        continue;
      }

      const commandArity = COMMAND_SPECS[command.instruction].arity;
      for (let p = 0; p < command.parameters.length; p += commandArity) {
        result.push({
          instruction: command.instruction,
          parameters: command.parameters.slice(p, p + commandArity),
        });
      }
    }

    return result;
  }

  private composeCommands(commands: Command[]): Command[] {
    if (commands.length <= 1) return commands;

    const result: Command[] = [];

    let composedCommand: Command = commands[0];
    for (let c = 1; c < commands.length; c++) {
      if (commands[c].instruction === composedCommand.instruction) {
        composedCommand.parameters.push(...commands[c].parameters);
      } else {
        result.push(composedCommand);
        composedCommand = commands[c];
      }
    }

    result.push(composedCommand);

    return result;
  }

  public insertNewCommandAt(instruction: PathInstruction, parameters: number[], cmdi: number, parmi: number): void {
    const decomposed = this.decomposedCommands;
    const decomposedIndex = this.resolveDecomposedIndex(cmdi, parmi);
    const composed = this.composeCommands([...decomposed.slice(0, decomposedIndex), { instruction, parameters }, ...decomposed.slice(decomposedIndex)]);

    this.resetDForm(composed);
    if (this.isShapeFinished) {
      this.clearEditPoints();
      this.createEditPoints();
    }
  }

  public deleteDecomposedCommand(cmdi: number, parmi: number): void {
    const decomposedIndex = this.resolveDecomposedIndex(cmdi, parmi);
    const decomposed = this.decomposedCommands;
    decomposed.splice(decomposedIndex, 1);

    this.resetDForm(this.composeCommands(decomposed));
    this.clearEditPoints();
    this.createEditPoints();
  }

  public deleteComposedCommand(cmdi: number) {
    const commands = this.d;
    commands.splice(cmdi, 1);

    this.resetDForm(this.composeCommands(commands));

    this.clearEditPoints();
    this.createEditPoints();
  }

  private getAbsolutePathPositions(): Coord[] {
    const coords: Coord[] = [];

    const decomposed = this.decomposedCommands;
    let currentPosition: Coord = { x: 0, y: 0 };
    let lastMPosition: Coord = currentPosition;
    for (const command of decomposed) {
      if (['Z', 'z'].includes(command.instruction)) {
        currentPosition = lastMPosition;
        coords.push(currentPosition);
        continue;
      }

      const nextPosition = COMMAND_SPECS[command.instruction].getNewPositionAfterMove(command.parameters, currentPosition);
      coords.push(nextPosition);
      currentPosition = nextPosition;

      if (['M', 'm'].includes(command.instruction)) {
        lastMPosition = currentPosition;
      }
    }

    return coords;
  }

  public getPreviousPosition(cmdi: number, parmi: number): Coord {
    const absoluteCoords = this.getAbsolutePathPositions();
    const decomposedIndex = this.resolveDecomposedIndex(cmdi, parmi);
    return absoluteCoords[decomposedIndex - 1];
  }

  private resolveDecomposedIndex(cmdi: number, parmi: number): number {
    let offset = 0;
    const commands = this.d;
    for (let i = 0; i < cmdi; i++) {
      const arity = COMMAND_SPECS[commands[i].instruction].arity;
      if (arity === 0) {
        // Z or z instructions
        offset++;
      } else {
        offset += commands[i].parameters.length / arity;
      }
    }

    const arity = COMMAND_SPECS[commands[cmdi].instruction].arity;
    if (arity > 0 && parmi > 0) {
      offset += parmi / arity;
    }

    return offset;
  }
  //#endregion
}
