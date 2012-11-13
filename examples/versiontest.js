/*var serialport = require("serialport");
serialport.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port);
    });
  });
  */
  
var HIGH = 1;
var LOW = 0;
  
var version = require('./version').REPORT_VERSION;
var pin = require('./pin');

var serialport = require('../');
var board = require('../board');

var stm = serialport.datastream('COM6');
var layout = board.layout(); 
stm.pipe(layout);


setTimeout(function(){
	console.log("Writing : " + version + " to com6");
	stm.write(version);
	stm.write(pin.pinMode(13, 0x01));
	stm.write(pin.digitalWrite(13, HIGH));
}, 3000);


//setTimeout(stm.write(pins.pinMode(13, 0x01)), 3000);
