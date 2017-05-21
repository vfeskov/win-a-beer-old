import { RxHttpRequest } from 'rx-http-request';
import { Observable as $ } from '../rxjs';
import { ActionRequired } from '../action-required';
import { getUnsubscribeUrl } from './unsubscribe';
const { assign } = Object;

export function requestApi(actionRequired$: $<ActionRequired>) {
  return actionRequired$
    .filter(({action, settings}) =>
      action === 'alert' && !!settings.api
    )
    .map(({settings, username, repo, tag}) => ({
      api: settings.api, username, repo, tag
    }))
    .map(({api, username, repo, tag}) => ({
      username,
      url: api
        .replace('[[repo]]', encodeURIComponent(repo))
        .replace('[[tag]]', encodeURIComponent(tag))
    }))
    .mergeMap(({username, url}) =>
      RxHttpRequest.get(url, {
        headers: {
          'Unsubscribe-Url': getUnsubscribeUrl(username, 'api')
        }
      })
      .catch(error => $.of({error}))
      .map(r => assign(r, {username, url})) as $<{error?: any, username: string, url: string}>
    )
    .do(({error, username, url}) => {
      if (error) {
        console.error(`API: Failed to request ${url} for user ${username}`, error);
      } else {
        console.log(`API: Request to ${url} for user ${username} was successful`);
      }
    });
}
