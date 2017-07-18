'use strict';

var NaviRequest = require('../naviRequest/naviRequest.model');
var HitchRequest = require('../hitchRequest/hitchRequest.model');
var Matching = require('./matching.model');
var User = require('../user/user.model');

function handleError(res, err) {
    return res.send(500, err);
}

exports.index = function (req, res) {
    Matching.find(req.query).lean().exec(function (err, matchings) {
        if (err) {
            return handleError(res, err);
        }

        return res.status(200).json(matchings);
    });
};

exports.driverAcceptHitchRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        exec(function (err, user) {
            if (err) console.log(err);
            HitchRequest.findById(req.params.id, function (err, hitchRequest) {
                Matching.findOneAndUpdate({ driver: user._id, hitchRequest: hitchRequest._id },
                    { $set: { statusDriver: 'accepted' } }, function (err, match) {
                        if (err) console.log(err);

                        console.log('statusDriver should be accepted..');
                        console.log(match);

                        if (match.statusPassenger == 'accepted') {

                            Matching.update({ driver: match.driver._id }, { $set: { status: 'closed' } }, { multi: true }, function (err, driverRes) {
                                Matching.update({ passenger: match.passenger._id }, { $set: { status: 'closed' } }, { multi: true }, function (err, passRes) {
                                    Matching.findByIdAndUpdate(match._id, { $set: { status: 'matched' } }).exec();
                                });
                            });

                            HitchRequest.findByIdAndUpdate(match.hitchRequest, { $set: { status: 'matched' } }).exec();
                            NaviRequest.findByIdAndUpdate(match.naviRequest, { $set: { status: 'matched' } }).exec();

                            //TODO notify passenger
                        }

                        return res.sendStatus(200);
                    });
            });
        });
};

exports.driverDeclineHitchRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentHitchRequest').
        exec(function (err, user) {
            if (err) console.log(err);

            HitchRequest.findById(req.params.id, function (err, hitchRequest) {
                Matching.findOneAndUpdate({ driver: user._id, hitchRequest: hitchRequest._id },
                    { $set: { statusDriver: 'declined' } }, function (err, match) {
                        if (err) console.log(err);

                        if (match.statusPassenger == 'accepted') {
                            //TODO notify passenger
                        }

                        return res.sendStatus(200);
                    });
            });

        });
};

exports.passengerAcceptNaviRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentHitchRequest').
        exec(function (err, user) {
            if (err) console.log(err);

            NaviRequest.findById(req.params.id, function (err, naviRequest) {
                Matching.findOneAndUpdate({ driver: user._id, naviRequest: naviRequest._id },
                    { $set: { statusPassenger: 'accepted' } }, function (err, match) {
                        if (err) console.log(err);

                        if (match.statusDriver == 'accepted') {

                            Matching.update({ driver: match.driver._id }, { $set: { status: 'closed' } }, { multi: true }, function (err, driverRes) {
                                Matching.update({ passenger: match.passenger._id }, { $set: { status: 'closed' } }, { multi: true }, function (err, passRes) {
                                    Matching.findByIdAndUpdate(match._id, { $set: { status: 'matched' } }).exec();
                                });
                            });

                            HitchRequest.findByIdAndUpdate(match.hitchRequest, { $set: { status: 'matched' } }).exec();
                            NaviRequest.findByIdAndUpdate(match.naviRequest, { $set: { status: 'matched' } }).exec();

                            //TODO notify driver
                        }

                        return res.sendStatus(200);
                    });
            });

        });
};

exports.passengerDeclineNaviRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentHitchRequest').
        exec(function (err, user) {
            if (err) console.log(err);

            NaviRequest.findById(req.params.id, function (err, naviRequest) {
                Matching.findOneAndUpdate({ driver: user._id, naviRequest: naviRequest._id },
                    { $set: { statusPassenger: 'declined' } }, function (err, match) {
                        if (err) console.log(err);

                        if (match.statusDriver == 'accepted') {
                            //TODO notify driver
                        }

                        return res.sendStatus(200);
                    });
            });
        });
};


