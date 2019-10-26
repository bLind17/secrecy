var session = {};

function onMessageReceived(message) {
	console.log(message);
	var json = JSON.parse(message);
	var params = json.param.split(";");
	onCommand(json.action, params);
}

function setRoomCode(roomCode) {
	$("#roomCode").text(roomCode);
}

function reset(timeout) {
	session = {};
	$("#score").hide();
	$("#yesNo").hide();
	$("#guess").hide();
	$("#startRound").hide();
	$("#cancelRound").hide();
	$("#wait").hide();
	$("#joinRoomCode").text("");
	
	$("#roomCode").hide();
	
	setTimeout(function () {
		var connection = new WebSocket('wss://der.lukaslipp.at/games/secrecyws:1338', ['soap', 'xmpp']);
		session.ws = connection;
		
		connection.onopen = function () {
		};
		
		connection.onclose = function () {
			reset(3000);
		};

		// Log errors
		connection.onerror = function (error) {
			console.log('WebSocket Error ' + error);
			reset(3000);
		};

		// Log messages from the server
		connection.onmessage = function (e) {
			onMessageReceived(e.data);
		};
		
		$("#login").show();	
	}, timeout);
}

function startGame() {
	if(session.ruler){
		session.ws.send("start");
		
		$("#startRound").hide();
		$("#cancelRound").show();
	}
}

function showStartGameDialog() {
	showDialog("Not enough players", "You should not play this game with less than 3 people. Are you sure you want to play anyway?", startGame, "Yes", "No");
}

function showWaitUI(roomCode) {
	$("#score").hide();
	$("#yesNo").hide();
	$("#guess").hide();
	$("#login").hide();
	if(roomCode != undefined) {
		$("#roomCode").text(roomCode);
	}
	$("#roomCode").show();
	$("#wait").show();
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

	
function onCommand(command, params) {
	switch(command) {
		case 'joined':
			showWaitUI(params[0]);
			break;
		case 'collect':
			session.hasBeenStarted = true;
			session.ongoingRound = true;
			if(session.ruler){
				$("#startRound").hide();
				$("#cancelRound").show();
			}
			$("#wait").hide();
			$("#score").hide();
			$("#yesNo").show();
			break;
		case 'guess':
			$("#yesNo").hide();
			
			var playerCount = parseInt(params[0]);
			for(var i = 0; i <= playerCount; i++) {
				$("#guess").append($("<input class='guessNumber' type='button' value='" + i + "' />"));
			}
			$(".guessNumber").click(function() {
				session.ws.send("guess:" + $(this).val());
			});
			$("#guess").show();
			break;
		case 'guessed':
			$("#guess").hide();
			$("#guess").empty();
			break;
		case 'score':
			session.ongoingRound = false;
			$("#pointsQuestion").text(params[0]);
			$("#pointsGame").text(params[1]);
			$("#score").show();
			if(session.ruler){
				$("#cancelRound").hide();
			}
			break;
		case 'readyForNewRound': 
			if(session.ruler){
				$("#startRound").show();
			}
			break;
		case 'bye': 
			showDialog("This is the end.", "Your gamemaster has ended this game. Thanks for playing!");
			break;
		case 'noroom': 
			showDialog("Whoops.", "This room does not exist. Please check the room code and try again.");
			break;
		case 'roomBusy': 
			showDialog("Whoops.", "This room is closed for business! If you want to join the running game, please ask the host to reopen it after the ongoing round.");
			break;
		case 'joinerror': 
			showDialog("Whoops.", "There has been an error. Make sure that your name and room code do not contain any ';', fancy symbols or anything else that you might think could be interpreted as an injection attempt. Behave and vaccinate!");
			break;
		case 'cancel': 
			showWaitUI();
			session.ongoingRound = false;
			if(session.ruler){
				$("#startRound").show();
				$("#cancelRound").hide();
			}
			break;
		case 'ruler': 
			session.ruler = true;
			if(session.ongoingRound) {
				$("#cancelRound").show();
			} else {
				$("#startRound").show();
			}
				
			break;
		case 'rulerInfo': 
			switch(params[0]) {
				case 'start':
					if(!session.hasBeenStarted && parseInt(params[1]) < 3) {
						showStartGameDialog();
					} else {
						startGame();
					}
					break;
			}
			break;
	}
}

$(document).ready(function() {
	var oldName = localStorage.getItem('name');
	if(oldName != undefined) {
		$("#name").val(oldName);
	} 
	
	$( "#dialog" ).dialog({
		resizable: false,
		height: "auto",
		width: 400,
		modal: true,
		autoOpen: false,
		show: "blind",
		hide: "blind"
	});
			
	$("#joinButton").click(function() {
		var roomCode = $("#joinRoomCode").val();
		var name = $("#name").val();
		
		if(name.length == 0) {
			showDialog("Warning", "Please enter a name.", function() {
				$("#name").focus();
			});
			return;
		}
		
		localStorage.setItem('name', name);
		
		var command = "join:" + roomCode + ";" + name;
		console.log(command);
		session.ws.send(command);
	});
	
	$("#CrashButton").click(function() {
		session.ws.send("pleaseCrash");
	});
	
	$("#yesButton").click(function() {
		session.ws.send("collect:1");
	});
	
	$("#noButton").click(function() {
		session.ws.send("collect:0");
	});
	
	$("#startRound").click(function() {
		session.ws.send("rulerInfo:start");
	});
	
	
	$("#cancelRound").click(function() {
		session.ws.send("cancelRound");
		$("#startRound").show();
		$("#cancelRound").hide();
	});
	
	// START
	reset(0);
});