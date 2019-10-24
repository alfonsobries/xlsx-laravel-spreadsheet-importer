import { exec } from 'child_process';
import xlsx from 'xlsx';
import { createAdapter } from './createAdapter';
import { createRange, promiseExec, slugify } from './util';

const cell = (r, c) => xlsx.utils.encode_cell({ r, c });

export interface RunOptions {
  input: string;
  sheets: string[];
  sheetsIndex: number[];
  tableNames: string[];
  prefix: string;
  drop: boolean;
  log: boolean;
  create: boolean;
  batchSize: number;
  columns: string[];
  formatted: boolean;
  id: string;
  relatedId: string;
  relatedClass: string;
  php: string;
  artisan: string;
  env: string;
}

export async function run(
  dbConfig: any,
  options: RunOptions,
  log: (...args: any[]) => void
) {
  const { adapter, ...other } = dbConfig;

  const db = await createAdapter(dbConfig);

  try {
    if (!options.artisan || options.log) {
      log(`Reading input file '${options.input}'`);
    }

    if (options.artisan) {
      await promiseExec(
        `${options.php} ${options.artisan} importer:progress --relatedClass="${
          options.relatedClass
        }" --relatedId=${options.relatedId} --type=started${
          options.env ? ' --env=' + options.env : ''
        } --pid=${process.pid}`
      );
    }

    const wb = xlsx.readFile(options.input);

    if (!options.artisan || options.log) {
      log('Connecting to the database');
    }

    if (options.artisan) {
      await promiseExec(
        `${options.php} ${options.artisan} importer:progress --relatedClass="${
          options.relatedClass
        }" --relatedId=${options.relatedId} --type=readed${
          options.env ? ' --env=' + options.env : ''
        } --pid=${process.pid}`
      );
    }

    db.connect(other);

    if (!options.artisan || options.log) {
      log('Database connected');
    }

    if (options.artisan) {
      await promiseExec(
        `${options.php} ${options.artisan} importer:progress --relatedClass="${
          options.relatedClass
        }" --relatedId=${options.relatedId} --type=connected${
          options.env ? ' --env=' + options.env : ''
        } --pid=${process.pid}`
      );
    }

    for (const sheetName of wb.SheetNames) {
      const index = wb.SheetNames.indexOf(sheetName);

      if (options.sheets && options.sheets.indexOf(sheetName) === -1) {
        continue;
      }

      if (options.sheetsIndex && !options.sheetsIndex.includes(index)) {
        continue;
      }

      const tableName =
        typeof options.tableNames[index] !== 'undefined'
          ? options.prefix + options.tableNames[index]
          : options.prefix + sheetName;

      if (!options.artisan || options.log) {
        log(`Importing sheet '${sheetName}' to table '${tableName}'`);
      }

      if (options.drop) {
        if (!options.artisan || options.log) {
          log(`Dropping table ${tableName}`);
        }

        await db.dropTable(tableName);
      }

      let columns = [];
      const ws = wb.Sheets[sheetName];
      const range = xlsx.utils.decode_range(ws['!ref']);
      let nColumns = range.e.c + 1;
      const nRows = range.e.r + 1;

      if (options.artisan) {
        await promiseExec(
          `${options.php} ${options.artisan} importer:progress --relatedClass="${
            options.relatedClass
          }" --relatedId=${options.relatedId} --type=total_rows --data=${nRows -
            1}${options.env ? ' --env=' + options.env : ''} --pid=${
            process.pid
          }`
        );
      }

      for (let c = 0; c < nColumns; c++) {
        const wc = ws[cell(0, c)];
        if (!wc || !(wc.w || wc.v)) {
          nColumns = c;
          break;
        }
        columns.push(wc.w || wc.v);
      }

      if (options.columns.length) {
        columns = options.columns.map((c) => c.split(':')[0]).concat(columns).map(c => slugify(c));
      }

      if (options.drop || options.create) {
        if (!options.artisan || options.log) {
          log(`Creating table [${tableName}](${columns.join(',')})`);
        }

        await db.createTable(tableName, columns, options.id);

        if (options.artisan) {
          await promiseExec(
            `${options.php} ${
              options.artisan
            } importer:progress --relatedClass="${
              options.relatedClass
            }" --relatedId=${
              options.relatedId
            } --type=table_created --data=${tableName}${
              options.env ? ' --env=' + options.env : ''
            } --pid=${process.pid}`
          );
        }
      }

      const nBatches = Math.ceil((nRows - 1) / options.batchSize);

      if (!options.artisan || options.log) {
        log(`Importing [${nRows}] total items`);
      }

      for (const iBatch of createRange(0, nBatches)) {
        const rows = [];
        const batchStart = iBatch * options.batchSize + 1;
        const batchEnd = Math.min(nRows, (iBatch + 1) * options.batchSize + 1);
        for (let iRow = batchStart; iRow < batchEnd; iRow++) {
          const row = options.columns.map((c) => c.split(':')[1]);

          let hasNonEmpty = false;
          for (let iCol = 0; iCol < nColumns; iCol++) {
            const wc = ws[cell(iRow, iCol)];
            if (wc) {
              hasNonEmpty = true;
            }
            const value = !wc
              ? ''
              : !options.formatted
              ? wc.v || ''
              : wc.w || wc.v || '';
            row.push(value);
          }

          if (hasNonEmpty) {
            rows.push(row);
          }
        }

        if (rows.length === 0) {
          if (options.artisan) {
            await promiseExec(
              `${options.php} ${
                options.artisan
              } importer:progress --relatedClass="${
                options.relatedClass
              }" --relatedId=${options.relatedId} --type=error --data=no_rows${
                options.env ? ' --env=' + options.env : ''
              } --pid=${process.pid}`
            );
          } else {
            log(`No non-empty rows in a batch. Breaking`);
          }
          break;
        }

        if (!options.artisan || options.log) {
          log(`*Inserting* batch [${iBatch + 1}/${nBatches}] (${rows.length})`);
        }

        await db.insertValues(tableName, columns, rows);

        if (options.artisan) {
          await promiseExec(
            `${options.php} ${
              options.artisan
            } importer:progress --relatedClass="${
              options.relatedClass
            }" --relatedId=${
              options.relatedId
            } --type=processing --data=${iBatch * options.batchSize +
              rows.length}${options.env ? ' --env=' + options.env : ''} --pid=${
              process.pid
            }`
          );
        }
      }
    }
  } catch (e) {
    if (options.artisan) {
      await promiseExec(
        `${options.php} ${options.artisan} importer:progress --relatedClass="${
          options.relatedClass
        }" --relatedId=${
          options.relatedId
        } --type=error --data=exception --message="${e.message || ''}"${
          options.env ? ' --env=' + options.env : ''
        } --pid=${process.pid}`
      );
    }
  } finally {
    await db.close();
    if (options.artisan) {
      await promiseExec(
        `${options.php} ${options.artisan} importer:progress --relatedClass="${
          options.relatedClass
        }" --relatedId=${options.relatedId} --type=finished${
          options.env ? ' --env=' + options.env : ''
        } --pid=${process.pid}`
      );
    }
  }
}
