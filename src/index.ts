#!/usr/bin/env node

import { join } from 'path';
import yargs from 'yargs';
import { run, RunOptions } from './run';
import { createLogger } from './util';
import dotenv from 'dotenv'

dotenv.config()

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
  prefix: {
    alias: 'p',
    default: '',
    describe: 'Prefix is prepended to the sheet name to get table name',
    requiresArg: true,
    type: 'string'
  },
  tableNames: {
    alias: 'n',
    default: [],
    describe: 'Table names to use when storing the data',
    requiresArg: true,
    type: 'array'
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

const dbConfig = {
  "adapter": process.env.DB_CONNECTION,
  "host": process.env.DB_HOST,
  "port": process.env.DB_PORT,
  "username": process.env.DB_USERNAME,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DB_DATABASE,
  "schema": process.env.DB_SCHEMA || 'public',
};

const log = createLogger();

run(dbConfig, args as RunOptions, log)
  .catch(e => console.error(e));
