import request from '../utils/request.js';
import { formatDate, parseDate } from '../utils/date.js';

//= ===========================================================================

const getLinkFile = async link => {
  const content = await request(link, { method: 'get' });
  const regexp = /<a class="resource-url-analytics" href="(?<link>.+?)"/;
  const linkFile = content.match(regexp)?.groups?.link;
  if (!linkFile) throw new Error('NO_GET_LINK');
  return linkFile;
};

//= ===========================================================================

const getFilenameDate = linkFile => {
  const filenameDate = linkFile.match(/\d\d-\d\d-\d{4}/)?.[0];
  if (!filenameDate) throw new Error('FILENAME_NOT_MATCHES');
  return formatDate('YYYY-MM-DD', parseDate(filenameDate, 'DD-MM-YYYY'));
};

//= ===========================================================================

export default async link => {
  const linkFile = await getLinkFile(link);
  const filenameDate = getFilenameDate(linkFile);
  return { linkFile, filenameDate };
};
