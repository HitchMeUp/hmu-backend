'use strict';

var User = require('../user/user.model');
var passport = require('passport');

function handleError(res, err) {
    return res.status(500).send(err);
}

//https://github.com/dzt/MobilePassport/
exports.register = function (req, res) {

    if (!req.body.firstname || !req.body.surname || !req.body.password || !req.body.email)
        return res.status(400).end('Invalid input');

    User.findOne({ email: req.body.email }, function (err, user) {
        if (user) {
            return res.status(400).end('User already exists');
        } else {

            var newUser = new User();
            newUser.firstname = req.body.firstname;
            newUser.surname = req.body.surname;
            newUser.password = newUser.generateHash(req.body.password);
            newUser.email = req.body.email;
            newUser.description = req.body.description;

            newUser.save();

            res.writeHead(200, { "Content-Type": "application/json" });

            newUser = newUser.toObject();
            delete newUser.password;
            res.end(JSON.stringify(newUser));
        }
    });
};

exports.login = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {

        if (err)
            return next(err);
        if (!user)
            return res.status(400).json({ SERVER_RESPONSE: 0, SERVER_MESSAGE: "Wrong Credentials" });
        req.logIn(user, function (err) {
            if (err)
                return next(err);
            if (!err)
                return res.json({ SERVER_RESPONSE: 1, SERVER_MESSAGE: "Logged in!" });
        });
    })(req, res, next);
};

exports.logout = function (req, res) {
    req.logout();
    res.end('Logged out');
};
