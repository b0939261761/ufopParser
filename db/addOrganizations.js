import { queryDB } from './db.js';

export default async organizations => {
  const sql = `
    INSERT INTO "Organizations" (
      code, manager, "fullName",
      name, address, activity, status
    )
    SELECT
        code, manager, "fullName",
        name, address, activity, status
      FROM UNNEST (
        $1::text[], $2::text[], $3::text[],
        $4::text[], $5::text[], $6::text[], $7::text[]
      ) AS t (
        code, manager, "fullName",
        name, address, activity, status
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

  const codes = [];
  const managers = [];
  const fullNames = [];
  const names = [];
  const addresses = [];
  const activities = [];
  const statuses = [];

  organizations.forEach(el => {
    codes.push(el.code || '');
    managers.push(el.manager || '');
    fullNames.push(el.fullName || '');
    names.push(el.name || '');
    addresses.push(el.address || '');
    activities.push(el.activity || '');
    statuses.push(el.status || '');
  });

  const values = [codes, managers, fullNames, names, addresses, activities, statuses];

  await queryDB(sql, values);
};
