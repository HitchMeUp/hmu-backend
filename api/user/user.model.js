'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        match: [emailRegex, 'Invalid E-Mail!'],
        index: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: { type: String, trim: true },
    surname: { type: String, trim: true },
    description: String,
    birthdate: Date,
    image: String,
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: false
            },
            naviRequest: {
                type: mongoose.Schema.ObjectId,
                ref: 'naviRequest',
                required: false
            },
            stars: Number,
            createdAt: { type: Date, default: Date.now },
            comment: String
        }
    ],
    Car: {
        capacity: Number,
        color: String,
        image: String,
        year: Number,
        brand: String,
        model: String,
    },
    currentNaviRequest: {
        type: mongoose.Schema.ObjectId,
        ref: 'naviRequest',
        required: false
    }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', userSchema);
