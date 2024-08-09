import { Shape } from '../shape';
import { CirclePainter } from './circle.painter';
import { LinePainter } from './line.painter';
import { PathPainter } from './path.painter';
import { RectPainter } from './rect.painter';
import { TextPainter } from './text.painter';

export const ShapePainterMapping = {
  [Shape.RECT]: RectPainter,
  [Shape.CIRCLE]: CirclePainter,
  [Shape.LINE]: LinePainter,
  [Shape.TEXT]: TextPainter,
  [Shape.PATH]: PathPainter,
};
