const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    minLength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE & SAVE!!!!
      validator: function (el) {
        return el === this.password;
        // here if the passwordConfirm doesn't match the password we will get a validation error
      },
      message: 'Passwords are not the same!!💥',
    },
  },
});

// between getting the data and saving it to the database
//
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified !!!
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

// Instance method = method that is available on all documents of a certain collection

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
  // the return function above will return true if the two given parameters are the same and false if the two parameters are different
  // we can't do it manually since the candidatePassword is not hashed since it is coming from the user and the userPassword is hashed since it is stored and coming from out database.
};

const User = mongoose.model('User', userSchema);

module.exports = User;
