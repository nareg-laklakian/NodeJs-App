const AppErrors = require('./../utils/appErrors');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppErrors(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // console.log(err.keyValue.name);
  // const value = err.errmsg.match(/(["'])(||?.)*?|1/);
  // console.log(value);
  const message = `Duplicate Fields Value: ${err.keyValue.name}. Please Use another value`;
  console.log(message);
  return new AppErrors(message, 400);
};

// In order to create one big string out of all the strings from the errors we have to loop over all the these objects and then extract all the error messages into a new array.

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(`. `)}`;
  return new AppErrors(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational , trusted error: send message to client
  if (err.isOperational) {
    // console.log('sendErrorProd  1');
    // console.log(err.name, '2');
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: 'we don't want to leak the error details to the client'
  } else {
    // 1) Log error
    // console.log('else statement  3');
    // console.log((err.isOperational = false));
    console.error('Error💥', err);
    // 2) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong here!!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // console.log('module.export   4');
    // console.log(error.name, '5');
    // console.log({ ...error }, '6');
    sendErrorProd(error, res);
  }
};

//  sendErrorProd is not working properly and it defaults to the else if error instead of the if isOperational error.
/// not working the last thing in 118 fix the error message not showing

// not reading castError and going into sendErrorProd instead of the last module.export

// (["'])(||?.)*?|1
