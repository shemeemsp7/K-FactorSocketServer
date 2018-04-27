var app = require('express')();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
require('./src/socket_utils.js')(app);
var socket_service = require('./src/socket_service.js').initSocketService(app, io);


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// socket controller
io.on('connection', function(socket) {

    socket.on('message', function(msg) {
        try {
            console.log("Recieved Message:" + msg.type);
            console.log(socket.conn.id);
            socket_service.processMessage(msg);
        } catch (error) {
            console.log(error);
        }

    });

    socket.on('disconnect', function(msg) {
        try {
            console.log('closed' + socket.conn.id);
            var connectionId = socket.conn.id;
            var userId = app.locals.appData.activeConnections[connectionId];
            socket_service.removeUser(userId, connectionId)
        } catch (e) {
            console.log(e);
        }
    })

    socket.on('open', function(userDetails) {
        try {
            console.log('opened : ' + JSON.stringify(userDetails));
            var connectionId = socket.conn.id;
            console.log(socket.conn.id);
            socket_service.addUser(userDetails, connectionId);
            socket_service.sendAllActiveUsersList();


        } catch (error) {
            console.log(error);
        }
    })

    socket.on('remove', function(user) {
        try {
            socket_service.removeUser(user.uid, socket.conn.id);
            socket_service.sendAllActiveUsersList();
        } catch (error) {
            console.log(error);
        }
    })

});

http.listen(port, function() {
    console.log('listening on *:' + port);
});
exports.app = app;