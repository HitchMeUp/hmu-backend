'use strict';

var express = require('express');
var controller = require('./naviRequest.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);

router.post('/accept/hitchRequest/:id', controller.acceptRequest);
router.post('/decline/hitchRequest/:id', controller.declineRequest);

module.exports = router;
