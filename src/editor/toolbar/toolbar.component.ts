import { Component } from '@angular/core';
import { CanvasOptionsComponent } from './canvas-options/canvas-options.component';
import { ExportSvgComponent } from './export-svg/export-svg.component';
import { ImportSvgComponent } from './import-svg/import-svg.component';
import { ShapeSelectorComponent } from './shape-selector/shape-selector.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [ImportSvgComponent, ExportSvgComponent, CanvasOptionsComponent, ShapeSelectorComponent],
})
export class ToolbarComponent {}
