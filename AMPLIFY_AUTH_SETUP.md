# AWS Amplify Authentication Setup Guide

## Overview

This guide explains how to set up AWS Amplify authentication with email, Google, and Facebook providers for the BangBang Wallpaper application.

## Prerequisites

1. AWS Account
2. Google Developer Console Account (for Google Sign-In)
3. Facebook Developer Account (for Facebook Login)

## Setup Instructions

### 1. Configure Environment Variables

Create or update the `.env.local` file in the root of your project with the following variables:

```
# AWS Amplify Social Provider Credentials

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth credentials
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 2. Set Up Google OAuth Credentials

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Navigate to "Credentials" and create OAuth client ID credentials
4. Set the application type to "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your production domain (e.g., `https://yourdomain.com`)
6. Add authorized redirect URIs:
   - `http://localhost:3000/account` (for local development)
   - `https://yourdomain.com/account` (for production)
7. Copy the Client ID and Client Secret to your `.env.local` file

### 3. Set Up Facebook App

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add the Facebook Login product to your app
4. Configure the following settings:
   - Valid OAuth Redirect URIs:
     - `http://localhost:3000/account` (for local development)
     - `https://yourdomain.com/account` (for production)
5. Copy the App ID and App Secret to your `.env.local` file

### 4. Deploy Amplify Backend

Run the following commands to deploy your Amplify backend with the updated authentication configuration:

```bash
npx amplify sandbox
# or for production
npx amplify deploy
```

## Testing Authentication

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page at `/account/login`
3. Test email login, Google login, and Facebook login

## Troubleshooting

- If social login redirects fail, verify that your redirect URIs are correctly configured in both the Google/Facebook developer consoles and in your code.
- Check the browser console for any error messages related to authentication.
- Ensure your Amplify backend is properly deployed with the latest configuration.

## Additional Resources

- [AWS Amplify Authentication Documentation](https://docs.amplify.aws/gen2/build-a-backend/auth/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)