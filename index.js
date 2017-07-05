var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');

// Setup server
var app = express();

var port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ secret: 'verysecretkey' }));
app.use(passport.initialize());
app.use(passport.session());

var server = require('http').createServer(app);
require('./config/passport')(passport);
require('./routes')(app, passport);

//DB Connection
mongoose.connect('mongodb://localhost/hmu-app');

// Start server
server.listen(port, function () {
    console.log('Server listening on port ' + port + '...');
});

// Expose app
module.exports = {
    app: app,
};
