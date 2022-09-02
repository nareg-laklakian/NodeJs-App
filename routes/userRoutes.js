const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
// const {
//   getAllUsers,
//   createUser,
//   getUser,
//   updateUser,
//   deleteUser,
// } = require('./../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword); // this will only receive the email from the user.
router.patch('/resetPassword/:token', authController.resetPassword); // this will receive the email , the token and the new password as well.
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.patch('/updateMe', authController.protect, userController.updateMe); // it is a protected so only the currently authenticated user can update data of the current user! the id of the user that is going to be updated comes from the request.user
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
