import { Injectable } from '@angular/core';
import { Subject as $$ } from 'rxjs/Subject';
import { Observable as $ } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import { Http, Response } from '@angular/http';
const { assign, keys } = Object;

@Injectable()
export class ContextService {
  context$: ConnectableObservable<Context>;
  loggedIn$: $<boolean>;
  repos$: $<string[]>;
  hasRepos$: $<boolean>;
  settings$: $<any>;
  private event$$: $$<Event> = new $$();

  constructor(http: Http) {
    this.context$ = this.event$$
      .scan((context, event: Event) => {
        context = copyContext(context);

        const {name} = event;
        const data = assign({}, event.data);

        switch (name) {
          case 'register':
            context.httpRequest.register = {endpoint: 'register', method: 'post', data};
            break;
          case 'login':
            context.httpRequest.login = {endpoint: 'login', method: 'post', data};
            break;
          case 'logout':
            context.httpRequest.logout = {endpoint: 'logout', method: 'delete'};
            break;
          case 'loadUserData':
            context.httpRequest.loadUserData = {endpoint: 'userData', method: 'get'};
            break;
          case 'addRepo':
            if (context.repos.indexOf(data.repo) > -1) { break; }
            const newRepos = context.repos.concat(data.repo);
            context.httpRequest.addRepo = {endpoint: 'repos', method: 'put', data: newRepos};
            break;
          case 'removeRepo':
            const updatedRepos = context.repos.filter(repo => repo !== data.repo)
            if (updatedRepos.length === context.repos.length) { break; }
            context.httpRequest.removeRepo = {endpoint: 'repos', method: 'put', data: updatedRepos};
            break;
          case 'updateSetting':
            const settings = assign({}, context.settings);
            if (!data.value) {
              delete settings[data.setting];
            } else {
              settings[data.setting] = data.value;
            }
            context.httpRequest.updateSetting = {endpoint: 'settings', method: 'put', data: settings};
            break;
          case 'httpResponse':
            delete context.httpLoading[data.id];
            switch (data.id) {
              case 'loadUserData':
                const {settings, repos} = data.response.json();
                context.settings = settings || {};
                context.repos = repos;
                if (!Array.isArray(context.repos)) { context.repos = []; }
                context.loggedIn = true;
                break;
              case 'addRepo':
              case 'removeRepo':
                context.repos = data.response.json();
                if (!Array.isArray(context.repos)) { context.repos = []; }
                break;
              case 'login':
              case 'register':
                context.loggedIn = true;
                context.login = data.login;
                context.httpRequest.loadUserData = {endpoint: 'userData', method: 'get'};
                break;
              case 'logout':
                context.loggedIn = false;
                context.repos = [];
                context.settings = {};
                break;
              case 'updateSetting':
                context.settings = data.response.json();
                break;
            }
            break;
          case 'httpLoading':
            delete context.httpRequest[data.id];
            context.httpLoading[data.id] = data.subscription;
            break;
          case 'httpError':
            delete context.httpLoading[data.id];
            context.httpError = data.response;
            if (data.response.status === 401) {
              context.loggedIn = false;
              context.repos = [];
            }
            break;
        }

        const requestIds = keys(context.httpRequest);
        if (!requestIds.length) { return context; }

        requestIds.forEach(id => {
          if (context.httpLoading[id]) {
            context.httpLoading[id].unsubscribe();
            delete context.httpLoading[id];
          }
          if (context.httpError[id]) { delete context.httpError[id]; }
        });

        return context;
      }, {} as Context)
      .publish();

    this.loggedIn$ = this.context$
      .filter(ctx => ctx.loggedIn !== null)
      .pluck('loggedIn');
    this.repos$ = this.context$.pluck('repos');
    this.hasRepos$ = this.repos$.map((repos: string[]) => !!repos.length);
    this.settings$ = this.context$
      .filter(({httpLoading, httpRequest}) => !httpLoading.updateSetting && !httpRequest.updateSetting)
      .pluck('settings');

    this.context$.connect();

    this.context$
      .filter(({httpRequest}) => !!httpRequest)
      .pluck('httpRequest')
      .mergeMap(requests =>
        $.of(...keys(requests).map(id => assign({id}, requests[id])))
      )
      .mergeMap(({id, endpoint, method, data = null}) => {
        const httpResult$$ = new $$();
        const subscription: Subscription = http[method](`/api/${endpoint}`, data)
          .map(response => ({name: 'httpResponse', data: {id, response}}))
          .catch(response => $.of({name: 'httpError', data: {id, response}}))
          .subscribe(httpResult$$);
        return $.of({name: 'httpLoading', data: {id, subscription}})
          .merge(httpResult$$)
      })
      .subscribe(this.event$$);

    this.loadUserData();
  }

  addRepo(repo: string) {
    this.event$$.next({name: 'addRepo', data: {repo}});
  }

  removeRepo(repo: string) {
    this.event$$.next({name: 'removeRepo', data: {repo}});
  }

  loadUserData() {
    this.event$$.next({name: 'loadUserData'});
  }

  login(login, password) {
    this.event$$.next({name: 'login', data: {login, password}});
  }

  register(login, password, passwordConfirmation) {
    this.event$$.next({name: 'register', data: {login, password, passwordConfirmation}});
  }

  logout() {
    this.event$$.next({name: 'logout'});
  }

  updateSetting(setting, value) {
    this.event$$.next({name: 'updateSetting', data: {setting, value}});
  }

  httpLoading(name) {
    return this.context$.pluck('httpLoading').pluck(name);
  }

  httpError(name) {
    return this.context$.pluck('httpError').pluck(name);
  }
}

function copyContext(context) {
  context = assign({}, context);
  if (typeof context.loggedIn !== 'boolean') { context.loggedIn = null; }
  if (!Array.isArray(context.repos)) {
    context.repos = [];
  } else {
    context.repos = context.repos.slice();
  }
  if (!context.settings) {
    context.settings = {};
  }
  'httpRequest,httpResponse,httpLoading,httpError'.split(',')
    .forEach(prop => context[prop] = assign({}, context[prop] || {}));
  return context;
}

function eventForbidden(name, {loggedIn}) {
  return (loggedIn && ['register', 'login'].indexOf(name) > -1) ||
    (!loggedIn && ['loadRepos', 'addRepo', 'removeRepo', 'logout'].indexOf(name) > -1);
}

export class Event {
  name: string;
  data?: any
}

export class Context {
  loggedIn: boolean;
  login: string;
  repos: string[];
  settings: {
    [name: string]: string
  };
  httpRequest: {
    [id: string]: {
      endpoint: string;
      method: string,
      data?: any
    }
  };
  httpLoading: {
    [id: string]: Subscription
  };
  httpError: {
    [id: string]: boolean
  };
}

