import { DatabaseAdapter } from './adapter.interface';
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
      console.log(`Connecting to ${other.host}:${other.port}/${other.database}/${other.schema}`);
      client = new PgSQLAdapter();
      break;
    default:
      throw new Error(`Unknown adapter '${adapter}'`);
  }

  await client.connect(other);
  return client;
}
