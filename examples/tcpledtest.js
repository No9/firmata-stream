var HIGH = 1;
var LOW = 0;
var CAPABILITY_QUERY = 0x6B;
var START_SYSEX = 0xF0;
var END_SYSEX = 0xF7;
var ANALOG_MAPPING_QUERY = 0x69;
var ANALOG_MAPPING_RESPONSE = 0x6A;
var REPORT_DIGITAL = 0xD0;
var REPORT_ANALOG = 0xC0;
var version = require('../lib/version').REPORT_VERSION;
var pin = require('../lib/pin');
var serialport = require('../tcpstream');
var board = require('../boardstream');

var sp = serialport.datastream();
var board = board.layout(); 
sp.pipe(board).pipe(sp);
sp.write(version);

board.on('reportversion', function(){
   console.log("VERSION REPORTED");
   sp.write([START_SYSEX, CAPABILITY_QUERY, END_SYSEX]);
});

board.on('capability-query', function(){
	sp.write([START_SYSEX, ANALOG_MAPPING_QUERY, END_SYSEX]);
});

board.on('analog-mapping-query', function(){
				sp.write(pin.pinMode(13, 0x01));
				var state = 0;
				setInterval(function(){
						state = state == 0 ? 1 : 0;
						console.log("Controller Setting PIN 13 :" + state);
						sp.write(pin.digitalWrite(board, 13, state));
				}, 1000)
		});
