const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fcmToken: {
    type: String,
  },
  phone: {
    type: String,
  },

  bio: {
    type: String,
    default: ""
  },

  photo: {
    type: String,   // profile image URL
    default: ""
  },

})

module.exports = mongoose.model('User', UserSchema)
