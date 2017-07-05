'use strict';

var User = require('./user.model');

function handleError(res, err) {
    return res.status(500).send(err);
}

exports.show = function (req, res) {
    console.log('USER / SHOW');
    console.log(req.user);
    User.findById(req.params.id).lean().exec(function (err, user) {
        if (err) {
            return handleError(res, err);
        }

        if (!user) {
            return res.send(404);
        }

        return res.json(user);
    });
};

exports.profile = function (req, res) {

    console.log('USER / PRofile');
    console.log(req.user);

    User.findOne({ email: req.user.email }, function (err, user) {
        if (user) {
            res.writeHead(200, { "Content-Type": "application/json" });
            user = user.toObject();
            delete user.password;
            delete user.__v;
            res.end(JSON.stringify(user));
        } else {
            return res.status(400).end('User not found');
        }
    });

};

