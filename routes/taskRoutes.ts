import express, { NextFunction } from 'express';
import UserAccount from '../entity/UserAccount';
import updateTableAfterTask, { PayloadType } from '../db/updateTableAfterTask';
import createTableFromXml, { readXMLFile } from '../db/createTableFromXml';
import { addPointsToUserScore } from '../db/user';
import { TaskType } from '../shared/shared-types';
import { authCheck } from '../middleware';

const router = express.Router();

// TODO - Pull Tasks dynamically from SharePoint or S3 by reading all the file names in a folder.
// Read the xml that is that folder.
const exampleTasks: TaskType[] = [];
let currTaskInd = -1;

export async function createExampleTasks() {
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

// TODO Call on startup to create a task based on xml. Will do this with admin portal in future
router.get('/createExampleTable', async (req, res, next: NextFunction) => {
  try {
    await createTableFromXml('https://hacc-2020.s3-us-west-2.amazonaws.com/chineseArrivals_1847-1870-rtp.xml', 'chinese_arrivals');
  } catch (err) {
    next(err);
  }
  res.send('Table Created');
});

router.get('/task', authCheck, (req, res) => {
  currTaskInd += 1;
  res.send(exampleTasks[currTaskInd]);
});

router.post('/task', authCheck, async (request, response) => {
  const payload = request.body as PayloadType;

  try {
    await updateTableAfterTask(payload);
    if (request.user === undefined) { throw new Error('User undefined after auth check'); }
    await addPointsToUserScore((request.user as UserAccount), 100);
    response.status(200).send('success');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('error in complete task', err);
    response.status(400).send('error');
  }
});

export default router;
