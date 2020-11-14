import pool from './pool';

import { DataFieldType } from '../shared/shared-types';
import { convertLabelToDbFormat, convertValueStrFormat, urlToFileName } from './utils';

export type PayloadType = {
    tableName: 'string';
    url: 'string';
    formData: DataFieldType[];
}

export default function updateTableAfterTask(
  { tableName, url, formData }: PayloadType,
): Promise<any> {
  const data = formData;

  const fileName = urlToFileName(url);

  const fields = `${data.reduce((previous, curr) => (previous === '' ? convertLabelToDbFormat(curr.label)
    : `${convertLabelToDbFormat(curr.label)},${previous}`), 'file_name')}`;
  const values = `${data.reduce((previous, curr) => (previous === '' ? convertValueStrFormat(curr.value)
    : `${convertValueStrFormat(curr.value)},${previous}`), `${convertValueStrFormat(fileName)}`)}`;

  const insertTableSql = `INSERT INTO public.${tableName}(${fields}) VALUES(${values});`;

  //   console.log('insertTableSql generated');
  //   console.log(insertTableSql);

  return new Promise((resolve, reject) => {
    pool.query(insertTableSql, (tableErr, tableRes) => {
      if (tableErr) {
        // console.log('INSERT TABLE ERROR:', tableErr.name, '--', tableErr.message);
        // console.log('inserTableSql:', insertTableSql);
        reject(tableErr.message);
      }

      if (tableRes) {
        // console.log('\nCREATE TABLE RESULT:', tableRes);
        resolve(tableRes);
      }
    });
  });
//   return new Promise((res, rej) => res(null));
}
