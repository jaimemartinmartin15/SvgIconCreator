import { SharedModel } from '../shared.model';

export interface TextModel extends SharedModel {
  x: number;
  y: number;
  text: string;
  fontSize: number;
}
