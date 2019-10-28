<?php 
include 'functions.php';  
?> 

<html>
<head>
<title>Welcome to Secrecy!</title>
	<meta charset="utf-8">
	<script src="../js/jquery-3.4.1.min.js"></script>
	
	<script src="../js/jquery-ui.min.js"></script>

	<script src="../js/bootstrap.js"></script>
	<link href="../css/bootstrap.css" rel="stylesheet">

	<link href="../css/style.css" rel="stylesheet">

	<script src="../js/fontawesome.js"></script>
	<script src="./js/host.js"></script>
	<script src="../settings.js"></script>
	
</head>
<body>
	<div id="content">
		<div id="roomCode"></div>
		<div id="roomCodeInformation">Go to <a href="../"><?php echo getGameURL() ?></a> on your <i class="fas fa-mobile-alt"></i> to join this game!</div>
		<table id="playerList" hidden="hidden"></table>
		<div id="controls">
			<input type="button" class="game-element" id="startGame" value="START" hidden="hidden" />
			<input type="button" class="game-element" id="endRound" value="Score round" hidden="hidden" />
			<input type="button" class="game-element" id="cancelRound" value="Cancel round" hidden="hidden" />
			<input type="button" class="game-element" id="reopen" value="Reopen room" hidden="hidden" />
			<input type="button" class="game-element" id="CrashButton" value="Crash" hidden="hidden" />
		</div>
		  
	</div>
	<div id="dialog" title="Do what?">
	  <p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span><span id="dialogText">I dunno...<span></p>
	</div>
</body>

<script>

	

</script>

</html>