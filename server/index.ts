import {config} from 'dotenv';
config();
import './rxjs';
import { Server } from 'hapi';
import * as auth from './plugins/auth';
import * as userData from './plugins/user-data';
import * as staticContent from './plugins/static-content';

const server = new Server();
server.connection({ port: 3000 });

server.register([auth, userData, staticContent]).then(() => {
  server.start(() => {
    console.log('Server running at: ', server.info.uri);
  });
});
