import { NgModule } from '@angular/core';
import {
  MdButtonModule,
  MdToolbarModule,
  MdInputModule,
  MdAutocompleteModule,
  MdProgressBarModule,
  MdListModule,
  MdIconModule,
  MdSlideToggleModule
} from '@angular/material';

const allModules = [
  MdButtonModule,
  MdToolbarModule,
  MdInputModule,
  MdAutocompleteModule,
  MdProgressBarModule,
  MdListModule,
  MdIconModule,
  MdSlideToggleModule
];

@NgModule({
  imports: allModules,
  exports: allModules,
})
export class MaterialModule { }
