import { queryDB } from './db.js';
import tranformText from '../utils/tranformText.js';

export const addPersons = data => {
  const sql = `
    INSERT INTO "Persons" (
      "fullName", address, activity, status, "downloadedFile"
    )
    SELECT
      "fullName", address, activity, status, "downloadedFile"
      FROM UNNEST (
        $1::text[], $2::text[], $3::text[], $4::text[], $5::date[]
      ) AS t (
        "fullName", address, activity, status, "downloadedFile"
      )
    ON CONFLICT ("fullName", address) DO UPDATE SET
      activity = EXCLUDED.activity,
      status = EXCLUDED.status,
      "updatedAt" = CURRENT_TIMESTAMP
  `;

  const values = [[], [], [], [], []];

  const loopData = item => {
    const fullName = tranformText(item.FIO).toUpperCase();
    const address = tranformText(item.ADDRESS);

    const lastIndex = values[0].findIndex(
      (el, idx) => el === fullName && values[1][idx] === address
    );
    if (lastIndex !== -1) values.forEach(arr => arr.splice(lastIndex, 1));

    values[0].push(fullName);
    values[1].push(address);
    values[2].push(tranformText(item.KVED));
    values[3].push(tranformText(item.STAN));
    values[4].push(globalThis.filenameDate);
  };

  data.forEach(loopData);

  return queryDB(sql, values);
};

export default {
  addPersons
};
