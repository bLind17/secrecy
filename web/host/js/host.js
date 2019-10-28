var session = {};

function reset(timeout, autoRoom = true) {
	session = {};
	session.players = {};
	
	if(autoRoom) {
		$("#roomCode").html("----");
		$("#roomCode").off('click');
	} else {
		$("#roomCode").html("<i class='refresh fa fa-redo-alt'></i>");
		$("#roomCode").click(function() {
			reset(0);
		});
	}		
	
	buildPlayerList();
	
	secrecy.onWsOpen = function () {
		secrecy.log("open");
		if(autoRoom) {
			secrecy.sendCommand('create'); // create a room when connecting
		}
	};
	secrecy.onWsClose = function () {
		reset(3000);
	};
	
	secrecy.onWsError = function () {
		reset(3000);
	};
	
	setTimeout(function () {
		secrecy.connect();
	}, timeout);
}

function buildPlayerList() {
	$('#playerList').empty();
	$('#playerList').append($(
		"<th>Name</th>" +
		"<th><i class='fas fa-check-square'></i></th>" +
		"<th><i class='fas fa-check-circle'></i></th>" +
		"<th>Score</th>"
	));
	
	secrecy.log("Cleared players.");
	
	var sortedIDs = getSortedPlayerIDs();
	for(var i = 0; i < sortedIDs.length; i++) {
		var id = sortedIDs[i];
		
		var player = session.players[id];
		var name = player.name;	
		var score = player.score;	
		
		console.log("Adding: " + name);
		$('#playerList').append($( "<tr class='player' id='" + id + "'>" 
		+ "<td>" + name + "</td>"
		+ "<td><i class='fas fa-check-square collectCheck'></i></td>"
		+ "<td><i class='fas fa-check-circle guessCheck'></i></td>"
		+ "<td class='scoreCell'>" + score + "</td>"
		+ "</tr>" ));
	}
}

function getSortedPlayerIDs() {
	var keys = Object.keys(session.players);
	return keys.sort(function(a,b){
		var playerA = session.players[a];
		var playerB = session.players[b];
		var scoreDiff = playerB.score - playerA.score;
		if(scoreDiff != 0) {
			return scoreDiff;
		}
		
		return playerA.name.localeCompare(playerB.name);
	});
}

function updatePlayerScore(playerID, round, total) {
	$("#" + playerID).find(".scoreCell").text("+" + round);
	session.players[playerID].score = total;
}

function playerJoined(name, id, score) {
	if(session.players[id] != undefined) {
		return;
	}
	
	$("#playerList").show();
	$("#startGame").show();
	
	session.players[id] = {};
	session.players[id].name = name;
	session.players[id].score = score;
	buildPlayerList();
}

function playerLeft(id) {
	if(session.players[id] == undefined) {
		return;
	}
	
	delete session.players[id];
	buildPlayerList();
}

secrecy.on("created", function(params) {
	secrecy.sendCommand("join", params[0], "ROOM");
	secrecy.setRoomCode(params[0]);
	secrecy.hideGameElementsExcept("roomCodeInformation");
});

secrecy.on("joined", function(params) {
	playerJoined(params[0], params[1], params[2]);
});

secrecy.on("left", function(params) {
	playerLeft(params[1]);
});

secrecy.on("yesno", function(params) {
	$("#" + params[0]).find(".collectCheck").css('visibility', 'visible');
});

secrecy.on("guess", function(params) {
	$("#" + params[0]).find(".guessCheck").css('visibility', 'visible');
});

secrecy.on("score", function(params) {
	updatePlayerScore(params[0], parseInt(params[1]), parseInt(params[2]));
});

secrecy.on("roundEnd", function(params) {
	secrecy.hideGameElementsExcept();
});

secrecy.on("readyForNewRound", function(params) {
	buildPlayerList();
	secrecy.hideGameElementsExcept("reopen", "startGame");
});

secrecy.on("exhausted", function(params) {
	secrecy.showDialog("I am sorry!", "Someone is creating too many rooms. Please try again shortly!");	
});

secrecy.on("started", function(params) {
	session.hasBeenStarted = true;
	secrecy.hideGameElementsExcept("cancelRound");
	hideAllCheckMarks();
});

secrecy.on("cancelled", function(params) {
	hideAllCheckMarks();
	secrecy.hideGameElementsExcept("reopen", "startGame");
});

secrecy.on("collectionDone", function(params) {
	secrecy.hideGameElementsExcept("endRound");
});

function hideAllCheckMarks() {
	$(".collectCheck").css('visibility', 'hidden');
	$(".gussCheck").css('visibility', 'hidden');
}

function startGame() {	
	secrecy.sendCommand("start");
}

$(document).ready(function() {
	$("#startGame").click(function() {
		if(!session.hasBeenStarted && Object.keys(session.players).length < 3) {
			secrecy.showDialog("Not enough players", "You should not play this game with less than 3 people. Are you sure you want to play anyway?", startGame, "Yes", "No");	
		} else {
			startGame();
		}
	});
	
	
	$("#cancelRound").click(function() {
		secrecy.sendCommand("cancelRound");
	});
	
	$("#CrashButton").click(function() {
		secrecy.sendCommand("pleaseCrash");
	});
	
	$("#endRound").click(function() {
		secrecy.sendCommand("endround");
	});
	
	$("#reopen").click(function() {		
		secrecy.sendCommand("reopen");
		secrecy.hideGameElementsExcept("startGame", "roomCodeInformation", "reopen");
		hideAllCheckMarks();
	});
	
	// START
	reset(0);
});