import { config } from 'dotenv';
config();
import { create as createRxSimpleDB } from 'rxjs-aws-sdk/RxSimpleDB';
import { Observable as $ } from './rxjs';
import { getActionRequired } from './action-required';
import { requestApi, sendEmail, updateSDB } from './actions';
const simpleDb = createRxSimpleDB({
  region: process.env.SDB_REGION,
  endpoint: process.env.SDB_ENDPOINT
});
const simpleDbDomain = process.env.SDB_DOMAIN_NAME;

export function handler(event, context, callback) {
  const actionRequired$ = getActionRequired(simpleDb, simpleDbDomain);

  $.merge(
    requestApi(actionRequired$),
    sendEmail(actionRequired$),
    updateSDB(simpleDb, simpleDbDomain, actionRequired$)
  )
  .last()
  .subscribe(
    () => callback(null),
    error => callback(error)
  );
};
