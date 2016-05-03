var tmi = require('tmi.js');
var jsonfile = require('jsonfile');
var options = {
	options:
	{
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "DastyBot",
		password: ""
	},
	channels: ["BimboGamer"]
};

var client = new tmi.client(options);
client.connect();

var uptime = 0;
var timestampFile = 'timestamps.json';
var customCommandsFile = 'customCommands.json';

function Timestamp(time, note) {
	this.time = time;
	this.note = note;
};
function CustomCommand(command, commandType, target, message) {
	this.command = command;
	this.commandType = commandType;
	this.target = target;
	this.message = message;
};

var customCommands = [];
var timestamps = [];
client.on('connected', function(){
	jsonfile.readFile(timestampFile, function(err, obj) {
		timestamps = obj;
		console.dir(timestamps);
	});
});
client.on('connected', function(){
	jsonfile.readFile(customCommandsFile, function(err, obj) {
		customCommands = obj;
		console.dir(customCommands);
	});
});
//client.on('connected', function(){
//	client.action(options.channels[0], "Hello, I'm a bot and I'm here to troll you.");
//});
client.on('connected', function(address, port) {
	console.log("address: " + address + " port: " + port);
	setInterval(function() {uptime++;},1000);	
});

// All !commands.
client.on('chat', function(channel, user, message, self) {
//	if(message === "!twitter") {
//		client.action(channel, "twitter.com/patrickianrice");
//	}
//	else if(message === "!instagram") {
//		client.action(channel, "instagram.com/dastrn");
//	}
//	else if(message === "!commands") {
//		client.action(channel, "Whisper me '!commands' to see the full list of commands.");
//	}
//	else if(message === "!uptime") {
//		client.action(channel, getTimeStamp());
//	}
//	else 
	if(message === "!marvel") {
		client.action(channel, "Kay is painting for MARVEL today at 1pm Eastern, 10am Pacific! http://bit.ly/1pBZcSp");
	}
	else if(message === "!prettyboy" && user.username != "dastrn") {
		client.action(channel, "SQWAA! Dastrn is the REAL pretty boy! " + user.username + " is an imposter! SQWAA!");
	}
	else if(message === gameName && gameIsActive === true) {
		gamePlayers.push(user.username);
		console.dir(gamePlayers);
		client.action(channel, user.username + " has been entered into the game: " + gameName);
	};
});

// Whisper Commands
client.on('whisper', function (user, message){
	if(message.substring(0, 10) === "!timestamp") { 
		var timestamp = new Timestamp(getTimeStamp(), message.substr(11));

		client.whisper(user.username, "'" + timestamp.note + "' will be stored at time " + timestamp.time);
		timestamps.push(timestamp);
		console.dir(timestamps);
		jsonfile.writeFile(timestampFile, timestamps, {spaces: 4}, function (err){
			console.error(err);
		});
	}
//	else if(message === "!commands") {
//		client.whisper(user.username, "!twitter, !instagram, !marvel, !commands, !uptime");
//	}
	else if(message.substring(0, 10) === "!startgame" && user.username === "dastrn" && gameIsActive === false) {
		var args = message.split(",");
		var gameNm = args[1];
		var gameTmLimit = args[2];
		GameStart(gameNm, gameTmLimit);
	}
	else if(message.substring(0, 8) === "!endgame" && user.username === "dastrn") {
		EndGame();
	}
	else if(message.substring(0, 7) === "!action" && user.username === "dastrn") {
		var args = message.split(',');
		client.action(options.channels[0], args[1]);
	}
	else if(message.substring(0, 7) === "!chirp " && (user.username === "dastrn" || user.username === "kaypikefashion" || user.username === "iamthem00s3")) {
		Chirp(message);
		console.log(chirpIsActive);
	}
	else if(message.substring(0, 9) === "!chirpoff" && (user.username === "dastrn" || user.username === "kaypikefashion" || user.username === "iamthem00s3")) {
		chirpIsActive = false;
		console.log(chirpIsActive);
	}
	else if(message.substring(0, 11) === "!addcommand" && user.username === "dastrn") {
		AddCommand(message);
	};
});

var getTimeStamp = function() {
	var timeStamp = new Date(null);
	timeStamp.setSeconds(uptime);
	return timeStamp.toISOString().substr(11,8);	
};
var initialGamePlayers = ["KayPikeFashion", "iamthem00s3", "BimboGamer"];
var gamePlayers = [];
var gameName = "";
var gameIsActive = false; // Initializing this.
var gameTimeLimit = 0;
var chirpIsActive = false;
var chirpMessage = "";
var chirpInterval = 0;

var GameStart = function(name, timeLimit){
	client.action(options.channels[0], "Starting game " + name + "! Please type " + name + " for a chance to win!");
	gamePlayers.length = 0;
	gamePlayers = initialGamePlayers.slice();
	gameIsActive = true;
	gameName = name;
	gameTimeLimit = function(timeLimit) {
		if (timeLimit != null) {
			return timeLimit;
		}
		else {
			return 0;
		};
	};
	
	//TODO: Add Endgame...and sort this logic out, bro.
	if (gameTimeLimit > 0) {
		var gametimer = setInterval(function() {
			if (gameTimeLimit === 0) {
				clearInterval(gametimer);
			};
			client.action(options.channels[0], gameTimeLimit + " minutes remaining in our giveaway! Please type " + name + " for a chance to win!");
			gameTimeLimit--;
		},60000);
	};
	console.log(gameName);
	console.dir(gamePlayers);
};

var EndGame = function(){
	gameIsActive = false;
	var winnerNum = RandomInt(gamePlayers.length);
	console.log("Winner number is " + winnerNum + " out of " + gamePlayers.length + " players.");
	client.action(options.channels[0], "The game has ended! Our winner is " + gamePlayers[winnerNum - 1]);
};

var AddCommand = function(message) {
	var args = message.split(', ');
	var newCommand = new CustomCommand(args[1], args[2], args[3], args[4]);
	console.dir(newCommand);
	customCommands.push(newCommand);
	console.dir(customCommands);
	jsonfile.writeFile(customCommandsFile, customCommands, {spaces: 4}, function (err){
		console.error(err);
	});
};

// Returns random int from 0 - high double-inclusive.
var RandomInt = function(high) {
	return Math.floor(Math.random() * high + 1);
};

var Chirp = function(message){	
	var args = message.split(";;");
	chirpMessage = args[1];
	chirpInterval = parseFloat(args[2]);
	if (args[1] == null || args[2] == null)
		return;
	chirpIsActive = true;
	client.action(options.channels[0], chirpMessage);
	console.log(" chirpIsActive value: " + chirpIsActive);
	var chirptimer = setInterval(function() {
		if (chirpIsActive) {
			client.action(options.channels[0], chirpMessage);
			console.log("Repeating chirp in " + chirpInterval + " minutes.");
		}
		else {
			clearInterval(chirptimer);
		};
	}, (chirpInterval * 60000));		
};

