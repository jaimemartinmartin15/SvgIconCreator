import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputNumberDirective } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { LOCAL_STORE_KEYS } from '../../../constants/local-storage-keys';
import { FormsService } from '../../../services/forms.service';
import { BurgerSvgComponent } from '../../../svg-output/burger.component';
import { GearSvgComponent } from '../../../svg-output/gear.component';
import { PlusSvgComponent } from '../../../svg-output/plus.component';

@Component({
  selector: 'app-parameters-config',
  templateUrl: './parameters-config.component.html',
  styleUrls: ['./parameters-config.component.scss'],
  imports: [CdkDrag, CdkDragHandle, ReactiveFormsModule, InputNumberDirective, GearSvgComponent, BurgerSvgComponent, PlusSvgComponent],
})
export class ParametersConfigComponent implements OnInit {
  @ViewChild('parametersConfigDialog')
  public parametersConfigDialogElRef: ElementRef<HTMLDialogElement>;

  public constructor(public readonly formsService: FormsService) {}

  public ngOnInit(): void {
    this.formsService.scaleAltForm.valueChanges.subscribe((v) => {
      localStorage.setItem(LOCAL_STORE_KEYS.SCALE_ALT, `${v}`);
    });
    this.formsService.scaleNormalForm.valueChanges.subscribe((v) => {
      localStorage.setItem(LOCAL_STORE_KEYS.SCALE_NORMAL, `${v}`);
    });
    this.formsService.scaleShiftForm.valueChanges.subscribe((v) => {
      localStorage.setItem(LOCAL_STORE_KEYS.SCALE_SHIFT, `${v}`);
    });
    this.formsService.moveAltForm.valueChanges.subscribe((v) => {
      localStorage.setItem(LOCAL_STORE_KEYS.MOVE_ALT, `${v}`);
    });
    this.formsService.moveNormalForm.valueChanges.subscribe((v) => {
      localStorage.setItem(LOCAL_STORE_KEYS.MOVE_NORMAL, `${v}`);
    });
    this.formsService.moveShiftForm.valueChanges.subscribe((v) => {
      localStorage.setItem(LOCAL_STORE_KEYS.MOVE_SHIFT, `${v}`);
    });
  }

  public showDialog() {
    this.parametersConfigDialogElRef.nativeElement.showModal();
  }
}
