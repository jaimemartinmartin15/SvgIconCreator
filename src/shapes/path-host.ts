import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Coord, CoordWithDelta, ElementsRefService, ToFormType } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Command, PathInstruction } from '../models/path.model';
import { Shape } from '../models/shape';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { ShapeHost } from './shape-host';

export function isPathInstruction(key: string): key is PathInstruction {
  return ['M', 'L', 'C', 'Z'].includes(key);
}

export const COMMANDS = {
  MOVE_TO: 'M',
  LINE_TO: 'L',
  CUBIC_BEZIER: 'C',
  CLOSE_PATH: 'Z',
} as const satisfies Record<string, PathInstruction>;

export class PathHost extends ShapeHost {
  //#region path host vars
  /**
   * 0 -> no points added
   * 1 -> end point added
   * 2 -> control point 1 added
   * 3 -> control point 2 added
   */
  private stateCubicBezier: number = 0;

  private _currentCommand: PathInstruction = 'M';
  public get currentCommand(): PathInstruction {
    return this._currentCommand;
  }
  public set currentCommand(command: PathInstruction) {
    this.stateCubicBezier = 0;
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

    if (this.currentCommand === COMMANDS.MOVE_TO) {
      this.formsService.dForm.push(this.createCommandFormWithCoords('M', [coord]));
      this.currentCommand = COMMANDS.LINE_TO;
      this.formsService.dForm.push(this.createCommandFormWithCoords('L', [coord]));
      return;
    }

    if (this.currentCommand === COMMANDS.LINE_TO) {
      this.onMouseDownLineTo(coord);
      return;
    }

    if (this.currentCommand === COMMANDS.CUBIC_BEZIER) {
      this.onMouseDownCubicBezier(coord);
      return;
    }
  }

  private onMouseDownLineTo(coord: Coord) {
    // check if previous command was of these type or not
    const commands = this.formsService.dForm;
    const lastControl = commands.controls[commands.length - 1];

    if (lastControl.value.instruction === COMMANDS.LINE_TO) {
      // add a new point to last command
      lastControl.controls['coords'].push(
        new FormGroup({
          x: new FormControl(coord.x, { nonNullable: true }),
          y: new FormControl(coord.y, { nonNullable: true }),
        }),
      );
    } else {
      // add a new command
      this.formsService.dForm.push(this.createCommandFormWithCoords('L', [coord]));
    }
  }

  private onMouseDownCubicBezier(coord: Coord) {
    if (this.stateCubicBezier === 0) {
      // add a new command with three coords (two control points and end point, init point is last of previous command)
      this.formsService.dForm.push(this.createCommandFormWithCoords('C', [coord, coord, coord]));
      return;
    }

    const commands = this.formsService.dForm;
    const lastCommandControl = commands.controls[commands.length - 1];
    const coordControls = lastCommandControl.controls['coords'];

    if (this.stateCubicBezier === 1) {
      coordControls.controls[0].patchValue({
        x: coord.x,
        y: coord.y,
      });
      coordControls.controls[1].patchValue({
        x: coord.x,
        y: coord.y,
      });
    }

    if (this.stateCubicBezier === 2) {
      coordControls.controls[1].patchValue({
        x: coord.x,
        y: coord.y,
      });
    }
  }
  //#endregion

  //#region mouse drag
  public override mouseDrag(coord: CoordWithDelta): void {
    const commands = this.formsService.dForm;
    const currentCommandControl = commands.controls[commands.length - 1];

    if (this.currentCommand === COMMANDS.LINE_TO) {
      this.onMouseDragLineTo(coord, currentCommandControl);
      return;
    }

    if (this.currentCommand === COMMANDS.CUBIC_BEZIER) {
      this.onMouseDragCubicBezier(coord, currentCommandControl);
      return;
    }
  }

  private onMouseDragLineTo(coord: Coord, currentCommandControl: ToFormType<Command>) {
    const coordsFormArrayControls = currentCommandControl.controls['coords'].controls;
    const pointsLength = coordsFormArrayControls.length;
    coordsFormArrayControls[pointsLength - 1].patchValue({ x: coord.x, y: coord.y });
  }

  private onMouseDragCubicBezier(coord: Coord, currentCommandControl: ToFormType<Command>) {
    const coordsFormArrayControls = currentCommandControl.controls['coords'].controls;

    if (this.stateCubicBezier === 0) {
      coordsFormArrayControls[0].patchValue({ x: coord.x, y: coord.y });
      coordsFormArrayControls[1].patchValue({ x: coord.x, y: coord.y });
      coordsFormArrayControls[2].patchValue({ x: coord.x, y: coord.y });
      return;
    }

    if (this.stateCubicBezier === 1) {
      coordsFormArrayControls[0].patchValue({ x: coord.x, y: coord.y });
      coordsFormArrayControls[1].patchValue({ x: coord.x, y: coord.y });
      return;
    }

    if (this.stateCubicBezier === 2) {
      coordsFormArrayControls[1].patchValue({ x: coord.x, y: coord.y });
      return;
    }
  }
  //#endregion

  //#region mouse up
  public override mouseUp(coord: CoordWithDelta): void {
    this.mouseDrag(coord);

    if (this.currentCommand === COMMANDS.CUBIC_BEZIER) {
      // change to next state or start a new cubic bezier command
      this.stateCubicBezier++;
      if (this.stateCubicBezier === 3) {
        this.stateCubicBezier = 0;
      }
    }
  }
  //#endregion

  //#region mouse drag edit
  public override mouseDragEdit(coord: CoordWithDelta): void {
    const coordControls = this.formsService.dForm.controls.flatMap((c) => c.controls.coords.controls);
    coordControls[this.selectedEditPointIndex].patchValue({
      x: coord.x,
      y: coord.y,
    });
  }
  //#endregion

  //#region edit point
  protected override getEditPointCoordsFromSvgShapeAttributes(): Coord[] {
    return this.getCommandsFromPath(this.d).flatMap((c) => c.coords);
  }

  public override updatePositionSvgEditPoints() {
    if (this.svgEditPoints.length === 0) return;

    this.getEditPointCoordsFromSvgShapeAttributes().forEach((c, i) => {
      this.setSvgAttribute('cx', c.x, this.svgEditPoints[i]);
      this.setSvgAttribute('cy', c.y, this.svgEditPoints[i]);
    });
  }
  //#endregion

  //#region move shape
  public override moveShapeUp(amount: number): void {
    const commands = this.getCommandsFromPath(this.d);
    commands.forEach((command) => command.coords.forEach((coord) => (coord.y -= amount)));
    this.d = this.getPathFromCommands(commands);

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.getCommandsFromPath(this.d));
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeRight(amount: number): void {
    const commands = this.getCommandsFromPath(this.d);
    commands.forEach((command) => command.coords.forEach((coord) => (coord.x += amount)));
    this.d = this.getPathFromCommands(commands);

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.getCommandsFromPath(this.d));
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeDown(amount: number): void {
    const commands = this.getCommandsFromPath(this.d);
    commands.forEach((command) => command.coords.forEach((coord) => (coord.y += amount)));
    this.d = this.getPathFromCommands(commands);

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.getCommandsFromPath(this.d));
      this.updatePositionSvgEditPoints();
    }
  }

  public override moveShapeLeft(amount: number): void {
    const commands = this.getCommandsFromPath(this.d);
    commands.forEach((command) => command.coords.forEach((coord) => (coord.x -= amount)));
    this.d = this.getPathFromCommands(commands);

    if (this.shapeListService.selectedShape === this) {
      this.formsService.dForm.setValue(this.getCommandsFromPath(this.d));
      this.updatePositionSvgEditPoints();
    }
  }
  //#endregion

  //#region svg form binding
  public override setSvgAttributesWithSvgAttributeForms(): void {
    this.stroke = this.formsService.strokeForm.value;
    this.fill = this.formsService.fillForm.value;
    this.strokeWidth = this.formsService.strokeWidthForm.value;
    // This method is called when the shape is being created after another one
    // do not copy coordinates
    this.formsService.dForm.clear();
    this.d = '';
  }

  public override setSvgAttributeFormsWithSvgAttributes(): void {
    this.formsService.strokeForm.setValue(this.stroke);
    this.formsService.fillForm.setValue(this.fill);
    this.formsService.strokeWidthForm.setValue(this.strokeWidth);
    // this method is called when an existing shape is selected
    // reset the dForm to show the coords of the selected path
    this.formsService.dForm.clear({ emitEvent: false });
    this.getCommandsFromPath(this.d)
      .map((c) => this.createCommandFormWithCoords(c.instruction, c.coords))
      .forEach((c) => this.formsService.dForm.push(c));
  }
  //#endregion

  //#region export
  protected override isShapeVisible(): boolean {
    const isVisible = super.isShapeVisible();
    const hasSize = this.formsService.dForm.controls.length > 1;

    return isVisible && hasSize;
  }

  protected override parseCustomOptimizedStringAndCloseShape(): string {
    return ` d="${this.d}" />`;
  }
  //#endregion

  //#region path host
  public closePath() {
    if (this.formsService.dForm.controls.length === 0) return;
    this.stateCubicBezier = 0;
    this.currentCommand = COMMANDS.CLOSE_PATH;
    this.formsService.dForm.push(
      new FormGroup({
        instruction: new FormControl(COMMANDS.CLOSE_PATH, { nonNullable: true }) as ToFormType<PathInstruction>,
        coords: new FormArray([] as ToFormType<Coord>[]),
      }),
    );
    this.isShapeFinished = true;
    this.createEditPoints();
  }

  private createCommandFormWithCoords(instruction: PathInstruction, coords: Coord[]): ToFormType<Command> {
    return new FormGroup({
      instruction: new FormControl(instruction, { nonNullable: true }) as ToFormType<PathInstruction>,
      coords: new FormArray(
        coords.map(
          (coord) =>
            new FormGroup({
              x: new FormControl(coord.x, { nonNullable: true }),
              y: new FormControl(coord.y, { nonNullable: true }),
            }),
        ),
      ),
    });
  }

  private getCommandsFromPath(d: string): Command[] {
    const commands: Command[] = [];
    for (let i = 0; i < d.length; i++) {
      const c = d.charAt(i);
      if (isPathInstruction(c)) {
        // find the start and the end indexes of the command "M1,3" - "C1,3 4,5 6,7" - "L1,3"
        const init = i;
        let end = i + 1;
        for (let j = i + 1; !['M', 'L', 'C', 'Z'].includes(d.charAt(j)) && j < d.length; j++) {
          end = j + 1;
        }

        commands.push({
          instruction: c,
          coords: d
            .substring(init + 1, end)
            .split(' ') // split coords
            .filter((c) => c !== '')
            .map((coords) => coords.split(',')) // split x and y
            .map(([x, y]) => ({ x: +x, y: +y })),
        });
      }
    }

    return commands;
  }

  public getPathFromCommands(commands: Command[]): string {
    return commands.map((c) => `${c.instruction}${c.coords.map((c) => `${c.x},${c.y}`).join(' ')}`).join(' ');
  }
  //#endregion
}
