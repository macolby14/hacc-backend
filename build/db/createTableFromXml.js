"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaStringFromXML = exports.readXMLFile = void 0;
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
const fs_1 = __importDefault(require("fs"));
const xml2json_1 = __importDefault(require("xml2json"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const pool_1 = __importDefault(require("./pool"));
const utils_1 = require("./utils");
async function readXMLFile(url, type) {
    return new Promise((resolve, reject) => {
        if (type === 'fs') {
            fs_1.default.readFile(url, 'utf8', (err, xml) => {
                if (err) {
                    reject(err); // Pass errors to Express.
                }
                else {
                    const json = xml2json_1.default.toJson(xml, { object: true });
                    const columns = json.indexFile.columns.column;
                    resolve(columns);
                }
            });
        }
        else {
            node_fetch_1.default(url).then((res) => {
                res.text().then((xml) => {
                    const json = xml2json_1.default.toJson(xml, { object: true });
                    const columns = json.indexFile.columns.column;
                    resolve(columns);
                });
            });
        }
    });
}
exports.readXMLFile = readXMLFile;
function convertTypes(xmlType) {
    switch (xmlType) {
        case 'string': return 'TEXT';
        case 'date': return 'TEXT';
        case 'number': return 'INTEGER';
        default: throw new Error('xml type not found');
    }
}
async function schemaStringFromXML(url, tableName) {
    const columns = await readXMLFile(url, 's3');
    const fields = columns.map((column) => ({
        label: utils_1.convertLabelToDbFormat(column.label),
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
}
exports.schemaStringFromXML = schemaStringFromXML;
async function createTableFromXml(xmlUrl, tableName) {
    const createTableSql = await schemaStringFromXML(xmlUrl, tableName);
    console.log('\ncreateTableSql:', createTableSql);
    pool_1.default.query(createTableSql, (tableErr, tableRes) => {
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
exports.default = createTableFromXml;
//# sourceMappingURL=createTableFromXml.js.map