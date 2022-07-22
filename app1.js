const fs = require('fs');
const express = require('express');
const { request } = require('http');

const app = express();
// in order to use middleware we use app.use so the used method is the one we use in order to use middleware (add middleware to our middleware stack)
// the express.json which calls the json method basically returns a function and that function is then added to the middleware stack.
// we did this to get access to the request body on the request object.

// this line below is what we call a middleware is basically a function that can modify an incoming request data it is called middle between request and the response
app.use(express.json());

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
//   //   console.log(req.message);
// });

// remember that routing is basically to determine how an application responds to a certain client request (to a certain url and [not only a url but also the http method which is used for that request])

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint....');
// });

///
// app.post('/', (req, res) => {
//   res
//     .status(404)
//     .json({ message: 'You can post to this endpoint....', app: 'laklak' });
// });
//
// status needs to be written before the json message ie the json method in which we can pass an object or string

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};

// we are doing JSON.parse so that the json would be automatically converted into an array of JS objects.

const getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  // since in the console all the id's are being printed out as a string and we need them to be numbers and therefore the line above does is that when we take a string and multiply that string with a number then it will automatically convert that string into a number.
  const tour = tours.find((el) => el.id === id);

  //   if (id > tours.length)
  if (!tour) {
    // if there is no tour ie tour is undefined.
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  }

  // what this line does is that first the callback function loops through the el.id which is the tours id and returns true or false and then the find method will only create an array that contains the elements that satisfy the true part of the (el.id === req.params)
  res.status(200).json({ status: 'success', data: { tour } });
};

// app.get('/api/v1/tours', (req, res) => {
//   res
//     .status(200)
//     .json({ status: 'success', results: tours.length, data: { tours } });
// });

// the tours here are an array of JSOn objects that will be read and printed to the client side .

const createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
  //   res.send('Done');
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  }
  // console.log(req.params.id);
  res
    .status(200)
    .json({ status: 'success', data: { tour: '<Updated tour here' } });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });
  }
  res.status(204).json({ status: 'success', data: null });
  // response 204 means no content.
};

// app.get('/api/v1/tours', getAllTours);
// app.get(`/api/v1/tours/:id`, getTour);
// app.post('/api/v1/tours', createTour);
// app.patch(`/api/v1/tours/:id`, updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route(`/api/v1/tours/:id`)
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// the difference between post and get is that in the get method the (response) is that data that is coming meanwhile in the post it is the (request) is the one containing the data since it is being sent from the client side!!!

///
// app.post('/api/v1/tours', (req, res) => {
//   const toursId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: toursId }, req.body);
// Object .assign allows us to create a new object by merging two objects together and in this case it is the id object and the req.body object.
// tours.push(newTour);
// req.body.id = new id();

// so here we are going to write to the file directory then we write the file which is the tours and then the callback function which in this case just handles if there is an error!
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     res.status(201).json({ status: 'success', data: { tour: newTour } });
//   }
// );
// res.send('Done');
// });
// and since we configured the body of the post response in postmon therefore we get that json response in the console.

///

// we always have to send something with the response in the post method so we can close the request response cycle

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// do 53 again
