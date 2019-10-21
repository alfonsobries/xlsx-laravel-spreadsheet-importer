import csvStringify from 'csv-stringify';
import mysql from 'mysql';
import { from as copyFrom } from 'pg-copy-streams';
import { DatabaseAdapter } from './adapter.interface';
import WritableStream = NodeJS.WritableStream;

function wrapColumn(c) {
  return `"${c}"`;
}

export class MySQLAdapter implements DatabaseAdapter {
  protected client = null;

  public async connect(options: any): Promise<any> {
    if (this.client) {
      await this.client.end();
    }
    const { schema, ...other } = options;
    console.log(`Connecting to ${other.host}:${other.port}/${other.database}`);
    const dbConfig = {
      host: other.host,
      port: other.port,
      user: other.user,
      password: other.password,
      database: other.database
    };
    const connection = mysql.createConnection(dbConfig);
    connection.connect();
    this.client = connection;
    return this.client;
  }

  public async close(): Promise<any> {
    return this.client.end();
  }

  public async dropTable(tableName: string): Promise<any> {
    // language=MySQL
    return new Promise((resolve, reject) => {
      this.client.query(
        `
        drop table if exists ${tableName}
      `,
        (error, results) => {
          if (error) {
            console.log('AAAAAA AAAAAA');
            reject(error);
          }

          resolve(results);
        }
      );
    });
  }

  public async createTable(
    tableName: string,
    columns: string[],
    id: string
  ): Promise<any> {
    this.checkColumns(columns);
    let columnDefs = columns.map((c) => `${c} text`).join(',');

    if (id) {
      columnDefs = `${id} INT AUTO_INCREMENT, ${columnDefs}, PRIMARY KEY (${id})`;
    }

    // language=MySQL
    return new Promise((resolve, reject) => {
      this.client.query(
        `create table if not exists ${tableName} (${columnDefs})`,
        (error, results) => {
          if (error) {
            reject(error);
          }

          resolve(results);
        }
      );
    });
  }

  public async insertValues(
    tableName: string,
    columns: string[],
    values: string[][]
  ): Promise<any> {
    this.checkColumns(columns);
    const sql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES ?`;
    return new Promise((resolve, reject) => {
      this.client.query(sql, [values], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve(results);
      });
    });
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
