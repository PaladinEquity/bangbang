import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    // Enable social providers
    externalProviders: {
      google: {
        clientId: secret(process.env.GOOGLE_CLIENT_ID || ''),
        clientSecret: secret(process.env.GOOGLE_CLIENT_SECRET || ''),
        scopes: ['profile', 'email', 'openid']
      },
      facebook: {
        clientId: secret(process.env.FACEBOOK_APP_ID || ''),
        clientSecret: secret(process.env.FACEBOOK_APP_SECRET || ''),
        scopes: ['public_profile', 'email']
      },
      callbackUrls: [
        'http://localhost:3000/',
        'https://main.d3e64r65ef03hg.amplifyapp.com/'
      ],
      logoutUrls: ['http://localhost:3000/', 'https://main.d3e64r65ef03hg.amplifyapp.com/'],
    }
  },
});
