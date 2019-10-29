<?php 
include 'functions.php';  
?> 

<html>
<head>
<title>Welcome to Secrecy!</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<script src="../js/jquery-3.4.1.min.js"></script>
	
	<script src="../js/jquery-ui.min.js"></script>

	<script src="../js/bootstrap.js"></script>
	<link href="../css/bootstrap.css" rel="stylesheet">

	<link href="../css/style.css" rel="stylesheet">
	<link href="../css/dark-mode.css" rel="stylesheet">
	<link href="../css/fa-all.css" rel="stylesheet">

	<script src="../settings.js"></script>
	<script src="../secrecy.js"></script>
	<script src="../secrecy_client.js"></script>
	
	<script> 
		secrecy.setHost(true);
	</script>
	
</head>
<body>
	<div id="container">
		<div class="col-10 offset-1 text-center">
			<h1><div class="spacer" id="roomCode"></div></h1>
		
		<div id="roomCodeInformation" class="game-element spacer alert alert-info">Go to <a href="../"><?php echo getGameURL() ?></a> on your <i class="fas fa-mobile-alt"></i> to join this game!</div>
			<table class="table table-striped d-none" id="playerList"></table>
			<div class="spacer" id="controls">
			<input type="button" class="game-element d-none btn btn-lg btn-primary" id="startRound" value="Start" />
			<input type="button" class="game-element d-none btn btn-lg btn-primary" id="endRound" value="Score Round" />
			<input type="button" class="game-element d-none btn btn-lg btn-primary" id="cancelRound" value="Cancel Round" />
			<input type="button" class="game-element d-none btn btn-lg btn-primary" id="reopen" value="Reopen Room" />
			<input type="button" class="game-element d-none btn btn-lg btn-primary" id="CrashButton" value="Crash" />
			</div>
		</div>
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

</html>