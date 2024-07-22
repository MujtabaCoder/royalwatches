const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
  },
  username: {
    type: String,
    
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    default: 'customer'
  },
  dob: {
    type: String,
  },
  address: {
    type: String,
  },
});

module.exports = mongoose.model('Admin', userSchema);
