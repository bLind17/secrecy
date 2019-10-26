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
			
	$("#startGame").hide();
	$("#playerList").hide();
	$("#reopen").hide();
	$("#cancelRound").hide();
	$("#endRound").hide();
	
	buildPlayerList();
	
	setTimeout(function () {
		var connection = new WebSocket('wss://der.lukaslipp.at/games/secrecyws:1338', ['soap', 'xmpp']);
		session.ws = connection;
		
		connection.onopen = function () {
			if(autoRoom) {
				connection.send('create'); // create a room when connecting
			}
		};
		
		connection.onclose = function () {
			console.log('WebSocket closed.');
			reset(3000, false);
		};

		// Log errors
		connection.onerror = function (error) {
			console.log('WebSocket Error ' + error);
			reset(3000, false);
		};

		// Log messages from the server
		connection.onmessage = function (e) {
			onMessageReceived(e.data);
		};
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
	console.log("Cleared players.");
	
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

function onMessageReceived(message) {
	console.log(message);
	var json = JSON.parse(message);
	var params = json.param.split(";");
	onCommand(json.action, params);
}

function setRoomCode(roomCode) {
	$("#roomCode").text(roomCode);
}

function onCommand(command, params) {
	switch(command) {
		case 'created':
			session.ws.send("join:" + params[0] + ";ROOM");
			setRoomCode(params[0]);
			$("#roomCodeInformation").show();
			break;
		case 'joined': 
			playerJoined(params[0], params[1], params[2]);
			break;
		case 'left': 
			playerLeft(params[1]);
			break;
		case 'yesno': 
			$("#" + params[0]).find(".collectCheck").css('visibility', 'visible');
			break;
		case 'guess': 
			$("#" + params[0]).find(".guessCheck").css('visibility', 'visible');
			break;
		case 'score': 
			updatePlayerScore(params[0], parseInt(params[1]), parseInt(params[2]));
			break;
		case 'roundEnd':
			$("#endRound").hide();
			break;
		case 'readyForNewRound': 
			buildPlayerList();
			$("#startGame").show();
			$("#reopen").show();
			$("#endRound").hide();
			break;
		case 'exhausted':	
			showDialog("I am sorry!", "Someone is creating too many rooms. Please try again shortly!");	
			break;
		case 'started': 
			session.hasBeenStarted = true;
			$("#startGame").hide();
			$("#cancelRound").show();
			$("#roomCodeInformation").hide();
			$("#hide").show();
			$("#reopen").hide();
			hideAllCheckMarks();
			break;
		case 'cancelled':
			$("#startGame").show();
			$("#cancelRound").hide();
			$("#reopen").show();
			hideAllCheckMarks();
			break;
		case 'collectionDone':
			$("#endRound").show();
			$("#cancelRound").hide();
			break;
	}
}

function hideAllCheckMarks() {
	$(".collectCheck").css('visibility', 'hidden');
	$(".gussCheck").css('visibility', 'hidden');
}

function startGame() {	
	session.ws.send("start");
}

// if json stringify doesnt work
function decycle(obj, stack = []) {
    if (!obj || typeof obj !== 'object')
        return obj;
    
    if (stack.includes(obj))
        return null;

    let s = stack.concat([obj]);

    return Array.isArray(obj)
        ? obj.map(x => decycle(x, s))
        : Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, decycle(v, s)]));
}

function showDialog(title, message, buttonCallback1, buttonText1, buttonText2, buttonCallback2) {
	console.log("dialog " + title);
	$( "#dialog" ).dialog('option', 'title', title);
	$( "#dialogText" ).text(message);
	
	var buttons = {};
	session.buttonCallbacks = {};
	
	if(buttonText1 == undefined) {
		buttonText1 = "OK";
	}

	buttons[buttonText1] = function() {
		$(this).dialog( "close" );
		if(buttonCallback1 != null && buttonCallback1 != undefined) {
			buttonCallback1();
		}
	};
	
	if(buttonText2 != undefined) {
		buttons[buttonText2] = function(y, x) {
			$( "#dialog" ).dialog( "close" );
			if(buttonCallback2 != null && buttonCallback2 != undefined) {
				buttonCallback2();
			}
		};
	}
	
	$( "#dialog" ).dialog('option', 'buttons', buttons);
	$( "#dialog" ).dialog("open");
}


$(document).ready(function() {
	$( "#dialog" ).dialog({
		resizable: false,
		height: "auto",
		width: 400,
		modal: true,
		autoOpen: false,
		show: "blind",
		hide: "blind",
		buttons: {
			"OK": function() {
				$( this ).dialog( "close" );
			}
		}
	});
	
	$("#startGame").click(function() {
		if(!session.hasBeenStarted && Object.keys(session.players).length < 3) {
			showDialog("Not enough players", "You should not play this game with less than 3 people. Are you sure you want to play anyway?", startGame, "Yes", "No");	
		} else {
			startGame();
		}
	});
	
	
	$("#cancelRound").click(function() {
		session.ws.send("cancelRound");
	});
	
	$("#CrashButton").click(function() {
		session.ws.send("pleaseCrash");
	});
	
	$("#endRound").click(function() {
		session.ws.send("endround");
	});
	
	$("#reopen").click(function() {		
		session.ws.send("reopen");
		$("#roomCodeInformation").show();
		$("#startGame").show();
		$("#reopen").hide();
		hideAllCheckMarks();
	});
	
	// START
	reset(0);
});