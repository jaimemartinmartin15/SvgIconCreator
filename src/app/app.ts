import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  constructor(private readonly shapeListService: ShapeListService) {}

  @HostListener('window:beforeunload', ['$event'])
  onBeforeunload(event: BeforeUnloadEvent) {
    if (this.shapeListService.shapeList.length > 0) {
      // Message of the pop up cannot be edited
      event.preventDefault();
      event.returnValue = ''; // For legacy browsers
    }
  }
}
