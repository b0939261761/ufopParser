// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import request from '../utils/request.js';

//= ===========================================================================

export default async (link, filename) => {
  const downloadStream = await request(link, { responseType: 'stream' });
  await pipeline(
    downloadStream.on('error', error => console.error(error)),
    createWriteStream(filename).on('error', error => console.error(error))
  );
};
