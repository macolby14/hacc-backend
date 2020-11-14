/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import parser from 'xml2json';
import fetch from 'node-fetch';

import pool from './pool';
import { convertLabelToDbFormat } from './utils';

type Column = {
  label: string;
  index: string;
  type: 'string' | 'date' | 'number';
  validations: any;
}

type readOptions = 'fs' | 's3';

export async function readXMLFile(url: string, type: readOptions): Promise<Column[]> {
  return new Promise((resolve, reject) => {
    if (type === 'fs') {
      fs.readFile(url, 'utf8', (err, xml) => {
        if (err) {
          reject(err); // Pass errors to Express.
        } else {
          const json = parser.toJson(xml, { object: true }) as any;
          const columns = json.indexFile.columns.column as Column[];
          resolve(columns);
        }
      });
    } else {
      fetch(url).then((res) => {
        res.text().then((xml) => {
          const json = parser.toJson(xml, { object: true }) as any;
          const columns = json.indexFile.columns.column as Column[];
          resolve(columns);
        });
      });
    }
  });
}

function convertTypes(xmlType: string): string {
  switch (xmlType) {
    case 'string': return 'TEXT';
    case 'date': return 'DATE';
    case 'number': return 'INTEGER';
    default: throw new Error('xml type not found');
  }
}

export async function schemaStringFromXML(url: string, tableName: string) {
  const columns = await readXMLFile(url, 's3');
  const fields = columns.map((column) => ({
    label: convertLabelToDbFormat(column.label),
    type: convertTypes(column.type),
  }));

  const dynamicTableSql = fields.reduce((prev, curr) => {
    let newStr = prev;
    const newAddition = `${curr.label} ${curr.type}`;
    if (prev !== '') {
      newStr = `${newAddition},${prev}`;
    } else {
      newStr = newAddition;
    }
    return newStr;
  }, '');

  const newTableName = tableName.replace(new RegExp('-', 'g'), '_');

  const commonFields = 'file_name TEXT primary key,';

  const createTableSql = `CREATE TABLE IF NOT EXISTS public.${newTableName}(
    ${commonFields}
    ${dynamicTableSql}
    );`;

  return createTableSql;
}

async function createTableFromXml(xmlUrl: string, tableName: string) {
  const createTableSql = await schemaStringFromXML(xmlUrl, tableName);

  console.log('\ncreateTableSql:', createTableSql);

  pool.query(createTableSql, (tableErr, tableRes) => {
    if (tableErr) {
      console.log('CREATE TABLE ERROR:', tableErr.name, '--', tableErr.message);
      console.log('createTableSql:', tableErr);
      throw new Error(tableErr.message);
    }

    if (tableRes) {
      console.log('\nCREATE TABLE RESULT:', tableRes);
    }
  });
}

export default createTableFromXml;
