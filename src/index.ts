#!/usr/bin/env node

import dotenv from 'dotenv';
import { join } from 'path';
import yargs from 'yargs';
import { run, RunOptions } from './run';
import { createLogger } from './util';

dotenv.config();

const args = yargs.options({
  input: {
    alias: 'i',
    describe: 'Input xlsx file',
    demandOption: true,
    requiresArg: true,
    type: 'string'
  },
  sheets: {
    alias: 's',
    describe: 'Only import specified sheets',
    requiresArg: true,
    type: 'array'
  },
  sheetsIndex: {
    alias: 'si',
    describe: 'Only import specified sheets index',
    requiresArg: true,
    type: 'array'
  },
  prefix: {
    alias: 'p',
    default: '',
    describe: 'Prefix is prepended to the table name',
    requiresArg: true,
    type: 'string'
  },
  tableNames: {
    alias: 'n',
    default: [],
    describe:
      'Table names to use when storing the data (instead of the sheet name)',
    requiresArg: true,
    type: 'array'
  },
  batchSize: {
    alias: 'b',
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
  log: {
    describe: 'Forces log to the users when its disabled because it uses artisan',
    default: false,
    type: 'boolean'
  },
  create: {
    alias: 'c',
    describe: 'Creates tables',
    default: false,
    type: 'boolean'
  },
  id: {
    describe: 'If set generates and ID column with the value',
    default: null,
    requiresArg: true,
    type: 'string'
  },
  relatedId: {
    describe:
      'Name of the related ID where the data comes from (to send to the artisan command)',
    default: null,
    requiresArg: true,
    type: 'string'
  },
  relatedClass: {
    describe:
      'Name of the related Model Class where the data comes from (to send to the artisan command)',
    default: null,
    requiresArg: true,
    type: 'string'
  },
  columns: {
    default: [],
    describe: 'Extra column:value to add into the database',
    requiresArg: true,
    type: 'array'
  },
  formatted: {
    alias: 'f',
    describe: 'Read as formatted text by default',
    default: false,
    type: 'boolean'
  },
  artisan: {
    default: '',
    describe: 'Laravel php artisan path',
    requiresArg: true,
    type: 'string'
  },
  php: {
    default: 'php',
    describe: 'php executable path',
    requiresArg: true,
    type: 'string'
  },
  env: {
    default: '',
    describe: 'enviroment to sent to the artisan command',
    requiresArg: true,
    type: 'string'
  }
}).argv;

const dbConfig = {
  adapter: process.env.DB_CONNECTION,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: process.env.DB_SCHEMA || 'public'
};

const log = createLogger();

run(dbConfig, args as RunOptions, log).catch((e) => console.error(e));
