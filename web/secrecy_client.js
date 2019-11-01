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
	
	setPlayerInfoText("");
	
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
			$("#roomCode").addClass("d-none");
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

function setPlayerInfoText(text) {
	$("#infoText").text(text);
}

function setHostInfoText(text) {
	$("#hostInfoText").html(text);
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
	setPlayerInfoText("Welcome!");
	secrecy.hideGameElementsExcept();
	$("#roomCode").removeClass("d-none");
});

secrecy.on("playerLeft", function(params) {
	playerLeft(params[1]);
});

secrecy.on("collect", function(params) {
	session.hasBeenStarted = true;
	session.ongoingRound = true;

	setPlayerInfoText("Please answer the question truthfully.");
	
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
		setPlayerInfoText("Please wait for the others.")
	});
	
	setPlayerInfoText("How many players do you think answered with 'yes'?");
	
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
    secrecy.hideGameElementsExcept("score", "scoreCardArea");
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
	secrecy.hideGameElementsExcept();
	
	secrecy.fadeIn("playerList");
	secrecy.fadeIn("score");
	
	if(secrecy.isHost() || session.ruler) {
		secrecy.fadeIn("startRound");
		secrecy.fadeIn("reopen");
		//secrecy.hideGameElementsExcept("score", "scoreCardArea", "startRound", "reopen");
	} else {
		//secrecy.hideGameElementsExcept("score", "scoreCardArea");
	}
	buildPlayerList();
	setPlayerInfoText("");
});

secrecy.on("collectionDone", function(params) {	
	if(secrecy.isHost() || session.ruler) {
		secrecy.hideGameElementsExcept("endRound", "scoreCardArea");
		setPlayerInfoText("Please press the button when everybody is ready to see the answers!");
	} else {
		setPlayerInfoText("Please wait for the host to reveal the score.");
	}
	
	if(secrecy.isHost()) {
		showScoreCards(params[0], params[1]);
		$("#playerList").toggleClass("d-none");
		secrecy.fadeIn("scoreCardArea", 1000);
	}
});

secrecy.on("showScoreCards", function(params) {
	secrecy.hideGameElementsExcept("scoreCardArea");
	
	if(secrecy.isHost()) {
		revealScoreCards(params[0], function endRoundCallback()
		{
			console.log("on showScoreCards, toggle playerList");
			showCorrectAnswer();
		});
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
	session.hasBeenStarted = true;
	secrecy.hideGameElementsExcept("cancelRound");
	
	setHostInfoText("<b>" + params[0] + "</b>, please choose a question and ready it out loud. All of you will then answer that question, using the buttons on your devices!");
	secrecy.fadeIn("hostInfoText", 1000);
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
	
	setPlayerInfoText("Other players may join now.");
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

function showCorrectAnswer() {
	secrecy.fadeOut("scoreCardArea", 1500, function() {
		removeScoreCards();
		hideAllCheckMarks();
		secrecy.sendCommand("endround");
	});
}

function hideAllCheckMarks() {
	$(".collectCheck").addClass('d-none');
	$(".guessCheck").addClass('d-none');
}

function makeCard(textBack, hexColor) {
	var card = $("#card-template").clone();
	/*
	if(textFront !== undefined) {
		card.find(".flip-card-front").text(textFront);
	}
	*/
	if(textBack !== undefined) {
		card.find(".flip-card-back").text(textBack);
	}
	
	if(hexColor !== undefined) {
		card.find(".flip-card-back").css("background-color", hexColor);
	}

	card.removeClass("d-none");
	card.removeAttr("id");
	return card;
}

function showScoreCards(yesses, noes) {
	var cards = [];

	// Add yes cards
	for(var i = 0; i < yesses; i++) {
		cards.push(makeCard("Yes"));
	}
	
	// Add no cards
	for(var i = 0; i < noes; i++) {
		cards.push(makeCard("No", "#d94141"));
	}

	cards = shuffleArray(cards);
	
	if(typeof addMoreCardsForTesting !== 'undefined') {
		for(var i = 0; i < addMoreCardsForTesting; i++) {
			let yes = Math.random() >= 0.5;
			cards.push(makeCard(yes ? "Yes" : "No", yes ? undefined : "#d94141"));
		}
	}
	
	for (i = 0; i < cards.length; i++) {
		cards[i].attr("id", "card-" + i);
		cards[i].appendTo("#scoreCardArea");
	}
}

function shuffleArray(array) {
	var arr = array; 
	for(let i = arr.length - 1; i > 0; i--){
		const j = Math.floor(Math.random() * i)
		const temp = arr[i]
		arr[i] = arr[j]
		arr[j] = temp
	}
	return arr;
}

function revealScoreCards(number_of_cards, callback_function) {
	if(typeof addMoreCardsForTesting !== 'undefined') {
		number_of_cards = parseInt(number_of_cards) + addMoreCardsForTesting;
	}
	
	revealScoreCard(0, number_of_cards, callback_function)
}

function revealScoreCard(card_index, number_of_cards, callback_function) {
	$("#card-" + card_index).toggleClass('flip-card flip-card-flipped');
	let next_card = card_index + 1;
	let next_card_timeout = calculateScoreCardTimeout(timeout, next_card, number_of_cards);
	console.log(next_card_timeout);
	if(next_card >= number_of_cards) {
		setTimeout(callback_function, timeout);
		return;
	}
	setTimeout(revealScoreCard, next_card_timeout, next_card, number_of_cards, callback_function);
}

function removeScoreCards() {
	$("#scoreCardArea>.flip-card-flipped").remove();
	$("#scoreCardArea>.flip-card").remove();
}

function calculateScoreCardTimeout(baseTimeout, index, maxIndex) {
	var speedUp = 0.4;
	if(typeof timeoutSpeedupFactor !== 'undefined') {
		speedUp =  timeoutSpeedupFactor;
	}
	
	var timeoutMin = 100;
	if(typeof timeout_minimum !== 'undefined') {
		timeoutMin = timeout_minimum;
	}
	
	let midPoint = Math.round(maxIndex / 2);
	let distanceFromMidpoint = Math.abs(midPoint - index);
	let offsetStep = Math.ceil(baseTimeout * speedUp);
	let suggestedTimout = baseTimeout - (midPoint - distanceFromMidpoint) * offsetStep;
	
	return Math.max(suggestedTimout, timeoutMin);
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