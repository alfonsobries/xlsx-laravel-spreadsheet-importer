# laravel-spreadsheet-importer

Based on `@proscom/xlsx-to-database`

Cli tool to import sheets from xlsx files (or other compatible formats in the SheetJs package) into temporal database tables.
- It optionally creates php laravel artisan commands to track the progress of the import in your laravel app.
- Once the temporal table is uploaded you can play with the data, execute sql queries, import the content into the final table, etc. and finally remove the temporal table.
- That means, of course *way* faster and more flexible import of data, xlsx can import a super big spreadsheet in just a few seconds.
- Compatible with postgresql as MySQL
- * Laravel package for handling the data coming soon

Uses [pg-copy-streams](https://www.npmjs.com/package/pg-copy-streams) for faster inserts in PostgreSql datatabases. 
Uses [xlsx](https://www.npmjs.com/package/xlsx) to parse xlsx files.

### Installation:

```bash
npm install @alfonsobries/xlsx-laravel-spreadsheet-importer
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
$ ./node_modules/.bin/xlsx-laravel-spreadsheet-importer \
    -i input.xlsx \
```

Or for a laravel app

```bash
$ ./node_modules/.bin/xlsx-laravel-spreadsheet-importer \
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

### Artisan command

If the `--artisan` option is set it will create an Laravel artisan command with the progress of the import that can be readed in a Laravel app.

| Option    | Possible values                                              | Description                                                  |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| --related | Any value used a `relatedId` param                           | Optional `id` that was sent as a param when running the script (useful to associate the data to a model for example) |
| --type    | `started`, `readed`, `connected`, `total_rows`, `table_created`, `error`, `finished`,`processing` |                                                              |
| --data    | Depends of the type of the progress, for `total_rows` the number of rows, for `table_created` the name of the table, for `error` the error message, for `processing` the total rows processed | Data related with the progress type                          |
| --env     | Laravel app enviroment                                       | Optional `env` that was sent as a param when running the script (to run the artisan command in different enviroments) |
| --pid     | The current process id                                       | The process id of the running script, useful for kill the process if neccesary |
