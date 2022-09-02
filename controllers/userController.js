const AppErrors = require('../utils/appErrors');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    // requestedAt: req.requestTime,
    results: users.length,
    data: { users },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if the user is trying to Post's password data
  //? we separated the update password route and functionality and the update data regarding the user in a more general fashion.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppErrors(
        'This route is not for password updates. Please use /updateMyPassword route',
        400
      )
    );
  }
  //2) filtered out unwanted field names that we don't want updated!
  const filteredBody = filterObj(req.body, 'name', 'email');
  // ? here in filterObj we are taking in the req.body and two parameters which are name and email and those are the elements and in the method filterObj above we can see that we are filtering the req.body to remove all the fields that are not email or name or anything else we specify in here  and we will be left with those so that the user can only update them

  // 3) Update user document!
  // here we are not using user.save() because there are some fields that are required to be updated that we are not including in the user.save() method and therefore are going to use User.findByIdAndUpdate().
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    //? instead of req.body we used a method called filteredBody so that not everything in the req.body gets updated for example the role could be set to admin and that is something that we should leave for the admin later on and not for any user in any time given or reset token and it's expiry date
    new: true,
    // ? here we used new:true so that so that it returns the new object ie the updated object instead of the old one
    runValidators: true,
    // ? run validators so in case we update some fields that we need to be validated like the email and therefore mongoose will catch those errors and validate them to be correct
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});
exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined.' });
};
exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined.' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined.' });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined.' });
};
