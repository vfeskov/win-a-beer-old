import { config } from 'dotenv';
config();
import { create as createRxSimpleDB } from 'rxjs-aws-sdk/RxSimpleDB';
import { Observable as $ } from './rxjs';
import { getActionRequired } from './action-required';
import { requestApi, sendEmail, updateSDB } from './actions';

export function handler(event, context, callback) {
  const simpleDb = createRxSimpleDB({
    region: process.env.SDB_REGION,
    endpoint: process.env.SDB_ENDPOINT
  });

  const DomainName = process.env.SDB_DOMAIN_NAME;

  const actionRequired$ = getActionRequired(simpleDb, DomainName);

  $.merge(
    requestApi(actionRequired$),
    sendEmail(actionRequired$),
    updateSDB(simpleDb, DomainName, actionRequired$)
  )
  .last()
  .subscribe(
    () => callback(null),
    error => callback(error)
  );
};
