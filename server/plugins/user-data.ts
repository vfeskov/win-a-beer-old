import { Server } from 'hapi';
import { Observable as $ } from 'rxjs/Observable';
import { badImplementation, badData } from 'boom';
import { loadUserData, saveRepos, saveSettings, loadSettings } from '../db';
import * as JWT from 'jsonwebtoken';
const LAMBDA_JWT_RSA_PUBLIC_KEY = process.env.WAB_LAMBDA_JWT_RSA_PUBLIC_KEY.replace(/\\n/g, '\n');

export function register(server: Server, options, callback) {
  server.route([{
      method: 'GET',
      path: '/api/userData',
      handler(request, reply) {
        const {login} = request.auth.credentials;
        loadUserData(login)
          .catch(error => {
            console.error(error);
            return $.of(badImplementation());
          })
          .subscribe(reply);
      }
    }, {
      method: 'PUT',
      path: '/api/repos',
      handler({payload, auth}, reply) {
        if (!payload || !Array.isArray(payload) || payload.some(r => typeof r !== 'string')) {
          return reply(badData('repos required as an array of strings'))
        }
        const {login} = auth.credentials;
        saveRepos(login, payload)
          .catch(error => {
            console.error(error);
            return $.of(badImplementation())
          })
          .subscribe(reply);
      }
    }, {
      method: 'PUT',
      path: '/api/settings',
      handler({payload, auth}, reply) {
        const {api, email} = payload;
        if (!payload || (email && typeof email !== 'string') || (api && typeof api !== 'string')) {
          return reply(badData('payload required'))
        }
        const {login} = auth.credentials;
        saveSettings(login, {api, email})
          .mapTo('')
          .catch(error => {
            console.error(error);
            return $.of(badImplementation())
          })
          .subscribe(reply);
      }
    }, {
      method: 'PUT',
      path: '/api/unsubscribe',
      config: { auth: false },
      handler({payload}, reply) {
        const {target, lambdajwt} = payload;
        if (!target) {
          return reply(badData('target required'));
        }
        JWT.verify(
          lambdajwt,
          LAMBDA_JWT_RSA_PUBLIC_KEY,
          (error, data) => {
            if (error) { return reply(badData('Invalid lambdajwt')); }
            loadSettings(data.login)
              .mergeMap(({settings}) => {
                delete settings[target];
                return saveSettings(data.login, settings);
              })
              .mapTo('')
              .catch(error => {
                console.error(error);
                return $.of(badImplementation())
              })
              .subscribe(reply);
          }
        );
      }
    }]);
  callback();
}

(register as any).attributes = {
  name: 'user-data',
  version: '1.0.0'
};
