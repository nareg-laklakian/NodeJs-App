const express = require('express');
const app = express();

app.use(logger);

app.get('/', (req, res) => {
  console.log('Home page');
  res.send('Home page welcome');
});

app.get('/users', (req, res) => {
  //   console.log(`User is admin = ${req.admin}`);
  console.log('1Users page');
  res.send('0users page');
});

function logger(req, res, next) {
  console.log('before');
  next();
  console.log('after');
}

function auth(req, res, next) {
  if (req.query.admin === 'true') {
    req.admin = true;
    next();
    return;
  }
  res.send('No auth');
}

const port = 5000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  FileSystem.writefile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      require.status(201).json({ id: newId, data: { tours: newTour } });
    }
  );
});
