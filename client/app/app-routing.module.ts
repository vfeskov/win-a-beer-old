import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';

import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component'

const routes: Routes = [
  {
    path: '',
    component: MainComponent
  },
  {
    path: 'unsubscribe/:target/:lambdajwt',
    component: UnsubscribeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
