import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ExtractFormGroupControls, ToFormType } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { LOCAL_STORE_KEYS } from '../constants/local-storage-keys';
import { Command } from '../models/path.model';
import { Shape } from '../models/shape';
import { ViewBoxModel } from '../models/view-box.model';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  //#region toolbar
  public readonly shapeSelectorForm = new FormControl(Shape.RECT, { nonNullable: true });
  public readonly canvasOptionsViewBoxForm = new FormGroup<ExtractFormGroupControls<ToFormType<ViewBoxModel>>>({
    x: new FormControl(0, { nonNullable: true }),
    y: new FormControl(0, { nonNullable: true }),
    width: new FormControl(100, { nonNullable: true }),
    height: new FormControl(100, { nonNullable: true }),
  });
  public readonly showGridForm = new FormControl<boolean>(false, { nonNullable: true });
  //#endregion

  //#region parameters config
  public readonly scaleAltForm = new FormControl<number>(+(localStorage.getItem(LOCAL_STORE_KEYS.SCALE_ALT) ?? 1.005), { nonNullable: true });
  public readonly scaleNormalForm = new FormControl<number>(+(localStorage.getItem(LOCAL_STORE_KEYS.SCALE_NORMAL) ?? 1.1), { nonNullable: true });
  public readonly scaleShiftForm = new FormControl<number>(+(localStorage.getItem(LOCAL_STORE_KEYS.SCALE_SHIFT) ?? 1.33), { nonNullable: true });
  public readonly moveAltForm = new FormControl<number>(+(localStorage.getItem(LOCAL_STORE_KEYS.MOVE_ALT) ?? 0.1), { nonNullable: true });
  public readonly moveNormalForm = new FormControl<number>(+(localStorage.getItem(LOCAL_STORE_KEYS.MOVE_NORMAL) ?? 1), { nonNullable: true });
  public readonly moveShiftForm = new FormControl<number>(+(localStorage.getItem(LOCAL_STORE_KEYS.MOVE_SHIFT) ?? 10), { nonNullable: true });
  //#endregion

  //#region svg attributes forms
  //#region shared
  public strokeForm = new FormControl<string>('#000000ff', { nonNullable: true });
  public fillForm = new FormControl<string>('#ffffffff', { nonNullable: true });
  public strokeWidthForm = new FormControl<number>(1, { nonNullable: true });
  public strokeLinecapForm = new FormControl<string>('butt', { nonNullable: true });
  public strokeLinejoinForm = new FormControl<string>('miter', { nonNullable: true });
  public strokeDasharrayForm = new FormArray<ToFormType<number>>([]);
  //#endregion

  //#region rect
  public xForm = new FormControl<number>(0, { nonNullable: true });
  public yForm = new FormControl<number>(0, { nonNullable: true });
  public widthForm = new FormControl<number>(0, { nonNullable: true });
  public heightForm = new FormControl<number>(0, { nonNullable: true });
  public rxForm = new FormControl<number>(0, { nonNullable: true });
  public ryForm = new FormControl<number>(0, { nonNullable: true });
  //#endregion

  //#region line
  public x1Form = new FormControl<number>(0, { nonNullable: true });
  public y1Form = new FormControl<number>(0, { nonNullable: true });
  public x2Form = new FormControl<number>(0, { nonNullable: true });
  public y2Form = new FormControl<number>(0, { nonNullable: true });
  //#endregion

  //#region path
  public dForm = new FormArray<ToFormType<Command>>([]);
  //#endregion

  //#region circle
  public cxForm = new FormControl<number>(0, { nonNullable: true });
  public cyForm = new FormControl<number>(0, { nonNullable: true });
  public rForm = new FormControl<number>(0, { nonNullable: true });
  //#endregion

  //#region text
  public textForm = new FormControl<string>('text', { nonNullable: true });
  public fontSizeForm = new FormControl<number>(15, { nonNullable: true });
  public fontFamilyForm = new FormControl<string>('Arial', { nonNullable: true });
  public textAnchorForm = new FormControl<string>('start', { nonNullable: true });
  //#endregion
  //#endregion
}
