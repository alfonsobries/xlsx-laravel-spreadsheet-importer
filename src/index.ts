#!/usr/bin/env node

import { join } from 'path';
import yargs from 'yargs';
import { run, RunOptions } from './run';
import { createLogger } from './util';


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

const log = createLogger();

run(dbConfig, args as RunOptions, log)
  .catch(e => console.error(e));
