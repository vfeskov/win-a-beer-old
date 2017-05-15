process.env.AWS_ACCESS_KEY_ID = process.env.WAB_AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = process.env.WAB_AWS_SECRET_ACCESS_KEY;
import { SimpleDB } from 'aws-sdk';
import { Observable as $ } from 'rxjs/Observable';

export {
  addUser,
  loadUser,
  loadUserData,
  saveRepos,
  saveSettings,
};

const {assign} = Object;

const DomainName = process.env.WAB_SDB_DOMAIN_NAME;
const origSimpledb = new SimpleDB({
  region    : process.env.WAB_SDB_REGION,
  endpoint  : process.env.WAB_SDB_ENDPOINT
});

const simpleDb = ['getAttributes', 'putAttributes', 'select']
  .reduce((result, method) =>
    assign(result, {[method]: params => rxifySimpleDBMethod(method, params)}),
    {}
  ) as RxSimpleDB;

function loadUser(login) {
  return simpleDb.getAttributes({DomainName, ItemName: login})
    .map(({Attributes}) => {
      if (!Attributes) {
        return assign({login, found: false});
      }
      return assign({login, found: true}, flattenAttrs(Attributes));
    });
}

function addUser(login, passwordEncrypted) {
  return simpleDb.putAttributes({
      DomainName,
      ItemName: login,
      Attributes: [
        {Name: 'passwordEncrypted', Value: passwordEncrypted},
        {Name: 'repos', Value: '[]'}
      ]
    });
}

function loadUserData(login) {
  return simpleDb.getAttributes({DomainName, ItemName: login, AttributeNames: ['repos', 'settings']})
    .map(({Attributes}) => {
      if (!Attributes) { throw new Error('User not found'); }
      const {settings, repos} = flattenAttrs(Attributes);
      return {
        settings: settings ? JSON.parse(settings) : {},
        repos: repos ? JSON.parse(repos) : []
      };
    });
}

function saveRepos(login, repos) {
  repos = repos.map(({id, full_name}) => ({id, full_name}));
  return simpleDb.putAttributes({
    DomainName,
    ItemName: login,
    Attributes: [
      {Name: 'repos', Value: JSON.stringify(repos), Replace: true}
    ]})
    .mapTo(repos);
}

function saveSettings(login, settings) {
  return simpleDb.putAttributes({
    DomainName,
    ItemName: login,
    Attributes: [
      {Name: 'settings', Value: JSON.stringify(settings), Replace: true}
    ]})
    .mapTo(settings);
}

function rxifySimpleDBMethod(methodName, params) {
  return new $(subscriber => {
    const request = origSimpledb[methodName](params, (err, data) => {
      if (err) { return subscriber.error(err); }
      subscriber.next(data);
      subscriber.complete();
    });
    return () => request.abort();
  });
}

function flattenAttrs(attrs: SimpleDB.Attribute[]) {
  return attrs.reduce((res, attr) =>
    assign(res, {[attr.Name]: attr.Value}),
  {} as any);
}

export interface RxSimpleDB {
  getAttributes(params?: SimpleDB.Types.GetAttributesRequest): $<SimpleDB.GetAttributesResult>;
  putAttributes(params?: SimpleDB.Types.PutAttributesRequest): $<{}>;
  select(params?: SimpleDB.Types.SelectRequest): $<SimpleDB.Types.SelectResult>;
}
