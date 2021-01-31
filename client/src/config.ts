// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'dnsriyj8la'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-xzxnscpj.us.auth0.com',            // Auth0 domain
  clientId: 'SSgn95PD0bCVOlHjze1RqD43fHr4aI9J',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
