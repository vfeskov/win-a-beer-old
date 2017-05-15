import * as Bcrypt from 'bcrypt';
import { Server } from 'hapi';
import * as hapiAuthJWT from 'hapi-auth-jwt2';
import * as JWT from 'jsonwebtoken';
import { badData, badImplementation } from 'boom';
import { loadUser, addUser } from '../db';
import { Observable as $ } from 'rxjs/Observable';
const { WAB_JWT_SECRET } = process.env;
const hash: (data: any, rounds: number) => $<string> = $.bindNodeCallback(Bcrypt.hash.bind(Bcrypt));
const compareHash: (data: any, encrypted: string) => $<boolean> = $.bindNodeCallback(Bcrypt.compare.bind(Bcrypt));
const COOKIE_OPTIONS = {
  ttl: 365 * 24 * 60 * 60 * 1000,
  encoding: 'none',
  isSecure: false,
  isHttpOnly: true,
  clearInvalid: false,
  strictHeader: true,
  path: '/'
};

export function register(server: Server, options, callback) {
  server.register(hapiAuthJWT, error => {
    if (error) { console.error(error); }

    server.auth.strategy('jwt', 'jwt', {
      key: WAB_JWT_SECRET,
      validateFunc: ({login}, req, cb) => cb(null, !!login),
      verifyOptions: { ignoreExpiration: true, algorithms: ['HS256'] }
    });

    server.auth.default('jwt');

    server.route([{
      method: 'POST',
      path: '/api/register',
      config: { auth: false },
      handler: registerRouteHandler
    }, {
      method: 'POST',
      path: '/api/login',
      config: { auth: false },
      handler: loginRouteHandler
    }, {
      method: 'DELETE',
      path: '/api/logout',
      handler(request, reply) {
        reply('success').unstate('token', COOKIE_OPTIONS as any);
      }
    }]);

    callback();
  });
}

(register as any).attributes = {
  name: 'auth',
  version: '1.0.0'
};

function registerRouteHandler({payload}, reply) {
  const {login, password, passwordConfirmation} = payload;
  if (!login || !password || password !== passwordConfirmation) {
    return reply(badData('Invalid payload'));
  }
  loadUser(login)
    .pluck('found')
    .mergeMap(found => {
      if (found) { return $.of({error: badData('login is taken')} as any); }
      return hash(password, 10)
        .mergeMap(passwordEncrypted => addUser(login, passwordEncrypted))
        .catch(() => $.of({error: badImplementation()}))
        .map(() => {
          return {token: JWT.sign({login}, WAB_JWT_SECRET)};
        });
    })
    .subscribe(({error, token}) => {
      if (error) { return reply(error); }
      reply({login}).state('token', token, COOKIE_OPTIONS);
    });
}

function loginRouteHandler({payload}, reply) {
  const {login, password} = payload;
  if (!login || !password) { return reply(badData('Invalid payload')); }
  loadUser(login)
    .mergeMap(({found, passwordEncrypted}) => {
      const error = badData('Incorrect login or password');
      if (!found) { return $.of({error}); }
      return compareHash(password, passwordEncrypted)
        .map(isValid => isValid ?
          {token: JWT.sign({login}, WAB_JWT_SECRET)} :
          {error}
        );
    })
    .catch(error => $.of({error: badImplementation()} as any))
    .subscribe(({error, token}) => {
      if (error) { return reply(error); }
      reply({login}).state('token', token, COOKIE_OPTIONS);
    });
}
