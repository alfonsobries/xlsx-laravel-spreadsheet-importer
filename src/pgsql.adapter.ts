import csvStringify from 'csv-stringify';
import { Client } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { DatabaseAdapter } from './adapter.interface';
import WritableStream = NodeJS.WritableStream;

function wrapColumn(c) {
  return `"${c}"`;
}

export class PgSQLAdapter implements DatabaseAdapter {
  protected client: Client = null;

  public async connect(options: any): Promise<any> {
    if (this.client) {
      await this.client.end();
    }
    const { schema, ...other } = options;
    console.log(`Connecting to ${other.host}:${other.port}/${other.database}`);
    this.client = new Client(other);
    await this.client.connect();
    if (schema) {
      // language=PostgreSQL
      await this.client.query(`
        set search_path to ${schema}
      `);
    }
    return this.client;
  }

  public async close(): Promise<any> {
    return this.client.end();
  }

  public async dropTable(tableName: string): Promise<any> {
    // language=PostgreSQL
    return this.client.query(`
      drop table if exists "${tableName}"
    `);
  }

  public async createTable(tableName: string, columns: string[]): Promise<any> {
    this.checkColumns(columns);
    const columnDefs = columns.map((c) => `"${c}" text`).join(',');
    // language=PostgreSQL
    return this.client.query(`
      create table if not exists "${tableName}" (
        ${columnDefs}
      )
    `);
  }

  public async insertValues(
    tableName: string,
    columns: string[],
    values: string[][]
  ): Promise<any> {
    this.checkColumns(columns);
    const columnDefs = columns.map(wrapColumn).join(',');
    const stream: WritableStream = this.client.query(
      copyFrom(`copy "${tableName}"(${columnDefs}) from stdin (format csv)`)
    );
    const stringifier = csvStringify();
    const result = new Promise((resolve, reject) => {
      stringifier.on('error', reject);
      stream.on('error', reject);
      stream.on('end', resolve);
    });
    stringifier.pipe(stream);
    for (let i = 0; i < values.length; i++) {
      stringifier.write(values[i]);
    }
    stringifier.end();
    return result;
  }

  protected checkColumns(columns: string[]) {
    if (columns.length === 0) {
      throw new Error('Cannot create table with zero columns');
    }
    const badColumns = columns.filter((c) => c.indexOf('"') >= 0);
    if (badColumns.length > 0) {
      throw new Error(
        `Columns ${badColumns.join(
          ','
        )} cannot be created in a database. Please rename them`
      );
    }
  }
}
