import { parseChunked } from '@discoveryjs/json-ext';
import * as fs from 'fs';

export const readLargeFileUtil = async (
  path: string,
  encoding: BufferEncoding = 'utf-8',
) => {
  const data = await parseChunked(fs.createReadStream(path, encoding));
  return Array.isArray(data) ? data[0] : data;
};
