import { Coord } from "./coord";

export interface CoordWithDelta extends Coord {
  dx: number;
  dy: number;
}