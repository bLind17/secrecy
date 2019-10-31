var uuid = require("uuid");
var path = require('path');
const utils = require(path.resolve( __dirname, './secrecy_utils.js'));

/**
* Score class keeps track of the score of a game
* while also remembering the score delta of the last round
*/
class Score {
	constructor() {
		/**
		* A collection of playerIDs -> points
		* States the current score a player has achieved
		*/
		this.points = {};
		/**
		* A collection of playerIDs -> points
		* States the score a player has achieved during the last round
		*/
		this.lastRoundsPoints = {};
		/**
		* Deleted scores
		* When a player leaves, their points will be stowed away here, in case they come back
		*/
		this.deletedScores = {};
	}
	
	/**
	* Removes a player's score from the active point collection
	* To the collection for deleted player's points
	* @param playerID player's id
	*/
	deleteScore(playerID) {
		this.deletedScores[playerID] = this.points[playerID];
		delete this.points[playerID];
	}
	
	/**
	* Checks if the given player has had a score before but left.
	* @param playerID player's id
	* @return true if player has a score that has been deleted
	*/
	hasDeletedScore(playerID) {
		return this.deletedScores[playerID] != undefined;
	}
	
	/**
	* Iff the given player has an entry in the deleted score list,
	* their old score will be given to them again.
	* @param playerID player's id
	*/
	reactivateDeletedScore(playerID) {
		if(!this.hasDeletedScore(playerID)) {
			return;
		}
		
		this.points[playerID] = this.deletedScores[playerID];
		delete this.deletedScores[playerID];
	}
	
	/**
	* Sets the points for a player to a fixed value
	* @param playerID player's id
	* @param points new score
	*/
	setPoints(playerID, points) {
		if(this.points[playerID] == undefined) {
			this.points[playerID] = 0;
		}
		
		this.points[playerID] = points;
		this.lastRoundsPoints[playerID] = points;
	}
	
	/**
	* Adds a number of points to the points already scored
	* @param playerID player's id
	* @param points new score
	*/
	addPoints(playerID, points) {
		if(this.points[playerID] == undefined) {
			this.points[playerID] = 0;
		}
		
		this.points[playerID] += points;
		this.lastRoundsPoints[playerID] = points;
	}
	
	/**
	* Retrieve the score of a player
	* @param playerID player's id
	* @return score of a player
	*/
	getPoints(playerID) {
		if(this.points[playerID] == undefined) {
			return 0;
		}
		
		return this.points[playerID];
	}
	
	/**
	* Calculates the average score of all active players
	* @return average score
	*/
	getAveragePoints() {
		return this.__getAverage(this.points);
	}
	
	/**
	* Calculates the minimum score of all players (even the idle ones)
	* @return minimum score of all players
	*/
	getMinimumPoints() {
		var min = -1;
		
		for(var playerID in this.points) {
			var points = this.points[playerID];
			if(min < 0 || points < min) {
				min = points;
			}
		}
		
		for(var playerID in this.deletedScores) {
			var points = this.deletedScores[playerID];
			if(min < 0 || points < min) {
				min = points;
			}
		}
		
		return Math.max(min, 0);
	}
	
	/**
	* Calculates the average score of all players in the given map
	* @param collection a map of scores (key -> numeric value)
	* @return average score, rounded
	*/
	__getAverage(collection) {
		var sum = 0;
		var count = 0;
		for(var playerID in collection) {
			var points = collection[playerID];
			sum += points;
			count++;
		}
		
		if(count == 0) {
			return 0;
		}
		
		return Math.round(sum/count);
	}
	
	/**
	* The score class remembers the points that were scored last round,
	* but has no concept of what a round is.
	* This method basically tells the score that the current round started.
	*
	* When a round starts, the last round's scores will be forgotten
	* When a round ends, idle players will be rewarded with the average round score
	* so that they can keep up, if their device fails or they need to take a break.
	*/
	startUpdate() {
		this.lastRoundsPoints = {};	
	}
	
	/**
	* The score class remembers the points that were scored last round,
	* but has no concept of what a round is.
	* This method basically tells the score that the current round ended.
	*
	* When a round starts, the last round's scores will be forgotten
	* When a round ends, idle players will be rewarded with the average round score
	* so that they can keep up, if their device fails or they need to take a break.
	*/
	endUpdate() {
		var averageRoundScore = this.__getAverage(this.lastRoundsPoints);
		for(var playerID in this.deletedScores) {
			this.deletedScores[playerID] += averageRoundScore;
		}
	}
	
	/**
	* Retrieve the delta points for a player scored during the last round
	* @param playerID the player's id
	* @return points the player scored last round
	*/
	getLastRoundsPoints(playerID) {
		if(this.lastRoundsPoints[playerID] == undefined) {
			return 0;
		}
		
		return this.lastRoundsPoints[playerID];
	}
}

class Question {
	constructor() {
		this._yesses = 0;
		this._noes = 0;
		this._guesses = {};
	}
	
	addYesNo(yes) {
		if(yes) {
			this._yesses++;
		} else {
			this._noes++;
		}
	}
	
	getYesNoCount() {
		return this._yesses + this._noes;
	}
	
	addGuess(playerID, guess) {
		this._guesses[playerID] = guess;
	}
	
	getGuessCount() {
		return Object.keys(this._guesses).length;
	}
	
	getCorrectGuess() {
		return this._yesses;
	}
	
	updateScore(score) {
		score.startUpdate();
		
		var correctGuess = this.getCorrectGuess();
		
		for(var playerID in this._guesses) {
			var guess = this._guesses[playerID];
			if(guess == correctGuess) {
				score.addPoints(playerID, 3);
			} else if(correctGuess == 1 && guess == 0) {
				continue; // no points to keep privacy
			} else if(correctGuess == this.getYesNoCount() - 1 && guess == this.getYesNoCount()) {
				continue; // no points to keep privacy
			} else if (guess == correctGuess + 1 || guess == correctGuess - 1) {
				score.addPoints(playerID, 1);
			}
		}
		
		score.endUpdate();
	}
}

class Player {
	constructor(ws, name, id) {
		this.ws = ws;
		this._name = name;
		this.playerID = id;
		this._score = 0;
	}
	
	setName(name) {
		if(name.includes(";")) {
			console.log("[Player] Invalid character in name " + name);
			return;
		}
		if(name.length > 18) {
			name = name.substr(0, 18);
		}
		
		this._name = name;
	}
	
	getName() {
		return this._name;
	}
}

class Room {
	constructor(game, roomCode) {
		this.game = game;
		this.score = new Score();
		
		this.roomCode = roomCode;
		this.roomClosedListener = undefined;
		this._roomSocket = undefined;
		this._rulerSocket = undefined;
		
		this.STATUS_FRESH = 0;
		this.STATUS_LOBBY = 1;
		this.STATUS_RUNNING = 2;
		this.STATUS_SCORE = 3;
		
		this.players = {};
		
		this.status = this.STATUS_FRESH;
		console.log("[GAME] Room (" + roomCode + ") has been created.");
	}
	
	sendToAll(message) {
		for(var id in this.players) {
			var ws = this.players[id].ws;
			if(ws.readyState == 1) {
				ws.send(message);
			}
		}
	}
	
	reopen() {
		if(this.status == this.STATUS_RUNNING && this.question == undefined) {
			this.status = this.STATUS_LOBBY;
			console.log("[" + this.roomCode + "] Reopened lobby.");
		}
	}
	
	startRound() {
		this.status = this.STATUS_RUNNING;
		this.question = new Question();
		
		console.log("[" + this.roomCode + "] Started round.");
	}
	
	cancelRound() {
		this.question = undefined;
		
		console.log("[" + this.roomCode + "] Cancelled round.");
	}
	
	setRoomSocket(ws) {
		if(ws != undefined) {
			this._roomSocket = ws;
			this.status = this.STATUS_LOBBY
			this.game.setPlayerRoom(ws.secGameID, this);
		}
	}
	
	getRoomSocket() {
		return this._roomSocket;
	}
	
	setRulerSocket(ws) {
		this._rulerSocket = ws;
	}
	
	getRulerSocket() {
		return this._rulerSocket;
	}
	
	getPlayerNames() {
		var names = [];
		for(var key in this.players) {
			names.push(this.players[key].getName());
		}
		return names;
	}
	
	getPlayer(playerID) {
		return this.players[playerID];
	}
	
	getPlayerIDs() {
		return Object.keys(this.players);
	}
	
	getPlayers() {
		return Object.values(this.players);
	}
	
	__getRandomPlayerID() {
		var ids = this.getPlayerIDs();
		var index = Math.floor(Math.random() * Math.floor(ids.length));
		return ids[index];
	}
	
	getRandomPlayer() {
		return this.players[this.__getRandomPlayerID()];
	}
	
	playerJoin(playerID) {		
		if(!this.isFresh() && !this.isLobby()) {
			return null;
		}
				
		var player = this.game.getPlayer(playerID);
		this.players[playerID] = player;
		
		if(this.score.hasDeletedScore(playerID)) {
			this.score.reactivateDeletedScore(playerID);
			console.log("Reactivating old score for player: " + playerID);
		} else {
			var minimum = this.score.getMinimumPoints();
			this.score.setPoints(playerID, minimum);
			console.log("Giving player the minimum score: " + playerID);
		}
		
		return player;
	}
	
	playerLeft(playerID) {		
		var player = this.players[playerID];
		if(player == undefined) {
			return;
		}
		
		delete this.players[playerID];
		this.score.deleteScore(playerID);
		if(player.getName() != undefined) {
			console.log("[" + this.roomCode + "] " + player.getName() + " left");	
		}
	}
	
	getPlayerCount() {
		return Object.keys(this.players).length;
	}
	
	isEmpty() {
		return this.getPlayerCount() == 0;
	}
	
	isFresh() {
		return this.status == this.STATUS_FRESH;
	}
	
	isLobby() {
		return this.status == this.STATUS_LOBBY;
	}
	
	isRunning() {
		return this.status == this.STATUS_RUNNING;
	}
	
	startGame() {
		this.status = this.STATUS_RUNNING;
	}
}

class Game {
	constructor() {
		// collection of rooms, mapped by room code
		// maps from room code to room (code -> room)
		this.rooms = {};
		// collection of players mapped (playerID -> player);
		this.players = {};
		// collection of players and their respective room (if joined)
		// maps from playerID to a room (playerID -> code)
		this.playerRooms = {};
		// collection of IDs that were valid once but left.
		this.deletedIDs = [];
		
		this._roomCreatesPerSecond = new Array(60).fill(0);
		this._roomCreatesCursor = 0;
		
		var _this = this;
		setInterval(function() {
			_this._roomCreatesCursor = (_this._roomCreatesCursor + 1) % 60;
			_this._roomCreatesPerSecond[_this._roomCreatesCursor] = 0;
		}, 1000);
	}
	
	_registerRoomCreate() {
		this._roomCreatesPerSecond[this._roomCreatesCursor]++;
	}
	
	_checkRoomCreatePossible() {
		var checkSeconds = 5;
		var maxRooms = 5;
		
		var roomsCreated = 0;
		var i = 0;
		for(i = 0; i < checkSeconds; i++) {
			var cursor = (this._roomCreatesCursor - i + this._roomCreatesPerSecond.length) % this._roomCreatesPerSecond.length;
			roomsCreated += this._roomCreatesPerSecond[cursor];
		}
		
		return roomsCreated < maxRooms;
	}

	_addRoom(room) {
		if(room == undefined) {
			throw "Cannot add undefined as a room.";
		}

		if(this.hasRoomWithCode(room.roomCode)) {
			throw "Room already exists.";
		}

		this.rooms[room.roomCode] = room;
		this.__attachAutoDeleteTimer(room);
	};
	
	__attachAutoDeleteTimer(room) {
		var _this = this;
		if(room.autoDeleteTimeout != undefined) {
			clearTimeout(room.autoDeleteTimeout);
		}
		
		room.autoDeleteTimeout = setTimeout(function() {
			if(room.getPlayerCount() == 0) {
				_this.deleteRoom(room);
				console.log("[GAME] Room " + room.roomCode + " autodelete.");
				
				if(room.roomClosedListener != undefined) {
					room.roomClosedListener(room, "No players joined.");
				}
				
				delete room.autoDeleteTimeout;
			}
		}, 120 * 1000);
	}
	
	notifyRoomEmpty(room) {
		this.__attachAutoDeleteTimer(room);
	}
	
	registerPlayer(ws) {
		if(ws.secGameID == undefined) {
			var id = uuid.v4();
			ws.secGameID = id;
			this.players[id] = new Player(ws, "Hackerman", id);
			console.log("[GAME] Player registered: " + this.players[id].getName() + " " + id);
		}
	}
	
	unregisterPlayer(playerID) {
		var player = this.players[playerID];
		delete this.players[playerID];
		delete this.playerRooms[playerID];
		this.deletedIDs.push(playerID);
		console.log("[GAME] Player unregistered: " + (player == undefined ? "undefined" : player.getName()) + " " + playerID);
	}
	
	isDeletedPlayerID(playerID) {
		return this.deletedIDs.includes(playerID);
	}
	
	resetPlayerID(player, newPlayerID) {
		if(!this.isDeletedPlayerID(newPlayerID)) {
			return;
		}
		
		var oldPlayerID = player.playerID;
		
		var room = this.playerRooms[oldPlayerID];
		if(room != undefined) {
			// only allowed for players who did not join any rooms yet
			return;
		}
		
		// update player list
		delete this.players[oldPlayerID];
		this.players[newPlayerID] = player;
		
		// update room list
		delete this.playerRooms[oldPlayerID];
		this.playerRooms[newPlayerID] = room;
		
		// update player and socket
		player.playerID = newPlayerID;
		player.ws.secGameID = newPlayerID;
		
		// remove newPlayerID from deleted IDs
		this.deletedIDs = this.deletedIDs.filter(function(element) { return element != newPlayerID });
		
		console.log("Changed playerID " + oldPlayerID + " -> " + newPlayerID);
	}
	
	getPlayer(playerID) {
		return this.players[playerID];
	}
	
	setPlayerRoom(playerID, room) {
		this.playerRooms[playerID] = room;
	}
	
	getPlayerRoom(playerID) {
		return this.playerRooms[playerID];
	}
	
	getRoom(roomCode) {
		return this.rooms[roomCode];
	}

	hasRoomWithCode(roomCode) {
		if(roomCode == undefined) {
			return false;
		}

		return this.rooms[roomCode] != undefined;
	};

	createRoom() {
		if(!this._checkRoomCreatePossible()) {
			console.log("[GAME] Too many rooms are being created.");
			return undefined;
		}
		
		var id = undefined;
		while(true) {
			id = uuid.v4();
			id = id.substring(0, 4).toUpperCase();

			if(!this.hasRoomWithCode(id)) {
				break;
			}
		}

		var r = new Room(this, id);
		this._addRoom(r);
		
		this._registerRoomCreate();
		
		return r;
	};
	
	deleteRoom(room) {
		room.sendToAll(utils.createMessage("bye"));
		
		var rs = room.getRoomSocket();
		if(rs != undefined && rs.readyState == 1) {
			rs.send(utils.createMessage("idle", "No players have joined within 2 minutes or all players have left the game. Deleting room."));
			rs.close();
		}
		
		for(var id in room.players) {
			room.players[id].ws.close();
			this.unregisterPlayer(id);
		}
		
		delete this.rooms[room.roomCode];
		
		this.logStatus();
	}
	
	logStatus() {
		var roomCount = Object.keys(this.rooms).length;
		var playerCount = Object.keys(this.players).length;
		var playersInRoomsCount = Object.keys(this.playerRooms).length;
		
		console.log("Open rooms: " + roomCount);
		console.log("Players online: " + playerCount);
		console.log("Players ingame: " + playersInRoomsCount);
	}
}

var sec = new Game();

module.exports = sec;
