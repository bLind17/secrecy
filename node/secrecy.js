const express = require('express');
const path = require('path');

const secrecyServer = require('secrecy_server');
const WebSocket = require('ws');

/*
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const name = 'secrecy_node';
const port = '1337';

app.set('views', path.join(__dirname, 'pug'));
app.set('view engine', 'pug');
app.use('/games/secrecy/api', function (req, res) {
	secrecyServer.handleApiRequest(req, res);
});

app.use('/games/secrecy/js', express.static(path.join(__dirname, 'js')));

app.get('/games/secrecy/host', function (req, res) {
	secrecyServer.handleHostRequest(req, res);
});

app.get('/games/secrecy/play', function (req, res) {
	secrecyServer.handlePlayRequest(req, res);
});

app.get('/games/secrecy', function (req, res) {
	secrecyServer.handleRequest(req, res);
});
*/
function noop() {}

function heartbeat() {
  this.isAlive = true;
}

const wss = new WebSocket.Server({ port: 1338, host: '0.0.0.0' })

wss.on('connection', function connection(ws) {
  secrecyServer.handleSocketClient(ws);
  
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
	//console.log("ping");
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping(noop);
	});
}, 30000);

console.log("Websockets running.");

/*
io.on('connection', ws => {
	secrecyServer.handleSocketClient(ws);
	console.log(ws._socket.remoteAddress + " connected."); 
})

server.listen(port, '0.0.0.0', () => {
	console.log(`${name} is listening on port ${port}`);
});
*/
