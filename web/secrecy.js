var secrecy = {};

/**
* If true, this client might behave differently 
*/
secrecy._isHost = false;

/**
* Sets if this client should be considered a host (room)
*/
secrecy.setHost = function(isHost) {
	secrecy._isHost = isHost;
}

/**
* Checks if this client is considered the host
*/
secrecy.isHost = function() {
	return secrecy._isHost;
}

/**
 * If true, debug logs will be printed to the console
 */
secrecy.showLog = true;

/**
 * Print a debug log to the console if switched on
 */
secrecy.log = function(message) {
	if(secrecy.showLog) {
		console.log(message);
	}
}

/**
* Collection of command based event handlers (callbacks)
* To attach a callback, add it to this collection with the command key
* For example: secrecy.on("playerJoined", callback);
*/
secrecy._commandCallbacks = {}

/**
* Used to add to the collection of command based event handlers (callbacks)
* To attach a callback, call this function with the command key as the first parameter
* and the callback as the second one.
* For example: secrecy.on("playerJoined", callback);
*/
secrecy.on = function(command, callback) {
	secrecy._commandCallbacks[command] = callback;
}	
 
/**
 * Connect to the websocket given in the settings,
 * Attach open/close/error/message handlers to ws
 *
 * To handle the events attach a function to:
 * secrecy.onWsOpen / secrecy.onWsClose / secrecy.onWsError
 */
secrecy.connect = function() {
	var url = settings['protocol'] + "://" + settings['host'] + ":" + settings['port'];
	var connection = new WebSocket(url, ['soap', 'xmpp']);
	secrecy.ws = connection;
	
	connection.onopen = function () {
		secrecy.log('WebSocket opened.');
		if(secrecy.onWsOpen != undefined) {
			secrecy.onWsOpen();
		}
	};
	
	connection.onclose = function () {
		secrecy.log('WebSocket closed.');
		if(secrecy.onWsClose != undefined) {
			secrecy.onWsClose();
		}
	};

	// Log errors
	connection.onerror = function (error) {
		secrecy.log('WebSocket error: ' + error);
		if(secrecy.onWsError != undefined) {
			secrecy.onWsError();
		}
	};

	// Log messages from the server
	connection.onmessage = function (e) {
		secrecy.onMessageReceived(e.data);
	};
}

/**
 * Called when the websocket receives a message from the server
 * Parses the message and calls the appropriate callback if it exists
 */
secrecy.onMessageReceived = function(message) {
	secrecy.log("[Message] " + message);
	var json = JSON.parse(message);
	var params = json.param.split(";");
	secrecy.onCommand(json.action, params);
}

/**
* Calls a command callback if it exists
* (see secrecy.on() )
*/
secrecy.onCommand = function(command, params) {
	var callback = secrecy._commandCallbacks[command];
	if(callback != undefined) {
		callback(params);
	}
}

/**
* Sends a simple command to the server
*/
secrecy.sendCommand = function(commandKey) {
	var args = Array.prototype.slice.call(arguments, 1);
	var param = args.join(";");
	params = param.length > 0 ? ":" + param : "";
	secrecy.ws.send(commandKey + params);
}

/**
* Hides all DOM elements with the 'game-element' class
* Then shows the element with the given ID
* @param elementID DOM ID, #-prefix optional
*/
secrecy.hideGameElementsExcept = function(elementID) {
	$(".game-element").addClass("d-none");

	var args = Array.prototype.slice.call(arguments);
	for(var i = 0; i < args.length; i++) {
		elementID = args[i];
		if(elementID.startsWith("#")) {
			elementID = elementID.substr(1);
		}
		$("#" + elementID).removeClass("d-none");
	}
}

/**
* Sets the room code text
*/
secrecy.setRoomCode = function(roomCode) {
	if(roomCode == undefined) {
		roomCode = "";
	}
	
	$("#roomCode").text("Room #" + roomCode);
}

/**
* Must be called before using this library
* call this when DOM is ready.
*/
secrecy.setup = function() {

	// enable dialog showing
	secrecy.showDialog = function(title, message, buttonCallback1, buttonText1, buttonText2, buttonCallback2) {
		$("#dialog-title").text(title);
		$("#dialog-content").text(message);

		if(buttonText1 != "")
		{
			$("#dialog-abort").text(buttonText1);

			$("#dialog-abort").click(function() {
				if(typeof buttonCallback1 === "function")
					buttonCallback1();
				$('#dialog').modal('hide');
			});
		} else {
			$("#dialog-abort").text("Close");
		}

		if(buttonText2 != "")
		{
			$("#dialog-ok").text(buttonText2);
			$("#dialog-ok").removeClass("d-none");

			$("#dialog-ok").click(function() {
				if(typeof buttonCallback2 === "function")
					buttonCallback2();
				$('#dialog').modal('hide');
			});
		} else {
			$("#dialog-ok").addClass("d-none");
		}

		$("#dialog").modal();
	};
};