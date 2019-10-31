var session = {};

/**
* Checks sessionstorage first, then localStorage
* retrieves the key value
* @param key item to retrieve
* @return string-value or null
*/
function getSessionOrLocalStorageItem(key) {
	var session = sessionStorage.getItem(key);
	if(session != null) {
		return session;
	}
	
	return localStorage.getItem(key);
}

function setSessionAndLocalStorageItem(key, item) {
	sessionStorage.setItem(key, item);
	localStorage.setItem(key, item);
}

function reset(timeout, autoRoom = true) {
	session = {};
	session.players = {};
	
	setInfoText("");
	
	secrecy.onWsOpen = function () {
		if(secrecy.isHost()) {
			if(autoRoom) {
				secrecy.sendCommand('create'); // create a room when connecting
			}
		} else {
			var lastID = getSessionOrLocalStorageItem("LastPlayerID");
			var gameEndedNormally = getSessionOrLocalStorageItem("GameEndedNormally");
			console.log(gameEndedNormally + " " + lastID);
			if(gameEndedNormally == "false" && lastID != null) {
				console.log("Sending old ID");
				secrecy.sendCommand('setMyID', lastID);
			}
			
			secrecy.hideGameElementsExcept("login");
			$("#roomCode").hide();
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
	var tableHeaders = "<thead>" + "<th>Name</th>";
	if(secrecy.isHost()) {
		tableHeaders += "<th><i class='fas fa-check-square'></i></th>" + "<th><i class='fas fa-check-circle'></i></th>";
	}
	tableHeaders += "<th>Round</th><th>Score</th>" + "</thead>";
	
	$('#playerList').empty();
	$('#playerList').append($(tableHeaders));
	
	secrecy.log("Cleared players.");
	
	var sortedIDs = getSortedPlayerIDs();
	$('#playerList').append("<tbody>");
	for(var i = 0; i < sortedIDs.length; i++) {
		var id = sortedIDs[i];
		
		var player = session.players[id];
		var name = player.name;	
		var score = player.score;	
		var lastScore = player.lastScore > 0 ? "+" + player.lastScore : "";	
		
		console.log("Adding: " + name);
		
		var tableContents = "<tr class='player' id='" + id + "'>" 
		+ "<td>" + name + "</td>";
		if(secrecy.isHost()) {
			tableContents += "<td><i class='fas fa-check-square collectCheck'></i></td>"
			+ "<td><i class='fas fa-check-circle guessCheck'></i></td>"
		}
		tableContents += "<td class='lastScoreCell'>" + lastScore + "</td>" + "<td class='scoreCell'>" + score + "</td>" + "</tr>"
		
		$('#playerList').append($(tableContents));
	}
	$('#playerList').append("</tbody>");
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
	$("#" + playerID).find(".lastScoreCell").text("+" + round);
	$("#" + playerID).find(".scoreCell").text(total);
	session.players[playerID].score = total;
	session.players[playerID].lastScore = round;
}

function playerJoined(name, id, score) {
	if(session.players[id] != undefined) {
		return;
	}
	
	$("#playerList").removeClass("d-none");
	
	if(secrecy.isHost() || session.ruler) {
		secrecy.hideGameElementsExcept("startRound", "roomCodeInformation");
	}
	
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
	if(Object.keys(session.players).length == 0) {
		secrecy.sendCommand("reopen");
	}
	
	buildPlayerList();
}

function startRound() {
	secrecy.sendCommand("start");
	secrecy.hideGameElementsExcept("cancelRound");
}

function showRoundStartDialog() {
	secrecy.showDialog("Not enough players", "You should not play this game with less than 3 people. Are you sure you want to play anyway?", startRound, "Yes", "No");
}

function setInfoText(text) {
	$("#infoText").text(text);
}

secrecy.on("created", function(params) {
	removeScoreCards();
	secrecy.sendCommand("join", params[0], "ROOM");
	secrecy.setRoomCode(params[0]);
	secrecy.hideGameElementsExcept("roomCodeInformation");
});

secrecy.on("playerJoined", function(params) {
	playerJoined(params[0], params[1], params[2]);
});

secrecy.on("joined", function(params) {
	var roomCode = params[0];
	var playerID = params[1];
	
	setSessionAndLocalStorageItem("GameEndedNormally", false);
	setSessionAndLocalStorageItem("LastPlayerID", playerID);
	
	secrecy.setRoomCode(roomCode);
	setInfoText("Welcome!");
	secrecy.hideGameElementsExcept("roomCode");
});

secrecy.on("playerLeft", function(params) {
	playerLeft(params[1]);
});

secrecy.on("collect", function(params) {
	session.hasBeenStarted = true;
	session.ongoingRound = true;

	setInfoText("Please answer the question truthfully.");
	
	if(session.ruler){
		secrecy.hideGameElementsExcept("yesNo", "cancelRound");
	} else {
		secrecy.hideGameElementsExcept("yesNo");
	}
});

secrecy.on("playerSentYesNo", function(params) {
	$("#" + params[0]).find(".collectCheck").removeClass('d-none');
});

secrecy.on("guess", function(params) {
	$('#guess').empty();
	var playerCount = parseInt(params[0]);

	var guessButtonsHTML = "";
	var row = "<div class='row justify-content-center'>";
	var div = "<div class='col-4 col-sm-3 col-md-2 col-lg-1 col-xl-1'>"

	guessButtonsHTML += row;

	for(var i = 0; i <= playerCount; i++) {
		if(playerCount == 3 && (i % 3) == 2 && i != 0)
		{
			guessButtonsHTML += "</div>";
			guessButtonsHTML += row;
		}	
		else if((i % 3) == 0 && i != 0 && playerCount != 3)
		{
			guessButtonsHTML += "</div>";
			guessButtonsHTML += row;	
		}

		guessButtonsHTML += div;
		guessButtonsHTML += guessButton(i);
		guessButtonsHTML += "</div>";			
	}
	guessButtonsHTML += "</div>";
	
	$("#guess").html(guessButtonsHTML);
	$(".guessNumber").click(function() {
		secrecy.sendCommand("guess:" + $(this).val());
	});
	
	setInfoText("How many players do you think answered with 'yes'?");
	
	if(session.ruler){
		secrecy.hideGameElementsExcept("guess", "cancelRound");
	} else {
		secrecy.hideGameElementsExcept("guess");
	}
});

function guessButton(number) {
	return "<input class='guessNumber btn btn-xl btn-primary' type='button' value='" + number + "' />";
}

secrecy.on("guessed", function(params) {
	secrecy.hideGameElementsExcept();
	$("#guess").empty();
});

secrecy.on("playerSentGuess", function(params) {
	$("#" + params[0]).find(".guessCheck").removeClass('d-none');
});

secrecy.on("score", function(params) {
	session.ongoingRound = false;
	$("#pointsQuestion").text(params[0]);
	$("#pointsGame").text(params[1]);
	$("#correctGuess").text(params[2]);
    secrecy.hideGameElementsExcept("score");
});

secrecy.on("newPlayerScore", function(params) {
	updatePlayerScore(params[0], parseInt(params[1]), parseInt(params[2]));
});

secrecy.on("roundEnd", function(params) {
	if(secrecy.isHost()) {
		secrecy.hideGameElementsExcept();
	}
});

secrecy.on("readyForNewRound", function(params) {
	if(secrecy.isHost() || session.ruler) {
		secrecy.hideGameElementsExcept("score", "startRound", "reopen");
	} else {
		secrecy.hideGameElementsExcept("score");
	}
	buildPlayerList();
	setInfoText("");
});

secrecy.on("collectionDone", function(params) {
	if(secrecy.isHost()) {
		showScoreCards(params[0], params[1]);
		$("#playerList").toggleClass("d-none");
	}
	
	if(secrecy.isHost() || session.ruler) {
		secrecy.hideGameElementsExcept("endRound");
		setInfoText("Please press the button when everybody is ready to see the answers!");
	} else {
		setInfoText("Please wait for the host to reveal the score.");
	}
});

secrecy.on("showScoreCards", function(params) {
	secrecy.hideGameElementsExcept();
	
	if(secrecy.isHost()) {
		setTimeout(revealScoreCards, 1000);	
		setTimeout(function() {
			$("#playerList").toggleClass("d-none");
			secrecy.sendCommand("endround");
		}, 3000);
	}
});

secrecy.on("bye", function(params) {
	sessionStorage.setItem("GameEndedNormally", true);
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
	removeScoreCards();
	session.hasBeenStarted = true;
	secrecy.hideGameElementsExcept("cancelRound");
	hideAllCheckMarks();
});

secrecy.on("cancelled", function(params) {
	session.ongoingRound = false;
	
	if(secrecy.isHost() || session.ruler){
		secrecy.hideGameElementsExcept("reopen", "startRound");
		hideAllCheckMarks();
	} else {
		secrecy.hideGameElementsExcept();
	}
});
	
secrecy.on("reopened", function(params) {
	if(secrecy.isHost() || session.ruler) {
		removeScoreCards();
		secrecy.hideGameElementsExcept("startRound", "roomCodeInformation");
		hideAllCheckMarks();
	}
	
	setInfoText("Other players may join now.");
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
	$(".collectCheck").addClass('d-none');
	$(".guessCheck").addClass('d-none');
}

function makeCard(textFront, textBack) {
	var card = $("#card-template").clone();
	if(textFront !== undefined) {
		card.find(".flip-card-front").find(".flip-card-content").text(textFront);
	}
	if(textBack !== undefined) {
		card.find(".flip-card-back").find(".flip-card-content").text(textBack);
	}
	card.removeClass("d-none");
	card.removeAttr("id");
	return card;
}

function showScoreCards(yesses, noes) {		
	// Add yes cards
	for(var i = 0; i < yesses; i++) {
		var card = makeCard(undefined, "Yes");
		card.appendTo("#scoreCardArea");
	}
	
	// Add no cards
	for(var i = 0; i < noes; i++) {
		var card = makeCard(undefined, "No");
		card.appendTo("#scoreCardArea");
	}
}

function revealScoreCards() {
	$("#scoreCardArea>.flip-card").toggleClass('flip-card flip-card-flipped');
}

function removeScoreCards() {
	$("#scoreCardArea>.flip-card-flipped").remove();
	$("#scoreCardArea>.flip-card").remove();
}

/////
///// ON READY
/////
$(document).ready(function() {
	var oldName = getSessionOrLocalStorageItem('name');
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
		
		setSessionAndLocalStorageItem('name', name);
		
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
		secrecy.sendCommand("showScoreCards");
	});	
	
	$("#cancelRound").click(function() {
		secrecy.sendCommand("cancelRound");
	});
	
	$("#reopen").click(function() {		
		secrecy.sendCommand("reopen");
	});
	
	secrecy.setup();
	
	// START
	reset(0);
});