const fs = require('fs');
const { stringify } = require('csv-stringify');

function createCsvWriteStream(filePath, columns) {
  const writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });
  const stringifier = stringify({
    header: true,
    columns,
  });

  stringifier.pipe(writeStream);

  return {
    stringifier,
    writeStream,
    writeRow(row) {
      return new Promise((resolve, reject) => {
        const canContinue = stringifier.write(row);
        if (canContinue) {
          resolve();
        } else {
          stringifier.once('drain', resolve);
        }
      });
    },
    end() {
      return new Promise((resolve, reject) => {
        stringifier.end();
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        stringifier.on('error', reject);
      });
    },
  };
}

module.exports = { createCsvWriteStream };
