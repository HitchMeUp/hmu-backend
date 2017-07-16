
var socketio = require('socket.io');

module.exports.listen = function(app){
    io = socketio.listen(app);

drivers = [];
passengers = [];
users = [];
connections =[];
var idCounter = 0;

function User(id, socket, role, start, destination, name, noMatch, matchStatus, smallUser) {
    this.id = id;
    this.socket = socket;
    this.role = role;
    this.start = start;
    this.destination = destination;
    this.name = name;
    this.noMatch = noMatch;
    this.matchStatus = matchStatus;
    this.smallUser = smallUser;
}
//Objekt was dem Client gesendet wird ( User-Objekt wäre zu groß)
function SmallUser(id, role, start, destination, name) {
    this.id = id;
    this.role = role;
    this.start = start;
    this.destination = destination;
    this.name = name;
}

//--------------------------------------Listener-----------------------------------------------------
//when client socket connects
io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s socekts connected', connections.length);

    var user = new User();
    user.socket = socket;
    user.id = idCounter++;
    socket.emit('id', user.id);

//when client disconnects
    socket.on('disconnect', function(data){
        //remove from arrays
        connections.splice(connections.indexOf(socket), 1);
        if(user.role == 'driver') {
            drivers.splice(drivers.indexOf(user), 1);
        } else {
            passengers.splice(passengers.indexOf(user), 1);
        }
        console.log('Disconnected: %s socekts connected', connections.length);
    });


//when client sends ride request as passenger or driver, gets JSON Object as data
    socket.on('ride', function(data){
       //save data in Object
        user.start = data.start;
        user.role = data.role;
        user.destination = data.destination;
        user.name = data.name;
        user.noMatch = [];
        user.smallUser = new SmallUser(user.id, user.role, user.start, user.destination, user.name);
        //looks if user is passenger or driver
        if(user.role=='driver'){
            drivers.push(user);
            users.push(user);
            console.log("new driver");

        } else {
            passengers.push(user);
            users.push(user);
            console.log("new passenger");
        }
        //ruft Suchmethode für Match auf und versendet die potentiellen Fahrer/Mitfahrer
        var potentialsSmall = userMatch(user);
        console.log("potenials: "+ potentialsSmall.length);
        user.socket.emit("match", potentialsSmall);
    });

//when one client wants another client to have a ride with
    socket.on('wanted', function(status, smallPotential) {
       // potential.socket.emit('wantedAccept', potential);
       if(status == 'denied'){
           if(typeof user.noMatch === "undefined") {
                user.noMatch = [];
           }
            user.noMatch.push(smallPotential.id);
       } else {
            var potential = findUserById(smallPotential.id);
            console.log("Potential: " + potential.name);
            potential.socket.emit('wantedOffer', user.smallUser);
            console.log("wanted request emitted");
       }
    });
    // Empfängt die Antwort des Angefragten
    socket.on('responseToOffer', function(answer, userID ,potential){
        var userProfile = findUserById(userID);
        var potentialProfile = findUserById(potential.id);
        if(answer === true){
            if(potentialProfile.role === 'passenger'){
                passengers.splice(passengers.indexOf(potentialProfile));
                drivers.splice(drivers.indexOf(userProfile));
            } else {
                passengers.splice(passengers.indexOf(userProfile));
                drivers.splice(drivers.indexOf(potentialProfile));
            }


        } else {
            userProfile.noMatch.push(potential.id);
        }
        //sendet Bestätigung/Ablehnung an beide Clients
            userProfile.socket.emit('confirmation', answer, potential);
            potentialProfile.socket.emit('confirmation', answer, userProfile.smallUser);
    });

});

function findUserById(id){
   var i;
   for(i = 0; i < users.length; i++) {
        if(users[i].id == id){
            return users[i];
        }
   }
   return null;
}

function deleteRide(userID) {
    var i;
    for(i = 0; i < drivers; i++){
        if(drivers[i].userId === userID) {
            drivers.splice(i, 1);
        }
    }
    for(i = 0; i < passengers; i++){
        if(passengers[i].userId === userID) {
            passengers.splice(i, 1);
        }
    }
}


function checkRideStillRelevant(smallUser) {
    var i;
    var userID = smallUser.id;
    for(i = 0; i < users; i++) {
        if(users[i].id === userID) {
            if(users[i].start === smallUser.start &&
            users[i].destination === smallUser.destination) {
                return true;
            }
        }
    }
    return false;
}


//Sucht nach Match
function userMatch(user){
    console.log("match-function called");
    var i, j;
    var potentials = [];
    var potentialsSmall = [];
    var targetRoleUsers;
    //sucht nach potentiellen mitfahrern mit dem selben start und ziel und nicht schon abgelehnt wurden
    if(user.role  == "driver"){
        targetRoleUsers = passengers;
    } else {
        targetRoleUsers = drivers;
    }
    for(i = 0; i<targetRoleUsers.length;i++){
        if(targetRoleUsers[i].start == user.start &&
        targetRoleUsers[i].destination == user.destination &&
        targetRoleUsers[i].noMatch.indexOf(user.id) == -1 &&
        targetRoleUsers[i].id != user.id){

            potentials.push(targetRoleUsers[i]);
            potentialsSmall.push(targetRoleUsers[i].smallUser);
        }
    }
    return potentialsSmall;
    //user.socket.emit("match", potentialsSmall);
}


return io;
}