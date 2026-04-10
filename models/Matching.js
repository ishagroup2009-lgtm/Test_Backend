const matchingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  male: {
    name: String,
    dob: String,
    time: String,
    place: String,
    lat: Number,
    lon: Number,
    timezone: Number   // ✅ added
  },

  female: {
    name: String,
    dob: String,
    time: String,
    place: String,
    lat: Number,
    lon: Number,
    timezone: Number   // ✅ added
  },

}, { timestamps: true });