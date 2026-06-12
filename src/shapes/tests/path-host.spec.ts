import { TestBed } from '@angular/core/testing';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { PathHost } from '../path-host';

describe('PathHost', () => {
  let service: PathHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElementsRefService, FormsService, ShapeListService],
    });

    const elementsRefService = TestBed.inject(ElementsRefService);
    const formsService = TestBed.inject(FormsService);
    const shapeListService = TestBed.inject(ShapeListService);
    service = new PathHost(elementsRefService, formsService, shapeListService);
  });

  describe('parseOptimizedString', () => {
    beforeEach(() => {
      service.stroke = '#00ff00ee';
      service.fill = '#ff0000ee';
      service.strokeWidth = 3;
      service.strokeLinecap = 'round';
      service.strokeLinejoin = 'bevel';
      service.strokeDasharray = [1, 3];
      service.d = [
        { instruction: 'M', parameters: [1, 2] },
        {
          instruction: 'L',
          parameters: [5.8, 5.6, 20.7, 80.9],
        },
        {
          instruction: 'C',
          parameters: [9.8, 4.8, 43.5, 49.04, 73.1, 94.3],
        },
        { instruction: 'Z', parameters: [] },
      ];
    });

    it('should parse all attributes', () => {
      expect(service.parseOptimizedString()).toEqual(
        '<path stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" stroke-linejoin="bevel" />',
      );
    });

    it('should remove transparency from colors if it is totally opaque ("ff")', () => {
      service.stroke = '#00ff00ff';
      service.fill = '#ff0000ff';

      expect(service.parseOptimizedString()).toEqual(
        '<path stroke-width="3" stroke="#00ff00" fill="#ff0000" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse fill if it is totally black ("#000000ff")', () => {
      service.fill = '#000000ff';

      expect(service.parseOptimizedString()).toEqual(
        '<path stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke if stroke-width is 0', () => {
      service.strokeWidth = 0;

      expect(service.parseOptimizedString()).toEqual(
        '<path stroke-width="0" fill="#ff0000ee" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke-width if it is the default', () => {
      service.strokeWidth = 1;

      expect(service.parseOptimizedString()).toEqual(
        '<path stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stoke-width or stroke if stroke is totally transparent ("00")', () => {
      service.stroke = '#ff00ff00';

      expect(service.parseOptimizedString()).toEqual(
        '<path fill="#ff0000ee" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke-dasharray if empty', () => {
      service.strokeDasharray = [];

      expect(service.parseOptimizedString()).toEqual(
        '<path stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke-linecap if default', () => {
      service.strokeLinecap = 'butt';

      expect(service.parseOptimizedString()).toEqual(
        '<path stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linejoin="bevel" />',
      );
    });

    it('should not parse stroke-linejoin if default', () => {
      service.strokeLinejoin = 'miter';

      expect(service.parseOptimizedString()).toEqual(
        '<path stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" />',
      );
    });

    it('should not parse if path is just the start point', () => {
      service.d = [{ instruction: 'M', parameters: [1, 2] }];

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
        '<path data-stroke-binding="strokeProp" data-fill-binding="fillProp" data-stroke-width-binding="strokeWidthProp" data-stroke-dasharray-binding="strokeDasharrayProp" stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" d="M1 2L5.8 5.6 20.7 80.9C9.8 4.8 43.5 49.04 73.1 94.3Z" stroke-linecap="round" stroke-linejoin="bevel" />',
      );
    });
  });
});
