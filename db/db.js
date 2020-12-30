import pg from 'pg';

let client;

export const connectDB = () => {
  client = new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  return client.connect();
};

export const disconnectDB = () => client.end();

export const queryDB = async (sql, values) => client.query(sql, values);
// try {
//   const result = ;
//   return result;
// // } catch (err) {
//   console.(err);
//   throw err;
// console.log(organizations);

// fs.writeFileSync('error-db.txt', err.toString());
// fs.writeFileSync('error-db.json', JSON.stringify(organizations));
// process.exit();
//   }
// };

export default {
  queryDB,
  connectDB,
  disconnectDB
};
