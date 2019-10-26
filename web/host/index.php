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
	<script src="./fontawesome.js"></script>
	<script src="./js/host.js"></script>
	
	<script>
		
	</script>
</head>
<body>
	<div id="content">
		<div id="roomCode"></div>
		<div id="roomCodeInformation">Go to <a href="https://games.lukaslipp.at/secrecy">games.lukaslipp.at/secrecy</a> on your <i class="fas fa-mobile-alt"></i> to join this game!</div>
		<table id="playerList" hidden="hidden"></table>
		<div id="controls">
			<input type="button" id="startGame" value="START" hidden="hidden" />
			<input type="button" id="endRound" value="Score round" hidden="hidden" />
			<input type="button" id="cancelRound" value="Cancel round" hidden="hidden" />
			<input type="button" id="reopen" value="Reopen room" hidden="hidden" />
			<input type="button" id="CrashButton" value="Crash" hidden="hidden" />
		</div>
		  
	</div>
	<div id="dialog" title="Do what?">
	  <p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span><span id="dialogText">I dunno...<span></p>
	</div>
</body>

<script>

	

</script>

</html>