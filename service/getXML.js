import { createWriteStream } from 'fs';
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { pipeline } from 'stream/promises';
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

const unpack = async (stream, fileName) => {
  const { name } = path.parse(fileName);
  for await (const entry of stream) {
    const fileNameInside = path.basename(entry.path);
    if (fileNameInside.includes(name)) {
      await pipeline(entry, createWriteStream(fileName));
    } else {
      entry.autodrain();
    }
  }
};

//= ===========================================================================

export default async (link, fileName) => {
  const linkFile = await getLinkFile(link);

  const zip = (await request(linkFile, { responseType: 'stream' }))
    .pipe(unzipper.Parse({ forceStream: true }));

  await unpack(zip, fileName);
};
