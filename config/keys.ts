// ADD YOUR OWN KEYS AND RENAME THIS FILE TO keys.js
const GOOGLE_TOKENS = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

const SESSION = {
  COOKIE_KEY: process.env.COOKIE_KEY,
};

const KEYS = {
  ...GOOGLE_TOKENS,
  ...SESSION,
};

export default KEYS;
