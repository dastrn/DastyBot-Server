var zmq = require('zmq')
var publisher = zmq.socket('pub')

publisher.bind('tcp://*:5555', function(err) {
  if(err)
    console.log(err)
  else
    console.log('Listening on 5555…')
})

setInterval(function() {
  //if you pass an array, send() uses SENDMORE flag automatically
  publisher.send(["A", "We do not want to see this"]);
  //if you want, you can set it explicitly
  publisher.send("BOT", "We would like to see this");
  //publisher.send();
},1000);