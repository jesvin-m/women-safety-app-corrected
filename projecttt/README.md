# Authentication System with Next.js and NextAuth.js

This is a modern authentication system built with Next.js, NextAuth.js, and Tailwind CSS. It supports OAuth authentication with Google and GitHub providers.

## Features

- OAuth authentication with Google and GitHub
- Modern and responsive UI with Tailwind CSS
- TypeScript support
- Secure session management

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up OAuth credentials:

   ### Google OAuth
   1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select an existing one
   3. Enable the Google+ API
   4. Go to Credentials and create an OAuth 2.0 Client ID
   5. Add `http://localhost:3000/api/auth/callback/google` to the authorized redirect URIs
   6. Copy the Client ID and Client Secret to your `.env.local` file

   ### GitHub OAuth
   1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
   2. Create a new OAuth App
   3. Add `http://localhost:3000/api/auth/callback/github` to the callback URL
   4. Copy the Client ID and Client Secret to your `.env.local` file

3. Update the `.env.local` file with your credentials:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Routes

- `/login` - Login page
- `/register` - Registration page
- `/api/auth/*` - NextAuth.js API routes

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your OAuth credentials secure
- Use HTTPS in production
- Generate a strong NEXTAUTH_SECRET for production use 