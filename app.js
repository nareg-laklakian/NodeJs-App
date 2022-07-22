const express = require('express');
const { request } = require('http');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//  1) MIDDLE WARES
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(`dev`));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// so after using the app.use all we have to do is pass the function into it that we would want to use as a middleware stack

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
//   //   console.log(req.message);
// });

// 2) Route Handlers

// app.get('/api/v1/tours', getAllTours);
// app.get(`/api/v1/tours/:id`, getTour);
// app.post('/api/v1/tours', createTour);
// app.patch(`/api/v1/tours/:id`, updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3) Route

// const tourRouter = express.Router();
// const userRouter = express.Router();

// tourRouter.route('/').get(getAllTours).post(createTour);

// tourRouter.route(`/:id`).get(getTour).patch(updateTour).delete(deleteTour);

// userRouter.route('/').get(getAllUsers).post (createUser);

// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;

/// making different files for each resource

// 65 chaining multiple middleware functions

// watch 80 last 1 minute again and then do  81
