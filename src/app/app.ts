import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeyboardService } from '../services/keyboard.service';
import { ShapeListService } from '../services/shape-list.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class App {
  constructor(
    private readonly shapeListService: ShapeListService,
    private readonly keyboardService: KeyboardService,
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  onBeforeunload(event: BeforeUnloadEvent) {
    if (this.shapeListService.shapeList.length > 0) {
      // Message of the pop up cannot be edited
      event.preventDefault();
      event.returnValue = ''; // For legacy browsers
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent) {
    this.keyboardService.windowKeyDown(event);
  }

  @HostListener('window:keyup', ['$event'])
  protected onKeyUp(event: KeyboardEvent) {
    this.keyboardService.windowKeyUp(event);
  }
}
