'use strict';

var mongoose = require('mongoose');

var hitchRequestSchema = new mongoose.Schema({
    status: { type: String, default: 'open' },
    from: String,
    to: String,
    comment: String,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: false
    },
    matchings: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'hitchRequest',
            required: false
        },
    ],
    declines: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'hitchRequest',
            required: false
        },
    ],
    pendings: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'hitchRequest',
            required: false
        },
    ],
    final: {
        type: mongoose.Schema.ObjectId,
        ref: 'hitchRequest',
        required: false
    },
    seatsNeeded: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    price: Number
});

module.exports = mongoose.model('hitchRequest', hitchRequestSchema);
