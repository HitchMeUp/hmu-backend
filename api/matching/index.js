'use strict';

var express = require('express');
var controller = require('./matching.controller');

var router = express.Router();

router.get('/', controller.index);

router.post('/driver/accept/hitchRequest/:id', controller.driverAcceptHitchRequest);
router.post('/driver/decline/hitchRequest/:id', controller.driverDeclineHitchRequest);
router.post('/passenger/accept/naviRequest/:id', controller.passengerAcceptNaviRequest);
router.post('/passenger/decline/naviRequest/:id', controller.passengerDeclineNaviRequest);

module.exports = router;
