import { Routes } from '@angular/router';
import { EditorComponent } from '../editor/editor.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: EditorComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
