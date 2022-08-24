// const fs = require('fs');
// const { query, request } = require('express');

const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppErrors = require('./../utils/appErrors');

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

exports.getAllTours = catchAsync(async (req, res, next) => {
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
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // it is called req.params.id because in tourRoutes we called the variable '/:id' , if it was called '/:name' then it would have became req.params.name

  // Tour.findOne({ _id: req.params.id}) and this would work the exact way as (Tour.findById(req.params.id))

  if (!tour) {
    return next(new AppErrors('no tour found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });

  // console.log(req.params);
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // //   if (id > tours.length)
  // res.status(200).json({ status: 'success', data: { tour } });
});

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

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: 'success', data: { tour: newTour } });

  // try {
  //   // const newTour = new Tour({});
  //   // newTour.save();

  //   // Tour.create({}).then();
  //   const newTour = await Tour.create(req.body);

  //   res.status(201).json({ status: 'success', data: { tour: newTour } });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppErrors('no tour found with that id', 404));
  }

  res.status(200).json({ status: 'success', data: { tour } });

  // console.log(req.params.id);
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppErrors('no tour found with that id', 404));
  }

  res.status(204).json({ status: 'success', data: null });
  // response 204 means no content.
});

// exports.deleteTour = (req, res) => {
//   res.status(204).json({ status: 'success', data: null });
//   // response 204 means no content.
// };

// because the export is not a single export therefore we do not use module.export instead we use the export object

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minimumPrice: { $min: '$price' },
        maximumPrice: { $max: '$price' },
      },
    },
    {
      $sort: { averagePrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        //match is basically to select documents (to query)
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 }, // 1 is for ascending and -1 is for descending
    },
    // {
    //   $limit: 6,
    // },
  ]);

  res.status(200).json({ status: 'success', data: { plan } });
});
