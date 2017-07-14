'use strict';

var User = require('./user.model');

function handleError(res, err) {
    return res.status(500).send(err);
}

exports.show = function (req, res) {
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

exports.update = function (req, res) {
    User.findOneAndUpdate({ email: req.user.email }, req.body, function (err, user) {
        if (user) {
            console.log('User exists..');
            if (req.body.password) {
                console.log('Password will be updated..');
                user.password = user.generateHash(req.body.password);
                try {
                    user.save(function (err) {
                        if (err) return res.status(400).end('User could not be saved...');
                        // saved
                    });
                } catch (err) {
                    console.log(err);
                }
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            user = user.toObject();
            delete user.password;
            delete user.__v;
            res.end(JSON.stringify(user));
        } else {
            return res.status(400).end('User not found');
        }
    });
}

exports.profile = function (req, res) {
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
