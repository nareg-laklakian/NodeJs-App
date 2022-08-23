const mongoose = require('mongoose');
const validator = require('validator');

// name , email , photo(string just like tours) , password , password confirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User name must be filled'],
    unique: true,
    maxLength: [18, 'A user name can not have more than 18 characters'],
    minLength: [6, 'A user name must be at least 6 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowerCase: true, // al this is going to do is transform the email to a lowercase!!!
    validate: [validator.isEmail, 'Please Provide a valid email!'],
  },

  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Password must be at least 6 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
