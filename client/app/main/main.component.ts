import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContextService } from 'app/common';

@Component({
  selector: 'wab-main',
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {

  constructor(private context: ContextService) { }

  ngOnInit() {
    this.context.loadUserData();
  }

}
