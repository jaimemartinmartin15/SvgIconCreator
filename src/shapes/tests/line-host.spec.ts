import { TestBed } from '@angular/core/testing';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { LineHost } from '../line-host';

describe('LineHost', () => {
  let service: LineHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElementsRefService, FormsService, ShapeListService],
    });

    const elementsRefService = TestBed.inject(ElementsRefService);
    const formsService = TestBed.inject(FormsService);
    const shapeListService = TestBed.inject(ShapeListService);
    service = new LineHost(elementsRefService, formsService, shapeListService);
  });

  describe('parseOptimizedString', () => {
    beforeEach(() => {
      service.stroke = '#00ff00ee';
      service.strokeWidth = 3;
      service.strokeLinecap = 'round';
      service.strokeDasharray = [1, 3];
      service.x1 = 6;
      service.y1 = 9;
      service.x2 = 12;
      service.y2 = 18;
    });

    it('should parse all attributes', () => {
      expect(service.parseOptimizedString()).toEqual(
        '<line stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" x1="6" y1="9" x2="12" y2="18" stroke-linecap="round" />',
      );
    });

    it('should remove transparency from colors if it is totally opaque ("ff")', () => {
      service.stroke = '#00ff00ff';

      expect(service.parseOptimizedString()).toEqual(
        '<line stroke-width="3" stroke="#00ff00" stroke-dasharray="1 3" x1="6" y1="9" x2="12" y2="18" stroke-linecap="round" />',
      );
    });

    it('should not parse stroke-width if it is the default', () => {
      service.strokeWidth = 1;

      expect(service.parseOptimizedString()).toEqual('<line stroke="#00ff00ee" stroke-dasharray="1 3" x1="6" y1="9" x2="12" y2="18" stroke-linecap="round" />');
    });

    it('should not parse stroke-dasharray if empty', () => {
      service.strokeDasharray = [];

      expect(service.parseOptimizedString()).toEqual('<line stroke-width="3" stroke="#00ff00ee" x1="6" y1="9" x2="12" y2="18" stroke-linecap="round" />');
    });

    it('should not parse stroke-linecap if default', () => {
      service.strokeLinecap = 'butt';

      expect(service.parseOptimizedString()).toEqual('<line stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" x1="6" y1="9" x2="12" y2="18" />');
    });

    it('should not parse coords if are default', () => {
      service.x1 = 0;
      service.y1 = 0;
      service.x2 = 0;
      service.y2 = 8;

      expect(service.parseOptimizedString()).toEqual('<line stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" y2="8" stroke-linecap="round" />');

      service.y1 = 8;
      service.y2 = 0;

      expect(service.parseOptimizedString()).toEqual('<line stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" y1="8" stroke-linecap="round" />');
    });

    it('should not parse if all coords are the same', () => {
      service.x1 = 8;
      service.y1 = 8;
      service.x2 = 8;
      service.y2 = 8;

      expect(service.parseOptimizedString()).toEqual('');
    });

    it('should not parse if stroke-width is 0', () => {
      service.strokeWidth = 0;

      expect(service.parseOptimizedString()).toEqual('');
    });

    it('should not parse if stroke is totally transparent ("00")', () => {
      service.stroke = '#ff00ff00';

      expect(service.parseOptimizedString()).toEqual('');
    });

    it('should parse data-attributes', () => {
      service.svg.dataset['attributes'] = JSON.stringify({ stroke: 'strokeInput' });

      expect(service.parseOptimizedString()).toEqual(
        '<line data-attributes="{\\&quot;stroke\\&quot;:\\&quot;strokeInput\\&quot;}" stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" x1="6" y1="9" x2="12" y2="18" stroke-linecap="round" />',
      );
    });
  });
});
