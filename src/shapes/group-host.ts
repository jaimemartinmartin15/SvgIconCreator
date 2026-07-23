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
  // TODO implement this region to move all the shapes of the group
  public override moveShapeUp(amount: number): void {
    throw new Error('Method not implemented.');
  }
  public override moveShapeRight(amount: number): void {
    throw new Error('Method not implemented.');
  }
  public override moveShapeDown(amount: number): void {
    throw new Error('Method not implemented.');
  }
  public override moveShapeLeft(amount: number): void {
    throw new Error('Method not implemented.');
  }
  //#endregion

  //#region import
  public override loadFromElementIntoParent(svg: SVGElement, parent: SVGSVGElement | GroupHost): void {
    super.loadFromElementIntoParent(svg, parent);

    Array.from(svg.children).forEach((svgShape) => {
      switch (svgShape.tagName) {
        case 'rect':
          const rectHost = new RectHost(this.elementsRefService, this.formsService, this.shapeListService);
          rectHost.loadFromElementIntoParent(svgShape as SVGRectElement, parent);
          break;
        case 'line':
          const lineHost = new LineHost(this.elementsRefService, this.formsService, this.shapeListService);
          lineHost.loadFromElementIntoParent(svgShape as SVGLineElement, parent);
          break;
        case 'path':
          const pathHost = new PathHost(this.elementsRefService, this.formsService, this.shapeListService);
          pathHost.loadFromElementIntoParent(svgShape as SVGPathElement, parent);
          break;
        case 'circle':
          const circleHost = new CircleHost(this.elementsRefService, this.formsService, this.shapeListService);
          circleHost.loadFromElementIntoParent(svgShape as SVGCircleElement, parent);
          break;
        case 'text':
          const textHost = new TextHost(this.elementsRefService, this.formsService, this.shapeListService);
          textHost.loadFromElementIntoParent(svgShape as SVGTextElement, parent);
          break;
        case 'g':
          const groupHost = new GroupHost(this.elementsRefService, this.formsService, this.shapeListService);
          groupHost.loadFromElementIntoParent(svgShape as SVGGElement, this);
          break;
      }
    });
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
