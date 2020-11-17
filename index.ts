/* eslint-disable no-console */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'reflect-metadata';
import passport from 'passport';

import './config/env-setup';
import './config/passport-setup';
import session from 'express-session';
import UserAccount from './entity/UserAccount';
import authRoutes from './routes/authRoutes';
import updateTableAfterTask, { PayloadType } from './db/updateTableAfterTask';
import { TaskType } from './shared/shared-types';
import createTableFromXml, { readXMLFile } from './db/createTableFromXml';
import { addPointsToUserScore, getUsersByScore } from './db/user';

// TODO - Pull Tasks dynamically from SharePoint or S3 by reading all the file names in a folder.
// Read the xml that is that folder.

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
  origin: `${process.env.CLIENT}`, // allow to server to accept request from different origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // allow session cookie from browser to pass through
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  cookie:
  {
    // EXPLAIN: Did not buy a domain name,
    // so must allow cross-site cookies for Vercel frontend/AWS backedn
    sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 60000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json()); // support json encoded bodies
app.use('/auth', authRoutes);

// TODO replace this with getting tasks from S3. Also need this async
createExampleTasks();

// EXPLAIN: Middleware for authorization on routes
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

app.get('/', (req: Request, res: Response) => res.send('Test'));

// TODO Call on startup to create a task based on xml. Will do this with admin portal in future
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

app.listen(process.env.HOST_PORT, () => {
  console.log(`⚡️[server]: Server is running at ${process.env.HOST}`);
  console.log(`Google Auth Host/Port ${process.env.HOST}`);
  console.log(`Environment is ${process.env.NODE_ENV}`);
});
