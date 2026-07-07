import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { adaptWidthOfInputToWidthOfText } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Shape } from '../../../models/shape';
import { ShapeListService } from '../../../services/shape-list.service';
import { ShapeHost } from '../../../shapes/shape-host';

@Component({
  selector: 'app-shape-element',
  templateUrl: './shape-element.component.html',
  styleUrls: ['./shape-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule],
})
export class ShapeElementComponent implements OnInit, AfterViewInit {
  public Shape = Shape;
  public nameForm = new FormControl<string>('', { nonNullable: true });

  @ViewChild('shapeName')
  public shapeNameInput: ElementRef<HTMLInputElement>;

  @Input()
  public shapeHost: ShapeHost;

  @Output()
  public openBindingsDialog = new EventEmitter<void>();

  @HostBinding('class.selected')
  public get isSelected(): boolean {
    return this.shapeListService.selectedShape === this.shapeHost;
  }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    this.selectShape(event);
  }

  public constructor(private readonly shapeListService: ShapeListService) {}

  public ngOnInit(): void {
    this.nameForm.valueChanges.subscribe((v) => (this.shapeHost.name = v));
    this.nameForm.setValue(this.shapeHost.name);
  }

  public ngAfterViewInit(): void {
    adaptWidthOfInputToWidthOfText(this.shapeNameInput.nativeElement);
  }

  public toggleVisibility(event: Event): void {
    this.shapeHost.setVisibility((event.target as HTMLInputElement).checked);
  }

  public adaptShapeNameSize(event: Event) {
    adaptWidthOfInputToWidthOfText(event.target as HTMLInputElement);
  }

  public selectShape(event: MouseEvent | FocusEvent) {
    const ctrlKey = event instanceof MouseEvent ? event.ctrlKey : false;

    // whether if it is selecting other shape or just unselecting current one, finish the shape
    if (this.shapeListService.selectedShape) {
      this.shapeListService.selectedShape.isShapeFinished = true;
    }

    if (this.shapeListService.selectedShape === this.shapeHost && ctrlKey) {
      this.shapeListService.selectedShape?.clearEditPoints();
      this.shapeListService.selectedShape = undefined;
    } else {
      this.shapeListService.selectedShape?.clearEditPoints();
      this.shapeListService.selectedShape = this.shapeHost;
      this.shapeHost.createEditPoints();
    }
  }

  public onDeleteShape(event: MouseEvent) {
    event.stopPropagation();
    this.shapeHost.delete();
  }
}
