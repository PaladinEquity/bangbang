// import { defineAuth, secret } from "@aws-amplify/backend";

// /**
//  * Define and configure your auth resource
//  * @see https://docs.amplify.aws/gen2/build-a-backend/auth
//  */
// export const auth = defineAuth({
//   loginWith: {
//     email: true,
//     // Enable social providers
//     externalProviders: {
//       google: {
//         clientId: secret(process.env.GOOGLE_CLIENT_ID || ''),
//         clientSecret: secret(process.env.GOOGLE_CLIENT_SECRET || ''),
//       },
//       facebook: {
//         clientId: secret(process.env.FACEBOOK_APP_ID || ''),
//         clientSecret: secret(process.env.FACEBOOK_APP_SECRET || ''),
//       },
//       callbackUrls: [
//         'http://localhost:3000/',
//         'https://main.d3e64r65ef03hg.amplifyapp.com/'
//       ],
//       logoutUrls: ['http://localhost:3000/', 'https://main.d3e64r65ef03hg.amplifyapp.com/'],
//     }
//   },
// });
import { defineAuth } from "@aws-amplify/backend";
import { addUserToGroup } from "../data/add-user-to-group/resource";
import { removeUserFromGroup } from "../data/remove-user-from-group/resource";
import { manageUsers } from "../data/manage-users/resource";
import { manageUserGroups } from "../data/manage-user-groups/resource";
import { listUsersInGroup } from "../data/list-users-in-group/resource";
import { manageUserDevices } from "../data/manage-user-devices/resource";
import { listUsers } from "../data/list-users/resource";
/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    // Maps to Cognito standard attribute 'address'
    address: {
      mutable: true,
      required: false,
    },
    // Maps to Cognito standard attribute 'email'
    email: {
      mutable: true,
      required: true,
    },
    // Maps to Cognito standard attribute 'family_name'
    familyName: {
      mutable: true,
      required: false,
    },
    // Maps to Cognito standard attribute 'given_name'
    givenName: {
      mutable: true,
      required: true,
    },
    // Maps to Cognito standard attribute 'phone_number'
    phoneNumber: {
      mutable: true,
      required: false,
    },
    // Maps to Cognito standard attribute 'picture'
    profilePicture: {
      mutable: true,
      required: false,
    },
    // Maps to Cognito standard attribute 'zoneinfo'
    timezone: {
      mutable: true,
      required: false,
    },
    // Maps to Cognito standard attribute 'updated_at'
    lastUpdateTime: {
      mutable: true,
      required: false,
    },
    // Custom attribute for Stripe customer ID
    "custom:stripeCustomerId": {
      mutable: true,
      dataType: "String",
    },
  },
  groups: ["ADMINS","USERS"],
    
  access: (allow) => [
    allow.resource(addUserToGroup).to(["addUserToGroup"]),
    allow.resource(removeUserFromGroup).to(["removeUserFromGroup"]),
    allow.resource(manageUsers).to(["manageUsers"]),
    allow.resource(manageUserGroups).to(["manageGroups"]),
    allow.resource(listUsersInGroup).to(["listUsersInGroup"]),
    allow.resource(manageUserDevices).to(["manageUserDevices"]),
    allow.resource(listUsers).to(["listUsers"])
  ],
});
