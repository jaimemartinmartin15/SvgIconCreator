import { TestBed } from '@angular/core/testing';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { CircleHost } from '../circle-host';

describe('CircleHost', () => {
  let service: CircleHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElementsRefService, FormsService, ShapeListService],
    });

    const elementsRefService = TestBed.inject(ElementsRefService);
    const formsService = TestBed.inject(FormsService);
    const shapeListService = TestBed.inject(ShapeListService);
    service = new CircleHost(elementsRefService, formsService, shapeListService);
  });

  describe('parseOptimizedString', () => {
    beforeEach(() => {
      service.stroke = '#00ff00ee';
      service.fill = '#ff0000ee';
      service.strokeWidth = 3;
      service.strokeDasharray = [1, 3];
      service.cx = 4;
      service.cy = 4.3;
      service.r = 4;
    });

    it('should parse all attributes', () => {
      expect(service.parseOptimizedString()).toEqual('<circle stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" cx="4" cy="4.3" r="4" />');
    });

    it('should remove transparency from colors if it is totally opaque ("ff")', () => {
      service.stroke = '#00ff00ff';
      service.fill = '#ff0000ff';

      expect(service.parseOptimizedString()).toEqual('<circle stroke-width="3" stroke="#00ff00" fill="#ff0000" stroke-dasharray="1 3" cx="4" cy="4.3" r="4" />');
    });

    it('should not parse fill if it is totally black ("#000000ff")', () => {
      service.fill = '#000000ff';

      expect(service.parseOptimizedString()).toEqual('<circle stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" cx="4" cy="4.3" r="4" />');
    });

    it('should not parse stroke if stroke-width is 0', () => {
      service.strokeWidth = 0;

      expect(service.parseOptimizedString()).toEqual('<circle stroke-width="0" fill="#ff0000ee" stroke-dasharray="1 3" cx="4" cy="4.3" r="4" />');
    });

    it('should not parse stroke-width if it is the default', () => {
      service.strokeWidth = 1;

      expect(service.parseOptimizedString()).toEqual('<circle stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" cx="4" cy="4.3" r="4" />');
    });

    it('should not parse stoke-width or stroke if stroke is totally transparent ("00")', () => {
      service.stroke = '#ff00ff00';

      expect(service.parseOptimizedString()).toEqual('<circle fill="#ff0000ee" stroke-dasharray="1 3" cx="4" cy="4.3" r="4" />');
    });

    it('should not parse cx and cy with default values', () => {
      service.cx = 0;
      service.cy = 0;

      expect(service.parseOptimizedString()).toEqual('<circle stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" r="4" />');
    });

    it('should not parse stroke-dasharray if empty', () => {
      service.strokeDasharray = [];

      expect(service.parseOptimizedString()).toEqual('<circle stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" cx="4" cy="4.3" r="4" />');
    });

    it('should not parse if r is 0', () => {
      service.r = 0;

      expect(service.parseOptimizedString()).toEqual('');
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

    it('should parse data-attributes', () => {
      service.svg.dataset['attributes'] = JSON.stringify({ stroke: 'strokeInput' });

      expect(service.parseOptimizedString()).toEqual(
        '<circle data-attributes="{\\&quot;stroke\\&quot;:\\&quot;strokeInput\\&quot;}" stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" cx="4" cy="4.3" r="4" />',
      );
    });
  });
});
