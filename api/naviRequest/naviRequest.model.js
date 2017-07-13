'use strict';

var mongoose = require('mongoose');

var naviRequestSchema = new mongoose.Schema({
    status: String,
    from: String,
    to: String,
    maxDetour: { type: Number, default: 5 },
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
