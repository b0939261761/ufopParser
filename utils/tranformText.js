import decodeFromWin1251 from './decodeFromWin1251.js';

export default (str = '') => {
  const result = str
    .trim()
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', '\'');
  return decodeFromWin1251(result);
};
