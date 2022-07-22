const getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};

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
