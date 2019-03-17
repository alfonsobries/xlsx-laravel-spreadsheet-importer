#!/usr/bin/env node

import yargs from 'yargs';
import { join } from 'path';
import xlsx from 'xlsx';
import { DatabaseAdapter } from './adapter.interface';
import { PgSQLAdapter } from './pgsql.adapter';

const cell = (r, c) => xlsx.utils.encode_cell({ r, c });

const args = yargs.options({
  input: {
    alias: 'i',
    describe: 'Input xlsx file',
    demandOption: true,
    requiresArg: true,
    type: 'string'
  },
  database: {
    alias: 'd',
    describe: 'Path to database connection configuration file',
    demandOption: true,
    requiresArg: true,
    type: 'string'
  },
  tables: {
    alias: 't',
    describe: 'Only import specified sheets',
    requiresArg: true,
    type: 'array'
  },
  prefix: {
    alias: 'p',
    default: '',
    describe: 'Prefix is prepended to the sheet name to get table name',
    requiresArg: true,
    type: 'string'
  },
  batchSize: {
    describe: 'Amount of rows per single insert query',
    default: 1000,
    requiresArg: true,
    type: 'number'
  },
  drop: {
    describe: 'Drops and recreates matched tables',
    default: false,
    type: 'boolean'
  },
  create: {
    alias: 'c',
    describe: 'Creates tables',
    default: false,
    type: 'boolean'
  }
}).argv;

// tslint:disable-next-line:no-var-requires
const dbConfig = require(join(process.cwd(), args.database));

async function createAdapter(config: any): Promise<DatabaseAdapter> {
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

interface RunOptions {
  input: string;
  tables: string[];
  prefix: string;
  drop: boolean;
  create: boolean;
  batchSize: number;
}

function* createRange(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

function createLogger() {
  let prevTime = Date.now();
  return function log(...args) {
    const now = Date.now();
    const diff = now - prevTime;
    console.log(...args, `+${diff}ms`);
    prevTime = now;
  }
}

const log = createLogger();

async function run(dbConfig: any, options: RunOptions, log: (...args: any[]) => void) {
  log('Connecting to the database');
  const db = await createAdapter(dbConfig);
  log('Database connected');

  try {
    log(`Reading input file '${options.input}'`);
    const wb = xlsx.readFile(options.input);
    for (const sheetName of wb.SheetNames) {
      if (options.tables && options.tables.indexOf(sheetName) === -1) {
        continue;
      }
      const tableName = options.prefix + sheetName;
      log(`Importing sheet '${sheetName}' to table '${tableName}'`);

      if (options.drop) {
        log(`Dropping table ${tableName}`);
        await db.dropTable(tableName);
      }

      const columns = [];
      const ws = wb.Sheets[sheetName];
      const range = xlsx.utils.decode_range(ws['!ref']);
      let nColumns = range.e.c + 1;
      const nRows = range.e.r + 1;
      for (let c = 0; c < nColumns; c++) {
        const wc = ws[cell(0, c)];
        if (!wc || !wc.w) {
          nColumns = c;
          break;
        }
        columns.push(wc.w);
      }

      if (options.drop || options.create) {
        log(`Creating table ${tableName}(${columns.join(',')})`);
        await db.createTable(tableName, columns);
      }

      const nBatches = Math.ceil((nRows - 1) / options.batchSize);
      for (const iBatch of createRange(0, nBatches)) {
        const rows = [];
        const batchStart = iBatch * options.batchSize + 1;
        const batchEnd = Math.min(nRows, (iBatch + 1) * options.batchSize + 1);
        for (let iRow = batchStart; iRow < batchEnd; iRow++) {
          const row = [];
          let hasNonEmpty = false;
          for (let iCol = 0; iCol < nColumns; iCol++) {
            const wc = ws[cell(iRow, iCol)];
            if (wc) {
              hasNonEmpty = true;
            }
            row.push(wc && wc.w || '');
          }
          if (hasNonEmpty) {
            rows.push(row);
          }
        }

        if (rows.length === 0) {
          log(`No non-empty rows in a batch. Breaking`);
          break;
        }

        log(`Inserting batch ${iBatch + 1}/${nBatches} (${rows.length})`);
        await db.insertValues(tableName, columns, rows);
      }
    }
  } finally {
    await db.close();
    log('Database connection closed');
  }
}

run(dbConfig, args as RunOptions, log)
  .catch(e => console.error(e));
