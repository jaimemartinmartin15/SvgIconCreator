import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Coord } from '../coord';
import { PathModel } from '../forms/path/path.model';
import { Shape } from '../shape';
import { ShapePainterMapping } from './shape-painter-mapping';
import { ShapePainter } from './shape.painter';

const COMMANDS = {
  MOVE_TO: 'M',
  LINE_TO: 'L',
  CUBIC_BEZIER: 'C',
  CLOSE_PATH: 'Z',
};

export class PathPainter extends ShapePainter {
  /*
   * 0 -> no points added
   * 1 -> end point added
   * 2 -> control point 1 added
   * 3 -> control point 2 added
   */
  private stateCubicBezier: number = 0;

  public currentCommand = 'M';

  public constructor(protected readonly canvas: SVGSVGElement) {
    super();

    this.shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    this.options = new FormGroup({
      name: new FormControl('path'),
      stroke: new FormControl('#000000'),
      strokeAlpha: new FormControl(1),
      strokeWidth: new FormControl(1),
      fill: new FormControl('#FFFFFF'),
      fillAlpha: new FormControl(0),
      commands: new FormArray([]),
    });
    this.setFormListener();
  }

  //#region mouse down

  public onMouseDown(coord: Coord) {
    this.isMouseDown = true;

    if (this.currentCommand === COMMANDS.MOVE_TO) {
      this.onMouseDownMoveTo(coord);
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

  private onMouseDownMoveTo(coord: Coord) {
    (this.options.controls['commands'] as FormArray).push(
      new FormGroup({
        type: new FormControl(COMMANDS.MOVE_TO),
        coords: new FormArray([
          new FormGroup({
            x: new FormControl(coord.x),
            y: new FormControl(coord.y),
          }),
        ]),
      })
    );
  }

  private onMouseDownLineTo(coord: Coord) {
    // check if previous command was of these type or not
    const commands: FormArray = this.options.controls['commands'] as FormArray;
    const lastControl = commands.controls[commands.length - 1];

    if (lastControl.value.type === COMMANDS.LINE_TO) {
      // add a new point to last command
      ((lastControl as FormGroup).controls['coords'] as FormArray).push(
        new FormGroup({
          x: new FormControl(coord.x),
          y: new FormControl(coord.y),
        })
      );
    } else {
      // add a new command
      (this.options.controls['commands'] as FormArray).push(
        new FormGroup({
          type: new FormControl(COMMANDS.LINE_TO),
          coords: new FormArray([
            new FormGroup({
              x: new FormControl(coord.x),
              y: new FormControl(coord.y),
            }),
          ]),
        })
      );
    }
  }

  private onMouseDownCubicBezier(coord: Coord) {
    if (this.stateCubicBezier === 0) {
      // add a new command, set end point and controls
      (this.options.controls['commands'] as FormArray).push(
        new FormGroup({
          type: new FormControl(COMMANDS.CUBIC_BEZIER),
          coords: new FormArray([
            new FormGroup({
              x: new FormControl(coord.x),
              y: new FormControl(coord.y),
            }),
            new FormGroup({
              x: new FormControl(coord.x),
              y: new FormControl(coord.y),
            }),
            new FormGroup({
              x: new FormControl(coord.x),
              y: new FormControl(coord.y),
            }),
          ]),
        })
      );
      return;
    }

    const commands = this.options.controls['commands'] as FormArray;
    const lastCommandControl = commands.controls[commands.length - 1] as FormGroup;
    const coordControls = lastCommandControl.controls['coords'] as FormArray;

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

  //#endregion mouse down

  //#region mouse move

  public onMouseMove(coord: Coord) {
    if (!this.isMouseDown) return;

    const commands: FormArray = this.options.controls['commands'] as FormArray;
    const currentCommandControl = commands.controls[commands.length - 1] as FormGroup;

    if (this.currentCommand === COMMANDS.MOVE_TO) {
      this.onMouseMoveMoveTo(coord, currentCommandControl);
      return;
    }

    if (this.currentCommand === COMMANDS.LINE_TO) {
      this.onMouseMoveLineTo(coord, currentCommandControl);
      return;
    }

    if (this.currentCommand === COMMANDS.CUBIC_BEZIER) {
      this.onMouseMoveCubicBezier(coord, currentCommandControl);
      return;
    }
  }

  private onMouseMoveMoveTo(coord: Coord, currentCommandControl: FormGroup) {
    (currentCommandControl.controls['coords'] as FormArray).controls[0].patchValue({
      x: coord.x,
      y: coord.y,
    });
  }

  private onMouseMoveLineTo(coord: Coord, currentCommandControl: FormGroup<any>) {
    const coordsFormArrayControls = (currentCommandControl.controls['coords'] as FormArray).controls;
    const pointsLength = coordsFormArrayControls.length;
    coordsFormArrayControls[pointsLength - 1].patchValue({
      x: coord.x,
      y: coord.y,
    });
  }

  private onMouseMoveCubicBezier(coord: Coord, currentCommandControl: FormGroup<any>) {
    const coordsFormArrayControls = (currentCommandControl.controls['coords'] as FormArray).controls;

    if (this.stateCubicBezier === 0) {
      coordsFormArrayControls[0].patchValue({
        x: coord.x,
        y: coord.y,
      });
      coordsFormArrayControls[1].patchValue({
        x: coord.x,
        y: coord.y,
      });
      coordsFormArrayControls[2].patchValue({
        x: coord.x,
        y: coord.y,
      });
      return;
    }

    if (this.stateCubicBezier === 1) {
      coordsFormArrayControls[0].patchValue({
        x: coord.x,
        y: coord.y,
      });
      coordsFormArrayControls[1].patchValue({
        x: coord.x,
        y: coord.y,
      });
      return;
    }

    if (this.stateCubicBezier === 2) {
      coordsFormArrayControls[1].patchValue({
        x: coord.x,
        y: coord.y,
      });
      return;
    }
  }

  //#endregion mouse move

  public override onMouseUp(coord: Coord) {
    super.onMouseUp(coord);
    // avoid super class to complete the shape
    this._isShapeCompleted = false;

    if (this.currentCommand === COMMANDS.MOVE_TO) {
      this.currentCommand = COMMANDS.LINE_TO;
    }

    if (this.currentCommand === COMMANDS.CUBIC_BEZIER) {
      // change to next state or finish
      this.stateCubicBezier++;
      if (this.stateCubicBezier === 3) {
        this.stateCubicBezier = 0;
      }
    }
  }

  //#region mouse-events-edit

  public onMouseMoveEdit(coord: Coord): void {
    if (this.svgSelectedEditPointIndex === -1) return;

    const coordControls = (this.options.controls['commands'] as FormArray).controls
      .map((c) => ((c as FormGroup).controls['coords'] as FormArray).controls)
      .flatMap((c) => c) as FormControl[];
    coordControls[this.svgSelectedEditPointIndex].patchValue({
      x: coord.x,
      y: coord.y,
    });
  }

  //#endregion mouse-events-edit

  public drawShape(model: PathModel): void {
    const path = model.commands.reduce((path, command) => {
      path += command.type;
      path += command.coords.map((c) => `${c.x},${c.y}`).join(' ');
      return path;
    }, '');
    this.shapeEl.setAttribute('d', path);
  }

  public getShapeEditPointsCoords(): Coord[] {
    return (this.options.value as PathModel).commands.map((c) => c.coords).flatMap((c) => c);
  }

  public isShapeType<T extends keyof typeof ShapePainterMapping>(shape: T): this is InstanceType<(typeof ShapePainterMapping)[T]> {
    return shape === Shape.PATH;
  }

  public moveTo() {
    this.currentCommand = COMMANDS.MOVE_TO;
  }

  public lineTo() {
    this.currentCommand = COMMANDS.LINE_TO;
  }

  public cubizBezier() {
    this.currentCommand = COMMANDS.CUBIC_BEZIER;
  }

  public closePath() {
    this.currentCommand = COMMANDS.CLOSE_PATH;
    (this.options.controls['commands'] as FormArray).push(
      new FormGroup({
        type: new FormControl(COMMANDS.CLOSE_PATH),
        coords: new FormArray([]),
      })
    );
    this._isShapeCompleted = true;
  }
}
