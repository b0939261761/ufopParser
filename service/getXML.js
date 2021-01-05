// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { pipeline } from 'stream/promises';
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { unlink } from 'fs/promises';
import { createWriteStream, createReadStream } from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { checkDownloadedFiles, addDownloadedFiles } from '../db/index.js';
import request from '../utils/request.js';
import { formatDate, parseDate } from '../utils/date.js';

const FILENAME_TMP = './tmp.zip';

//= ===========================================================================

const getLinkFile = async link => {
  const content = (await request(link, { method: 'get' }));
  const regexp = /<a class="resource-url-analytics" href="(?<link>.+?)"/;
  const linkFile = content.match(regexp)?.groups?.link;
  if (!linkFile) throw new Error('NO_GET_LINK');
  return linkFile;
};

//= ===========================================================================

const getFileNameDate = linkFile => {
  const fileNameDate = linkFile.match(/\d\d-\d\d-\d\d/)?.[0];
  if (!fileNameDate) throw new Error('FILENAME_NOT_MATCHES');
  return formatDate('YYYY-MM-DD', parseDate(fileNameDate, 'DD-MM-YY'));
};

//= ===========================================================================

const unpack = async (streamUnzip, streamParse, fileName) => {
  const { name } = path.parse(fileName);
  for await (const entry of streamUnzip) {
    const fileNameInside = path.basename(entry.path);
    if (fileNameInside.includes(name)) {
      await pipeline(
        entry.on('error', error => console.error(error)),
        streamParse
      );
    } else entry.autodrain();
  }
};

//= ===========================================================================

export default async (link, fileName, streamParse) => {
  const linkFile = await getLinkFile(link);
  const fileNameDate = getFileNameDate(linkFile);
  console.info('FILENAME:', fileNameDate);
  if (await checkDownloadedFiles(fileNameDate)) throw new Error('FILE_HAS_DOWNLOADED');

  const downloadStream = await request(linkFile, { responseType: 'stream' });
  await pipeline(
    downloadStream.on('error', error => console.error(error)),
    createWriteStream(FILENAME_TMP).on('error', error => console.error(error))
  );

  console.info('START PARSE');
  const streamUnzip = createReadStream(FILENAME_TMP).on('error', error => console.error(error))
    .pipe(unzipper.Parse({ forceStream: true })).on('error', error => console.error(error));

  await unpack(streamUnzip, streamParse, fileName);
  await unlink(FILENAME_TMP);
  // await addDownloadedFiles(fileNameDate);
};
