/* eslint-disable no-console */
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'reflect-metadata';
import passport from 'passport';

import './config/env-setup';
import './config/passport-setup';
import session from 'express-session';
import taskRoutes, { createExampleTasks } from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';
import { getUsersByScore } from './db/user';

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
app.use('/task', taskRoutes);

// TODO replace this with getting tasks from S3. Also need this async
createExampleTasks();

// TODO Remove this, currently easy check if server is up
app.get('/', (req: Request, res: Response) => res.send('Test'));

// EXPLAIN: USers sorted by score for leaderboard
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
  console.log(`Environment is ${process.env.NODE_ENV}`);
});
