const { error } = require('console');
const express = require('express');
const { request } = require('http');
const morgan = require('morgan');

const AppErrors = require('./utils/appErrors');
const globalErrorHandler = require('./controllers/errorController');

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

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋🏼');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(x); // we put this here to experiment with uncaught exception error handler in server.js
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

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // error.statusCode = 404;

  next(new AppErrors(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

/// making different files for each resource
