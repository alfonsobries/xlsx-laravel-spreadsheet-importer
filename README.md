# laravel-spreadsheet-importer

Based on `@proscom/xlsx-to-database`

CLI tool to import sheets from xlsx files into temporal database tables that are much easier to work with.

- It optionally triggers PHP Laravel artisan commands to track the progress of the import into your Laravel app.
- You can interact with those artisan commands by using the [laravel package](https://github.com/alfonsobries/laravel-spreadsheet-importer), it also allow you to easily interact with the temporal data: [laravel-spreadsheet-importer](https://github.com/alfonsobries/laravel-spreadsheet-importer) 
- Compatible with multiple formats, see the compatible formated in the dependency (https://www.npmjs.com/package/xlsx#file-formats) 
- Once the temporal table is uploaded, you can play with the data, execute Eloquent & SQL queries, import the content into the final table, etc., and of course once you finish working with the data you can remove the temporal table.
- Using node instead of PHP for reading and import spreadsheets is **considerably** faster, also, because you will work with a temporal database table, the data is much easier to work with and the operations are faster.
- Compatible with PostgreSQL as MySQL

Uses [pg-copy-streams](https://www.npmjs.com/package/pg-copy-streams) for faster inserts in PostgreSql datatabases. 
Uses [xlsx](https://www.npmjs.com/package/xlsx) to parse xlsx files.

### Installation:

```bash
npm install @alfonsobries/xlsx-laravel-spreadsheet-importer --save
```

### Usage:

Create a .env file with the database settings (If the files exists in your laravel app this step is not neccesary)

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
    --relatedId 1
    --relatedClass "App\Models\MyModel"
```
The laravel package automatically generates this command for you: [laravel-spreadsheet-importer](https://github.com/alfonsobries/laravel-spreadsheet-importer) 

```bash
$ xlsx-laravel-spreadsheet-importer --help
Options:
  --help               Show help                                       [boolean]
  --version            Show version number                             [boolean]
  --input, -i          Input xlsx file                       [string] [required]
  --sheets, -s         Only import specified sheets                      [array]
  --sheetsIndex, --si  Only import specified sheets index                [array]
  --prefix, -p         Prefix is prepended to the table name
                                                          [string] [default: ""]
  --tableNames, -n     Table names to use when storing the data (instead of the
                       sheet name)                         [array] [default: []]
  --batchSize, -b      Amount of rows per single insert query
                                                        [number] [default: 1000]
  --drop               Drops and recreates matched tables
                                                      [boolean] [default: false]
  --create, -c         Creates tables                 [boolean] [default: false]
  --id                 If set generates and ID column with the value
                                                        [string] [default: null]
  --relatedId          Name of the related ID where the data comes from (to send
                       to the artisan command)          [string] [default: null]
  --relatedClass       Name of the related Model Class where the data comes from
                       (to send to the artisan command) [string] [default: null]
  --columns            Extra column:value to add into the database
                                                           [array] [default: []]
  --formatted, -f      Read as formatted text by default
                                                      [boolean] [default: false]
  --artisan            Laravel php artisan path           [string] [default: ""]
  --php                php executable path             [string] [default: "php"]
  --env                enviroment to sent to the artisan command
                                                          [string] [default: ""]
```

### Artisan command

If the `--artisan` option is set it will create a Laravel artisan command with the progress of the import that can be read in a Laravel app.

| Option    | Possible values                                              | Description                                                  |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| --relatedClass | Any value used a `relatedClass` param                           | Optional `id` that was sent as a param when running the script (useful to associate the data to a model for example) |
| --relatedId | Any value used a `relatedId` param                           | Optional `id` that was sent as a param when running the script (useful to associate the data to a model for example) |
| --type    | `started`, `readed`, `connected`, `total_rows`, `table_created`, `error`, `finished`,`processing` |                                                              |
| --data    | Depends of the type of the progress, for `total_rows` the number of rows, for `table_created` the name of the table, for `error` the error message, for `processing` the total rows processed | Data related with the progress type                          |
| --env     | Laravel app enviroment                                       | Optional `env` that was sent as a param when running the script (to run the artisan command in different enviroments) |
| --pid     | The current process id                                       | The process id of the running script, useful for kill the process if neccesary |
