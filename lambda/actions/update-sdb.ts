import { Observable as $ } from '../rxjs';
import { ActionRequired, Alerted } from '../action-required';
const { assign, keys } = Object;

export function updateSDB(simpleDb, DomainName, actionRequired$: $<ActionRequired>) {
  return actionRequired$
    .reduce((newAlerted, action: ActionRequired) => {
      const {repo, username, tag, alerted} = action;
      if (!newAlerted[username]) {
        newAlerted[username] = alerted;
      }
      newAlerted[username][repo] = tag;
      return newAlerted;
    }, {} as {[username: string]: Alerted})
    .mergeMap(newAlerted =>
      $.of(...keys(newAlerted).map(username => ({
        username, alerted: newAlerted[username]
      })))
    )
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
    .do(({error, username}) => {
      if (error) {
        console.error(`SimpleDB: Failed to update ${username}`, error);
      } else {
        console.log(`SimpleDB: ${username} was updated successfully`);
      }
    });
}
