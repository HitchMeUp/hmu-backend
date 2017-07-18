'use strict';

var mongoose = require('mongoose');

var naviRequestSchema = new mongoose.Schema({
    status: { type: String, default: 'open' },
    from: String,
    to: String,
    maxDetour: { type: Number, default: 45 },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: false
    },
    matchings: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'matching',
            required: false
        },
    ],
    seatsNeeded: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('naviRequest', naviRequestSchema);
