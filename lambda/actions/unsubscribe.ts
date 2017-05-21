import * as JWT from 'jsonwebtoken';
const JWT_RSA_PRIVATE_KEY = process.env.JWT_RSA_PRIVATE_KEY.replace(/\\n/, '\n');
const { APP_URL } = process.env;

export function getUnsubscribeUrl(username: string, target: string) {
  const token = JWT.sign(
    { login: username, target },
    JWT_RSA_PRIVATE_KEY,
    { algorithm: 'RS256' }
  );
  return `${APP_URL}/unsubscribe/${target}/${token}`;
}
