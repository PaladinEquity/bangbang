import { defineStorage } from '@aws-amplify/backend';

// Define the storage resource
export const storage = defineStorage({
  name: 'bangbang-storage',
  access: (allow) => ({
    // For authenticated users
    'wallpapers/${entityId}/*': [
      allow.authenticated.to(['read', 'write']),
      allow.entity('identity').to(['read', 'write', 'delete'])
    ],
    // For public access (if needed)
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read'])
    ],
    // For protected user-specific content
    'protected/${identityId}/*': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete'])
    ]
  })
});