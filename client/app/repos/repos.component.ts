import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContextService } from 'app/common';
import { Observable as $ } from 'rxjs/Observable';

@Component({
  selector: 'wab-repos',
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReposComponent {
  constructor(public context: ContextService) {
  }
}
