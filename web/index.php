<?php 
?>
<html>
<head>
<title>Welcome to Secrecy!</title>
	<meta charset="utf-8">

	<script src="./js/jquery-3.4.1.min.js"></script>
	
	<script src="./js/jquery-ui.min.js"></script>

	<script src="./js/bootstrap.js"></script>
	<link href="./css/bootstrap.css" rel="stylesheet">

	<link href="./css/style.css" rel="stylesheet">
	<link href="./css/dark-mode.css" rel="stylesheet">
	
	<script src="./settings.js"></script>
	<script src="./secrecy.js"></script>
	<script src="./secrecy_client.js"></script>
	
</head>
<body>
	<div id="container">
		<div class="col-10 offset-1">
			<div class="input-group input-group-lg spacer game-element" id="login">
				<input class="form-control" type="text" id="name" maxlength="18" placeholder="Johnny Dough 😆" />
				<input class="form-control" type="text" id="joinRoomCode" placeholder="Room code" />
				<input class="btn btn-lg btn-primary btn-block spacer" type="button" id="joinButton" value="Join" />
			</div>
			
			<div id="roomCode" ></div>		

			<div id="wait" class="game-element hidden" >Please wait.</div>
			<div id="yesNo" class="game-element hidden" >
				<input type="btn btn-lg btn-primary btn-block" id="yesButton" value="Yes" />
				<input type="btn btn-lg btn-primary btn-block" id="noButton" value="No" />
			</div>
			<div id="guess" class="game-element hidden" ></div>
			<div id="score" class="game-element hidden" >
				<p id="scoreQuestion">You scored <span id="pointsQuestion">0</span> points this round.</p>
				<p id="scoreGame">Your total score: <span id="pointsGame">0</span> points!</p>
			</div>
			<div id="controls">
				<input type="btn btn-lg btn-primary btn-block" class="game-element hidden" id="startRound" value="START"  />
				<input type="btn btn-lg btn-primary btn-block" class="game-element hidden" id="cancelRound" value="Cancel round"  />
				<input type="btn btn-lg btn-primary btn-block" class="game-element hidden" id="endRound" value="Score round"  />
				<input type="btn btn-lg btn-primary btn-block" class="game-element hidden" id="reopen" value="Reopen room"  />
			</div> hidden
		</div>
	</div>
	
	<nav class="navbar fixed-bottom navbar-expand-sm navbar-dark bg-dark">
	<a class="navbar-brand" href="#">Secrecy</a>
	<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarCollapse">
		<ul class="navbar-nav mr-auto">
		<li class="nav-item">
				<a class="nav-link" href="./host" target="_blank">Host Room</a>
		</li>
		<li class="nav-item dropup">
			<a class="nav-link dropdown-toggle" href="#" id="dropdown10" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Settings</a>
			<div class="dropdown-menu" aria-labelledby="dropdown10">
			<div class="dropdown-item">
				<div class="custom-control custom-switch">
					<input type="checkbox" class="custom-control-input" id="darkSwitch" />
					<label class="custom-control-label" for="darkSwitch">Dark Mode</label>
				</div>
				<script src="./js/dark-mode-switch.js"></script>
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
