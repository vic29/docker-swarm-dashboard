
const srv = require('./server.js');
const io = require('socket.io')(srv.getServer());

module.exports = {

    onConnection: function(callback) {
        io.on('connection', callback);
    },
    
    broadcast: function(channel, msg) {
        io.sockets.emit(channel, msg);
    },

    getOnlineConnections: function() {
        return io.sockets.sockets;
    }

}