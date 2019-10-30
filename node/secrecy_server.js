var path = require('path');

const secrecyServer = require(path.resolve( __dirname, './secrecy_server.js'));
const game = require(path.resolve( __dirname, './secrecy_game.js'));
const utils = require(path.resolve( __dirname, './secrecy_utils.js'));
const nodeutil = require('util');
const fs = require('fs');

var server = {};

server.setRoomRuler = function(room, ruler) {
	room.setRulerSocket(ruler.ws);		
	ruler.ws.send(utils.createMessage("ruler", "You are the ruler now."));
};

server.onJoin = function(player, params) {
	if(game.getPlayerRoom(player.playerID) != undefined) {
		player.ws.send(utils.createMessage("info", "You can only join one room."));
		return;
	}
			
	var roomName = params[0].toUpperCase();
	var room = game.getRoom(roomName);
	if(room == undefined) {
		player.ws.send(utils.createMessage("noroom", "This room does not exist."));
		console.log("[GAME] Room (" + roomName + ") does not exist.");
		return;
	}
	
	if(params.length != 2) {
		player.ws.send(utils.createMessage("joinerror", "Please don't do that."));
		return;
	}

	var playerAlias = params[1];		
	player.setName(playerAlias);

	if(room.isFresh()) {
		room.setRoomSocket(player.ws);
		player.ws.send(utils.createMessage("info", "You are the room. You are the fire."));
		server.writeLog(nodeutil.format("Room %s host joined.", room.roomCode));
		return;
	} else if (room.isLobby()) {
		var player = room.playerJoin(player.playerID);
		
		// inform room of new player
		var rs = room.getRoomSocket();
		rs.send(utils.createMessage("playerJoined", player.getName(), player.playerID, room.score.getPoints(player.playerID)));
		
		// inform player that join worked
		player.ws.send(utils.createMessage("joined", roomName));
		
		// inform other players of new player
		room.sendToAll(utils.createMessage("playerJoined", player.getName(), player.playerID, room.score.getPoints(player.playerID)));
		
		// inform new player of old players
		var oldPlayers = room.getPlayers();
		for(var i = 0; i < oldPlayers.length; i++) {
			var op = oldPlayers[i];
			if(op == player) {
				continue;
			}
			player.ws.send(utils.createMessage("playerJoined", op.getName(), op.playerID, room.score.getPoints(op.playerID)));
		}
		
		if(room.getPlayerCount() == 1) {
			server.setRoomRuler(room, player);
		}
		
		server.writeLog(nodeutil.format("Room %s player joined.", room.roomCode));
		
		return;
	} else {
		player.ws.send(utils.createMessage("roomBusy", roomName));
	}
}

server.questionFinished = function(room, question) {
	console.log("[" + room.roomCode + "] Question finished, calulating score...");
	question.updateScore(room.score);
		
	var yesses = question.getCorrectGuess();
	var noes = question.getYesNoCount() - yesses;
		
	var rs = room.getRoomSocket();
	rs.send(utils.createMessage("collectionDone", yesses, noes));
	var ruler = room.getRulerSocket();
	if(ruler != undefined) {
		ruler.send(utils.createMessage("collectionDone"));
	}
}

server.writeLog = function(text) {
	var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var path = __dirname + '/../logs.txt';
	var message = nodeutil.format("[%s] %s\n", time, text);
	fs.appendFileSync(path, message);
}

server.onCommand = function(ws, command, params) {
	var playerID = ws.secGameID;
	var player = game.getPlayer(playerID);
	
	if(command == "create") {
		var room = game.createRoom();
		if(room == undefined) {
			ws.send(utils.createMessage("exhausted", "Someone is creating too many games. Please try again in a few seconds."));
			return;	
		}
		
		ws.send(utils.createMessage("created", room.roomCode));
		server.writeLog(nodeutil.format("Room %s created.", room.roomCode));
		
		return;
	}
	
	if(command == "pleaseCrash") {
		crash.exe.start.lol();
		return;
	}

	if(player == undefined) {
		console.log("[GAME] Command requires registered player: " + command);
		return;
	}
	
	if(command == "join") {
		server.onJoin(player, params);
		return;
	}
		
	if(command == "start") {
		var room = game.getPlayerRoom(player.playerID);
		if(room == undefined) {
			player.ws.send(utils.createMessage("info", "You must BE a room first."));
			return;
		}
		
		var rs = room.getRoomSocket();
		if(player.ws != rs && player.ws != room.getRulerSocket()) {
			player.ws.send(utils.createMessage("info", "You are not allowed to do that."));
			return;
		}
		
		room.startRound();
		rs.send(utils.createMessage("started"));
		room.sendToAll(utils.createMessage("collect"));
		return;
	}
	
	if(command == "cancelRound") {
		var room = game.getPlayerRoom(player.playerID);
		if(room == undefined) {
			player.ws.send(utils.createMessage("info", "You must BE a room first."));
			return;
		}
		
		var rs = room.getRoomSocket();
		if(player.ws != rs && player.ws != room.getRulerSocket()) {
			player.ws.send(utils.createMessage("info", "You are not allowed to do that."));
			return;
		}
		
		rs.send(utils.createMessage("cancelled"));
		room.sendToAll(utils.createMessage("cancelled"));
		room.cancelRound();
		return;
	}
	
	if(command == "rulerInfo") {
		var room = game.getPlayerRoom(player.playerID);
		if(room == undefined) {
			player.ws.send(utils.createMessage("info", "You must BE a room first."));
			return;
		}
		
		if(player.ws != room.getRoomSocket() && player.ws != room.getRulerSocket()) {
			player.ws.send(utils.createMessage("info", "You are not allowed to do that."));
			return;
		}
		
		player.ws.send(utils.createMessage("rulerInfo", params[0], room.getPlayerCount()));
		return;
	}
	
	if(command == "reopen") {
		if(room == undefined) {
			player.ws.send(utils.createMessage("info", "You must BE a room first."));
			return;
		}
		
		var rs = room.getRoomSocket();
		if(player.ws != rs && player.ws != room.getRulerSocket()) {
			player.ws.send(utils.createMessage("info", "You are not allowed to do that."));
			return;
		}
		
		room.reopen();
		rs.send(utils.createMessage("reopened"));
		room.sendToAll(utils.createMessage("reopened"));
		
		return;
	}
	
	if(command == "collect") {
		var room = game.getPlayerRoom(player.playerID);
		var question = room.question;
		if(question == undefined) {
			return;
		}
		
		question.addYesNo(params[0] == "1");
		
		var rs = room.getRoomSocket();
		rs.send(utils.createMessage("playerSentYesNo", playerID));
		
		var playerCount = room.getPlayerCount();
		player.ws.send(utils.createMessage("guess", playerCount));
				
		return;
	}
	
	if(command == "guess") {
		var room = game.getPlayerRoom(player.playerID);
		var question = room.question;
		if(question == undefined) {
			return;
		}
		
		question.addGuess(playerID, parseInt(params[0]));
		
		var rs = room.getRoomSocket();
		rs.send(utils.createMessage("playerSentGuess", playerID));
		
		player.ws.send(utils.createMessage("guessed"));
		
		var playerCount = room.getPlayerCount();
		var guessCount = question.getGuessCount();
		if(playerCount == guessCount) {
			room.sendToAll(utils.createMessage("everyone guessed"));
			server.questionFinished(room, question);
		}
		
		return;
	}
	
	if(command == "endround") {
		var room = game.getPlayerRoom(player.playerID);
		if(room == undefined) {
			player.ws.send(utils.createMessage("info", "You must BE a room first."));
			return;
		}
		
		var rs = room.getRoomSocket();
		if(player.ws != rs && player.ws != room.getRulerSocket()) {
			player.ws.send(utils.createMessage("info", "You are not allowed to do that."));
			return;
		}
				
		var correct = room.question.getCorrectGuess();
		
		var playerIDs = room.getPlayerIDs();
		for(var i = 0; i < playerIDs.length; i++) {
			var playerID = playerIDs[i];
			var player = room.getPlayer(playerID);
			if(player == undefined) {
				console.log("[" + room.roomCode + "] Player not found: " + playerID);
				continue;
			}
			
			player.ws.send(utils.createMessage("score", room.score.getLastRoundsPoints(playerID), room.score.getPoints(playerID), correct));
			rs.send(utils.createMessage("newPlayerScore", player.playerID, room.score.getLastRoundsPoints(playerID), room.score.getPoints(playerID)));
			room.sendToAll(utils.createMessage("newPlayerScore", player.playerID, room.score.getLastRoundsPoints(playerID), room.score.getPoints(playerID)));
		}	
		
		room.question = undefined;
		
		rs.send(utils.createMessage("readyForNewRound"));
		room.sendToAll(utils.createMessage("readyForNewRound"));
		
		return;
	}
	
	if(command == "showScoreCards") {
		var room = game.getPlayerRoom(player.playerID);
		if(room == undefined) {
			player.ws.send(utils.createMessage("info", "You must BE a room first."));
			return;
		}
		
		var rs = room.getRoomSocket();
		if(player.ws != rs && player.ws != room.getRulerSocket()) {
			player.ws.send(utils.createMessage("info", "You are not allowed to do that."));
			return;
		}	
		
		var room = game.getPlayerRoom(player.playerID);
		rs.send(utils.createMessage("showScoreCards"));
		room.sendToAll(utils.createMessage("showScoreCards"));
		return;
	}
}

server.handleSocketClient = function(ws) {
	ws.on('disconnect', function() {
      console.log('[SERVER] Got disconnect!');
	});
	
	ws.on('close', function() {
		var playerID = ws.secGameID;
	
		console.log('[SERVER] Got close!');
		
		var room = game.getPlayerRoom(playerID);
		if(room == undefined) {
			return;
		}
		
		var rs = room.getRoomSocket();
		if(rs == ws || room.isEmpty()) {
			game.deleteRoom(room);
			console.log("[GAME] Deleted: " + room.roomCode);
			server.writeLog(nodeutil.format("Room %s deleted.", room.roomCode));
			return;
		}

		var player = room.getPlayer(playerID);
		if(player == undefined) {
			return;
		}

		if(rs != undefined && rs.readyState == 1) {
			rs.send(utils.createMessage("playerLeft", player.getName(), player.playerID));
			room.sendToAll(utils.createMessage("playerLeft", player.getName(), player.playerID));
		}
		
		server.writeLog(nodeutil.format("Room %s player left.", room.roomCode));
				
		room.playerLeft(playerID);
		game.unsetPlayerRoom(playerID);
		
		if(room.getRulerSocket() == player.ws) {
			var newRuler = room.getRandomPlayer();
			if(newRuler != undefined) {
				server.setRoomRuler(room, newRuler);
			}
		}
	});
		
	ws.on('message', message => {
		var splitsies = message.split(/:(.+)/);
		
		var command = splitsies[0];
			
		var params = [];
		if(splitsies.length > 1) {
			params = splitsies[1].split(';');
		}	
		
		console.log(command);
		server.onCommand(ws, command, params);
	});
	
	game.registerPlayer(ws);
}

server.onRoomClosed = function(room, message) {
	var ws = room.getRoomSocket();
	if(ws != undefined) {
		ws.send("Room closed: " + message);
	}
}

module.exports = server;