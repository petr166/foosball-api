import { ApolloServer } from 'apollo-server';
import { print } from 'graphql';
import Promise from 'bluebird';

import { PROD, PORT } from './config';
import schema from './api/schema';
import connectDb from './db';
import { appCrons } from './utils';

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
      console.log('Error:', err);
      console.log('====================================');
    } else {
      if (err.extensions && err.extensions.exception) {
        delete err.extensions.exception;
      }
    }

    return err;
  },
  extensions: [
    () => ({
      requestDidStart: ({ queryString, parsedQuery, variables }) => {
        const query = queryString || (parsedQuery ? print(parsedQuery) : null);
        console.log(
          `\n\n[${new Date().toLocaleTimeString()}] REQUEST ->>>>>\n`
        );
        console.log(query);
        console.log('variables:', variables);
        console.log('<<<<<<<<<<<<<<');
      },
    }),
  ],
});

// connect to db
connectDb().then(() => {
  // start server
  server.listen(PORT).then(({ url }: any) => {
    console.log(`🚀 Server ready at ${url}\n`);
    appCrons();
  });
});
