// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { pipeline } from 'stream/promises';
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { unlink } from 'fs/promises';
import { createWriteStream, createReadStream } from 'fs';

import path from 'path';
import unzipper from 'unzipper';
import request from '../utils/request.js';

//= ===========================================================================

const getLinkFile = async link => {
  const content = (await request(link, { method: 'get' }));
  const regexp = /<a class="resource-url-analytics" href="(?<link>.+?)"/;
  const linkFile = content.match(regexp)?.groups?.link;
  if (!linkFile) throw new Error('NO_GET_LINK');
  return linkFile;
};

//= ===========================================================================

const unpack = async (streamZip, streamParse, fileName) => {
  const { name } = path.parse(fileName);
  for await (const entry of streamZip) {
    const fileNameInside = path.basename(entry.path);
    if (fileNameInside.includes(name)) await pipeline(entry, streamParse);
    else entry.autodrain();
  }
};

//= ===========================================================================

export default async (link, fileName, streamParse) => {
  const fileNameZip = 'tmp.zip';
  const linkFile = await getLinkFile(link);

  await pipeline(
    await request(linkFile, { responseType: 'stream' }),
    createWriteStream(fileNameZip)
  );

  console.info('START PARSE');
  const streamZip = createReadStream(fileNameZip).on('error', error => { console.log(1); throw error; })
    .pipe(unzipper.Parse({ forceStream: true })).on('error', error => { console.log(2); throw error; });

  await unpack(streamZip, streamParse, fileName);
  await unlink(fileNameZip);
};
