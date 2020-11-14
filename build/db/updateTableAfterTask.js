"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("./pool"));
const utils_1 = require("./utils");
function updateTableAfterTask({ tableName, url, formData }) {
    const data = formData;
    const fileName = utils_1.urlToFileName(url);
    const fields = `${data.reduce((previous, curr) => (previous === '' ? utils_1.convertLabelToDbFormat(curr.label)
        : `${utils_1.convertLabelToDbFormat(curr.label)},${previous}`), 'file_name')}`;
    const values = `${data.reduce((previous, curr) => (previous === '' ? utils_1.convertValueStrFormat(curr.value)
        : `${utils_1.convertValueStrFormat(curr.value)},${previous}`), `${utils_1.convertValueStrFormat(fileName)}`)}`;
    const insertTableSql = `INSERT INTO public.${tableName}(${fields}) VALUES(${values});`;
    //   console.log('insertTableSql generated');
    //   console.log(insertTableSql);
    return new Promise((resolve, reject) => {
        pool_1.default.query(insertTableSql, (tableErr, tableRes) => {
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
exports.default = updateTableAfterTask;
//# sourceMappingURL=updateTableAfterTask.js.map