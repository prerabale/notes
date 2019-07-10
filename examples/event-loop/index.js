const fs = require('fs');

fs.readFile(__filename, (err, data) => {
  /**
   * poll 阶段
   * 因为 poll 之后是 check 阶段，immediate 会在此阶段执行，
   * 所以在此场景中，setImmediate 的回调函数一定会优先于 setTimeout 先执行 
   */
  setTimeout(() => {
    console.log('poll timeout');
  }, 10);

  setImmediate(() => {
    console.log('poll immediate')
  });

  /**
   * 因为 process.nextTick 是在每个阶段结束的时候执行，所以 poll 阶段执行之后，会先执行 process.nextTick，
   * 然后进入 check 阶段
   */
  process.nextTick(() => {
    console.log('poll nextTick')
  })

  const start = Date.now();
  while(Date.now() - start < 100) {
  }
})