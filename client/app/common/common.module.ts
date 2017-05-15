import { NgModule } from '@angular/core';
import { GithubService } from './github.service';
import { MaterialModule } from './material.module';
import { ContextService } from './context.service';

@NgModule({
  imports: [MaterialModule],
  exports: [MaterialModule],
  providers: [GithubService, ContextService]
})
export class CommonModule { }
