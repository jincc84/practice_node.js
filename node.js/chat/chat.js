var http = require('http').createServer(handler);
var io = require('socket.io').listen(http);
var util = require('util');
var fs = require('fs');
var clog = require('clog');

var clients = [];

http.listen(4000);

function handler(request, response) {
	response.writeHead(200, {
		'Content-Type':'text/html'
	});

	var rs = fs.createReadStream(__dirname + '/template.html');

	util.pump(rs, response);
};

io.sockets.on('connection', function(socket) {
	var username;

	clients.push(socket);
	socket.emit('welcome', {'salutation':'Welcome to this chat server!'});
	socket.emit('welcome', {'salutation':'Please input your username:'});

	socket.on('data from client', function(data) {
		clog.log('message ' + data.text);
		if(!username) {
			username = data.text;
			socket.emit('data from server', {'message': 'Welcome, ' + username + '!'});
			return;
		}
		var feedback = username + '(' + socket.id + ') : ' + data.text;

		clients.forEach(function(_socket) {
			_socket.emit('data from server', {'message': feedback});
		});
	});

	socket.on('disconnect', function() {
		var splice_idx = -1;
		var disconnect_username = username ? username : 'guest';
		disconnect_username += '(' + socket.id + ')';
		for(var i=0; i<clients.length; i++) {
			var _socket = clients[i];
			if(socket.id == _socket.id) {
				clog.info("disconnect socket.id:" + socket.id);
				splice_idx = i;

				continue;
			}

			_socket.emit('disconnect client', {'username': disconnect_username});
		}

		if(splice_idx > -1) {
			clog.info("splice clients[" + splice_idx + "], socket.id:" + socket.id);
			clients.splice(splice_idx, 1);
		}

		clog.info('clients.length: ' + clients.length);
	});
});


