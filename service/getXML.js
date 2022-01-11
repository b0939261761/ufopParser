// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import ParseXML from './parseXML.js';
import { addOrganizations, addPersons } from '../db/index.js';

//= ===========================================================================

export default async filename => {
  const streamUnzip = createReadStream(filename).on('error', error => console.error(error))
    .pipe(unzipper.Parse({ forceStream: true })).on('error', error => console.error(error));

  const organizations = new ParseXML('Organizations', addOrganizations);
  const streamOrganizations = organizations.streamParse.bind(organizations);
  // const persons = new ParseXML('Persons', addPersons);
  // const streamPersons = persons.streamParse.bind(persons);

  for await (const entry of streamUnzip) {
    const fileNameInside = path.basename(entry.path).slice(0, 4);
    let streamParse;

    if (fileNameInside === '17.1') streamParse = streamOrganizations;
    // else if (fileNameInside === '17.2') streamParse = streamPersons;

    if (streamParse) {
      await pipeline(
        entry.on('error', error => console.error(error)),
        streamParse
      );
    } else {
      entry.autodrain();
    }
  }
};
