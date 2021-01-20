import { queryDB } from './db.js';
import tranformText from '../utils/tranformText.js';

export const addOrganizations = data => {
  const sql = `
    INSERT INTO "Organizations" (
      code, manager, "fullName", name,
      address, activity, status, "downloadedFile"
    )
    SELECT
        code, manager, "fullName", name,
        address, activity, status, "downloadedFile"
      FROM UNNEST (
        $1::text[], $2::text[], $3::text[], $4::text[],
        $5::text[], $6::text[], $7::text[], $8::date[]
      ) AS t (
        code, manager, "fullName", name,
        address, activity, status, "downloadedFile"
      )
    ON CONFLICT (code) DO UPDATE SET
      manager = EXCLUDED.manager,
      "fullName" = EXCLUDED."fullName",
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      activity = EXCLUDED.activity,
      status = EXCLUDED.status,
      "updatedAt" = CURRENT_TIMESTAMP
  `;

  const values = [[], [], [], [], [], [], [], []];

  const loopData = item => {
    const code = item.EDRPOU || '';

    const lastIndex = values[0].findIndex(el => el === code);
    if (lastIndex !== -1) values.forEach(arr => arr.splice(lastIndex, 1));

    values[0].push(code);
    values[1].push(tranformText(item.BOSS));
    values[2].push(tranformText(item.NAME));
    values[3].push(tranformText(item.SHORT_NAME));
    values[4].push(tranformText(item.ADDRESS));
    values[5].push(tranformText(item.KVED));
    values[6].push(tranformText(item.STAN));
    values[7].push(globalThis.filenameDate);
  };

  data.forEach(loopData);

  return queryDB(sql, values);
};

export default {
  addOrganizations
};
