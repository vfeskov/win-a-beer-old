import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export class HasDeadStream implements OnDestroy {
  dead$: Subject<any> = new Subject();
  ngOnDestroy() {
    this.dead$.next();
  }
}
