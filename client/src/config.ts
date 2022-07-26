// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'tu7dg2pq25'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-8w040f2t.us.auth0.com',            // Auth0 domain
  clientId: 'jEmi0U5cieD4JRGgppvNfWWN5S9FYL5N',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
