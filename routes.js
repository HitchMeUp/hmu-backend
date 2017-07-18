'use strict';

var express = require('express');

module.exports = function (app, passport) {
    // Insert routes below
    app.use('/auth', require('./api/auth'));

    app.use('/api/user', isLoggedIn, require('./api/user'));

    app.use('/api/hitchRequest', isLoggedIn, require('./api/hitchRequest'));
    app.use('/api/naviRequest', isLoggedIn, require('./api/naviRequest'));
    app.use('/api/matching', isLoggedIn, require('./api/matching'));


    // Other routes return a 404
    app.get('/', function (req, res) {
        res.sendStatus(404);
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.end('Not logged in');
}
