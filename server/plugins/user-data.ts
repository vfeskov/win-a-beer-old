import { Server } from 'hapi';
import { Observable as $ } from 'rxjs/Observable';
import { badImplementation, badData } from 'boom';
import { loadUserData, saveRepos, saveSettings } from '../db';

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
        if (!payload || !Array.isArray(payload)) {
          return reply(badData('repos required as an array'))
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
        if (!payload) {
          return reply(badData('payload required'))
        }
        const {login} = auth.credentials;
        saveSettings(login, payload)
          .catch(error => {
            console.error(error);
            return $.of(badImplementation())
          })
          .subscribe(reply);
      }
    }]);
  callback();
}

(register as any).attributes = {
  name: 'user-data',
  version: '1.0.0'
};
