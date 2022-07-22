// const fs = require('fs');
const { query } = require('express');
const Tour = require('./../models/tourModel');

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
    // BUILD QUERY ;
    // 1A) FILTERING
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((element) => delete queryObj[element]);

    //1B) ADVANCED FILTERING
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    // console.log(JSON.parse(queryString));

    // console.log(req.query, queryObj);
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });

    let query = Tour.find(JSON.parse(queryString)); // this Tour.find will return a query

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(sortBy);
      query = query.sort(sortBy);
      //sort('price ratingsAverage')
    } else {
      query = query.sort('-createdAt');
    }

    console.log(req.query);

    // { difficulty:'easy', duration: {$gte:5},}
    // { difficulty: 'easy', duration: { gte: '5' } }
    // gte,gt,lte,lt

    // const query =  await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    // // console.log(req.requestTime);

    /// 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.split(',').join(' ');
      query = query.select('name duration price');
    } else {
      query = query.select('-__v'); // minus(-) is excluding!!
    }

    // EXECUTE THE QUERY
    const tours = await query;

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
