'use strict';

var mongoose = require('mongoose');

var hitchRequestSchema = new mongoose.Schema({
    status: { type: String, default: 'open' },
    from: String,
    to: String,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    },
    matchings: [{
        naviRequest: {
            type: mongoose.Schema.ObjectId,
            ref: 'naviRequest',
            required: false
        },
        status: String
    }],
    seatsNeeded: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    price: Number
});

module.exports = mongoose.model('HitchRequest', hitchRequestSchema);
