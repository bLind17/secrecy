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
	<link href="../css/dark-mode.css" rel="stylesheet">
	<link href="../css/fa-all.css" rel="stylesheet">

	<script src="./js/host.js"></script>
	<script src="../settings.js"></script>
	
</head>
<body>
	<div id="container">
		<div class="col-10 offset-1">
			<h1><div class="spacer" id="roomCode"></div></h1>
		
			<div id="roomCodeInformation">Go to <a href="../"><?php echo getGameURL() ?></a> on your <i class="fas fa-mobile-alt"></i> to join this game!</div>
			<table class="table hidden" id="playerList"></table>
			<div class="spacer" id="controls">
				<input type="button" class="btn btn-lg btn-primary" class="hidden" id="startGame" value="START" />
				<input type="button" class="btn btn-lg btn-primary" class="hidden" id="endRound" value="Score round" />
				<input type="button" class="btn btn-lg btn-primary" class="hidden" id="cancelRound" value="Cancel round" />
				<input type="button" class="btn btn-lg btn-primary" class="hidden" id="reopen" value="Reopen room" />
				<input type="button" class="btn btn-lg btn-primary" class="hidden" id="CrashButton" value="Crash" />
			</div>
		</div>
	</div>
	<div id="dialog" title="Do what?">
	  <p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span><span id="dialogText">I dunno...<span></p>
	</div>


	<nav class="navbar fixed-bottom navbar-expand-sm navbar-dark bg-dark">
	<a class="navbar-brand" href="#">Secrecy</a>
	<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarCollapse">
		<ul class="navbar-nav mr-auto">

		<li class="nav-item dropup">
			<a class="nav-link dropdown-toggle" href="#" id="dropdown10" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Settings</a>
			<div class="dropdown-menu" aria-labelledby="dropdown10">
			<div class="dropdown-item">
				<div class="custom-control custom-switch">
					<input type="checkbox" class="custom-control-input" id="darkSwitch" />
					<label class="custom-control-label" for="darkSwitch">Dark Mode</label>
				</div>
				<script src="../js/dark-mode-switch.js"></script>
			</div>
			</div>
		</li>
		</ul>
	</div>
	</nav>

</body>

<script>

	

</script>

</html>