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
	
	<link rel="shortcut icon" href="../img/favicon.ico">
	
	<script>
		var css_folder = "../css/";
	</script>
	<link href="../css/bootstrap.css" id="theme-sheet" rel="stylesheet" type="text/css">

	<link href="../css/style.css" rel="stylesheet">
	<link href="../css/flipCard.css" rel="stylesheet">
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
		<div id="gameArea" class="col-10 offset-1 text-center">
			<h1><div class="spacer" id="roomCode"></div></h1>
		
			<div id="roomCodeInformation" class="game-element spacer alert alert-info">Go to <a href="../" class="alert-link"><?php echo getGameURL() ?></a> on your <i class="fas fa-mobile-alt alert-link"></i> to join this game!</div>
			<div id="scoreCardArea" class="row justify-content-center spacer"></div>
			<table class="table table-striped d-none" id="playerList"></table>
			<div class="spacer d-none" id="controls">
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

	<!-- Modal -->
	<div class="modal fade" id="dialog" tabindex="-1" role="dialog" aria-labelledby="Dialog Window" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="dialog-title">Modal title</h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body" id="dialog-content">
				...
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-primary" id="dialog-ok">Ok</button>
				<button type="button" class="btn btn-secondary" data-dismiss="modal" id="dialog-abort">Close</button>
			</div>
			</div>
		</div>
	</div>
	
	<!-- Card Template -->
	<div id="card-template" class="flip-card d-none">
		<div class="flip-card-inner card">
			<div class="flip-card-front card-body">
				<div class="flip-card-content">
					<img src="../img/secrecy_1000.png"/>
				</div>
			</div>
			<div class="flip-card-back card-body">
				<div class="flip-card-content">
					Bye
				</div>
			</div>
		</div>
	</div>
</body>

</html>