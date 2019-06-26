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
