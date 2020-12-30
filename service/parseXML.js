import { createReadStream } from 'fs';
import addOrganizations from '../db/addOrganizations.js';
import decodeFromWin1251 from '../utils/decodeFromWin1251.js';

//= ===========================================================================

const modifyContent = str => {
  const result = str
    .trim()
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', '"');
  return decodeFromWin1251(result);
};

//= ===========================================================================

const structure = {
  EDRPOU: { name: 'code' },
  NAME: { name: 'fullName', transform: true },
  SHORT_NAME: { name: 'name', transform: true },
  KVED: { name: 'activity', transform: true },
  ADDRESS: { name: 'address', transform: true },
  BOSS: { name: 'manager', transform: true },
  STAN: { name: 'status', transform: true }
};

//= ===========================================================================

const pushOrganizations = async (organizations, organization) => {
  const index = organizations.findIndex(el => el.code === organization.code);
  if (index > -1) organizations.splice(index, 1);
  organizations.push(organization);

  if (organizations.length === +process.env.DB_CHUNK_LENGTH) {
    await addOrganizations(organizations);
    organizations.splice(0, organizations.length);
  }
};

//= ===========================================================================

const getOrganization = record => {
  const rawTags = record.matchAll(/<(?<tag>(.*?))>(?<content>.*?)<\/(\k<tag>)>/g);

  const organization = {};
  for (const rawTag of rawTags) {
    const { tag, content } = rawTag.groups;
    const field = structure[tag];
    if (field) {
      const value = field.transform ? modifyContent(content) : content;
      organization[field.name] = value;
    }
  }
  return organization;
};

//= ===========================================================================

export default async filename => {
  console.info(new Date().toISOString(), 'START PARSE');
  const fileStream = createReadStream(filename, { encoding: 'binary' });
  let chunks = '';
  const organizations = [];
  for await (const chunk of fileStream) {
    chunks += chunk;
    const rawRecords = chunks.matchAll(/(?:<RECORD>)(?<record>.*?)<\/RECORD>/g);

    let lastIndex = 0;
    for (const rawRecord of rawRecords) {
      lastIndex = rawRecord.index + rawRecord[0].length;
      const organization = getOrganization(rawRecord.groups.record);
      chunks = chunks.slice(lastIndex);
      await pushOrganizations(organizations, organization);
    }
  }

  await addOrganizations(organizations);
};
