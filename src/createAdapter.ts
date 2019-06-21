import { DatabaseAdapter } from './adapter.interface';
import { MySQLAdapter } from './mysql.adapter';
import { PgSQLAdapter } from './pgsql.adapter';

export async function createAdapter(config: any): Promise<DatabaseAdapter> {
  const { adapter, ...other } = config;

  if (!adapter) {
    throw new Error(`Database config should have property 'adapter' specifying database adapter`);
  }

  console.log(`Using ${adapter} adapter`);
  let client = null;
  switch (adapter) {
    case 'pgsql':
      client = new PgSQLAdapter();
      break;
    case 'mysql':
      client = new MySQLAdapter();
      break;
    default:
      throw new Error(`Unknown adapter '${adapter}'`);
  }

  return client;
}
