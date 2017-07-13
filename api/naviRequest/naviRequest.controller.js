'use strict';

var User = require('../user/user.model');
var hitchRequest = require('../hitchRequest/hitchRequest.model');

var naviRequest = require('./naviRequest.model');

function handleError(res, err) {
    return res.send(500, err);
}

exports.index = function (req, res) {
    naviRequest.find(req.query).lean().exec(function (err, naviRequests) {
        if (err) {
            return handleError(res, err);
        }

        return res.status(200).json(naviRequests);
    });
};

exports.show = function (req, res) {
    naviRequest.findById(req.params.id).lean().exec(function (err, naviRequest) {
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
            if (user.currentNaviRequest && user.currentNaviRequest.status == 'open') {
                user.currentNaviRequest.status = 'closed';
            }

            naviRequest.create(req.body, function (err, newNaviRequest) {

                if (err) {
                    return handleError(res, err);
                }

                user.currentNaviRequest = newNaviRequest._id;

                var results = [];

                hitchRequest.find({ status: 'open' }, function (err, hitchRequests) {

                    hitchRequests.forEach(function (oneHitchRequest) {

                        //check if enough seats are available
                        if (oneHitchRequest.seatsNeeded <= newNaviRequest.availableSeats) {

                            //check if the detour for a hitchrequest is still within range of the max detour
                            if (calcDetour(newNaviRequest, oneHitchRequest) <= newNaviRequest.maxDetour) {
                                results.push({ hitchRequest: oneHitchRequest, status: 'open' });
                            }
                        }
                    });
                    newNaviRequest.matchings = results;
                    console.log(newNaviRequest.matchings);
                    return res.json(results);
                });
            });
        });

};

//TODO Google API for calculation
var calcDetour = function (naviRequest, hitchRequest) {
    return 1;
}
