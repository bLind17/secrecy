var settings = {
    "protocol":"wss",
    "host":"der.lukaslipp.at/games/secrecyws",
    "port":"1338"
}

// card reveal timeout
var timeout = 1000 * 1; 			// 1 seconds
var timeoutSpeedupFactor = 0.4;		// 0.4 times faster with every card
var timout_minimum = 1000 * 0.1;	// 0.1 second -> minimum card reveal timeout

// adds more cards to the score board. comment out if done testing
var addMoreCardsForTesting = 24;