const path = require('path');

const secrecyServer = require('secrecy_server');
const WebSocket = require('ws');

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

// keep clients alive (webhost requires this)
const interval = setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping(noop);
	});
}, 30000);

console.log("Websockets running.");