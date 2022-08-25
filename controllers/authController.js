const jwt = require('jsonwebtoken');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppErrors = require('./../utils/appErrors');

// in the code below we changes the User.create(req.body) method to the 4 lines of code below so that every new user that is created doesn't become an admin and how we can get admin is to go into mongoDb Compass and then edit the user role to admin from there.

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);
  // jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // console.log('here');
  const { email, password } = req.body;

  // 1) Check if email and password exist

  if (!email || !password) {
    return next(new AppErrors('Please provide email and password!!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password, user.password); // if the first line is incorrect then we will not have user.password and then the const user will not run and therefore we are taking that line of code and putting it in the second part of the if statement instead of a standalone variable.
  // the answer of this will either be true or false

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErrors('Incorrect Email or Password', 401));
  }

  // console.log(user);

  // 3) Check if everything is ok , send token to client
  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token });
});

// 130
