"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
/* eslint-disable no-console */
var express_1 = __importDefault(require("express"));
// import path from 'path';
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
require("reflect-metadata");
var passport_1 = __importDefault(require("passport"));
require("./config/env-setup");
require("./config/passport-setup");
var cookie_session_1 = __importDefault(require("cookie-session"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var authRoutes_1 = __importDefault(require("./routes/authRoutes"));
var keys_1 = __importDefault(require("./config/keys"));
var updateTableAfterTask_1 = __importDefault(require("./db/updateTableAfterTask"));
var createTableFromXml_1 = __importStar(require("./db/createTableFromXml"));
var user_1 = require("./db/user");
// TODO - Pull Tasks dynamically from SharePoint or S3 by reading all the file names in a folder.
// Read the xml that is that folder.
var exampleTasks = [];
var currTaskInd = -1;
function createExampleTasks() {
    return __awaiter(this, void 0, void 0, function () {
        var fieldInfo, _a, _b, i, paddedNum;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).stringify;
                    return [4 /*yield*/, createTableFromXml_1.readXMLFile('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 's3')];
                case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                case 2:
                    fieldInfo = _c.sent();
                    for (i = 1; i <= 15; i += 1) {
                        paddedNum = ("" + i).padStart(5, '0');
                        exampleTasks.push({
                            pdfUrl: "https://hacc-2020.s3-us-west-2.amazonaws.com/ChineseArrivals_1847-1870_" + paddedNum + ".pdf",
                            fieldInfo: fieldInfo,
                            tableName: 'chinese_arrivals',
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var app = express_1.default();
app.use(cors_1.default({
    origin: process.env.CLIENT + ":" + process.env.CLIENT_PORT,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(cookie_session_1.default({
    name: 'session',
    keys: [keys_1.default.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100,
}));
app.use(cookie_parser_1.default());
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(body_parser_1.default.json()); // support json encoded bodies
app.use('/auth', authRoutes_1.default);
// TODO: async... probably should await. Just waiting a little while to call for a task instead
createExampleTasks();
var PORT = 8000;
// Serve static files from public -> served under static url
// Commented out for AWS EBS
// app.use('/static', express.static(path.join(__dirname, 'public')));
// // from passport documentation
// passport.use(new LocalStrategy(
//   {
//     usernameField: 'email',
//   },
//   async (email, password, done) => {
//     try {
//       const user = await userRepository.findOne({ email, password });
//       if (!user) {
//         console.log('User not found');
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   },
// ));
var authCheck = function (req, res, next) {
    if (!req.user) {
        res.status(401).json({
            authenticated: false,
            message: 'user has not been authenticated',
        });
    }
    else {
        next();
    }
};
// if it's already login, send the profile response,
// otherwise, send a 401 response that the user is not authenticated
// authCheck before navigating to home page
app.get('/restricted', authCheck, function (req, res) {
    res.status(200).json({
        authenticated: true,
        message: 'user successfully authenticated',
        user: req.user,
        cookies: req.cookies,
    });
});
app.get('/', function (req, res) { return res.send('Test'); });
app.get('/createExampleTasks', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Calling at server startup now
        // createExampleTasks();
        res.send(exampleTasks);
        return [2 /*return*/];
    });
}); });
app.get('/createExampleTable', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, createTableFromXml_1.default('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 'chinese_arrivals')];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                next(err_1);
                return [3 /*break*/, 3];
            case 3:
                res.send('Table Created');
                return [2 /*return*/];
        }
    });
}); });
app.get('/task', authCheck, function (req, res) {
    currTaskInd += 1;
    res.send(exampleTasks[currTaskInd]);
});
app.post('/task', authCheck, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payload = request.body;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, updateTableAfterTask_1.default(payload)];
            case 2:
                _a.sent();
                if (request.user === undefined) {
                    throw new Error('User undefined after auth check');
                }
                console.log('User');
                console.log(request.user);
                return [4 /*yield*/, user_1.addPointsToUserScore(request.user, 100)];
            case 3:
                _a.sent();
                response.status(200).send('success');
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                console.log('error in complete task', err_2);
                response.status(400).send('error');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/users', function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var users, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user_1.getUsersByScore()];
            case 1:
                users = _a.sent();
                response.status(200).json(users);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                response.status(400).send('Something went wrong in /users route');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () {
    console.log("\u26A1\uFE0F[server]: Server is running at " + process.env.HOST + ":" + PORT);
});
//# sourceMappingURL=index.js.map