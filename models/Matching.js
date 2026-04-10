const mongoose = require("mongoose");

const matchingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  male: {
    name: String,
    dob: String,
    time: String,
    place: String,
    lat: Number,
    lon: Number,
  },

  female: {
    name: String,
    dob: String,
    time: String,
    place: String,
    lat: Number,
    lon: Number,
  },

  payload: Object,        // astrology payload
  result: Object,         // API result (obstruction etc)

}, { timestamps: true });

module.exports = mongoose.model("Matching", matchingSchema);