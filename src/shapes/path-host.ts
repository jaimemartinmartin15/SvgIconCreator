import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Coord, CoordWithDelta, ToFormType } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Command, PathInstruction, PathModel } from '../models/path.model';
import { Shape } from '../models/shape';
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

  public override readonly type = Shape.PATH;
  public override svg: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  public override readonly form: ToFormType<PathModel> = new FormGroup({
    name: new FormControl('path', { nonNullable: true }),
    stroke: new FormControl('#000000ff', { nonNullable: true }),
    strokeWidth: new FormControl(1, { nonNullable: true }),
    fill: new FormControl('#ffffffff', { nonNullable: true }),
    commands: new FormArray([] as ToFormType<Command>[]),
  });

  public override setSvgAttributesWithSvgAttributeForms(): void {
    this.stroke = this.formsService.strokeForm.value;
    this.fill = this.formsService.fillForm.value;
    this.strokeWidth = this.formsService.strokeWidthForm.value;
    // TODO d attribute
  }

  public override setSvgAttributeFormsWithSvgAttributes(): void {
    this.formsService.strokeForm.setValue(this.stroke);
    this.formsService.fillForm.setValue(this.fill);
    this.formsService.strokeWidthForm.setValue(this.strokeWidth);
    // TODO d attribute
  }

  //#region svg attributes
  public override updateSvgAttributes(model: PathModel) {
    super.updateSvgAttributes(model);

    const path = model.commands.reduce((path, command) => {
      path += command.instruction;
      path += command.coords.map((c) => `${c.x},${c.y}`).join(' ');
      return path;
    }, '');
    this.svg.setAttribute('d', path);
  }

  public override updatePositionSvgEditPoints(model: PathModel) {
    if (this.svgEditPoints.length === 0) return;

    model.commands
      .flatMap((c) => c.coords)
      .forEach((c, i) => {
        this.setSvgAttribute('cx', c.x, this.svgEditPoints[i]);
        this.setSvgAttribute('cy', c.y, this.svgEditPoints[i]);
      });
  }
  //#endregion

  //#region mouse down
  public override mouseDown(coord: Coord): void {
    if (this.svg.parentElement === null) {
      this.canvas.append(this.svg);
    }

    if (this.currentCommand === COMMANDS.MOVE_TO) {
      this.form.controls.commands.push(this.createCommandFormWithCoords('M', [coord]));
      this.currentCommand = COMMANDS.LINE_TO;
      this.form.controls.commands.push(this.createCommandFormWithCoords('L', [coord]));
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
    const commands = this.form.controls['commands'];
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
      this.form.controls['commands'].push(this.createCommandFormWithCoords('L', [coord]));
    }
  }

  private onMouseDownCubicBezier(coord: Coord) {
    if (this.stateCubicBezier === 0) {
      // add a new command with three coords (two control points and end point, init point is last of previous command)
      this.form.controls['commands'].push(this.createCommandFormWithCoords('C', [coord, coord, coord]));
      return;
    }

    const commands = this.form.controls['commands'];
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
    const commands = this.form.controls['commands'];
    const currentCommandControl = commands.controls[commands.length - 1];

    if (this.currentCommand === COMMANDS.LINE_TO) {
      this.onMouseMoveLineTo(coord, currentCommandControl);
      return;
    }

    if (this.currentCommand === COMMANDS.CUBIC_BEZIER) {
      this.onMouseDragCubicBezier(coord, currentCommandControl);
      return;
    }
  }

  private onMouseMoveLineTo(coord: Coord, currentCommandControl: ToFormType<Command>) {
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
    const coordControls = this.form.controls.commands.controls.flatMap((c) => c.controls.coords.controls);
    coordControls[this.selectedEditPointIndex].patchValue({
      x: coord.x,
      y: coord.y,
    });
  }
  //#endregion

  //#region edit point
  protected override getEditPointsCoordsFromForm(): Coord[] {
    return this.form.controls.commands.value.flatMap((c) => (c.coords ?? []) as Coord[]);
  }
  //#endregion

  //#region move shape
  public override moveShapeUp(amount: number): void {
    this.form.controls.commands.controls.forEach((command) =>
      command.controls.coords.controls.forEach((coord) => coord.patchValue({ y: this.toFixed(coord.controls.y.value - amount) })),
    );
  }

  public override moveShapeRight(amount: number): void {
    this.form.controls.commands.controls.forEach((command) =>
      command.controls.coords.controls.forEach((coord) => coord.patchValue({ x: this.toFixed(coord.controls.x.value + amount) })),
    );
  }

  public override moveShapeDown(amount: number): void {
    this.form.controls.commands.controls.forEach((command) =>
      command.controls.coords.controls.forEach((coord) => coord.patchValue({ y: this.toFixed(coord.controls.y.value + amount) })),
    );
  }

  public override moveShapeLeft(amount: number): void {
    this.form.controls.commands.controls.forEach((command) =>
      command.controls.coords.controls.forEach((coord) => coord.patchValue({ x: this.toFixed(coord.controls.x.value - amount) })),
    );
  }
  //#endregion

  //#region import
  public override loadFromElement(svg: SVGPathElement) {
    this.svg = svg;

    const commandsFromPath = this.getCommandsFromPath(this.svg.getAttribute('d') ?? '');

    // the FormArray needs to be populated first with the same amount of controls to be set
    commandsFromPath.forEach((command) => this.form.controls.commands.push(this.createCommandFormWithCoords(command.instruction, command.coords)));

    this.form.setValue({
      name: this.svg.getAttribute('name') || 'path',
      stroke: this.svg.getAttribute('stroke') || '#000000ff',
      strokeWidth: this.getSvgAttributeAsNumber('stroke-width'),
      fill: this.svg.getAttribute('fill') || '#ffffffff',
      commands: commandsFromPath, // actually this is redundant because it is already set when the array is populated with controls
    });

    super.loadFromElement(svg);
  }
  //#endregion

  //#region export
  protected override isShapeVisible(): boolean {
    const isVisible = super.isShapeVisible();
    const hasSize = this.form.value.commands!.length > 1;

    return isVisible && hasSize;
  }

  protected override parseCustomOptimizedStringAndCloseShape(): string {
    let pathAttr = '';

    const pathModel = this.form.value as PathModel;
    pathAttr += ` d="${pathModel.commands.reduce((path, command) => {
      path += command.instruction;
      path += command.coords.map((c) => `${c.x},${c.y}`).join(' ');
      return path;
    }, '')}"`;

    return `${pathAttr} />`;
  }
  //#endregion

  //#region path host
  public closePath() {
    if (this.form.controls.commands.length === 0) return;
    this.stateCubicBezier = 0;
    this.currentCommand = COMMANDS.CLOSE_PATH;
    this.form.controls['commands'].push(
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
  //#endregion
}
