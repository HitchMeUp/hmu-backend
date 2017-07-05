'use strict';

var mongoose = require('mongoose');

var naviRequestSchema = new mongoose.Schema({
    status: String,
    from: String,
    to: String,
    passengers: [{
        hitchRequest: {
            type: mongoose.Schema.ObjectId,
            ref: 'hitchRequest',
            required: false
        },
        status: String
    }],
    availableSeats: Number,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('naviRequest', naviRequestSchema);
