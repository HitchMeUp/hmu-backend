'use strict';

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
    naviRequest.create(req.body, function (err, newnaviRequest) {
        if (err) {
            return handleError(res, err);
        }

        return res.json(newnaviRequest);
    });
};
