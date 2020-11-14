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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
require("reflect-metadata");
const passport_1 = __importDefault(require("passport"));
// import passportLocal from 'passport-local';
// import session from 'express-session';
const cookie_session_1 = __importDefault(require("cookie-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("./config/env-setup");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
require("./config/passport-setup");
const keys_1 = __importDefault(require("./config/keys"));
// import UserAccount from './entity/UserAccount';
const updateTableAfterTask_1 = __importDefault(require("./db/updateTableAfterTask"));
const createTableFromXml_1 = __importStar(require("./db/createTableFromXml"));
const user_1 = require("./db/user");
// const LocalStrategy = passportLocal.Strategy;
// TODO - Pull Tasks dynamically from SharePoint or S3 by reading all the file names in a folder.
// Read the xml that is that folder.
// const userRepository = connection.getRepository(UserAccount);
const exampleTasks = [];
let currTaskInd = -1;
async function createExampleTasks() {
    const fieldInfo = await JSON.stringify(await createTableFromXml_1.readXMLFile('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 's3'));
    for (let i = 1; i <= 15; i += 1) {
        const paddedNum = `${i}`.padStart(5, '0');
        exampleTasks.push({
            pdfUrl: `https://hacc-2020.s3-us-west-2.amazonaws.com/ChineseArrivals_1847-1870_${paddedNum}.pdf`,
            fieldInfo,
            tableName: 'chinese_arrivals',
        });
    }
}
const app = express_1.default();
app.use(cors_1.default({
    origin: `${process.env.CLIENT}:${process.env.CLIENT_PORT}`,
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
const PORT = 8000;
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
const authCheck = (req, res, next) => {
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
app.get('/restricted', authCheck, (req, res) => {
    res.status(200).json({
        authenticated: true,
        message: 'user successfully authenticated',
        user: req.user,
        cookies: req.cookies,
    });
});
app.get('/', (req, res) => res.send('Test'));
app.get('/createExampleTasks', async (req, res) => {
    // Calling at server startup now
    // createExampleTasks();
    res.send(exampleTasks);
});
app.get('/createExampleTable', async (req, res, next) => {
    try {
        await createTableFromXml_1.default('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 'chinese_arrivals');
    }
    catch (err) {
        next(err);
    }
    res.send('Table Created');
});
app.get('/task', authCheck, (req, res) => {
    currTaskInd += 1;
    res.send(exampleTasks[currTaskInd]);
});
app.post('/task', authCheck, async (request, response) => {
    const payload = request.body;
    try {
        await updateTableAfterTask_1.default(payload);
        if (request.user === undefined) {
            throw new Error('User undefined after auth check');
        }
        console.log('User');
        console.log(request.user);
        await user_1.addPointsToUserScore(request.user, 100);
        response.status(200).send('success');
    }
    catch (err) {
        console.log('error in complete task', err);
        response.status(400).send('error');
    }
});
app.get('/users', async (request, response) => {
    try {
        const users = await user_1.getUsersByScore();
        response.status(200).json(users);
    }
    catch (err) {
        response.status(400).send('Something went wrong in /users route');
    }
});
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at ${process.env.HOST}:${PORT}`);
});
//# sourceMappingURL=index.js.map