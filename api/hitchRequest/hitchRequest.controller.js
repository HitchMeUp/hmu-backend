'use strict';

var hitchRequest = require('./hitchRequest.model');

function handleError(res, err) {
    return res.send(500, err);
}

exports.index = function (req, res) {
    hitchRequest.find(req.query).lean().exec(function (err, hitchRequests) {
        if (err) {
            return handleError(res, err);
        }

        return res.status(200).json(hitchRequests);
    });
};

exports.show = function (req, res) {
    hitchRequest.findById(req.params.id).lean().exec(function (err, hitchRequest) {
        if (err) {
            return handleError(res, err);
        }

        if (!hitchRequest) {
            return res.send(404);
        }

        return res.json(hitchRequest);
    });
};

exports.create = function (req, res) {
    hitchRequest.create(req.body, function (err, newhitchRequest) {
        if (err) {
            return handleError(res, err);
        }

        return res.json(newhitchRequest);
    });
};
