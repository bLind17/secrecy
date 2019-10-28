var session = {};

function reset(timeout, autoRoom = true) {
	session = {};
	session.players = {};
	
	secrecy.onWsOpen = function () {
		if(secrecy.isHost()) {
			if(autoRoom) {
				secrecy.sendCommand('create'); // create a room when connecting
			}
		} else {
			secrecy.hideGameElementsExcept("login");
		}
	};
	
	buildPlayerList();
	
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
	
	hideAllCheckMarks();
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
	secrecy.hideGameElementsExcept("startRound", "roomCodeInformation");
	
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

function startRound() {
	secrecy.sendCommand("start");
	secrecy.hideGameElementsExcept("cancelRound");
}

function showRoundStartDialog() {
	secrecy.showDialog("Not enough players", "You should not play this game with less than 3 people. Are you sure you want to play anyway?", startRound, "Yes", "No");
}

secrecy.on("created", function(params) {
	secrecy.sendCommand("join", params[0], "ROOM");
	secrecy.setRoomCode(params[0]);
	secrecy.hideGameElementsExcept("roomCodeInformation");
});

secrecy.on("playerJoined", function(params) {
	playerJoined(params[0], params[1], params[2]);
});

secrecy.on("joined", function(params) {
	secrecy.setRoomCode(params[0]);
	secrecy.hideGameElementsExcept("wait", "roomCode");
});

secrecy.on("playerLeft", function(params) {
	playerLeft(params[1]);
});

secrecy.on("collect", function(params) {
	session.hasBeenStarted = true;
	session.ongoingRound = true;

	if(session.ruler){
		secrecy.hideGameElementsExcept("yesNo", "cancelRound");
	} else {
		secrecy.hideGameElementsExcept("yesNo");
	}
});

secrecy.on("playerSentYesNo", function(params) {
	$("#" + params[0]).find(".collectCheck").css('visibility', 'visible');
});

secrecy.on("guess", function(params) {
	$('#guess').empty();
	var playerCount = parseInt(params[0]);
	for(var i = 0; i <= playerCount; i++) {
		$("#guess").append($("<input class='guessNumber' type='button' value='" + i + "' />"));
	}
	$(".guessNumber").click(function() {
		secrecy.sendCommand("guess:" + $(this).val());
	});
	
	if(session.ruler){
		secrecy.hideGameElementsExcept("guess", "cancelRound");
	} else {
		secrecy.hideGameElementsExcept("guess");
	}
});

secrecy.on("guessed", function(params) {
	secrecy.hideGameElementsExcept("wait");
	$("#guess").empty();
});

secrecy.on("playerSentGuess", function(params) {
	$("#" + params[0]).find(".guessCheck").css('visibility', 'visible');
});

secrecy.on("score", function(params) {
	session.ongoingRound = false;
	$("#pointsQuestion").text(params[0]);
	$("#pointsGame").text(params[1]);
    secrecy.hideGameElementsExcept("score");
});

secrecy.on("newPlayerScore", function(params) {
	updatePlayerScore(params[0], parseInt(params[1]), parseInt(params[2]));
});

secrecy.on("roundEnd", function(params) {
	secrecy.hideGameElementsExcept();
});

secrecy.on("readyForNewRound", function(params) {
	secrecy.hideGameElementsExcept("score", "startRound");
});

secrecy.on("collectionDone", function(params) {
	secrecy.hideGameElementsExcept("endRound");
});

secrecy.on("bye", function(params) {
	secrecy.showDialog("This is the end.", "Your gamemaster has ended this game. Thanks for playing!");
});

secrecy.on("noroom", function(params) {
	secrecy.showDialog("Whoops.", "This room does not exist. Please check the room code and try again.");
});

secrecy.on("roomBusy", function(params) {
	secrecy.showDialog("Whoops.", "This room is closed for business! If you want to join the running game, please ask the host to reopen it after the ongoing round.");
});

secrecy.on("joinerror", function(params) {
	secrecy.showDialog("Whoops.", "There has been an error. Make sure that your name and room code do not contain any ';', fancy symbols or anything else that you might think could be interpreted as an injection attempt. Behave and vaccinate!");
});

secrecy.on("exhausted", function(params) {
	secrecy.showDialog("I am sorry!", "Someone is creating too many rooms. Please try again shortly!");	
});

secrecy.on("started", function(params) {
	session.hasBeenStarted = true;
	secrecy.hideGameElementsExcept("cancelRound");
	hideAllCheckMarks();
});

secrecy.on("cancel", function(params) {
	session.ongoingRound = false;
	if(session.ruler){
		secrecy.hideGameElementsExcept("startRound");
	} else {
		secrecy.hideGameElementsExcept("wait");
	}
});

secrecy.on("cancelled", function(params) {
	hideAllCheckMarks();
	secrecy.hideGameElementsExcept("reopen", "startRound");
});
			
secrecy.on("ruler", function(params) {
	session.ruler = true;
	if(session.ongoingRound) {
		secrecy.hideGameElementsExcept("cancelRound");
	} else {
		secrecy.hideGameElementsExcept("startRound");
	}
});

secrecy.on("rulerInfo", function(params) {
	switch(params[0]) {
		case 'start':
			if(!session.hasBeenStarted && parseInt(params[1]) < 3) {
				showRoundStartDialog();
			} else {
				startRound();
			}
			break;
	}
});

function hideAllCheckMarks() {
	$(".collectCheck").css('visibility', 'hidden');
	$(".guessCheck").css('visibility', 'hidden');
}

/////
///// ON READY
/////
$(document).ready(function() {
	var oldName = localStorage.getItem('name');
	if(oldName != undefined) {
		$("#name").val(oldName);
	} 
	
	$("#joinButton").click(function() {
		var roomCode = $("#joinRoomCode").val();
		var name = $("#name").val();
		
		if(name.length == 0) {
			secrecy.showDialog(	
				"Warning", 
				"Please enter a name.", 
				function() {
					$("#name").focus();
				}
			);
			
			return;
		}
		
		localStorage.setItem('name', name);
		
		secrecy.sendCommand("join", roomCode, name);
	});
	
	$("#CrashButton").click(function() {
		secrecy.sendCommand("pleaseCrash");
	});
	
	$("#yesButton").click(function() {
		secrecy.sendCommand("collect:1");
	});
	
	$("#noButton").click(function() {
		secrecy.sendCommand("collect:0");
	});
	
	$("#startRound").click(function() {
		secrecy.sendCommand("rulerInfo:start");
	});
	
	$("#endRound").click(function() {
		secrecy.sendCommand("endround");
	});	
	
	$("#cancelRound").click(function() {
		secrecy.sendCommand("cancelRound");
		secrecy.hideGameElementsExcept("startRound");
	});
	
	$("#reopen").click(function() {		
		secrecy.sendCommand("reopen");
		secrecy.hideGameElementsExcept("startGame", "roomCodeInformation", "reopen");
		hideAllCheckMarks();
	});
	
	secrecy.setup();
	
	// START
	reset(0);
});