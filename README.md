# xlsx-to-database

Cli tool to import sheets from xlsx file to the database tables

Currently supports only PostgreSQL databases via [pg](https://www.npmjs.com/package/pg).
Uses [pg-copy-streams](https://www.npmjs.com/package/pg-copy-streams) for faster inserts. 
Uses [xlsx](https://www.npmjs.com/package/xlsx) to parse xlsx files.

### Installation:

```bash
npm install -g @proscom/xlsx-to-database
```

### Usage:
```bash
$ xlsx-to-database \
    -i input.xlsx \
    -d database.json \
    -c
```

```bash
$ xlsx-to-database --help
Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --input, -i     Input xlsx file                            [string] [required]
  --database, -d  Path to database connection configuration file
                                                             [string] [required]
  --tables, -t    Only import specified sheets                           [array]
  --prefix, -p    Prefix is prepended to the sheet name to get table name
                                                          [string] [default: ""]
  --batchSize     Amount of rows per single insert query[number] [default: 1000]
  --drop          Drops and recreates matched tables  [boolean] [default: false]
  --create, -c    Creates tables                      [boolean] [default: false]
```

### Configuration file example for PostgreSQL:
```json
{
  "adapter": "pgsql",
  "host": "127.0.0.1",
  "port": "5432",
  "username": "root",
  "password": "root",
  "database": "test",
  "schema": "test"
}
```

Configuration file is read via `require()`, so you can also use a `.js` file to dynamically generate a configuration.
It may be useful in order to read environment variables for example.
