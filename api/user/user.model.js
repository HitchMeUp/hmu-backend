'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var md5 = require('MD5');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid E-Mail!'],
        index: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: String,
    surname: String,
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
    }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', function (next) {
    console.log('hello.');
});

module.exports = mongoose.model('User', userSchema);
