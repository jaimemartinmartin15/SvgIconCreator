import { Component, HostBinding, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CollapsibleComponent } from '@jaimemartinmartin15/jei-devkit-angular-shared';
import { Subject, takeUntil } from 'rxjs';
import { ShapeListService } from '../../../services/shape-list.service';
import { ShapeHost } from '../../../shapes/shape-host';

@Component({
  template: '', // overrided by shape-form child implementations
})
export abstract class ShapeFormComponent implements OnInit, OnDestroy {
  private componentDestroyed$ = new Subject<void>();

  @ViewChild(CollapsibleComponent)
  public jeiCollapsible: CollapsibleComponent;

  @Input()
  public host: ShapeHost;

  public constructor(
    private readonly shapeListService: ShapeListService,
  ) { }

  //#region  hooks
  public ngOnInit(): void {
    this.host.form.valueChanges
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((v) => {
        this.host.updateSvgAttributes(v);
        this.host.updatePositionSvgEditPoints(v)
      });
  }


  public ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
  //#endregion

  //#region bindings
  @HostBinding('class.selected')
  public get isSelected() {
    return this.shapeListService.selectedShape === this.host;
  }

  @HostBinding('class.expanded')
  public get isExpanded() {
    return this.jeiCollapsible?.isOpen ?? true;
  }

  public selectShape(event: MouseEvent) {
    // whether if it is selecting other shape or just unselecting current one, finish the shape
    if (this.shapeListService.selectedShape) {
      this.shapeListService.selectedShape.isShapeFinished = true;
    }

    if (this.shapeListService.selectedShape === this.host && event.ctrlKey) {
      this.shapeListService.selectedShape?.clearEditPoints();
      this.shapeListService.selectedShape = undefined;
    } else {
      this.shapeListService.selectedShape?.clearEditPoints();
      this.shapeListService.selectedShape = this.host;
      this.host.createEditPoints();
    }
  }
  //#endregion
}
