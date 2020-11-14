// ADD YOUR OWN KEYS AND RENAME THIS FILE TO keys.js
const TWITTER_TOKENS = {
  GOOGLE_CLIENT_ID: 'SOME KEY',
  GOOGLE_CLIENT_SECRET: 'SOME SECRET',
};

// const DB_USER = 'hacc';
// const DB_PASSWORD = 'hacc';
// const MONGODB = {
//   MONGODB_URI: `mongodb://${DB_USER}:${DB_PASSWORD}@ds<SOME_DOMAIN>.mlab.com:<PORT>/<PROJECT_NAME>`,
// };

const SESSION = {
  COOKIE_KEY: 'hacc_cookie_key',
};

const KEYS = {
  ...TWITTER_TOKENS,
  ...SESSION,
};

export default KEYS;
