
var admin = require("firebase-admin");

//var serviceAccount = require("../config/serviceAccountKey.json");

/*admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hitchmeup-173823.firebaseio.com"
});*/

admin.initializeApp({
    credential: admin.credential.cert({
        private_key: process.env.FIREBASE_PRIVATE_KEY,
        client_email: process.env.FIREBASE_CLIENT_EMAIL
    }),
    databaseURL: "https://hitchmeup-173823.firebaseio.com"
});

exports.send = function (registrationToken, payload) {
    admin.messaging().sendToDevice(registrationToken, payload)
        .then(function (response) {

            console.log('Payload');
            console.log(payload);

            console.log("Successfully sent message:", response);
        })
        .catch(function (error) {
            console.log("Error sending message:", error);
        });
};
