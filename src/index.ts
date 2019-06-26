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
  sheetsIndex: {
    alias: 'si',
    describe: 'Only import specified sheets index',
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
  create: {
    alias: 'c',
    describe: 'Creates tables',
    default: false,
    type: 'boolean'
  },
  id: {
    describe: 'Name of the ID column',
    default: null,
    requiresArg: true,
    type: 'string'
  },
  relatedId: {
    describe: 'Name of the related ID where the data comes from',
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
  artisan: {
    default: '',
    describe: 'php artisan path',
    requiresArg: true,
    type: 'string'
  },
  php: {
    default: 'php',
    describe: 'php path',
    requiresArg: true,
    type: 'string'
  },
  env: {
    default: '',
    describe: 'enviroment for the artisan command',
    requiresArg: true,
    type: 'string'
  },
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

run(dbConfig, args as RunOptions, log).catch(e => console.error(e));
