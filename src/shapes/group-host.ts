import { Coord, CoordWithDelta, ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../models/shape';
import { FormsService } from '../services/forms.service';
import { ShapeListService } from '../services/shape-list.service';
import { CircleHost } from './circle-host';
import { LineHost } from './line-host';
import { PathHost } from './path-host';
import { RectHost } from './rect-host';
import { ShapeHost } from './shape-host';
import { TextHost } from './text-host';

export class GroupHost extends ShapeHost {
  //#region path host vars
  public readonly shapes: ShapeHost[] = [];
  public readonly cdkDropListId = crypto.randomUUID();
  //#endregion

  public override readonly tag = Shape.G;
  public override svg: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', Shape.G);

  public constructor(elementsRefService: ElementsRefService, formsService: FormsService, shapeListService: ShapeListService) {
    super(elementsRefService, formsService, shapeListService);

    this.name = `group_${ShapeHost.shapeCounter++}`;
  }

  //#region mouse
  public override mouseDown(coord: Coord): void {
    throw new Error('Method not implemented.');
  }
  public override mouseDrag(coord: CoordWithDelta): void {
    throw new Error('Method not implemented.');
  }
  public override mouseUp(coord: CoordWithDelta): void {
    throw new Error('Method not implemented.');
  }
  //#endregion

  //#region mouse drag edit
  public override mouseDragEdit(coord: CoordWithDelta): void {
    throw new Error('Method not implemented.');
  }
  //#endregion

  //#region edit point
  protected override getEditPointCoords(): Coord[] {
    throw new Error('Method not implemented.');
  }
  public override updatePositionSvgEditPoints(): void {
    throw new Error('Method not implemented.');
  }
  //#endregion

  //#region move shape
  public override moveShapeUp(amount: number): void {
    this.shapes.forEach((shape) => shape.moveShapeUp(amount));
  }
  public override moveShapeRight(amount: number): void {
    this.shapes.forEach((shape) => shape.moveShapeRight(amount));
  }
  public override moveShapeDown(amount: number): void {
    this.shapes.forEach((shape) => shape.moveShapeDown(amount));
  }
  public override moveShapeLeft(amount: number): void {
    this.shapes.forEach((shape) => shape.moveShapeLeft(amount));
  }
  //#endregion

  //#region export
  // TODO implement this region
  public override parseShapeToString(): string {
    throw new Error('Method not implemented.');
  }
  //#endregion

  //#region svg form binding
  public override onEditingExistingShape(): void {
    throw new Error('Method not implemented.');
  }
  public override onCreatingNewShape(): void {
    throw new Error('Method not implemented.');
  }
  //#endregion
}
