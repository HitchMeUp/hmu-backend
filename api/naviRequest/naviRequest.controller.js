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

//User -> Current Navi Request -> ID von Hitchrequest -> Status -> Benachrichtigung

// User accepts a Navi Request
//accept/hitchRequest/:id'
exports.acceptRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        exec(function (err, user) {
            NaviRequest.findByIdAndUpdate(user.currentNaviRequest, { $set: { status: 'pending' } }, (err, naviRequest) => {
                naviRequest.matchings.forEach(function (match, index) {
                    naviRequest.pendings.push(match);
                    naviRequest.matchings = naviRequest.matchings.slice(index, 1);
                    naviRequest.save(function (err) {
                        if (err) console.log(err);
                    });

                    console.log(index);

                    console.log(naviRequest.matchings);
                    console.log(naviRequest.matchings.slice(index, 1));

                    return res.send(200);

                    //TODO 
                    //Notify client of new matches
                });
            });
        });
};

exports.declineRequest = function (req, res) {
    User.findOne({ email: req.user.email }).
        exec(function (err, user) {
            NaviRequest.findByIdAndUpdate(user.currentNaviRequest, { $set: { status: 'pending' } }, (err, naviRequest) => {
                naviRequest.matchings.forEach(function (match, index) {
                    naviRequest.declines.push(match);
                    naviRequest.matchings = naviRequest.matchings.slice(index, 1);
                    naviRequest.save(function (err) {
                        if (err) console.log(err);
                    });

                    console.log(index);

                    console.log(naviRequest.matchings);
                    console.log(naviRequest.matchings.slice(index, 1));

                    return res.send(200);

                    //TODO 
                    //Notify of decline
                });
            });
        });
};

exports.create = function (req, res) {
    User.findOne({ email: req.user.email }).
        populate('currentNaviRequest').
        exec(function (err, user) {
            if (err) console.log(err);

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

                            NaviRequest.findByIdAndUpdate(newNaviRequest._id, { $push: { matchings: oneHitchRequest._id } }).exec();

                            results.push(oneHitchRequest);

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
