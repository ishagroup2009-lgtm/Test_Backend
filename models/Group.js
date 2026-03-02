const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    photo: { type: String, default: '' },

    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member'], default: 'member' }
      }
    ],

  },
  { timestamps: true }
)

module.exports = mongoose.model('Group', groupSchema)