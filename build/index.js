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
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'reflect-metadata';
import passport from 'passport';
// import passportLocal from 'passport-local';
// import session from 'express-session';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import './config/env-setup';
import authRoutes from './routes/authRoutes';
import './config/passport-setup';
import keys from './config/keys';
// import UserAccount from './entity/UserAccount';
import updateTableAfterTask from './db/updateTableAfterTask';
import createTableFromXml, { readXMLFile } from './db/createTableFromXml';
import { addPointsToUserScore, getUsersByScore } from './db/user';
// const LocalStrategy = passportLocal.Strategy;
// TODO - Pull Tasks dynamically from SharePoint or S3 by reading all the file names in a folder.
// Read the xml that is that folder.
// const userRepository = connection.getRepository(UserAccount);
const exampleTasks = [];
let currTaskInd = -1;
function createExampleTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        const fieldInfo = yield JSON.stringify(yield readXMLFile('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 's3'));
        for (let i = 1; i <= 15; i += 1) {
            const paddedNum = `${i}`.padStart(5, '0');
            exampleTasks.push({
                pdfUrl: `https://hacc-2020.s3-us-west-2.amazonaws.com/ChineseArrivals_1847-1870_${paddedNum}.pdf`,
                fieldInfo,
                tableName: 'chinese_arrivals',
            });
        }
    });
}
const app = express();
app.use(cors({
    origin: `${process.env.CLIENT}:${process.env.CLIENT_PORT}`,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: [keys.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100,
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json()); // support json encoded bodies
app.use('/auth', authRoutes);
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
app.get('/createExampleTasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Calling at server startup now
    // createExampleTasks();
    res.send(exampleTasks);
}));
app.get('/createExampleTable', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createTableFromXml('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 'chinese_arrivals');
    }
    catch (err) {
        next(err);
    }
    res.send('Table Created');
}));
app.get('/task', authCheck, (req, res) => {
    currTaskInd += 1;
    res.send(exampleTasks[currTaskInd]);
});
app.post('/task', authCheck, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = request.body;
    try {
        yield updateTableAfterTask(payload);
        if (request.user === undefined) {
            throw new Error('User undefined after auth check');
        }
        console.log('User');
        console.log(request.user);
        yield addPointsToUserScore(request.user, 100);
        response.status(200).send('success');
    }
    catch (err) {
        console.log('error in complete task', err);
        response.status(400).send('error');
    }
}));
app.get('/users', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield getUsersByScore();
        response.status(200).json(users);
    }
    catch (err) {
        response.status(400).send('Something went wrong in /users route');
    }
}));
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at ${process.env.HOST}:${PORT}`);
});
//# sourceMappingURL=index.js.map