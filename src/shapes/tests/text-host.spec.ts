import { TestBed } from '@angular/core/testing';
import { ElementsRefService } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { FormsService } from '../../services/forms.service';
import { ShapeListService } from '../../services/shape-list.service';
import { TextHost } from '../text-host';

describe('TextHost', () => {
  let service: TextHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElementsRefService, FormsService, ShapeListService],
    });

    const elementsRefService = TestBed.inject(ElementsRefService);
    const formsService = TestBed.inject(FormsService);
    const shapeListService = TestBed.inject(ShapeListService);
    service = new TextHost(elementsRefService, formsService, shapeListService);
  });

  describe('parseOptimizedString', () => {
    beforeEach(() => {
      service.stroke = '#00ff00ee';
      service.fill = '#ff0000ee';
      service.strokeWidth = 3;
      service.strokeLinecap = 'round';
      service.strokeLinejoin = 'bevel';
      service.strokeDasharray = [1, 3];
      service.x = 5;
      service.y = 8;
      service.text = 'jaime';
      service.fontSize = 5;
      service.fontFamily = 'Helvetica';
    });

    it('should parse all attributes', () => {
      expect(service.parseOptimizedString()).toEqual(
        '<text stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should remove transparency from colors if it is totally opaque ("ff")', () => {
      service.stroke = '#00ff00ff';
      service.fill = '#ff0000ff';

      expect(service.parseOptimizedString()).toEqual(
        '<text stroke-width="3" stroke="#00ff00" fill="#ff0000" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse fill if it is totally black ("#000000ff")', () => {
      service.fill = '#000000ff';

      expect(service.parseOptimizedString()).toEqual(
        '<text stroke-width="3" stroke="#00ff00ee" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse stroke if stroke-width is 0', () => {
      service.strokeWidth = 0;

      expect(service.parseOptimizedString()).toEqual(
        '<text stroke-width="0" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse stroke-width if it is the default', () => {
      service.strokeWidth = 1;

      expect(service.parseOptimizedString()).toEqual(
        '<text stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse stoke-width or stroke if stroke is totally transparent ("00")', () => {
      service.stroke = '#ff00ff00';

      expect(service.parseOptimizedString()).toEqual(
        '<text fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse stroke-dasharray if empty', () => {
      service.strokeDasharray = [];

      expect(service.parseOptimizedString()).toEqual(
        '<text stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" x="5" y="8" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse stroke-linecap if default', () => {
      service.strokeLinecap = 'butt';

      expect(service.parseOptimizedString()).toEqual(
        '<text stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse stroke-linejoin if default', () => {
      service.strokeLinejoin = 'miter';

      expect(service.parseOptimizedString()).toEqual(
        '<text stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linecap="round" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse x and y if they are default', () => {
      service.x = 0;
      service.y = 0;

      expect(service.parseOptimizedString()).toEqual(
        '<text stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });

    it('should not parse if content is empty', () => {
      service.text = '';

      expect(service.parseOptimizedString()).toEqual('');
    });

    it('should not parse if font-size is 0', () => {
      service.fontSize = 0;

      expect(service.parseOptimizedString()).toEqual('');
    });

    it('should parse data-attributes-bindings', () => {
      service.svg.dataset['strokeBinding'] = 'strokeProp';
      service.svg.dataset['fillBinding'] = 'fillProp';
      service.svg.dataset['strokeWidthBinding'] = 'strokeWidthProp';
      service.svg.dataset['strokeDasharrayBinding'] = 'strokeDasharrayProp';

      expect(service.parseOptimizedString()).toEqual(
        '<text data-stroke-binding="strokeProp" data-fill-binding="fillProp" data-stroke-width-binding="strokeWidthProp" data-stroke-dasharray-binding="strokeDasharrayProp" stroke-width="3" stroke="#00ff00ee" fill="#ff0000ee" stroke-dasharray="1 3" x="5" y="8" font-size="5" stroke-linecap="round" stroke-linejoin="bevel" font-family="Helvetica" >jaime</text>',
      );
    });
  });
});
