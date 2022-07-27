// const fs = require('fs');
// const { query, request } = require('express');

const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({ status: 'fail', message: 'invalid ID' });
//   } // we have return so that if the id is invalid it would return the function and not hit the next() and therefore continuing the command chain.
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'Missing name or price' });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE THE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // query.sort().select().skip().limit(); // this is how the query could look like on this line

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      // requestedAt: req.requestTime,
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // it is called req.params.id because in tourRoutes we called the variable '/:id' , if it was called '/:name' then it would have became req.params.name

    // Tour.findOne({ _id: req.params.id}) and this would work the exact way as (Tour.findById(req.params.id))

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status().json({
      status: 'fail',
      message: err,
    });
  }

  // console.log(req.params);
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // //   if (id > tours.length)
  // res.status(200).json({ status: 'success', data: { tour } });
};

// exports.createTour = (req, res) => {
//   res.status(201).json({ status: 'success',// data: { tour: newTour } });
//   // console.log(req.body);
//   // const newId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.assign({ id: newId }, req.body);

//   // tours.push(newTour);

//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   //     res.status(201).json({ status: 'success', data: { tour: newTour } });
//   //   }
//   // );
//   //   res.send('Done');
// });

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();

    // Tour.create({}).then();
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
  // console.log(req.params.id);
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
    // response 204 means no content.
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

// exports.deleteTour = (req, res) => {
//   res.status(204).json({ status: 'success', data: null });
//   // response 204 means no content.
// };

// because the export is not a single export therefore we do not use module.export instead we use the export object

//97

exports.getTourStats = async (req, res) => {
  try {
    const stats = Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$ratingsAverage' },
          averagePrice: { $avg: '$price' },
          minimumPrice: { $min: '$price' },
          maximumPrice: { $max: '$price' },
        },
      },
    ]);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

// 101
