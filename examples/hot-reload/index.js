const fs = require('fs');
const path = require('path');
const inspect = require('util').inspect;
let config = require('./config');

function print(err, content) {
  if (err) {
    throw err;
  }
  console.log('配置内容: ' + inspect(content));
}


function watch(filePath, handler) {
  const realPath = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, filePath);
  const dir = path.dirname(realPath);
  fs.watch(realPath, function (eventType, filename) {
    const fullPath = path.resolve(dir, filename);
    delete require.cache[fullPath];
    try {
      const content = require(fullPath);
      handler(null, content);
    } catch (e) {
      handler(e, null);
    }
  })
}

print(null, config);
watch(path.resolve(__dirname, 'config.js'), print)