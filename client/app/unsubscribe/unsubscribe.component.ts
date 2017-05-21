import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContextService } from 'app/common';
import { Observable as $ } from 'rxjs/Observable';
const { assign } = Object;

@Component({
  selector: 'wab-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnsubscribeComponent implements OnInit {
  status$: $<string>;
  loading$: $<boolean>;

  constructor(private route: ActivatedRoute, private context: ContextService) { }

  ngOnInit() {
    this.loading$ = this.context.httpLoading('unsubscribeUser');
    this.status$ = this.route.params
      .mergeMap(({target, lambdajwt}) =>
        this.context.unsubscribeUser(target, lambdajwt)
          .map(success => ({success}))
          .catch(error => $.of({error}))
          .map(r => assign(r, {target})) as $<any>
      )
      .map(({error, target}) => {
        if (error) {
          return `Sorry, we couldn't unsubscribe you :( <br/> Please contact us at <a href="mailto:unsubscribe@beer.vfeskov.com">unsubscribe@beer.vfeskov.com</a>`;
        } else {
          return `Success! You won't receive any ${target} notifications anymore`;
        }
      });
  }

}
