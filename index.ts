/* eslint-disable no-console */
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

import { TaskType } from './shared/shared-types';
import createTableFromXml, { readXMLFile } from './db/createTableFromXml';

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
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // support json encoded bodies

// TODO: async... probably should await. Just waiting a little while to call for a task instead
createExampleTasks();

const PORT = 8000;

// Serve static files from public -> served under static url
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req: Request, res: Response) => res.send('Test'));

app.get('/createExampleTasks', async (req: Request, res: Response) => {
  // Calling at server startup now
  // createExampleTasks();
  res.send(exampleTasks);
});

app.get('/createChineseArrivalTable', async (req, res, next: NextFunction) => {
  try {
    await createTableFromXml('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 'chinese_arrivals');
  } catch (err) {
    next(err);
  }
  res.send('Table Created');
});

app.get('/getTask', (req, res) => {
  currTaskInd += 1;
  res.send(exampleTasks[currTaskInd]);
});

app.post('/completeTask', (req, res) => {
  const payload = req.body;
  console.log('Server received payload for compelted task');
  console.log(payload);
  res.send('Server received your task');
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
