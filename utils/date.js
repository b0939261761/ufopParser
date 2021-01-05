const zeroStart = (num, digits = 2) => num.toString().padStart(digits, '0');

const getDateTime = (date = new Date()) => (date instanceof Date ? date : new Date(date));

export const formatDate = (format, datePar) => {
  if (!format) return '';
  const date = getDateTime(datePar);
  let result = format.toString();

  const mask = {
    YYYY: date.getFullYear().toString(),
    YY: date.getFullYear().toString().slice(2),
    MM: zeroStart(date.getMonth() + 1),
    DD: zeroStart(date.getDate()),
    HH: zeroStart(date.getHours()),
    mm: zeroStart(date.getMinutes()),
    ss: zeroStart(date.getSeconds()),
    SSS: zeroStart(date.getMilliseconds(), 3)
  };

  Object.entries(mask).forEach(({ 0: key, 1: value }) => {
    result = result.replace(new RegExp(key, 'g'), value);
  });

  return result;
};

export const parseDate = (str, format) => {
  if (!format) return new Date(str);

  const mask = {};
  for (const { 0: key, index } of format.matchAll(/(SSS|ss|mm|HH|DD|MM|YYYY|YY)/g)) {
    mask[key] = parseInt(str.substr(index, key.length)) || 0;
  }

  const year = mask.YYYY || (mask.YY && `20${mask.YY}`) || 0;
  const month = (mask.MM || 1) - 1;
  const day = mask.DD || 0;
  const hour = mask.HH || 0;
  const minute = mask.mm || 0;
  const second = mask.ss || 0;
  const millisecond = mask.SSS || 0;
  return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
};

export default {
  formatDate,
  parseDate
};
