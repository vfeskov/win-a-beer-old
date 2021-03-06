import { Observable as $ } from './rxjs';
import { flattenAttrs, RxSimpleDBInstance } from 'rxjs-aws-sdk/RxSimpleDB';
import { RxHttpRequest } from 'rx-http-request';
const { assign, keys } = Object;
const { isArray } = Array;

export function getActionRequired(simpleDb: RxSimpleDBInstance, DomainName: string): $<ActionRequired> {
  return simpleDb.select({
      SelectExpression: `select repos, settings, alerted from \`${DomainName}\` where repos is not null`
    })
    .filter(({Items}) => Items && !!Items.length)
    .mergeMap(({Items}) => $.of(...Items))
    .map(({Name, Attributes}) =>
      assign({username: Name}, flattenAttrs(Attributes)) as UserRaw
    )
    .map(item => assign(item, {repos: item.repos.trim()}))
    .filter(({repos, settings}) => !!repos && !!settings)
    .map(({username, repos, settings, alerted}): User => ({
      username: username,
      repos: repos.split(','),
      settings: parseForceObject(settings),
      alerted: parseForceObject(alerted)
    }))
    .catch(error => {
      console.error('Failed to parse user data', error);
      return $.of({error} as User)
    })
    .filter(({settings, error}) => {
      if (error) { return false; }
      const {email, api} = settings;
      return (email && typeof email === 'string') || (api && typeof api === 'string');
    })
    .reduce((result, user: User) => {
      const {repos, settings, alerted, username} = user;
      const {email, api} = settings;
      repos.forEach(repo => {
        if (!/.+\/.+/.test(repo)) { return; }
        if (!result[repo]) { result[repo] = []; }
        result[repo].push({username, settings, alerted});
      });
      return result;
    }, {} as RequestData)
    .mergeMap(data =>
      $.of(...keys(data).map(repo => ({repo, userData: data[repo]})))
    )
    .mergeMap(({repo, userData}) =>
      RxHttpRequest
        .get(`https://api.github.com/repos/${repo}/tags`, {
          headers: {
            'User-Agent': process.env.GITHUB_API_USER_AGENT
          }
        })
        .map(response => ({
          tags: JSON.parse(response.body),
          repo,
          userData
        }))
        .catch(error => {
          console.error(`Failed to load tags for ${repo}`, error);
          return $.of({error});
        }) as $<ResponseData>
    )
    .filter(({error}) => !error)
    .filter(({tags}) => !!tags && !!tags.length)
    .mergeMap(({tags, repo, userData}) =>
      $.of(...userData.map(_userData => assign(_userData, {repo, tags})))
    )
    .map(data => {
      const {repo, tags, alerted, settings, username} = data;
      const tagNames = tags.map(tag => tag.name);
      let action = '';
      if (!alerted[repo]) {
        action = 'dontAlertButSave';
      } else if (tagNames.indexOf(alerted[repo]) !== 0) {
        action = 'alert';
      }
      return {action, tag: tagNames[0], repo, alerted, settings, username};
    })
    .filter(({action}) => !!action)
    .share();
}

function parseForceObject(json) {
  if (!json) { return {}; }
  const result = JSON.parse(json);
  return (result !== null && typeof result === 'object' && !isArray(result)) ? result : {};
}

export interface Settings {
  email?: string
  api?: string
}

export interface User {
  username: string
  repos: string[]
  settings: Settings
  alerted: {
    [repo: string]: string
  }
  error?: any
}

export interface UserRaw {
  username: string
  repos: string
  settings: string
  alerted: string
}

export interface RequestData {
  [repo: string]: UserData[]
}

export interface UserData {
  username: string
  settings: Settings
  alerted: Alerted
}

export interface ResponseData {
  repo: string
  tags: Tag[]
  userData: UserData[]
  error?: any
}

export interface Tag {
  name: string
  commit: {
    sha: string
  }
}

export interface Alerted {
  [repo: string]: string
}

export interface ActionRequired {
  action: string
  tag: string
  repo: string
  alerted: Alerted
  settings: Settings
  username: string
}
