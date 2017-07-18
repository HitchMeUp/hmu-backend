'use strict';

var User = require('../user/user.model');
var HitchRequest = require('../hitchRequest/hitchRequest.model');
var NaviRequest = require('./naviRequest.model');
var Matching = require('../matching/matching.model');


var googleClient = require('../../services/googleClient').googleMapsClient;


function handleError(res, err) {
    return res.send(500, err);
}


exports.index = function (req, res) {

    console.log(req.user);

    //console.log(req);
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

exports.create = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentNaviRequest').
        exec(function (err, user) {
            if (err) console.log(err);

            if (user.currentNaviRequest && user.currentNaviRequest.status == 'open') {
                NaviRequest.findByIdAndUpdate(user.currentNaviRequest._id, { $set: { status: 'closed' } }).exec();
                Matching.find({ naviRequest: user.currentNaviRequest._id }, function (err, matches) {
                    matches.forEach(function (match) {
                        Matching.findByIdAndUpdate(match._id, { $set: { status: 'closed' } }).exec();
                    });
                });
            }

            var naviReqObj = req.body;
            naviReqObj.user = user._id;

            NaviRequest.create(naviReqObj, function (err, newNaviRequest) {


                if (err) {
                    return handleError(res, err);
                }

                User.findByIdAndUpdate(user._id, { $set: { currentNaviRequest: newNaviRequest._id } }).exec();
                NaviRequest.findByIdAndUpdate(newNaviRequest._id, { $set: { user: user._id } }).exec();

                var results = [];

                HitchRequest.find({ status: 'open' }, function (err, hitchRequests) {

                    if (!hitchRequests.length) {
                        return res.status(200).send([]);
                    }

                    var hitchRequestsProcessed = 0;

                    hitchRequests.forEach(function (oneHitchRequest) {

                        //check if the detour for a hitchrequest is still within range of the max detour
                        calcDetour(newNaviRequest, oneHitchRequest, function (detour) {
                            hitchRequestsProcessed++;

                            if (detour > (newNaviRequest.maxDetour * 60)) {
                                return;
                            }

                            var matchingObj = {
                                hitchRequest: oneHitchRequest,
                                naviRequest: newNaviRequest,
                                passenger: oneHitchRequest.user,
                                driver: newNaviRequest.user
                            };

                            Matching.create(matchingObj, function (err, newMatch) {

                                if (err) console.log(err);

                                NaviRequest.findByIdAndUpdate(newNaviRequest._id, { $push: { matchings: newMatch } }).exec();

                                results.push(oneHitchRequest);

                                if (hitchRequestsProcessed === hitchRequests.length) {
                                    return res.json(results);
                                }
                            });

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
