var gcm = require('node-gcm');

var sender = new gcm.Sender(process.env.GCM_KEY);

exports.sendMessage = function (message, registrationId, callback) {

    var message = new gcm.Message({ data: { message: message } });
    var regTokens = [registrationId];
    sender.send(message, { registrationTokens: regTokens }, function (err, response) {

        if (err) {
            console.error(err);
            callback();
        } else {
            console.log(response);
            callback();
        }
    });

}