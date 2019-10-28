var session = {};

function reset(timeout) {
	session = {};
	
	secrecy.onWsOpen = function () {
		secrecy.log("open");
		secrecy.hideGameElementsExcept("login");
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

function startGame() {
	if(session.ruler){
		secrecy.sendCommand("start");
		secrecy.hideGameElementsExcept("cancelRound");
	}
}

function showStartGameDialog() {
	secrecy.showDialog("Not enough players", "You should not play this game with less than 3 people. Are you sure you want to play anyway?", startGame, "Yes", "No");
}
	
secrecy.on("joined", function(params) {
	secrecy.setRoomCode(params[0]);
	secrecy.hideGameElementsExcept("wait", "roomCode");
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

secrecy.on("score", function(params) {
	session.ongoingRound = false;
	$("#pointsQuestion").text(params[0]);
	$("#pointsGame").text(params[1]);
    secrecy.hideGameElementsExcept("score");
});

secrecy.on("readyForNewRound", function(params) {
	if(session.ruler){
		secrecy.hideGameElementsExcept("score", "startRound");
	}
});

secrecy.on("collectionDone", function(params) {
	if(session.ruler){
		secrecy.hideGameElementsExcept("endRound");
	}
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

secrecy.on("cancel", function(params) {
	session.ongoingRound = false;
	if(session.ruler){
		secrecy.hideGameElementsExcept("startRound");
	} else {
		secrecy.hideGameElementsExcept("wait");
	}
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
				showStartGameDialog();
			} else {
				startGame();
			}
			break;
	}
});
	
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
	
	secrecy.setup();
	
	// START
	reset(0);
});