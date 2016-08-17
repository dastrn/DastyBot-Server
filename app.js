var tmi = require('tmi.js');
var zmq = require('zmq');
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
		password: "oauth:"
	},
	channels: ["dastrn"]
};

var publisher = zmq.socket('pub');
var subscriber = zmq.socket('sub');

subscriber.on("message", function () {
	var messageArgs = arguments;
	// Arg[0] = sub channel name
	// Arg[1] = Response Text
	// Arg[2] = Response Target Type
	// Arg[3] = Response Target

	if (messageArgs[2].toString() === "channel")
		client.action(messageArgs[3].toString(), messageArgs[1].toString());
	else if(messageArgs[2].toString() === "whisper")
		client.whisper(messageArgs[3].toString(), messageArgs[1].toString());	
});

var client = new tmi.client(options);
client.connect();

var uptime = 0;

//process.on('SIGINT', function() {
//  publisher.close();
//  subscriber.close();
//});

client.on('connected', function(){
	client.action(options.channels[0], "DastyBot is alive!");
});
client.on('connected', function(address, port) {
	console.log("address: " + address + " port: " + port);
});

client.on('chat', function(channel, user, message, self) {
	if (message.substring(0, 1) === "!") {
		chatParseService(channel, user, message, "BOTChat", self);
	}
});

var chatParseService = function(channel, user, message, pubChannel, self){
	var messageString = jsonify(message, user.username, channel).toString();
	//console.log(messageString);
	publisher.send(pubChannel, zmq.ZMQ_SNDMORE);
	publisher.send(messageString);
};

var jsonify = function(message, username, channel){
	var theMessage = message.replace(/'/g, "");
	var prejson = [{
		'CommandText': theMessage,
		'Source': username,
		'SourceLocation': channel		
	}];
	var json = JSON.stringify(prejson);
	return json;	
};

client.on("join", function (channel, username, self) {
   //client.action(options.channels[0], " welcomes " + username + " to the stream.");
	client.action(options.channels[0], " welcomes new viewers to the stream.");
});

publisher.bind('tcp://192.168.1.129:5555');
subscriber.connect('tcp://localhost:5556');
subscriber.subscribe('BOT');

client.on('whisper', function (user, message){
	chatParseService(user.username, user, message, "BOTWhisper");	
	
});