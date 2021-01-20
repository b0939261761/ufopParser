import { performance } from 'perf_hooks';
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { unlink } from 'fs/promises';
import { connectDB, disconnectDB } from './db/db.js';
import { checkDownloadedFiles, addDownloadedFiles } from './db/index.js';

import getFilenameLink from './service/getFilenameLink.js';
import downloadFile from './service/downloadFile.js';
import getXML from './service/getXML.js';
import { formatDate } from './utils/date.js';
import { delay } from './utils/tools.js';

const FILENAME_TMP = './tmp.zip';

// eslint-disable-next-line no-constant-condition
while (true) {
  const timeStart = performance.now();
  console.info('START', formatDate('DD.MM.YYYY HH:mm:ss'));

  try {
    await connectDB();
    const { linkFile, filenameDate } = await getFilenameLink(process.env.LINK);
    globalThis.filenameDate = filenameDate;
    console.info('FILENAME:', filenameDate);
    if (await checkDownloadedFiles(filenameDate)) throw new Error('FILE_HAS_DOWNLOADED');

    await downloadFile(linkFile, FILENAME_TMP);
    await getXML(FILENAME_TMP);

    await addDownloadedFiles(filenameDate);
    await unlink(FILENAME_TMP);

    const timeEnd = Math.ceil((performance.now() - timeStart) / 60000);
    console.info('DONE', formatDate('DD.MM.YYYY HH:mm:ss'), `- execute ${timeEnd} minutes`);
  } catch (error) {
    console.info('ERROR', formatDate('DD.MM.YYYY HH:mm:ss'));
    console.error(error);
  }
  await disconnectDB();
  await delay(process.env.LOOP_DELAY);
}
