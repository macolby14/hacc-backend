"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaStringFromXML = exports.readXMLFile = void 0;
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
var fs_1 = __importDefault(require("fs"));
var xml2json_1 = __importDefault(require("xml2json"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var pool_1 = __importDefault(require("./pool"));
var utils_1 = require("./utils");
function readXMLFile(url, type) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    if (type === 'fs') {
                        fs_1.default.readFile(url, 'utf8', function (err, xml) {
                            if (err) {
                                reject(err); // Pass errors to Express.
                            }
                            else {
                                var json = xml2json_1.default.toJson(xml, { object: true });
                                var columns = json.indexFile.columns.column;
                                resolve(columns);
                            }
                        });
                    }
                    else {
                        node_fetch_1.default(url).then(function (res) {
                            res.text().then(function (xml) {
                                var json = xml2json_1.default.toJson(xml, { object: true });
                                var columns = json.indexFile.columns.column;
                                resolve(columns);
                            });
                        });
                    }
                })];
        });
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
function schemaStringFromXML(url, tableName) {
    return __awaiter(this, void 0, void 0, function () {
        var columns, fields, dynamicTableSql, newTableName, commonFields, createTableSql;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readXMLFile(url, 's3')];
                case 1:
                    columns = _a.sent();
                    fields = columns.map(function (column) { return ({
                        label: utils_1.convertLabelToDbFormat(column.label),
                        type: convertTypes(column.type),
                    }); });
                    dynamicTableSql = fields.reduce(function (prev, curr) {
                        var newStr = prev;
                        var newAddition = curr.label + " " + curr.type;
                        if (prev !== '') {
                            newStr = newAddition + "," + prev;
                        }
                        else {
                            newStr = newAddition;
                        }
                        return newStr;
                    }, '');
                    newTableName = tableName.replace(new RegExp('-', 'g'), '_');
                    commonFields = 'file_name TEXT primary key,';
                    createTableSql = "CREATE TABLE IF NOT EXISTS public." + newTableName + "(\n    " + commonFields + "\n    " + dynamicTableSql + "\n    );";
                    return [2 /*return*/, createTableSql];
            }
        });
    });
}
exports.schemaStringFromXML = schemaStringFromXML;
function createTableFromXml(xmlUrl, tableName) {
    return __awaiter(this, void 0, void 0, function () {
        var createTableSql;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, schemaStringFromXML(xmlUrl, tableName)];
                case 1:
                    createTableSql = _a.sent();
                    console.log('\ncreateTableSql:', createTableSql);
                    pool_1.default.query(createTableSql, function (tableErr, tableRes) {
                        if (tableErr) {
                            console.log('CREATE TABLE ERROR:', tableErr.name, '--', tableErr.message);
                            console.log('createTableSql:', tableErr);
                            throw new Error(tableErr.message);
                        }
                        if (tableRes) {
                            console.log('\nCREATE TABLE RESULT:', tableRes);
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = createTableFromXml;
//# sourceMappingURL=createTableFromXml.js.map