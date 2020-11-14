"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pool_1 = __importDefault(require("./pool"));
var utils_1 = require("./utils");
function updateTableAfterTask(_a) {
    var tableName = _a.tableName, url = _a.url, formData = _a.formData;
    var data = formData;
    var fileName = utils_1.urlToFileName(url);
    var fields = "" + data.reduce(function (previous, curr) { return (previous === '' ? utils_1.convertLabelToDbFormat(curr.label)
        : utils_1.convertLabelToDbFormat(curr.label) + "," + previous); }, 'file_name');
    var values = "" + data.reduce(function (previous, curr) { return (previous === '' ? utils_1.convertValueStrFormat(curr.value)
        : utils_1.convertValueStrFormat(curr.value) + "," + previous); }, "" + utils_1.convertValueStrFormat(fileName));
    var insertTableSql = "INSERT INTO public." + tableName + "(" + fields + ") VALUES(" + values + ");";
    //   console.log('insertTableSql generated');
    //   console.log(insertTableSql);
    return new Promise(function (resolve, reject) {
        pool_1.default.query(insertTableSql, function (tableErr, tableRes) {
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