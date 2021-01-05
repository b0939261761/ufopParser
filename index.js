import { performance } from 'perf_hooks';
import { connectDB, disconnectDB } from './db/db.js';
import getXML from './service/getXML.js';
import parseXML from './service/parseXML.js';
import { formatDate } from './utils/date.js';
import { delay } from './utils/tools.js';

while (true) {
  const timeStart = performance.now();
  console.info('START', formatDate('DD.MM.YYYY HH:mm:ss'));

  try {
    await connectDB();
    await getXML(process.env.LINK, process.env.FILENAME, parseXML);
    const tineEnd = Math.ceil((performance.now() - timeStart) / 60000);
    console.info('DONE', formatDate('DD.MM.YYYY HH:mm:ss'), `- execute ${tineEnd} minutes`);
  } catch (error) {
    console.info('ERROR', formatDate('DD.MM.YYYY HH:mm:ss'));
    console.error(error);
  }
  await disconnectDB();

  await delay(process.env.LOOP_DELAY);
}
