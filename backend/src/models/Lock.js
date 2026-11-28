const mongoose = require('mongoose');

const lockSchema = new mongoose.Schema(
    {
        _id: { type: String },
        lockedUntil: { type: Date, required: true },
    },
    { versionKey: false }
);

module.exports = mongoose.model('Lock', lockSchema);
