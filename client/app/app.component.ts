import { Component } from '@angular/core';
import { ContextService } from 'app/common';

@Component({
  selector: 'wab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public context: ContextService) { }
}
