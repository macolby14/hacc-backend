var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import parser from 'xml2json';
import fetch from 'node-fetch';
import pool from './pool';
import { convertLabelToDbFormat } from './utils';
export function readXMLFile(url, type) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (type === 'fs') {
                fs.readFile(url, 'utf8', (err, xml) => {
                    if (err) {
                        reject(err); // Pass errors to Express.
                    }
                    else {
                        const json = parser.toJson(xml, { object: true });
                        const columns = json.indexFile.columns.column;
                        resolve(columns);
                    }
                });
            }
            else {
                fetch(url).then((res) => {
                    res.text().then((xml) => {
                        const json = parser.toJson(xml, { object: true });
                        const columns = json.indexFile.columns.column;
                        resolve(columns);
                    });
                });
            }
        });
    });
}
function convertTypes(xmlType) {
    switch (xmlType) {
        case 'string': return 'TEXT';
        case 'date': return 'TEXT';
        case 'number': return 'INTEGER';
        default: throw new Error('xml type not found');
    }
}
export function schemaStringFromXML(url, tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const columns = yield readXMLFile(url, 's3');
        const fields = columns.map((column) => ({
            label: convertLabelToDbFormat(column.label),
            type: convertTypes(column.type),
        }));
        const dynamicTableSql = fields.reduce((prev, curr) => {
            let newStr = prev;
            const newAddition = `${curr.label} ${curr.type}`;
            if (prev !== '') {
                newStr = `${newAddition},${prev}`;
            }
            else {
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
    });
}
function createTableFromXml(xmlUrl, tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const createTableSql = yield schemaStringFromXML(xmlUrl, tableName);
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
    });
}
export default createTableFromXml;
//# sourceMappingURL=createTableFromXml.js.map