const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Admin', userSchema);
