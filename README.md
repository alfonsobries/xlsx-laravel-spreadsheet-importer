# laravel-spreadsheet-importer

Based on `@proscom/xlsx-to-database`

Cli tool to import sheets from xlsx to the database tables that also allows to create laravel artisan commands to track the progress into a laravel app.

Uses [pg-copy-streams](https://www.npmjs.com/package/pg-copy-streams) for faster inserts in PostgreSql datatabases. 
Uses [xlsx](https://www.npmjs.com/package/xlsx) to parse xlsx files.

### Installation:

```bash
npm install -g @alfonsobries/xlsx-laravel-spreadsheet-importer
```

### Usage:
Create a .env file with the database settings

```
DB_CONNECTION=pgsql # or mysql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=my_database
DB_USERNAME=admin
DB_PASSWORD=
```

```bash
$ xlsx-laravel-spreadsheet-importer \
    -i input.xlsx \
```

Or for a laravel app

```bash
$ xlsx-laravel-spreadsheet-importer \
    -i input.xlsx \
    --php /usr/bin/php \
    --artisan /home/myproject/path/artisan \
    --env testing
```

```bash
$ xlsx-laravel-spreadsheet-importer --help
Options:
  --help               Show help                                       [boolean]
  --version            Show version number                             [boolean]
  --input, -i          Input xlsx file                       [string] [required]
  --sheets, -s         Only import specified sheets                      [array]
  --sheetsIndex, --si  Only import specified sheets index                [array]
  --prefix, -p         Prefix is prepended to the sheet name to get table name
                                                          [string] [default: ""]
  --tableNames, -n     Table names to use when storing the data
                                                           [array] [default: []]
  --batchSize, -b      Amount of rows per single insert query
                                                        [number] [default: 1000]
  --drop               Drops and recreates matched tables
                                                      [boolean] [default: false]
  --create, -c         Creates tables                 [boolean] [default: false]
  --id                 Name of the ID column            [string] [default: null]
  --relatedId          Name of the related ID where the data comes from
                                                        [string] [default: null]
  --columns            Extra column:value to add into the database
                                                           [array] [default: []]
  --artisan            php artisan path                   [string] [default: ""]
  --php                php path                        [string] [default: "php"]
  --env                enviroment for the artisan command [string] [default: ""]
```
