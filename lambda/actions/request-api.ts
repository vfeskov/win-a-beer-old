import { RxHttpRequest } from 'rx-http-request';
import { Observable as $ } from '../rxjs';
const { assign } = Object;

export function requestApi(api$) {
  api$
    .map(({api, username, repo, tag}) => ({
      username,
      url: api
        .replace('[[repo]]', encodeURIComponent(repo))
        .replace('[[tag]]', encodeURIComponent(tag))
    }))
    .mergeMap(({username, url}) => RxHttpRequest.get(url)
      .catch(error => $.of({error}))
      .map(r => assign(r, {username, url})) as $<{error?: any, username: string, url: string}>
    )
    .subscribe(({error, username, url}) => {
      if (error) {
        console.error(`API: Failed to request ${url} for user ${username}`, error);
      } else {
        console.log(`API: Request to ${url} for user ${username} was successful`);
      }
    });
}
