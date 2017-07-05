'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

//needs to be ahead of :id route
router.get('/profile', controller.profile);
router.get('/:id', controller.show);

module.exports = router;
