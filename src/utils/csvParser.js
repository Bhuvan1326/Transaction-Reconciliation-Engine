const fs = require('fs');
const { parse } = require('csv-parse');

function createCsvReadStream(filePath) {
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  fileStream.pipe(parser);
  return parser;
}

module.exports = { createCsvReadStream };
