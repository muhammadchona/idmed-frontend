import Dexie from 'dexie';
import { schema } from './index';

const db = new Dexie('idmed');

db.version(1).stores(schema);

db.open().catch((err) => {
  console.error(`Failed to open db: ${err.stack}`);
});

export default db;
