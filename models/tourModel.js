const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name can not have more than 40 characters'],
      minLength: [10, 'A tour name can not have less than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be more than or equal to 1.0'],
      max: [5, 'Rating must be less than or equal to 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // the this keyword only points to current doc on NEW document creation
          return value < this.price;
          // lets say discount is 100 and price is 200 and therefore this will return true unlike if the discount is 250 which will return false
        },
        message:
          'Discount price ({VALUE}) should be less than the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(), // in mongo this is immediately converted to date format that we can read and understand
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  // we used an arrow function here because as we know the arrow function does not get its own this keyword so therefore in mongoose since we need the this keyword a lot we will probably use the normal function a lot.
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before the save (.save()) command and create(.create()) command but not insertMany(.insertMany())
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// PRE FIND HOOK  (middleware that will run before any find query is executed)
// Query Middleware

tourSchema.pre(/^find/, function (next) {
  // we used regEx because there are multiple functions that start with find [par example : find,findOne,FindOneAndUpdate ... etc] so on this case it will include all the functions that start with the word find
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } }); // in here the this keyword will point to the current query and not the current document.

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} millisecond`);
  // console.log(docs);
  next();
});

// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } }); // in here the this keyword will point to the current query and not the current document.
//   next();
// });

// AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // this.pipeline is an array and we add an element  at the beginning or an array with unshift for the beginning and shift to the end
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// done with 108 (section 8);
