const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// name , email , photo(string just like tours) , password , password confirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User name must be filled'],
    unique: true,
    maxLength: [18, 'A user name can not have more than 18 characters'],
    // minLength: [6, 'A user name must be at least 6 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowerCase: true, // al this is going to do is transform the email to a lowercase!!!
    validate: [validator.isEmail, 'Please Provide a valid email!'],
  },

  photo: String,
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

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

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // this.passwordChangedAt will console.log in the time format and not the the seconds format that we JWTTimestamp will be logged in therefore we will need to convert it to that and we do that by .getTime() and that will give us the milliseconds and then we need to divide by 1000 and parseInt it so that it will give us an integer
    // console.log(this.passwordChangedAt, JWTTimestamp);
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(changedTimestamp, JWTTimestamp);

    // console.log(JWTTimestamp < changedTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // for the reason of the plain resetToken not be stored in the database we are going to encrypt but not as strong as the password itself

  this.passwordResetToken = crypto
    .createHash('sha256') // the sha256 algorithm
    .update(resetToken) // the token itself (the string that we want to encrypt)
    .digest('hex'); // digest and store it as a hexadecimal

  // we store it in the database so that we can compare it with the reset token that the user provided

  console.log({ resetToken }, this.passwordResetToken); // when we log something as an object it will tell us its variable name along with the value

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // since Date is in milliseconds therefore we wrote 10 times 60 for seconds and then 1000 for milliseconds

  return resetToken; // here we have to send the unencrypted resetToken
};

const User = mongoose.model('User', userSchema);

module.exports = User;

// ?134 again and again and again !!!!
