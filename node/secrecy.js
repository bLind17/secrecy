var path = require('path');
const secrecyServer = require(path.resolve( __dirname, './secrecy_server.js'));

const WebSocket = require('ws');

/**
 * does nothing
 */
function noop() {}

/**
 * When a websocket client sends a pong message,
 * we consider that a heartbeat and call it alive
 */
function heartbeat() {
  this.isAlive = true;
}

/**
 * Websocket server instance
 */
const wss = new WebSocket.Server({ port: 1338, host: '0.0.0.0' })

wss.on('connection', function connection(ws) {
  secrecyServer.handleSocketClient(ws);
  
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

/**
 * Every X seconds we send a ping to our clients. If they return a pong,
 * they will stay alive and connected. If they don't, in the next cycle we
 * terminate their connection, to prevent zombie sockets walking around.
 */
const interval = setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping(noop);
	});
}, 30 * 1000);

console.log("Secrecy server started.");