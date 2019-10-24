import { exec } from 'child_process';
import removeAccents from 'remove-accents';
import snakeCase from 'snake-case';

export function* createRange(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

export function createLogger() {
  let prevTime = Date.now();
  return function log(...args) {
    const now = Date.now();
    const diff = now - prevTime;
    console.log(...args, `+${diff}ms`);
    prevTime = now;
  };
}

export function promiseExec(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout? stdout : stderr);
    });
  });
}

export function slugify(str) {
  return snakeCase(removeAccents(str));
}
