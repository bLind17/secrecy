<?php 
?>
<html>
<head>
<title>Welcome to Secrecy!</title>
	<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	
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
		<div class="col-10 offset-1 text-center">
			<div class="input-group input-group-lg spacer game-element" id="login">
				<input class="form-control" type="text" id="name" maxlength="18" placeholder="Johnny Dough 😆" />
				<input class="form-control" type="text" id="joinRoomCode" placeholder="Room code" />
				<input class="btn btn-lg btn-primary btn-block spacer" type="button" id="joinButton" value="Join" />
			</div>
			
			<h1><div class="d-none spacer" id="roomCode"></div></h1>

			<div id="wait" class="game-element d-none" >Please wait.</div>
			<div id="yesNo" class="game-element d-none spacer" >
				<input type="button" class="btn btn-xl btn-primary" id="yesButton" value="Yes" />
				<input type="button" class="btn btn-xl btn-primary" id="noButton" value="No" />
			</div>
			<div id="guess" class="game-element d-none" ></div>
			<div id="score" class="game-element d-none" >
				<p id="scoreAnswer">The correct answer is: <span class="badge badge-primary" id="correctGuess">0</span></p>
				<p id="scoreQuestion">You scored <span id="pointsQuestion" class="badge badge-secondary">0</span> points this round.</p>
				<p id="scoreGame">Your total score: <span id="pointsGame" class="badge badge-dark">0</span> points!</p>
				<table class="table table-striped d-none" id="playerList"></table>
			</div>
			<div class="spacer" id="controls">
				<input type="button" class="d-none btn btn-lg btn-secondary game-element" id="startRound" value="Start"  />
				<input type="button" class="d-none btn btn-lg btn-secondary game-element" id="cancelRound" value="Cancel Round"  />
				<input type="button" class="d-none btn btn-lg btn-secondary game-element" id="endRound" value="Score Round"  />
				<input type="button" class="d-none btn btn-lg btn-secondary game-element" id="reopen" value="Reopen Room"  />
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
				<button type="button" class="btn btn-secondary" data-dismiss="modal" id="dialog-abort">Close</button>
				<button type="button" class="btn btn-primary" id="dialog-ok">Ok</button>
			</div>
			</div>
		</div>
	</div>
</body>

<script>
	

</script>

</html>
