'use strict';

var mongoose = require('mongoose');

var naviRequestSchema = new mongoose.Schema({
    status: { type: String, default: 'open' },
    from: String,
    to: String,
    maxDetour: { type: Number, default: 45 },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    },
    matchings: [{
        hitchRequest: {
            type: mongoose.Schema.ObjectId,
            ref: 'hitchRequest',
            required: false
        },
        status: { type: String, default: 'open' }
    }],
    availableSeats: Number,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('naviRequest', naviRequestSchema);
