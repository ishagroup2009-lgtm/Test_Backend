const mongoose = require("mongoose")

const statusSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    image: {
        type: String,
        default: null
    },

    text: {
        type: String,
        default: ""
    },

    views: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

},
{
    timestamps: true
})

module.exports = mongoose.model("Status", statusSchema)