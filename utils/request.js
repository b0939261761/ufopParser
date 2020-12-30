import http from 'http';
import https from 'https';

export default async (url, options = {}) => {
  let resolve;
  let reject;

  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  const lib = isHttps ? https : http;

  const params = {
    method: options.method || 'GET',
    protocol: urlObj.protocol,
    host: urlObj.host,
    port: urlObj.port,
    path: urlObj.pathname,
    timeout: options.timeout ?? 0
  };

  const onRequest = res => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return reject(new Error(`${res.statusCode} ${lib.STATUS_CODES[res.statusCode]}`));
    }

    if (options.responseType === 'stream') return resolve(res);

    const data = [];

    res.on('data', chunk => data.push(chunk));
    res.on('error', error => reject(error));
    res.on('end', () => resolve(Buffer.concat(data).toString()));
  };

  const request = (res, rej) => {
    ([resolve, reject] = [res, rej]);
    const req = lib.request(params, onRequest);

    // if (postData) req.write(postData);
    req.on('error', error => !req.aborted && reject(error));
    req.on('timeout', () => req.abort());
    req.end();
  };

  return new Promise(request);
};
