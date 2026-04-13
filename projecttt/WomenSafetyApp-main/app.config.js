// Loads environment variables from `.env` for local development.
// Keep `.env` out of git (see `.gitignore`).
require('dotenv').config();

const appJson = require('./app.json');

module.exports = ({ config }) => {
  return {
    ...(config || {}),
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      ...(config?.extra || {}),
      // Expose selected public env vars to the app bundle
      EXPO_PUBLIC_GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      EXPO_PUBLIC_SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
    },
  };
};

