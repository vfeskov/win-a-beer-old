import { create as createSES } from 'rxjs-aws-sdk/RxSES';
import { Observable as $ } from '../rxjs';
import { ActionRequired } from '../action-required';
import { getUnsubscribeUrl } from './unsubscribe';
const { assign } = Object;

const ses = createSES({
  apiVersion: '2010-12-01',
  region: process.env.SES_REGION
});

export function sendEmail(actionRequired$: $<ActionRequired>) {
  return actionRequired$
    .filter(({action, settings}) =>
      action === 'alert' && !!settings.email
    )
    .map(({settings, username, repo, tag}) => ({
      email: settings.email,
      username,
      repo,
      tag,
      unsubscribeUrl: getUnsubscribeUrl(username, 'email')
    }))
    .map(({email, username, repo, tag, unsubscribeUrl}) => ({
      username,
      email,
      subject: `New GitHub Tag: ${repo} ${tag}`,
      body: `Hi, ${username}! :)\n` +
        `We\'re just letting you know that they assigned a new tag to a repo you wanted us to monitor: https://github.com/${repo}/releases/tag/${tag}\n\n` +
        `Have a great day!\n\n` +
        `If you wish to stop receiving such emails click: ${unsubscribeUrl}\n`
    }))
    .mergeMap(({email, username, subject, body}) =>
      ses.sendEmail({
        Source: process.env.FROM,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: {
            Data: subject
          },
          Body: {
            Text: {
              Data: body
            }
          }
        }
      })
      .catch(error => $.of({error}))
      .map(r => assign(r, {username, subject, email})) as $<{error?: any, username: string, email: string, subject: string}>
    )
    .do(({email, username, subject, error}) => {
      if (error) {
        console.error(`Email: Failed to send email ${subject} to ${email} for user ${username}`, error);
      } else {
        console.log(`Email: Email ${subject} was successfully sent to ${email} for user ${username}`);
      }
    });
}
