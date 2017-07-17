'use strict';

var NaviRequest = require('../naviRequest/naviRequest.model');
var HitchRequest = require('./hitchRequest.model');

var googleClient = require('../../services/googleClient').googleMapsClient;

var User = require('../user/user.model');

function handleError(res, err) {
    return res.send(500, err);
}

exports.index = function (req, res) {
    HitchRequest.find(req.query).lean().exec(function (err, hitchRequests) {
        if (err) {
            return handleError(res, err);
        }

        return res.status(200).json(hitchRequests);
    });
};

exports.show = function (req, res) {
    HitchRequest.findById(req.params.id).lean().exec(function (err, hitchRequest) {
        if (err) {
            return handleError(res, err);
        }

        if (!hitchRequest) {
            return res.send(404);
        }

        return res.json(hitchRequest);
    });
};

exports.acceptRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentNaviRequest').
        exec(function (err, user) {

        });
};

exports.declineRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentNaviRequest').
        exec(function (err, user) {

        });
};

exports.create = function (req, res) {
    User.findOne({ email: req.user.email }).
        exec(function (err, user) {
            if (user.currentHitchRequest && user.currentHitchRequest.status == 'open') {
                HitchRequest.findByIdAndUpdate(user.currentHitchRequest._id, { $set: { status: 'status' } }).exec();
            }

            HitchRequest.create(req.body, function (err, newHitchRequest) {

                if (err) {
                    return handleError(res, err);
                }

                User.findByIdAndUpdate(user._id, { $set: { currentHitchRequest: newHitchRequest._id } }).exec();
                HitchRequest.findByIdAndUpdate(newHitchRequest._id, { $set: { user: user._id } }).exec();

                var results = [];

                NaviRequest.find({ status: 'open' }, function (err, naviRequests) {

                    if (!naviRequests.length) {
                        return res.send('No requests found');
                    }

                    var naviRequestsProcessed = 0;

                    naviRequests.forEach(function (oneNaviRequest) {

                        //check if the detour for a hitchrequest is still within range of the max detour
                        calcDetour(oneNaviRequest, newHitchRequest, function (detour) {
                            naviRequestsProcessed++;

                            if (detour > (oneNaviRequest.maxDetour * 60)) {
                                return;
                            }

                            results.push({ naviRequest: oneNaviRequest, status: 'open' });

                            if (naviRequestsProcessed === naviRequests.length) {
                                return res.json(results);
                            }
                        });
                    });
                });
            });
        });
};

var calcDetour = function (naviRequest, hitchRequest, callback) {
    googleClient.directions({
        origin: naviRequest.from,
        destination: naviRequest.to,
    }, function (err, naviResponse) {
        if (err) {
            console.log(err);
        }

        let legs = naviResponse.json.routes[0].legs;
        var naviDuration = 0;

        legs.forEach(function (leg) {
            naviDuration += leg.duration.value;
        });

        googleClient.directions({
            origin: naviRequest.from,
            destination: naviRequest.to,
            waypoints: [hitchRequest.from, hitchRequest.to]
        }, function (err, detourResponse) {

            if (err) {
                console.log(err);
            }

            let legs = detourResponse.json.routes[0].legs;
            let detourDuration = 0;

            legs.forEach(function (leg) {
                detourDuration += leg.duration.value;
            });

            let detour = detourDuration - naviDuration;
            callback(detour);
        });
    });

}
