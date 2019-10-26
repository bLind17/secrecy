<?php 

?>
<html>
<head>
<title>Welcome to Secrecy!</title>
	<meta charset="utf-8">

	<link href="https://der.lukaslipp.at/common/jquery/jquery-ui.min.css" rel="stylesheet">
	<link href="./style.css" rel="stylesheet">
	<script src="https://der.lukaslipp.at/common/jquery/external/jquery/jquery.js"></script>
	<script src="https://der.lukaslipp.at/common/jquery/jquery-ui.min.js"></script>
	<script src="./join.js"></script>
	
</head>
<body>
	<div id="content">
		<div id="login">
			<input type="text" id="name" maxlength="18" placeholder="Johnny Dough 😆" />
			<input type="text" id="joinRoomCode" placeholder="Room code" />
			<input type="button" id="joinButton" value="Join" />
		</div>
		<div id="roomCode" hidden="hidden"></div>
		<div id="wait" hidden="hidden">Please wait.</div>
		<div id="yesNo" hidden="hidden">
			<input type="button" id="yesButton" value="Yes" />
			<input type="button" id="noButton" value="No" />
		</div>
		<div id="guess" hidden="hidden"></div>
		<div id="score" hidden="hidden">
			<p id="scoreQuestion">You scored <span id="pointsQuestion">0</span> points this round.</p>
			<p id="scoreGame">Your total score: <span id="pointsGame">0</span> points!</p>
		</div>
		
		<div id="controls">
			<input type="button" id="startRound" value="START" hidden="hidden" />
			<input type="button" id="cancelRound" value="Cancel round" hidden="hidden" />
			<input type="button" id="endRound" value="Score round" hidden="hidden" />
		</div>
	</div>
 
	<div id="dialog" title="Do what?">
	  <p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span><span id="dialogText">I dunno...<span></p>
	</div>
</body>

<script>
	

</script>

</html>