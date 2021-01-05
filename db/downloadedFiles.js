import { queryDB } from './db.js';

export const checkDownloadedFiles = async date => {
  const sql = 'SELECT EXISTS(SELECT 1 FROM "DownloadedFiles" WHERE date = $1)';
  const { rows } = await queryDB(sql, [date]);
  return rows[0].exists;
};

export const addDownloadedFiles = date => {
  const sql = `
    INSERT INTO "DownloadedFiles" (date) VALUES ($1)
      ON CONFLICT (date) DO UPDATE SET "updatedAt" = CURRENT_TIMESTAMP
  `;
  return queryDB(sql, [date]);
};

export default {
  checkDownloadedFiles,
  addDownloadedFiles
};
