// Get configuration from environment
// Set defaults & extras

const {
  NODE_ENV = 'development',
  API_ROOT = '/api',
  PORT = 4000,
  SECRET_KEY = 'supersecretalltheway',
  JWT_ISSUER = 'yoMAMA',
  DB_URI = 'localhost',
  DB_PORT = 27017,
  DB_NAME = 'foosball',
  TOKEN_HEADER = 'Bearer ',
  SYNC_DB_INDEXES: rawSYNC_DB_INDEXES = false,
} = process.env;

const PROD = NODE_ENV === 'production';
const DB_CONN_STR = `mongodb://${DB_URI}:${DB_PORT}`;
const SYNC_DB_INDEXES = String(rawSYNC_DB_INDEXES) === 'true';

// score calculator
const SCORE_DIFF_FACTOR = 1 / 10;
const POINTS_DIFF_FACTOR = 1 / 10;
const GAME_COUNT_FACTOR = 1 / 10;

export {
  NODE_ENV,
  API_ROOT,
  PORT,
  SECRET_KEY,
  JWT_ISSUER,
  PROD,
  DB_URI,
  DB_PORT,
  DB_NAME,
  DB_CONN_STR,
  TOKEN_HEADER,
  SYNC_DB_INDEXES,
  SCORE_DIFF_FACTOR,
  POINTS_DIFF_FACTOR,
  GAME_COUNT_FACTOR,
};
