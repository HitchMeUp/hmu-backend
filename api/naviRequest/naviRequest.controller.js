'use strict';

var User = require('../user/user.model');
var HitchRequest = require('../hitchRequest/hitchRequest.model');
var NaviRequest = require('./naviRequest.model');

var googleClient = require('../../services/googleClient').googleMapsClient;
var pushService = require('../../services/pushService');


function handleError(res, err) {
    return res.send(500, err);
}

exports.index = function (req, res) {
    NaviRequest.find(req.query).lean().exec(function (err, naviRequests) {
        if (err) {
            return handleError(res, err);
        }

        return res.status(200).json(naviRequests);
    });
};

exports.show = function (req, res) {
    NaviRequest.findById(req.params.id).lean().exec(function (err, naviRequest) {
        if (err) {
            return handleError(res, err);
        }

        if (!naviRequest) {
            return res.send(404);
        }

        return res.json(naviRequest);
    });
};

exports.acceptHitchRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentNaviRequest').
        exec(function (err, user) {

        });
};

exports.create = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentNaviRequest').
        exec(function (err, user) {
            if (user.currentNaviRequest && user.currentNaviRequest.status == 'open') {
                NaviRequest.findByIdAndUpdate(user.currentNaviRequest._id, { $set: { status: 'closed' } }).exec();
            }

            NaviRequest.create(req.body, function (err, newNaviRequest) {


                if (err) {
                    return handleError(res, err);
                }

                User.findByIdAndUpdate(user._id, { $set: { currentNaviRequest: newNaviRequest._id } }).exec();
                NaviRequest.findByIdAndUpdate(newNaviRequest._id, { $set: { user: user._id } }).exec();

                var results = [];

                HitchRequest.find({ status: 'open' }, function (err, hitchRequests) {

                    if (!hitchRequests.length) {
                        return res.send('No requests found');
                    }

                    var hitchRequestsProcessed = 0;

                    hitchRequests.forEach(function (oneHitchRequest) {

                        //check if enough seats are available
                        /*if (oneHitchRequest.seatsNeeded > newNaviRequest.availableSeats) {
                            return;
                        }*/

                        //check if the detour for a hitchrequest is still within range of the max detour
                        calcDetour(newNaviRequest, oneHitchRequest, function (detour) {
                            hitchRequestsProcessed++;

                            if (detour > (newNaviRequest.maxDetour * 60)) {
                                return;
                            }

                            results.push({ hitchRequest: oneHitchRequest, status: 'open' });

                            if (hitchRequestsProcessed === hitchRequests.length) {
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
