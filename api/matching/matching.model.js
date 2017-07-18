'use strict';

var mongoose = require('mongoose');

var matchingsSchema = new mongoose.Schema({
    status: { type: String, default: 'open' },
    statusDriver: { type: String, default: 'open' },
    statusPassenger: { type: String, default: 'open' },
    driver: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    passenger: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    hitchRequest: {
        type: mongoose.Schema.ObjectId,
        ref: 'hitchRequest',
        required: true
    },
    naviRequest: {
        type: mongoose.Schema.ObjectId,
        ref: 'naviRequest',
        required: true
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('matching', matchingsSchema);
