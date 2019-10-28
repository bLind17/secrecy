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
	<script src="../settings.js"></script>
	<script src="../secrecy.js"></script>
	<script src="./js/host.js"></script>
	
</head>
<body>
	<div id="content">
		<div id="roomCode"></div>
		<div id="roomCodeInformation" class="game-element">Go to <a href="../"><?php echo getGameURL() ?></a> on your <i class="fas fa-mobile-alt"></i> to join this game!</div>
		<table id="playerList" style="display:none;"></table>
		<div id="controls">
			<input type="button" class="game-element" id="startGame" value="START" style="display:none;" />
			<input type="button" class="game-element" id="endRound" value="Score round" style="display:none;" />
			<input type="button" class="game-element" id="cancelRound" value="Cancel round" style="display:none;" />
			<input type="button" class="game-element" id="reopen" value="Reopen room" style="display:none;" />
			<input type="button" class="game-element" id="CrashButton" value="Crash" style="display:none;" />
		</div>
		  
	</div>
</body>

<script>

	

</script>

</html>