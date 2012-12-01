var version = require('../lib/version').REPORT_VERSION;
var pin = require('../lib/pin');
var serialport = require('../');
var board = require('../boardstream');

var HIGH = 1;
var LOW = 0;
var CAPABILITY_QUERY = 0x6B;
var START_SYSEX = 0xF0;
var END_SYSEX = 0xF7;
var ANALOG_MAPPING_QUERY = 0x69;
var ANALOG_MAPPING_RESPONSE = 0x6A;
var MOTOR1 = 12;
var MOTOR2 = 13;
var BREAK1 = 9;
var BREAK2 = 8;
var SPEEDPIN1 = 3;
var SPEEDPIN2 = 11;


var sp = serialport.datastream('COM6');
var board = board.layout(); 
var OUTPUT = board.MODES.OUTPUT;
var ANALOG = board.MODES.ANALOG;
var PWM = board.MODES.PWM;

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
						//sp.write(pin.pinMode(13, 0x01));
				console.log(OUTPUT);
				sp.write(pin.pinMode( MOTOR2, OUTPUT )); 
				sp.write(pin.pinMode( BREAK2, OUTPUT ));
				sp.write(pin.pinMode( SPEEDPIN2, PWM ));
				
				sp.write(pin.digitalWrite(board, MOTOR2, HIGH));
				sp.write(pin.digitalWrite(board, BREAK2, LOW ));
				sp.write(pin.analogWrite(board, SPEEDPIN2, 255));
				
				//this.digitalWrite(MOTOR2, HIGH ); //Establishes backward direction of Channel A
				   //Disengage the Brake for Channel A#
				//this.analogWrite(board, SPEEDPIN2, 255);   //Spins the motor on Channel A at half speed
				setTimeout(function() {
					console.log("wait complete")
				sp.write(pin.digitalWrite(board, BREAK2, HIGH ));
				sp.write(pin.analogWrite(board, SPEEDPIN2, 0));	
					
				}, 2000);
		});
