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

var idx = 1;
io.sockets.on('connection', function(socket) {
	clients.push(socket);

	var username = "test" + idx++;
	var welcome = {
			salutation: 'Welcome to this chat server!',
			username: username,
			id: socket.id
	};

	socket.emit('welcome', welcome);

	/*
	 * notice other connected user
	 * */
	clients.forEach(function(_socket) {
		_socket.emit('connect client', {'username': username});
	});

	/*
	 * chat data
	 * */
	socket.on('data from client', function(data) {
		clog.log('message ' + data.text);
		if(!username) {
			username = data.text;
			socket.emit('data from server', {'message': 'Welcome, ' + username + '!'});
			return;
		}

		var feedback = {
				username: username,
				id: socket.id,
				text: data.text
		};

		clients.forEach(function(_socket) {
			feedback.isMyData = (socket.id == _socket.id);
			_socket.emit('data from server', feedback);
		});
	});

	/*
	 * disconnect user
	 * */
	socket.on('disconnect', function() {
		var splice_idx = -1;
		var feedback = {
				username : username,
				id: socket.id
		};

		for(var i=0; i<clients.length; i++) {
			var _socket = clients[i];
			if(socket.id == _socket.id) {
				clog.info("disconnect socket.id:" + socket.id);
				splice_idx = i;

				continue;
			}

			_socket.emit('disconnect client', feedback);
		}

		if(splice_idx > -1) {
			clog.info("splice clients[" + splice_idx + "], socket.id:" + socket.id);
			clients.splice(splice_idx, 1);
		}

		clog.info('clients.length: ' + clients.length);
	});
});


