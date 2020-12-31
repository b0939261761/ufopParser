import path from 'path';
import { performance } from 'perf_hooks';
import { connectDB, disconnectDB } from './db/db.js';
import getXML from './service/getXML.js';
import parseXML from './service/parseXML.js';

const PATH_FILES = './files';

const timeStart = performance.now();

const link = 'https://data.gov.ua/dataset/1c7f3815-3259-45e0-bdf1-64dca07ddc10/resource/06bbccbd-e19c-40d5-9e18-447b110c0b4c';
const filePath = path.join(PATH_FILES, '17.1-EX_XML_EDR_UO.xml');

const getCurrentFormatDateTime = () => {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };

  return new Intl.DateTimeFormat('ru', options).format(new Date());
};

console.info('START', getCurrentFormatDateTime());

try {
  await connectDB();
  await getXML(link, filePath, parseXML);
} catch (error) {
  console.error('err', error);
}
await disconnectDB();

const tineEnd = Math.ceil((performance.now() - timeStart) / 60000);

console.info('DONE', getCurrentFormatDateTime(), `- execute ${tineEnd} minutes`);
