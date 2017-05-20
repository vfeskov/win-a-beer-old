import { config } from 'dotenv';
config();
import { create as createRxSimpleDB } from 'rxjs-aws-sdk/RxSimpleDB';
import { Observable as $ } from './rxjs';
import { getStreams } from './streams';
import { requestApi, sendEmail, updateSDB } from './actions';

const simpleDb = createRxSimpleDB({
  region: process.env.SDB_REGION,
  endpoint: process.env.SDB_ENDPOINT
});

const DomainName = process.env.SDB_DOMAIN_NAME;

const { api$, email$, markAlerted$ } = getStreams(simpleDb, DomainName);

requestApi(api$);
sendEmail(email$);
updateSDB(simpleDb, DomainName, markAlerted$);