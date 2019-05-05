import { ApolloServer } from 'apollo-server';
import Promise from 'bluebird';

import { PROD, PORT } from './config';
import schema from './api/schema';
import connectDb from './db';

// set default Promise to bluebird
global.Promise = Promise;

// create server
const server = new ApolloServer({
  schema,
  context: ({ req }: any) => {
    return {
      authorization: req.headers.authorization,
    };
  },
  formatError: err => {
    // log errors in dev mode
    if (!PROD) {
      console.log('====================================');
      console.log(err);
      console.log('====================================');
    } else {
      if (err.extensions && err.extensions.exception) {
        delete err.extensions.exception;
      }
    }

    return err;
  },
});

// connect to db
connectDb().then(() => {
  // start server
  server.listen(PORT).then(({ url }: any) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
