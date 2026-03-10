const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
      default: null
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    message: {
      type: String,
      required: true,
    },
        file: {
        type: String
    },

    fileType: {
        type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Message', MessageSchema)
