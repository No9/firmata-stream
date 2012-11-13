/*var serialport = require("serialport");
serialport.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port);
    });
  });
  */
  
var HIGH = 1;
var LOW = 0;
var CAPABILITY_QUERY = 0x6B;
var START_SYSEX = 0xF0;
var END_SYSEX = 0xF7;
var ANALOG_MAPPING_QUERY = 0x69;
var ANALOG_MAPPING_RESPONSE = 0x6A;
	
var version = require('./version').REPORT_VERSION;
var pin = require('./pin');

var serialport = require('../');
var board = require('../board');

var stm = serialport.datastream('COM6');
var layout = board.layout(); 
stm.pipe(layout).pipe(stm);
//.pipe(stm);


setTimeout(function(){
	//console.log("Writing : " + version + " to com6");
	stm.write(version);
}, 5000);

setTimeout(function(){
	//console.log("Writing : " + version + " to com6");
	stm.write([START_SYSEX, CAPABILITY_QUERY, END_SYSEX]);
}, 10000);

setTimeout(function(){
	//console.log("Writing : " + version + " to com6");
	stm.write([START_SYSEX, ANALOG_MAPPING_QUERY, END_SYSEX]);
}, 15000);





setTimeout(function(){
	console.log("Controller Setting PIN 13 : OUTPUT");
	stm.write(pin.pinMode(13, 0x01));
	}, 20000)
setTimeout(function(){

	console.log("Controller Setting PIN 13 : HIGH");
	stm.write(pin.digitalWrite(layout, 13, HIGH));
	}, 25000)

setTimeout(function(){

	console.log("Controller Setting PIN 13 : LOW");
	stm.write(pin.digitalWrite(layout, 13, LOW));
	}, 30000)	

//setTimeout(stm.write(pins.pinMode(13, 0x01)), 3000);
