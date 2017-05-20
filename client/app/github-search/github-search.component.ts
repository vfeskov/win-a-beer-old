import { Component, ChangeDetectionStrategy} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable as $ } from 'rxjs/Observable';
import { GithubService, Repo, ContextService } from 'app/common';

@Component({
  selector: 'wab-github-search',
  templateUrl: './github-search.component.html',
  styleUrls: ['./github-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GithubSearchComponent {
  repoCtrl: FormControl = new FormControl();
  repoSuggestions$: $<Repo[]>;
  loading$: $<boolean>;
  isLoggedIn$: $<boolean>;

  constructor(github: GithubService, public context: ContextService) {
    this.isLoggedIn$ = context.loggedIn$;
    const repoSearchRequest$ = this.repoCtrl.valueChanges
      .debounceTime(300)
      .filter(v => v);
    this.repoSuggestions$ = repoSearchRequest$
      .switchMap(name =>
        github.searchRepos(name)
          .pluck('items')
          .catch(() => $.of([]))
      )
      .merge(this.repoCtrl.valueChanges.mapTo([]))
      .share();
    this.loading$ = $.merge(
      repoSearchRequest$.mapTo(true),
      this.repoCtrl.valueChanges.mapTo(false),
      this.repoSuggestions$.mapTo(false)
    );
  }
}
