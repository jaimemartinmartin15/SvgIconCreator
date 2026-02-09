import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class KeyboardService {
  private keysDown = new Set<string>();
  private _capsLockOn: boolean = false;

  // invoked from app.ts
  public windowKeyDown(event: KeyboardEvent) {
    this.keysDown.add(event.key);
    this._capsLockOn = event.getModifierState('CapsLock');
  }

  // invoked from app.ts
  public windowKeyUp(event: KeyboardEvent) {
    this.keysDown.delete(event.key);
    this._capsLockOn = event.getModifierState('CapsLock');
  }

  public get shiftKey() {
    return this.keysDown.has('Shift');
  }

  public get useMayus(): boolean {
    return this.shiftKey !== this._capsLockOn;
  }
}
