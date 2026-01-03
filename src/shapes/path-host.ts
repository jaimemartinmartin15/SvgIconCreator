import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Coord, CoordWithDelta, ElementsRefService, ToFormType } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Command, PathInstruction } from '../models/path.model';
import { Shape } from '../models/shape';
import { AppEventsService } from '../services/app-events.service';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { EDIT_POINT_COLORS, ShapeHost } from './shape-host';

const C_LENGTH = 6;
const S_Q_LENGTH = 4;

export class PathHost extends ShapeHost {
  //#region path host vars
  private parameterToEditIndex: number = -1;

  private pivotDragEditPoint: Coord;

  private _currentCommand: PathInstruction = 'M';
  public get currentCommand(): PathInstruction {
    return this._currentCommand;
  }
  public set currentCommand(command: PathInstruction) {
    if (this._currentCommand !== command) {
      this.parameterToEditIndex = -1;
    }
    this._currentCommand = command;
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
      this.canvas.append(this.svg);
    }

    if (['M', 'm'].includes(this.currentCommand)) {
      // Note: in the standard it is possible to have multiple coords for M or m commands, but I only support one coord.
      //       That is why it changes to L automatically. It allows to draw a line on first mouse down and mouse up.
      // TODO: allow to choose default instruction after M or m instructions (tip: remove return in this block?)

      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord) : coord;

      this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [c.x, c.y]));
      this.currentCommand = 'L';
      this.formsService.dForm.push(this.createCommandFormWithParameters('L', [coord.x, coord.y]));
      return;
    }

    if (['L', 'l', 'T', 't'].includes(this.currentCommand)) {
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord) : coord;

      if (this.isLastCommandInstructionTheSame(this.currentCommand)) {
        this.lastCommandControl.controls.parameters.push([new FormControl(c.x, { nonNullable: true }), new FormControl(c.y, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [c.x, c.y]));
      }
      return;
    }

    if (['H', 'h'].includes(this.currentCommand)) {
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord) : coord;

      if (this.isLastCommandInstructionTheSame(this.currentCommand)) {
        this.lastCommandControl.controls.parameters.push([new FormControl(c.x, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [c.x]));
      }
      return;
    }

    if (['V', 'v'].includes(this.currentCommand)) {
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord) : coord;

      if (this.isLastCommandInstructionTheSame(this.currentCommand)) {
        this.lastCommandControl.controls.parameters.push([new FormControl(c.y, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [c.y]));
      }
      return;
    }

    if (['C', 'c'].includes(this.currentCommand)) {
      if (this.parameterToEditIndex === -1 || (this.parameterToEditIndex - 4) % C_LENGTH === 0) {
        // create a new curve

        const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord) : coord;

        if (this.isLastCommandInstructionTheSame(this.currentCommand)) {
          this.lastCommandControl.controls.parameters.push([
            new FormControl(c.x, { nonNullable: true }),
            new FormControl(c.y, { nonNullable: true }),
            new FormControl(c.x, { nonNullable: true }),
            new FormControl(c.y, { nonNullable: true }),
            new FormControl(c.x, { nonNullable: true }),
            new FormControl(c.y, { nonNullable: true }),
          ]);
          // this.parameterToEditIndex is already set to start editing the end point of the new list of parameters (on mouse up)
        } else {
          this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [c.x, c.y, c.x, c.y, c.x, c.y]));
          this.parameterToEditIndex = 4; // first time, overrides the -1
        }
        return;
      }

      if ((this.parameterToEditIndex - 2) % C_LENGTH === 0 || (this.parameterToEditIndex - 4) % C_LENGTH === 0) {
        // set first and second edit point controls
        this.mouseDrag(coord as CoordWithDelta);
        return;
      }

      return; // should not happen
    }

    if (['S', 's', 'Q', 'q'].includes(this.currentCommand)) {
      if (this.parameterToEditIndex === -1 || (this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        // create a new curve

        const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord) : coord;

        if (this.isLastCommandInstructionTheSame(this.currentCommand)) {
          this.lastCommandControl.controls.parameters.push([
            new FormControl(c.x, { nonNullable: true }),
            new FormControl(c.y, { nonNullable: true }),
            new FormControl(c.x, { nonNullable: true }),
            new FormControl(c.y, { nonNullable: true }),
          ]);
          // this.parameterToEditIndex is already set to start editing the end point of the new list of parameters (on mouse up)
        } else {
          this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [c.x, c.y, c.x, c.y]));
          this.parameterToEditIndex = 2; // first time, overrides the -1
        }

        return;
      }

      if ((this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        // set first and second edit point controls
        this.mouseDrag(coord as CoordWithDelta);
        return;
      }

      return; // should not happen
    }

    if (['A', 'a'].includes(this.currentCommand)) {
      // TODO think a way to set a size with the mouse instead of 2 and 4 by default and using the forms
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord) : coord;

      if (this.isLastCommandInstructionTheSame(this.currentCommand)) {
        this.lastCommandControl.controls.parameters.push([
          new FormControl(2, { nonNullable: true }),
          new FormControl(4, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(c.x, { nonNullable: true }),
          new FormControl(c.y, { nonNullable: true }),
        ]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [2, 4, 0, 0, 0, c.x, c.y]));
      }
      return;
    }
  }
  //#endregion

  //#region mouse drag
  public override mouseDrag(coord: CoordWithDelta): void {
    const parameters = this.lastCommandControl.controls.parameters;

    if (['L', 'l', 'T', 't', 'A', 'a'].includes(this.currentCommand)) {
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord, 1) : coord;
      parameters.controls.at(-2)!.setValue(c.x);
      parameters.controls.at(-1)!.setValue(c.y);
      return;
    }

    if (['H', 'h'].includes(this.currentCommand)) {
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord, 1) : coord;
      parameters.controls.at(-1)!.setValue(c.x);
      return;
    }

    if (['V', 'v'].includes(this.currentCommand)) {
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord, 1) : coord;
      parameters.controls.at(-1)!.setValue(c.y);
      return;
    }

    if (['C', 'c'].includes(this.currentCommand)) {
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord, C_LENGTH / 2) : coord;

      if ((this.parameterToEditIndex - 4) % C_LENGTH === 0) {
        // dragging end of the curve
        parameters.controls[this.parameterToEditIndex - 4].setValue(c.x);
        parameters.controls[this.parameterToEditIndex - 3].setValue(c.y);
        parameters.controls[this.parameterToEditIndex - 2].setValue(c.x);
        parameters.controls[this.parameterToEditIndex - 1].setValue(c.y);
        parameters.controls[this.parameterToEditIndex + 0].setValue(c.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(c.y);
        return;
      }

      if (this.parameterToEditIndex % C_LENGTH === 0) {
        // dragging first edit point control
        parameters.controls[this.parameterToEditIndex + 0].setValue(c.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(c.y);
        parameters.controls[this.parameterToEditIndex + 2].setValue(c.x);
        parameters.controls[this.parameterToEditIndex + 3].setValue(c.y);
        return;
      }

      if ((this.parameterToEditIndex - 2) % C_LENGTH === 0) {
        // dragging second edit point control
        parameters.controls[this.parameterToEditIndex + 0].setValue(c.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(c.y);
        return;
      }
      return;
    }

    if (['S', 's', 'Q', 'q'].includes(this.currentCommand)) {
      const c = this.isRelativeInstruction(this.currentCommand) ? this.calculateRelativeCoord(coord, S_Q_LENGTH / 2) : coord;

      if ((this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        // dragging end of the curve
        parameters.controls[this.parameterToEditIndex - 2].setValue(c.x);
        parameters.controls[this.parameterToEditIndex - 1].setValue(c.y);
        parameters.controls[this.parameterToEditIndex + 0].setValue(c.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(c.y);
        return;
      }

      if (this.parameterToEditIndex % S_Q_LENGTH === 0) {
        // dragging the edit point control
        parameters.controls[this.parameterToEditIndex + 0].setValue(c.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(c.y);
        return;
      }

      return;
    }
  }
  //#endregion

  //#region mouse up
  public override mouseUp(coord: CoordWithDelta): void {
    this.mouseDrag(coord);

    if (['C', 'c'].includes(this.currentCommand)) {
      if ((this.parameterToEditIndex - 4) % C_LENGTH === 0) {
        // finish moving end of the curve (first click)
        // pass to move the first edit point control
        this.parameterToEditIndex -= 4;
        return;
      }
      if (this.parameterToEditIndex % C_LENGTH === 0) {
        // finish moving edit point 1 (second click)
        // pass to move the second edit point control
        this.parameterToEditIndex += 2;
        return;
      }
      if ((this.parameterToEditIndex - 2) % C_LENGTH === 0) {
        // finish moving edit point 2 (second click)
        // pass to move the (possible) next curve end point
        this.parameterToEditIndex += 8;
        return;
      }
    }

    if (['S', 's', 'Q', 'q'].includes(this.currentCommand)) {
      if ((this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        // finish moving end of the curve (first click)
        // pass to move the edit point control
        this.parameterToEditIndex -= 2;
        return;
      }
      if (this.parameterToEditIndex % S_Q_LENGTH === 0) {
        // finish moving edit point (second click)
        // pass to move the (possible) next curve end point
        this.parameterToEditIndex += 6;
        return;
      }
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
    const coords: Coord[] = [];
    const commands: Command[] = this.d;

    for (let c = 0; c < commands.length; c++) {
      const instruction = commands[c].instruction;
      const parameters = commands[c].parameters;

      if (['M', 'L', 'C', 'S', 'Q', 'T'].includes(instruction)) {
        for (let p = 0; p < parameters.length; p += 2) {
          coords.push({ x: parameters[p], y: parameters[p + 1] });
        }
        continue;
      }

      if (['m', 'l', 't'].includes(instruction)) {
        for (let p = 0; p < parameters.length; p += 2) {
          const lastCoord = coords.at(-1)!;
          coords.push({ x: lastCoord.x + parameters[p], y: lastCoord.y + parameters[p + 1] });
        }
        continue;
      }

      if (instruction === 'H') {
        for (let p = 0; p < parameters.length; p++) {
          const lastCoord = coords.at(-1)!;
          coords.push({ x: parameters[p], y: lastCoord.y });
        }
        continue;
      }

      if (instruction === 'h') {
        for (let p = 0; p < parameters.length; p++) {
          const lastCoord = coords.at(-1)!;
          coords.push({ x: lastCoord.x + parameters[p], y: lastCoord.y });
        }
        continue;
      }

      if (instruction === 'V') {
        for (let p = 0; p < parameters.length; p++) {
          const lastCoord = coords.at(-1)!;
          coords.push({ x: lastCoord.x, y: parameters[p] });
        }
        continue;
      }

      if (instruction === 'v') {
        for (let p = 0; p < parameters.length; p++) {
          const lastCoord = coords.at(-1)!;
          coords.push({ x: lastCoord.x, y: lastCoord.y + parameters[p] });
        }
        continue;
      }

      if (instruction === 'c') {
        for (let s = 0; s < parameters.length / C_LENGTH; s++) {
          const lastCoord = coords.at(-1)!;
          for (let p = 0; p < C_LENGTH; p += 2) {
            coords.push({
              x: lastCoord.x + parameters[s * C_LENGTH + p],
              y: lastCoord.y + parameters[s * C_LENGTH + p + 1],
            });
          }
        }
        continue;
      }

      if (['s', 'q'].includes(instruction)) {
        for (let s = 0; s < parameters.length / S_Q_LENGTH; s++) {
          const lastCoord = coords.at(-1)!;
          for (let p = 0; p < S_Q_LENGTH; p += 2) {
            coords.push({
              x: lastCoord.x + parameters[s * S_Q_LENGTH + p],
              y: lastCoord.y + parameters[s * S_Q_LENGTH + p + 1],
            });
          }
        }
        continue;
      }

      if (instruction === 'A') {
        for (let p = 0; p < parameters.length; p += 7) {
          coords.push({ x: parameters[p + 5], y: parameters[p + 6] });
        }
        continue;
      }

      if (instruction === 'a') {
        for (let p = 0; p < parameters.length; p += 7) {
          const lastCoord = coords.at(-1)!;
          coords.push({ x: lastCoord.x + parameters[p + 5], y: lastCoord.y + parameters[p + 6] });
        }
        continue;
      }
    }

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
    this.d = this.d.map((command) => {
      if (command.instruction === command.instruction.toLowerCase()) {
        // if the command is relative, do not apply transformation
        return command;
      }

      if (command.instruction === 'A') {
        // if the command is an Arc, apply transformation only to end point
        // A  rx  ry  x-axis-rotation  large-arc-flag  sweep-flag  x  y
        command.parameters[6] -= amount;
        return command;
      }

      if (command.instruction === 'H') {
        return command;
      }

      if (command.instruction === 'V') {
        command.parameters = command.parameters.map((v) => v - amount);
        return command;
      }

      command.parameters = command.parameters.map((v, i) => {
        if (i % 2 === 1) return v - amount;
        return v;
      });
      return command;
    });

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.d);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeRight(amount: number): void {
    this.d = this.d.map((command) => {
      if (command.instruction === command.instruction.toLowerCase()) {
        // if the command is relative, do not apply transformation
        return command;
      }

      if (command.instruction === 'A') {
        // if the command is an Arc, apply transformation only to end point
        // A  rx  ry  x-axis-rotation  large-arc-flag  sweep-flag  x  y
        command.parameters[5] += amount;
        return command;
      }

      if (command.instruction === 'H') {
        command.parameters = command.parameters.map((v) => v + amount);
        return command;
      }

      if (command.instruction === 'V') {
        return command;
      }

      command.parameters = command.parameters.map((v, i) => {
        if (i % 2 === 0) return v + amount;
        return v;
      });
      return command;
    });

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.d);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeDown(amount: number): void {
    this.d = this.d.map((command) => {
      if (command.instruction === command.instruction.toLowerCase()) {
        // if the command is relative, do not apply transformation
        return command;
      }

      if (command.instruction === 'A') {
        // if the command is an Arc, apply transformation only to end point
        // A  rx  ry  x-axis-rotation  large-arc-flag  sweep-flag  x  y
        command.parameters[6] += amount;
        return command;
      }

      if (command.instruction === 'H') {
        return command;
      }

      if (command.instruction === 'V') {
        command.parameters = command.parameters.map((v) => v + amount);
        return command;
      }

      command.parameters = command.parameters.map((v, i) => {
        if (i % 2 === 1) return v + amount;
        return v;
      });
      return command;
    });

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.d);
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeLeft(amount: number): void {
    this.d = this.d.map((command) => {
      if (command.instruction === command.instruction.toLowerCase()) {
        // if the command is relative, do not apply transformation
        return command;
      }

      if (command.instruction === 'A') {
        // if the command is an Arc, apply transformation only to end point
        // A  rx  ry  x-axis-rotation  large-arc-flag  sweep-flag  x  y
        command.parameters[5] -= amount;
        return command;
      }

      if (command.instruction === 'H') {
        command.parameters = command.parameters.map((v) => v - amount);
        return command;
      }

      if (command.instruction === 'V') {
        return command;
      }

      command.parameters = command.parameters.map((v, i) => {
        if (i % 2 === 0) return v - amount;
        return v;
      });
      return command;
    });

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
    this.formsService.dForm.clear({ emitEvent: false });
    this.d.map((c) => this.createCommandFormWithParameters(c.instruction, c.parameters)).forEach((c) => this.formsService.dForm.push(c));
  }
  //#endregion

  //#region export
  protected override isShapeVisible(): boolean {
    const isVisible = super.isShapeVisible();
    const hasSize = this.d.length > 1;

    return isVisible && hasSize;
  }

  protected override parseCustomOptimizedStringAndCloseShape(): string {
    let pathAttr = ` d="${this.d.map((command) => `${command.instruction}${command.parameters.join(' ')}`).join('')}"`;

    if (this.strokeLinecap !== 'butt') {
      pathAttr += ` stroke-linecap="${this.strokeLinecap}"`;
    }

    if (this.strokeLinejoin !== 'miter') {
      pathAttr += ` stroke-linejoin="${this.strokeLinejoin}"`;
    }

    return `${pathAttr} />`;
  }
  //#endregion

  //#region path host
  private isLastCommandInstructionTheSame(i: PathInstruction): boolean {
    const commandControls = this.formsService.dForm;
    const lastCommandControl = commandControls.controls.at(-1)!;
    return lastCommandControl.value.instruction === i;
  }

  private get lastCommandControl(): ToFormType<Command> {
    return this.formsService.dForm.controls.at(-1)!;
  }

  private calculateRelativeCoord(coord: Coord, offset: number = 0): Coord {
    const coords = this.getEditPointCoords();
    const lastCoord = coords[coords.length - offset - 1];
    return { x: coord.x - lastCoord.x, y: coord.y - lastCoord.y };
  }

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

  private isRelativeInstruction(instruction: PathInstruction): boolean {
    return instruction.toLowerCase() === instruction;
  }

  public closePath() {
    if (this.formsService.dForm.controls.length === 0) return;
    this.formsService.dForm.push(this.createCommandFormWithParameters('Z', []));
    this.currentCommand = 'M';
  }

  private createCommandFormWithParameters(instruction: PathInstruction, parameters: number[]): ToFormType<Command> {
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
        svgEditPointIndex++; // Arcs only contain one edit point
      } else if (['H', 'h', 'V', 'v'].includes(commands[i].instruction)) {
        svgEditPointIndex += commands[i].parameters.length;
      } else {
        svgEditPointIndex += commands[i].parameters.length / 2;
      }
      i++;
    }

    // i is now the index of the command that contains the edit point to calculate the index

    if (['A', 'a'].includes(commands[i].instruction)) {
      // Arcs only have one edit point, regardless of parmi
      return svgEditPointIndex;
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
  //#endregion
}
