'use strict';

var mongoose = require('mongoose');

var hitchRequestSchema = new mongoose.Schema({
    status: String,
    from: String,
    to: String,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    },
    seatsNeeded: Number,
    createdAt: { type: Date, default: Date.now },
    price: Number
});

module.exports = mongoose.model('HitchRequest', hitchRequestSchema);
