import pool from './pool';

export default function createUserTable(): Promise<string> {
  const createTableSql = `CREATE TABLE IF NOT EXISTS public.user_accounts(
        email TEXT primary key,
        password TEXT,
        auth TEXT,
        score INTEGER
        );`;

  return new Promise((resolve, reject) => {
    pool.query(createTableSql, (tableErr, tableRes) => {
      if (tableErr) {
        // console.log('CREATE TABLE ERROR:', tableErr.name, '--', tableErr.message);
        // console.log('createTableSql:', tableErr);
        reject(tableErr.message);
      }

      if (tableRes) {
        // console.log('\nCREATE TABLE RESULT:', tableRes);
        resolve('Table Created');
      }
    });
  });
}
