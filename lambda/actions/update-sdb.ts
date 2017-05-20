import { Observable as $ } from '../rxjs';
const { assign } = Object;

export function updateSDB(simpleDb, DomainName, markAlerted$) {
  markAlerted$
    .mergeMap(({username, alerted}) =>
      simpleDb.putAttributes({
        DomainName,
        ItemName: username,
        Attributes: [
          {Name: 'alerted', Value: JSON.stringify(alerted), Replace: true}
        ]
      })
        .catch(error => $.of({error}))
        .map(r => assign(r, {username}))  as $<{error?: any, username: string}>
    )
    .subscribe(({error, username}) => {
      if (error) {
        console.error(`SimpleDB: Failed to update ${username}`, error);
      } else {
        console.log(`SimpleDB: ${username} was updated successfully`);
      }
    });
}
