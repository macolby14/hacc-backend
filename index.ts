/* eslint-disable no-console */
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'reflect-metadata';
import passport from 'passport';
// import passportLocal from 'passport-local';
// import session from 'express-session';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';

import './config/env-setup';
import UserAccount from './entity/UserAccount';
import authRoutes from './routes/authRoutes';
import './config/passport-setup';
import keys from './config/keys';
// import UserAccount from './entity/UserAccount';
import updateTableAfterTask, { PayloadType } from './db/updateTableAfterTask';
import { TaskType } from './shared/shared-types';
import createTableFromXml, { readXMLFile } from './db/createTableFromXml';
import { addPointsToUserScore, getUsersByScore } from './db/user';

// const LocalStrategy = passportLocal.Strategy;

// TODO - Pull Tasks dynamically from SharePoint or S3 by reading all the file names in a folder.
// Read the xml that is that folder.

// const userRepository = connection.getRepository(UserAccount);

const exampleTasks: TaskType[] = [];
let currTaskInd = -1;

async function createExampleTasks() {
  const fieldInfo = await JSON.stringify(await readXMLFile('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 's3'));
  for (let i = 1; i <= 15; i += 1) {
    const paddedNum = `${i}`.padStart(5, '0');
    exampleTasks.push(
      {
        pdfUrl: `https://hacc-2020.s3-us-west-2.amazonaws.com/ChineseArrivals_1847-1870_${paddedNum}.pdf`,
        fieldInfo,
        tableName: 'chinese_arrivals',
      },
    );
  }
}

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // allow to server to accept request from different origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // allow session cookie from browser to pass through
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: [keys.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100,
  }),
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json()); // support json encoded bodies
app.use('/auth', authRoutes);

// TODO: async... probably should await. Just waiting a little while to call for a task instead
createExampleTasks();

const PORT = 8000;

// Serve static files from public -> served under static url
app.use('/static', express.static(path.join(__dirname, 'public')));

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

const authCheck = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: 'user has not been authenticated',
    });
  } else {
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

app.get('/', (req: Request, res: Response) => res.send('Test'));

app.get('/createExampleTasks', async (req: Request, res: Response) => {
  // Calling at server startup now
  // createExampleTasks();
  res.send(exampleTasks);
});

app.get('/createExampleTable', async (req, res, next: NextFunction) => {
  try {
    await createTableFromXml('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 'chinese_arrivals');
  } catch (err) {
    next(err);
  }
  res.send('Table Created');
});

app.get('/task', authCheck, (req, res) => {
  currTaskInd += 1;
  res.send(exampleTasks[currTaskInd]);
});

app.post('/task', authCheck, async (request, response) => {
  const payload = request.body as PayloadType;

  try {
    await updateTableAfterTask(payload);
    if (request.user === undefined) { throw new Error('User undefined after auth check'); }
    console.log('User');
    console.log(request.user);
    await addPointsToUserScore((request.user as UserAccount), 100);
    response.status(200).send('success');
  } catch (err) {
    console.log('error in complete task', err);
    response.status(400).send('error');
  }
});

app.get('/users', async (request, response) => {
  try {
    const users = await getUsersByScore();
    response.status(200).json(users);
  } catch (err) {
    response.status(400).send('Something went wrong in /users route');
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
