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
    this.parameterToEditIndex = -1;
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

    if (this.currentCommand === 'M') {
      this.formsService.dForm.push(this.createCommandFormWithParameters('M', [coord.x, coord.y]));
      this.currentCommand = 'L';
      this.formsService.dForm.push(this.createCommandFormWithParameters('L', [coord.x, coord.y]));
      return;
    }

    if (this.currentCommand === 'm') {
      const relativeCoord: Coord = this.calculateRelativeCoord(coord);

      this.formsService.dForm.push(this.createCommandFormWithParameters('m', [relativeCoord.x, relativeCoord.y]));
      this.currentCommand = 'L';
      this.formsService.dForm.push(this.createCommandFormWithParameters('L', [coord.x, coord.y]));
      return;
    }

    if (this.currentCommand === 'L') {
      if (this.isLastCommandInstructionTheSame('L')) {
        this.lastCommandControl.controls.parameters.push([new FormControl(coord.x, { nonNullable: true }), new FormControl(coord.y, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('L', [coord.x, coord.y]));
      }
      return;
    }

    if (this.currentCommand === 'l') {
      const relativeCoord: Coord = this.calculateRelativeCoord(coord);

      if (this.isLastCommandInstructionTheSame('l')) {
        this.lastCommandControl.controls.parameters.push([
          new FormControl(relativeCoord.x, { nonNullable: true }),
          new FormControl(relativeCoord.y, { nonNullable: true }),
        ]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('l', [relativeCoord.x, relativeCoord.y]));
      }
      return;
    }

    if (this.currentCommand === 'H') {
      if (this.isLastCommandInstructionTheSame('H')) {
        this.lastCommandControl.controls.parameters.push([new FormControl(coord.x, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('H', [coord.x]));
      }
      return;
    }

    if (this.currentCommand === 'h') {
      const relativeCoord: Coord = this.calculateRelativeCoord(coord);

      if (this.isLastCommandInstructionTheSame('h')) {
        this.lastCommandControl.controls.parameters.push([new FormControl(relativeCoord.x, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('h', [relativeCoord.x]));
      }
      return;
    }

    if (this.currentCommand === 'V') {
      if (this.isLastCommandInstructionTheSame('V')) {
        this.lastCommandControl.controls.parameters.push([new FormControl(coord.y, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('V', [coord.y]));
      }
      return;
    }

    if (this.currentCommand === 'v') {
      const relativeCoord: Coord = this.calculateRelativeCoord(coord);

      if (this.isLastCommandInstructionTheSame('v')) {
        this.lastCommandControl.controls.parameters.push([new FormControl(relativeCoord.y, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('v', [relativeCoord.y]));
      }
      return;
    }

    if (this.currentCommand === 'C') {
      if (this.parameterToEditIndex === -1 || (this.parameterToEditIndex - 4) % 6 === 0) {
        // create a new curve

        if (this.isLastCommandInstructionTheSame('C')) {
          this.lastCommandControl.controls.parameters.push([
            new FormControl(coord.x, { nonNullable: true }),
            new FormControl(coord.y, { nonNullable: true }),
            new FormControl(coord.x, { nonNullable: true }),
            new FormControl(coord.y, { nonNullable: true }),
            new FormControl(coord.x, { nonNullable: true }),
            new FormControl(coord.y, { nonNullable: true }),
          ]);
        } else {
          this.formsService.dForm.push(this.createCommandFormWithParameters('C', [coord.x, coord.y, coord.x, coord.y, coord.x, coord.y]));
          this.parameterToEditIndex = 4;
        }
        return;
      }
      if ((this.parameterToEditIndex - 2) % 6 === 0 || (this.parameterToEditIndex - 4) % 6 === 0) {
        this.mouseDrag(coord as CoordWithDelta);
        return;
      }
      return;
    }

    if (this.currentCommand === 'c') {
      if (this.parameterToEditIndex === -1 || (this.parameterToEditIndex - 4) % C_LENGTH === 0) {
        // create a new curve

        const relativeCoord = this.calculateRelativeCoord(coord);
        if (this.isLastCommandInstructionTheSame('c')) {
          this.lastCommandControl.controls.parameters.push([
            new FormControl(relativeCoord.x, { nonNullable: true }),
            new FormControl(relativeCoord.y, { nonNullable: true }),
            new FormControl(relativeCoord.x, { nonNullable: true }),
            new FormControl(relativeCoord.y, { nonNullable: true }),
            new FormControl(relativeCoord.x, { nonNullable: true }),
            new FormControl(relativeCoord.y, { nonNullable: true }),
          ]);
        } else {
          this.formsService.dForm.push(
            this.createCommandFormWithParameters('c', [relativeCoord.x, relativeCoord.y, relativeCoord.x, relativeCoord.y, relativeCoord.x, relativeCoord.y]),
          );
          this.parameterToEditIndex = 4;
        }
        return;
      }
      if ((this.parameterToEditIndex - 2) % 6 === 0 || (this.parameterToEditIndex - 4) % 6 === 0) {
        this.mouseDrag(coord as CoordWithDelta);
        return;
      }
      return;
    }

    if (this.currentCommand === 'S' || this.currentCommand === 'Q') {
      if (this.parameterToEditIndex === -1 || (this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        // create a new curve

        if (this.isLastCommandInstructionTheSame(this.currentCommand)) {
          this.lastCommandControl.controls.parameters.push([
            new FormControl(coord.x, { nonNullable: true }),
            new FormControl(coord.y, { nonNullable: true }),
            new FormControl(coord.x, { nonNullable: true }),
            new FormControl(coord.y, { nonNullable: true }),
          ]);
        } else {
          this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [coord.x, coord.y, coord.x, coord.y]));
          this.parameterToEditIndex = 2;
        }
        return;
      }
      if ((this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        this.mouseDrag(coord as CoordWithDelta);
        return;
      }
      return;
    }

    if (this.currentCommand === 's' || this.currentCommand === 'q') {
      if (this.parameterToEditIndex === -1 || (this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        // create a new curve

        const relativeCoord = this.calculateRelativeCoord(coord);
        if (this.isLastCommandInstructionTheSame(this.currentCommand)) {
          this.lastCommandControl.controls.parameters.push([
            new FormControl(relativeCoord.x, { nonNullable: true }),
            new FormControl(relativeCoord.y, { nonNullable: true }),
            new FormControl(relativeCoord.x, { nonNullable: true }),
            new FormControl(relativeCoord.y, { nonNullable: true }),
          ]);
        } else {
          this.formsService.dForm.push(this.createCommandFormWithParameters(this.currentCommand, [relativeCoord.x, relativeCoord.y, relativeCoord.x, relativeCoord.y]));
          this.parameterToEditIndex = 2;
        }
        return;
      }
      if ((this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        this.mouseDrag(coord as CoordWithDelta);
        return;
      }
      return;
    }

    if (this.currentCommand === 'T') {
      if (this.isLastCommandInstructionTheSame('T')) {
        this.lastCommandControl.controls.parameters.push([new FormControl(coord.x, { nonNullable: true }), new FormControl(coord.y, { nonNullable: true })]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('T', [coord.x, coord.y]));
      }
      return;
    }

    if (this.currentCommand === 't') {
      const coords = this.getEditPointCoords();
      const lastCoord = coords[coords.length - 1];
      const relativeCoord: Coord = { x: coord.x - lastCoord.x, y: coord.y - lastCoord.y };

      if (this.isLastCommandInstructionTheSame('t')) {
        this.lastCommandControl.controls.parameters.push([
          new FormControl(relativeCoord.x, { nonNullable: true }),
          new FormControl(relativeCoord.y, { nonNullable: true }),
        ]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('t', [relativeCoord.x, relativeCoord.y]));
      }
      return;
    }

    if (this.currentCommand === 'A') {
      if (this.isLastCommandInstructionTheSame('A')) {
        this.lastCommandControl.controls.parameters.push([
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(coord.x, { nonNullable: true }),
          new FormControl(coord.y, { nonNullable: true }),
        ]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('A', [0, 0, 0, 0, 0, coord.x, coord.y]));
      }
      return;
    }

    if (this.currentCommand === 'a') {
      const coords = this.getEditPointCoords();
      const lastCoord = coords[coords.length - 1];
      const relativeCoord: Coord = { x: coord.x - lastCoord.x, y: coord.y - lastCoord.y };

      if (this.isLastCommandInstructionTheSame('a')) {
        this.lastCommandControl.controls.parameters.push([
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(0, { nonNullable: true }),
          new FormControl(relativeCoord.x, { nonNullable: true }),
          new FormControl(relativeCoord.y, { nonNullable: true }),
        ]);
      } else {
        this.formsService.dForm.push(this.createCommandFormWithParameters('a', [0, 0, 0, 0, 0, relativeCoord.x, relativeCoord.y]));
      }
      return;
    }
  }
  //#endregion

  //#region mouse drag
  public override mouseDrag(coord: CoordWithDelta): void {
    const parameters = this.lastCommandControl.controls.parameters;
    const coords = this.getEditPointCoords();

    if (this.currentCommand === 'L') {
      parameters.controls[parameters.controls.length - 2].setValue(coord.x);
      parameters.controls[parameters.controls.length - 1].setValue(coord.y);
      return;
    }

    if (this.currentCommand === 'l') {
      const relativeCoord = { x: coord.x - coords[coords.length - 2].x, y: coord.y - coords[coords.length - 2].y };
      parameters.controls[parameters.controls.length - 2].setValue(relativeCoord.x);
      parameters.controls[parameters.controls.length - 1].setValue(relativeCoord.y);
      return;
    }

    if (this.currentCommand === 'H') {
      parameters.controls[parameters.controls.length - 1].setValue(coord.x);
      return;
    }

    if (this.currentCommand === 'h') {
      const relativeCoord = { x: coord.x - coords[coords.length - 2].x, y: coord.y - coords[coords.length - 2].y };
      parameters.controls[parameters.controls.length - 1].setValue(relativeCoord.x);
      return;
    }

    if (this.currentCommand === 'V') {
      parameters.controls[parameters.controls.length - 1].setValue(coord.y);
      return;
    }

    if (this.currentCommand === 'v') {
      const relativeCoord = { x: coord.x - coords[coords.length - 2].x, y: coord.y - coords[coords.length - 2].y };
      parameters.controls[parameters.controls.length - 1].setValue(relativeCoord.y);
      return;
    }

    if (this.currentCommand === 'C') {
      if ((this.parameterToEditIndex - 4) % C_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex - 4].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex - 3].setValue(coord.y);
        parameters.controls[this.parameterToEditIndex - 2].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex - 1].setValue(coord.y);
        parameters.controls[this.parameterToEditIndex].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(coord.y);
        return;
      }

      if (this.parameterToEditIndex % C_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(coord.y);
        parameters.controls[this.parameterToEditIndex + 2].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex + 3].setValue(coord.y);
        return;
      }

      if ((this.parameterToEditIndex - 2) % C_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(coord.y);
        return;
      }
      return;
    }

    if (this.currentCommand === 'c') {
      const relativeCoord = this.calculateRelativeCoord(coord, 3);

      if ((this.parameterToEditIndex - 4) % C_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex - 4].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex - 3].setValue(relativeCoord.y);
        parameters.controls[this.parameterToEditIndex - 2].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex - 1].setValue(relativeCoord.y);
        parameters.controls[this.parameterToEditIndex].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(relativeCoord.y);
        return;
      }

      if (this.parameterToEditIndex % C_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(relativeCoord.y);
        parameters.controls[this.parameterToEditIndex + 2].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex + 3].setValue(relativeCoord.y);
        return;
      }

      if ((this.parameterToEditIndex - 2) % C_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(relativeCoord.y);
        return;
      }
      return;
    }

    if (this.currentCommand === 'S' || this.currentCommand === 'Q') {
      if (this.parameterToEditIndex % S_Q_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(coord.y);
        return;
      }

      if ((this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex - 2].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex - 1].setValue(coord.y);
        parameters.controls[this.parameterToEditIndex].setValue(coord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(coord.y);
        return;
      }
      return;
    }

    if (this.currentCommand === 's' || this.currentCommand === 'q') {
      const relativeCoord = this.calculateRelativeCoord(coord, S_Q_LENGTH / 2);

      if ((this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex - 2].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex - 1].setValue(relativeCoord.y);
        parameters.controls[this.parameterToEditIndex].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(relativeCoord.y);
        return;
      }

      if (this.parameterToEditIndex % S_Q_LENGTH === 0) {
        parameters.controls[this.parameterToEditIndex].setValue(relativeCoord.x);
        parameters.controls[this.parameterToEditIndex + 1].setValue(relativeCoord.y);
        return;
      }

      return;
    }

    if (this.currentCommand === 'T') {
      parameters.controls[parameters.controls.length - 2].setValue(coord.x);
      parameters.controls[parameters.controls.length - 1].setValue(coord.y);
      return;
    }

    if (this.currentCommand === 't') {
      const relativeCoord = { x: coord.x - coords[coords.length - 2].x, y: coord.y - coords[coords.length - 2].y };
      parameters.controls[parameters.controls.length - 2].setValue(relativeCoord.x);
      parameters.controls[parameters.controls.length - 1].setValue(relativeCoord.y);
      return;
    }

    if (this.currentCommand === 'A') {
      parameters.controls[parameters.controls.length - 2].setValue(coord.x);
      parameters.controls[parameters.controls.length - 1].setValue(coord.y);
      return;
    }

    if (this.currentCommand === 'a') {
      const relativeCoord = { x: coord.x - coords[coords.length - 2].x, y: coord.y - coords[coords.length - 2].y };
      parameters.controls[parameters.controls.length - 2].setValue(relativeCoord.x);
      parameters.controls[parameters.controls.length - 1].setValue(relativeCoord.y);
      return;
    }
  }
  //#endregion

  //#region mouse up
  public override mouseUp(coord: CoordWithDelta): void {
    this.mouseDrag(coord);

    if (this.currentCommand.toUpperCase() === 'C') {
      if (this.parameterToEditIndex === -1) {
        this.parameterToEditIndex = 4;
        return;
      }
      if ((this.parameterToEditIndex - 4) % C_LENGTH === 0) {
        // finish moving end of the curve (first click)
        this.parameterToEditIndex -= 4;
        return;
      }
      if (this.parameterToEditIndex % C_LENGTH === 0) {
        // finish moving edit point 1 (second click)
        this.parameterToEditIndex += 2;
        return;
      }
      if ((this.parameterToEditIndex - 2) % C_LENGTH === 0) {
        // finish moving edit point 2 (second click)
        this.parameterToEditIndex += 8;
        return;
      }
    }

    if (['S', 's', 'Q', 'q'].includes(this.currentCommand)) {
      if (this.parameterToEditIndex === -1) {
        this.parameterToEditIndex = 0;
        return;
      }
      if ((this.parameterToEditIndex - 2) % S_Q_LENGTH === 0) {
        this.parameterToEditIndex -= 2;
        return;
      }
      if (this.parameterToEditIndex % S_Q_LENGTH === 0) {
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
          const lastCoord = coords[coords.length - 1];
          coords.push({ x: lastCoord.x + parameters[p], y: lastCoord.y + parameters[p + 1] });
        }
        continue;
      }

      if (instruction === 'H') {
        for (let p = 0; p < parameters.length; p++) {
          const lastCoord = coords[coords.length - 1];
          coords.push({ x: parameters[p], y: lastCoord.y });
        }
        continue;
      }

      if (instruction === 'h') {
        for (let p = 0; p < parameters.length; p++) {
          const lastCoord = coords[coords.length - 1];
          coords.push({ x: lastCoord.x + parameters[p], y: lastCoord.y });
        }
        continue;
      }

      if (instruction === 'V') {
        for (let p = 0; p < parameters.length; p++) {
          const lastCoord = coords[coords.length - 1];
          coords.push({ x: lastCoord.x, y: parameters[p] });
        }
        continue;
      }

      if (instruction === 'v') {
        for (let p = 0; p < parameters.length; p++) {
          const lastCoord = coords[coords.length - 1];
          coords.push({ x: lastCoord.x, y: lastCoord.y + parameters[p] });
        }
        continue;
      }

      if (instruction === 'c') {
        for (let s = 0; s < parameters.length / C_LENGTH; s++) {
          const lastCoord = coords[coords.length - 1];
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
          const lastCoord = coords[coords.length - 1];
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
          const lastCoord = coords[coords.length - 1];
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
    const lastCommandControl = commandControls.controls[commandControls.length - 1];
    return lastCommandControl.value.instruction === i;
  }

  private get lastCommandControl(): ToFormType<Command> {
    const commandControls = this.formsService.dForm;
    return commandControls.controls[commandControls.length - 1];
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
      } else if (['H', 'h'].includes(instruction.value)) {
        for (let i = 0; i < parameters.length; i++) {
          if (counter === this.selectedEditPointIndex) {
            return [parameters.controls[i], mockFormControl];
          } else {
            counter++;
          }
        }
      } else if (['V', 'v'].includes(instruction.value)) {
        for (let i = 0; i < parameters.length; i++) {
          if (counter === this.selectedEditPointIndex) {
            return [mockFormControl, parameters.controls[i + 1]];
          } else {
            counter++;
          }
        }
      } else if (['A', 'a'].includes(instruction.value)) {
        for (let i = 5; i < parameters.length; i += 7) {
          if (counter === this.selectedEditPointIndex) {
            return [parameters.controls[i], parameters.controls[i + 1]];
          } else {
            counter++;
          }
        }
      }
    }

    return [mockFormControl, mockFormControl]; // should never return this
  }

  private getFormControlValueForEditPoint(): Coord {
    const controls = this.getFormControlsForSelectedEditPointIndex();
    return { x: controls[0].value, y: controls[1].value };
  }

  public closePath() {
    if (this.formsService.dForm.controls.length === 0) return;
    this.parameterToEditIndex = 0;
    this.currentCommand = 'M';
    this.formsService.dForm.push(this.createCommandFormWithParameters('Z', []));
  }

  private createCommandFormWithParameters(instruction: PathInstruction, parameters: number[]): ToFormType<Command> {
    return new FormGroup({
      instruction: new FormControl(instruction, { nonNullable: true }) as ToFormType<PathInstruction>,
      parameters: new FormArray(parameters.map((v) => new FormControl(v, { nonNullable: true }))),
    });
  }

  public calculateSvgEditPointIndexForCommandAndControl(cmdi: number, parmi: number): number {
    if (!(this.shapeListService.selectedShape instanceof PathHost)) return -1;
    const commands = this.shapeListService.selectedShape.d;

    let svgEditPointIndex = 0;
    let i = 0;

    // count edit points of previous commands
    while (i < cmdi) {
      if (commands[i].instruction.toLowerCase() === 'a') {
        svgEditPointIndex++; // Arcs only contain one edit point
      } else if (commands[i].instruction.toLowerCase() === 'h' || commands[i].instruction.toLowerCase() === 'v') {
        svgEditPointIndex += commands[i].parameters.length;
      } else {
        svgEditPointIndex += commands[i].parameters.length / 2;
      }
      i++;
    }

    // i is now the index of the command that contains the edit point to calculate the index

    if (commands[i].instruction.toLowerCase() === 'a') {
      // Arcs only have one edit point, regardless of parmi
      return svgEditPointIndex;
    }

    if (commands[i].instruction.toLowerCase() === 'h' || commands[i].instruction.toLowerCase() === 'v') {
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
