const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 💥  SHUTTING DOWN....');
  console.log(err.name, err.message);
  process.exit(1);
});

// In the unhandled rejection the crashing of the application by applying process.exit(1) is optional , in uncaught exception we really need to crash our application because after there was uncaught exception the entire node process was in so called unclean state.

// we want to lock the error to the console and then shows up in the logs in our server
// so giving us a way to fix the problem and then we want to gracefully shut down the server

///
///

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL, {
    // this connect method will return a promise so we should go ahead and handle the promise
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(connection.connections);
    console.log('DB connection successful');
  });

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 697,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERROR 💥:', err);
//   });

// console.log(app.get('env'));
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 SHUTTING DOWN....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// by doing server.close we give the server time to finish all the requests that are still pending or are being handled at the time and only after that the server is killed!
// in process exit in the parameters of the exit function (0) means success and (1) means failure

// console.log(x);
