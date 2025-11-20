import { TestBed } from '@angular/core/testing';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { RectHost } from '../rect-host';

describe('RectHost', () => {
  let service: RectHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElementsRefService, FormsService, ShapeListService],
    });

    const elementsRefService = TestBed.inject(ElementsRefService);
    const formsService = TestBed.inject(FormsService);
    const shapeListService = TestBed.inject(ShapeListService);
    service = new RectHost(elementsRefService, formsService, shapeListService);
  });

  describe('parseOptimizedString', () => {
    beforeEach(() => {
      service.stroke = '#00ff00ee';
      service.fill = '#ff0000ee';
      service.strokeWidth = 3;
      service.strokeLinejoin = 'bevel';
      service.strokeDasharray = [1, 3];
      service.x = 5;
      service.y = 5;
      service.width = 23.8;
      service.height = 89.0;
      service.rx = 5;
      service.ry = 8;
    });

    it('should parse all attributes', () => {
      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });

    it('should remove transparency from colors if it is totally opaque ("ff")', () => {
      service.stroke = '#00ff00ff';
      service.fill = '#ff0000ff';

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="3" stroke="#00ff00" fill="#ff0000" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse fill if it is totally black ("#000000ff")', () => {
      service.fill = '#000000ff';

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke if stroke-width is 0', () => {
      service.strokeWidth = 0;

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="0" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke-width if it is the default', () => {
      service.strokeWidth = 1;

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stoke-width or stroke if stroke is totally transparent ("00")', () => {
      service.stroke = '#ff00ff00';

      expect(service.parseOptimizedString()).toEqual(
        '<rect fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke-dasharray if empty', () => {
      service.strokeDasharray = [];

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" x="5" y="5" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke-linejoin if default', () => {
      service.strokeLinejoin = 'miter';

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="5" ry="8" />',
      );
    });

    it('should not parse x and y with default values', () => {
      service.x = 0;
      service.y = 0;

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse rx and ry if are default', () => {
      service.rx = 0;
      service.ry = 0;

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" stroke-linejoin="bevel" />',
      );
    });

    it('should parse only rx or ry if are equal', () => {
      service.rx = 9;
      service.ry = 9;

      expect(service.parseOptimizedString()).toEqual(
        '<rect stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="9" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse if stroke and fill are totally transparent', () => {
      service.fill = '#00ff0000';
      service.stroke = '#00ff0000';

      expect(service.parseOptimizedString()).toEqual('');
    });

    it('should not parse if fill is totally transparent and strokeWidth is 0', () => {
      service.fill = '#ff002200';
      service.strokeWidth = 0;

      expect(service.parseOptimizedString()).toEqual('');
    });

    it('should parse data-attributes-bindings', () => {
      service.svg.dataset['strokeBinding'] = 'strokeProp';
      service.svg.dataset['fillBinding'] = 'fillProp';
      service.svg.dataset['strokeWidthBinding'] = 'strokeWidthProp';
      service.svg.dataset['strokeDasharrayBinding'] = 'strokeDasharrayProp';

      expect(service.parseOptimizedString()).toEqual(
        '<rect data-stroke-binding="strokeProp" data-fill-binding="fillProp" data-stroke-width-binding="strokeWidthProp" data-stroke-dasharray-binding="strokeDasharrayProp" stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="5" width="23.8" height="89" rx="5" ry="8" stroke-linejoin="bevel" />',
      );
    });
  });
});
