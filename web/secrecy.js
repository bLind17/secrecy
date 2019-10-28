var secrecy = {};

secrecy.resultCodes = {};
secrecy.resultCodes.WEBSOCKET_OPENED = 1;
secrecy.resultCodes.WEBSOCKET_CLOSED = 2;
secrecy.resultCodes.WEBSOCKET_ERROR  = 3;

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
 * To handle the events, either pass a callback that understands the resultCodes
 * or attach a function to:
 * secrecy.onWsOpen / secrecy.onWsClose / secrecy.onWsError
 */
secrecy.connect = function(callback) {
	var url = settings['protocol'] + "://" + settings['host'] + ":" + settings['port'];
	var connection = new WebSocket(url, ['soap', 'xmpp']);
	secrecy.ws = connection;
	
	connection.onopen = function () {
		secrecy.log('WebSocket opened.');
		if(callback != undefined) {
			callback(secrecy.resultCodes.WEBSOCKET_OPENED);
		}
		if(secrecy.onWsOpen != undefined) {
			secrecy.onWsOpen();
		}
	};
	
	connection.onclose = function () {
		secrecy.log('WebSocket closed.');
		if(callback != undefined) {
			callback(secrecy.resultCodes.WEBSOCKET_CLOSED);
		}
		if(secrecy.onWsClose != undefined) {
			secrecy.onWsClose();
		}
	};

	// Log errors
	connection.onerror = function (error) {
		secrecy.log('WebSocket error: ' + error);
		if(callback != undefined) {
			callback(secrecy.resultCodes.WEBSOCKET_ERROR);
		}
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
	onCommand(json.action, params);
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
	secrecy.ws.send(commandKey + ":" + param);
}

/**
* Hides all DOM elements with the 'game-element' class
* Then shows the element with the given ID
* @param elementID DOM ID, #-prefix optional
*/
secrecy.hideGameElementsExcept = function(elementID) {
	$(".game-element").hide();
	
	var args = Array.prototype.slice.call(arguments, 1);
	for(var i = 0; i < args.length; i++) {
		elementID = args[i];
		if(elementID.startsWith("#")) {
			elementID = elementID.substr(1);
		}
		$("#" + elementID).show();
	}
}

/**
* Sets the room code text
*/
secrecy.setRoomCode = function(roomCode) {
	if(roomCode == undefined) {
		roomCode = "";
	}
	
	$("#roomCode").text(roomCode);
}

/**
* Must be called before using this library
* call this when DOM is ready.
*/
secrecy.setup() = function() {
	// add dialog div to enable dialog showing^^
	$("body").append($('<div id="dialog" title="Do what?"><p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span><span id="dialogText">I dunno...<span></p></div>'));
	
	// initialize jQuery-UI dialog
	$("#dialog").dialog({
		resizable: false,
		height: "auto",
		width: 400,
		modal: true,
		autoOpen: false,
		show: "blind",
		hide: "blind"
	});
	
	// enable dialog showing
	secrecy.showDialog = function(title, message, buttonCallback1, buttonText1, buttonText2, buttonCallback2) {
		secrecy.log("dialog " + title);
		$("#dialog").dialog('option', 'title', title);
		$("#dialogText").text(message);
		
		var buttons = {};
		
		if(buttonText1 == undefined) {
			buttonText1 = "OK";
		}

		buttons[buttonText1] = function() {
			$(this).dialog("close");
			if(buttonCallback1 != null && buttonCallback1 != undefined) {
				buttonCallback1();
			}
		};
		
		if(buttonText2 != undefined) {
			buttons[buttonText2] = function(y, x) {
				$("#dialog").dialog("close");
				if(buttonCallback2 != null && buttonCallback2 != undefined) {
					buttonCallback2();
				}
			};
		}
		
		$("#dialog").dialog('option', 'buttons', buttons);
		$("#dialog").dialog("open");
	};
};