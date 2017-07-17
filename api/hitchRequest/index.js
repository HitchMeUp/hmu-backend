'use strict';

var express = require('express');
var controller = require('./hitchRequest.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);

router.post('/accept/naviRequest/:id', controller.acceptRequest);
router.post('/decline/naviRequest/:id', controller.declineRequest);

module.exports = router;
