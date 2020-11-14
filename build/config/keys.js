"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// ADD YOUR OWN KEYS AND RENAME THIS FILE TO keys.js
var GOOGLE_TOKENS = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};
var SESSION = {
    COOKIE_KEY: process.env.COOKIE_KEY,
};
var KEYS = __assign(__assign({}, GOOGLE_TOKENS), SESSION);
exports.default = KEYS;
//# sourceMappingURL=keys.js.map