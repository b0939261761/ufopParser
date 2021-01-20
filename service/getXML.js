import { formatDate } from '../utils/date.js';

//= ===========================================================================

export default class {
  #type;
  #insertToDB;
  #records = [];

  constructor(type, insertToDB) {
    this.#type = type;
    this.#insertToDB = insertToDB;
  }

  //= ===========================================================================

  // eslint-disable-next-line func-names, space-before-function-paren
  async #pushRecords(record) {
    this.#records.push(record);
    if (this.#records.length !== +process.env.DB_CHUNK_LENGTH) return;
    await this.#insertToDB(this.#records);
    // eslint-disable-next-line no-param-reassign
    this.#records.length = 0;
  }

  //= ===========================================================================

  // eslint-disable-next-line func-names, space-before-function-paren
  #getRecord(rawRecord) {
    const rawTags = rawRecord.matchAll(/<(?<tag>(.*?))>(?<content>.*?)<\/(\k<tag>)>/g);

    const record = {};
    for (const rawTag of rawTags) record[rawTag.groups.tag] = rawTag.groups.content;
    return record;
  }

  //= ===========================================================================

  async streamParse(stream) {
    console.info('START PARSE:', this.#type, formatDate('DD.MM.YYYY HH:mm:ss'));
    let countRecord = 0;
    stream.setEncoding('binary');
    try {
      let chunks = '';

      for await (const chunk of stream) {
        chunks += chunk.replaceAll('\n', '');
        const rawRecords = chunks.matchAll(/<RECORD>(?<record>.*?)<\/RECORD>/g);

        let lastIndex = 0;
        for (const rawRecord of rawRecords) {
          lastIndex = rawRecord.index + rawRecord[0].length;
          const record = this.#getRecord(rawRecord.groups.record);
          countRecord += 1;
          await this.#pushRecords(record);
        }

        chunks = chunks.slice(lastIndex);
      }

      await this.#insertToDB(this.#records);
      console.info('RECORDS:', countRecord, formatDate('DD.MM.YYYY HH:mm:ss'));
    } catch (err) {
      console.error(err);
    }
  }
}
