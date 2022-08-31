const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppErrors = require('./../utils/appErrors');
const sendEmail = require('./../utils/email');

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
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
    // here if we insert a password change in the body of the req it will register as a passwordChangedAt field and if we don't then that field will remain empty and not be filled
  });

  // const newUser = await User.create(req.body); // FIXME: The field of passwordChangedAt is not being logged in with the code above!!

  const token = signToken(newUser._id);
  // jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });
  //
  console.log(newUser);
  //
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

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppErrors('Yo are not logged in, please log in to get access', 401)
    );
  }

  // The code above does not permit users that are not logged in to view parts of the database that we have implemented so they must log in , have a valid jwt token and then view those documents

  // 2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppErrors('The user belonging to the token no longer exists.', 401)
    );
  }

  // 4) Check if user changed password after jwt issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppErrors(
        'User recently changed password. Please log  in again!!',
        401
      )
    );
  }

  // Grant access to the protected route
  req.user = freshUser;
  next();
  // Here the code will have to go through all the hurdles above to get to this next which will get it to the next route handler which in this situation will be to grant the user access.
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array  ['admin','lead-guide'] .role='user' if this is the case then since it is not in the roles array and therefore it will not occur

    if (!roles.includes(req.user.role)) {
      return next(
        new AppErrors('You do not have permission to perform this action', 403)
        // 403 code means forbidden!
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Posted email

  // here we used findOne and not findById because we don't know the id and the user doesn't know his/her id
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppErrors('There is no user with this email address', 404));
  } // the 404 error code means not found

  // 2) Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email address

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: req.body.email,
      // or we can also say req.body.email which is the same here actually
      subject: 'Your password reset Token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppErrors(
        'There was an error sending the email, try again later',
        500
      )
    );
  }
});
exports.resetPassword = (req, res, next) => {};

// ?134 again and again and again !!!!
