import { Shape } from '../shapes';
import { CirclePainter } from './circle.painter';
import { CubicBezierPainter } from './cubic-bezier.painter';
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
  [Shape.CUBIC_BEZIER]: CubicBezierPainter,
};
