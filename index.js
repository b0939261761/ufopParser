import path from 'path';
import { promises as fsPromises } from 'fs';
import { performance } from 'perf_hooks';
import { connectDB, disconnectDB } from './db/db.js';
import getXML from './service/getXML.js';
import parseXML from './service/parseXML.js';

const PATH_FILES = './files';

const timeStart = performance.now();

const link = 'https://data.gov.ua/dataset/1c7f3815-3259-45e0-bdf1-64dca07ddc10/resource/06bbccbd-e19c-40d5-9e18-447b110c0b4c';
const filePath = path.join(PATH_FILES, '17.1-EX_XML_EDR_UO.xml');

try {
  await connectDB();
  await getXML(link, filePath);
  await parseXML(filePath);
} catch (error) {
  console.error('err', error);
}

try {
  await disconnectDB();
  await fsPromises.unlink(filePath);
} catch {}

console.info(`Script run ${(performance.now() - timeStart) / 60000} minutes`);
