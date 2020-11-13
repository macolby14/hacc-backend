/* eslint-disable no-console */
import express, { Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import path from 'path';
import cors from 'cors';

import createTableFromXml from './db/createTableFromXml';

const app = express();
app.use(cors());

const PORT = 8000;

// Serve static files from public -> served under static url
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req: Request, res: Response) => res.send('Test'));

app.get('/createChineseArrivalTable', async (req, res, next: NextFunction) => {
  try {
    await createTableFromXml('./public/chineseArrivals_1847-1870-rtp.xml', 'chineseArrivals_1847-1870-rtp');
  } catch (err) {
    next(err);
  }
  res.send('Table Created');
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
