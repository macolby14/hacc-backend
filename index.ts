/* eslint-disable no-console */
import express, { Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import path from 'path';
import cors from 'cors';

import { createTable } from './utils';

const app = express();
app.use(cors());

const PORT = 8000;

// Serve static files from public -> served under static url
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req: Request, res: Response) => res.send('Test'));

app.get('/create', async (req, res, next: NextFunction) => {
  try {
    await createTable('./public/chineseArrivals_1847-1870-rtp.xml', 'chineseArrivals_1847-1870-rtp');
  } catch (err) {
    next(err);
  }
  res.send('Table Created');
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

/*
app.get('/courses/:date', async
(req: Request, res: Response, next: NextFunction) => res.send('get'));

app.get('/courses', async (req: Request, res: Response) => {
  const coursees = await courseRepository.find();
  res.json(coursees);
});

app.post('/courses', async (req: Request, res: Response) => {
  const course = await courseRepository.create(req.body);
  const results = await courseRepository.save(course);
  return res.send(results);
});

app.put('/courses/:date', async (req: Request, res: Response) => {
  const courses = await courseRepository.find({ where: { date: req.params.date } });
  if (courses.length > 1) { return res.json({ error: 'More than 1 course found with same date' }); }
  if (courses.length === 0) { return res.json
    ({ error: 'No courses found with this date for put request' }); }
  const course = courses[0];
  courseRepository.merge(course, req.body);
  const results = await courseRepository.save(course);
  return res.send(results);
});

app.delete('/courses/:date', async (req: Request, res: Response) => {
  const results = await courseRepository.delete({ date: req.params.date });
  return res.send(results);
});
*/
