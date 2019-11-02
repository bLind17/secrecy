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
	<script>$.fn.slider = null</script>
	<script src="../js/bootstrap-slider.min.js"></script>
	<script src="../js/bootstrap-toggle.min.js"></script>
	<link rel="shortcut icon" href="../img/favicon.ico">
	
	<script>
		var css_folder = "../css/";
	</script>
	<link href="../css/bootstrap.css" id="theme-sheet" rel="stylesheet" type="text/css">
	<link href="../css/bootstrap-slider.min.css" rel="stylesheet">
	<link href="../css/style.css" rel="stylesheet">
	<link href="../css/flipCard.css" rel="stylesheet">
	<link href="../css/fa-all.css" rel="stylesheet">
	<link href="../css/bootstrap-toggle.min.css" rel="stylesheet">

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
			<div id="hostInfoText" class="game-element spacer alert alert-warning d-none"></div>
			<div id="scoreCardArea" class="row justify-content-center spacer game-element col-lg-10 col-xl-8 offset-lg-1 offset-xl-2" style="display: none"></div>
			<div id="score" class="game-element d-none" >
				<div id="roundScore" class="spacer">
					<p id="scoreAnswer">The correct answer is: <span class="badge badge-primary" id="correctGuess">0</span></p>
				</div>
			</div>
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
						<div class="switch-item align-middle text-center">
							<input type="checkbox" data-toggle="toggle" id="darkSwitch">
							<label class="dropdown-label">Dark Mode</label>
						</div>
						<hr>
						<div class="slider-item">
						<label>Reveal Speed</label>
						<br>
						<input
							type="text"
							name="somename"
							data-provide="slider"
							data-slider-ticks="[2.2, 1.4, 0.6]"
							data-slider-ticks-labels='["fast", "normal", "slow"]'
							data-slider-min="0.6"
							data-slider-max="2.2"
							data-slider-step="0.8"
							data-slider-value="1.4"
							data-slider-tooltip="hide"
							id="speedSlider"
						>	
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
		<div class="flip-card-inner">
			<div class="flip-card-front card-body">
				<img src="../img/secrecy_1000.png"/>
			</div>
			<div class="flip-card-back card-body" >
				Bye
			</div>
		</div>
	</div>
</body>

<script>
	$('#darkSwitch').bootstrapToggle();
	$("#speedSlider").slider({
		reversed : true
	});

	$( document ).ready(function() {
		initEnvironment();

		$('#speedSlider').slider().on('change', function(){
			changeEnvironment();
		});
		$('#darkSwitch').change(function() {
			changeEnvironment();
		});
	});
</script>
</html>