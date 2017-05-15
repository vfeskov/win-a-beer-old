import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CommonModule } from './common';
import { AppComponent } from './app.component';
import { GithubSearchComponent } from './github-search/github-search.component';
import { ReposComponent } from './repos/repos.component';
import { AuthComponent } from './auth/auth.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    GithubSearchComponent,
    ReposComponent,
    AuthComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserAnimationsModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [GithubSearchComponent, ReposComponent, AuthComponent, SettingsComponent]
})
export class AppModule { }
