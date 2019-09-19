import mongoose from 'mongoose';
import Promise from 'bluebird';

import { DB_NAME, DB_CONN_STR, SYNC_DB_INDEXES } from './config';
import * as models from './models';

mongoose.set('useCreateIndex', true);

const connectDb = (): any => {
  return mongoose
    .connect(DB_CONN_STR, {
      useNewUrlParser: true,
      dbName: DB_NAME,
      promiseLibrary: Promise,
      useCreateIndex: true,
    })
    .then(async () => {
      console.log(`🗄  Connected to mongodb "${DB_NAME}"`);

      if (SYNC_DB_INDEXES) {
        try {
          await Promise.map(Object.keys(models), (modelKey: string) =>
            // @ts-ignore 7017
            models[modelKey]
              .syncIndexes()
              .catch((err: any) =>
                err.code !== 26 ? Promise.reject(err) : true
              )
          );

          console.log(`Rebuilt db indexes`);
        } catch (e) {
          // code 26 is collection not yet created
          if (e.code !== 26) {
            console.log('Sync indexes error:', e);
            process.exit();
          }
        }
      }

      return true;
    })
    .catch(async e => {
      console.log('🚨 DB connection failed:', e.message);
      console.log('Retrying in 2 sec...');
      await Promise.delay(2000);
      return connectDb();
    });
};

export default connectDb;
