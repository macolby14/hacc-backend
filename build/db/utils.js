"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlToFileName = exports.convertValueStrFormat = exports.convertLabelToDbFormat = void 0;
/* eslint-disable import/prefer-default-export */
function convertLabelToDbFormat(label) {
    return label.replace(new RegExp('\\s', 'g'), '_').toLowerCase();
}
exports.convertLabelToDbFormat = convertLabelToDbFormat;
function convertValueStrFormat(label) {
    return "'" + label + "'";
}
exports.convertValueStrFormat = convertValueStrFormat;
function urlToFileName(url) {
    // regex to just match last part of filename
    var re = /\/\/.+\/(.+)?\.pdf/;
    var match = url.match(re);
    if (match === null || match.length < 1) {
        throw new Error('filename invalid');
    }
    var fileName = match[1];
    return fileName;
}
exports.urlToFileName = urlToFileName;
//# sourceMappingURL=utils.js.map