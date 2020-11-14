const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
require('reflect-metadata');
const typeorm_1 = require('typeorm');
const path_1 = __importDefault(require('path'));
const cors_1 = __importDefault(require('cors'));
const Course_1 = __importDefault(require('./entity/Course'));

typeorm_1.createConnection().then((connection) => {
  const courseRepository = connection.getRepository(Course_1.default);
  const app = express_1.default();
  app.use(cors_1.default());
  const PORT = 8000;
  // Serve static files from public -> served under static url
  app.use('/static', express_1.default.static(path_1.default.join(__dirname, 'public')));
  app.get('/courses', async (req, res) => {
    const coursees = await courseRepository.find();
    res.json(coursees);
  });
  app.get('/courses/:date', async (req, res) => {
    const results = await courseRepository.find({ where: { date: req.params.date } });
    if (results.length > 1) {
      return res.json({ error: 'More than 1 course found with same date' });
    }
    return res.send(results);
  });
  app.post('/courses', async (req, res) => {
    const course = await courseRepository.create(req.body);
    const results = await courseRepository.save(course);
    return res.send(results);
  });
  app.put('/courses/:date', async (req, res) => {
    const courses = await courseRepository.find({ where: { date: req.params.date } });
    if (courses.length > 1) {
      return res.json({ error: 'More than 1 course found with same date' });
    }
    if (courses.length === 0) {
      return res.json({ error: 'No courses found with this date for put request' });
    }
    const course = courses[0];
    courseRepository.merge(course, req.body);
    const results = await courseRepository.save(course);
    return res.send(results);
  });
  app.delete('/courses/:date', async (req, res) => {
    const results = await courseRepository.delete({ date: req.params.date });
    return res.send(results);
  });
  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at ${process.env.HOST}:${PORT}`);
  });
});
// # sourceMappingURL=index.js.map
