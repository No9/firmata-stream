var HIGH = 1;
var LOW = 0;
var CAPABILITY_QUERY = 0x6B;
var START_SYSEX = 0xF0;
var END_SYSEX = 0xF7;
var ANALOG_MAPPING_QUERY = 0x69;
var ANALOG_MAPPING_RESPONSE = 0x6A;
	
var version = require('../lib/version').REPORT_VERSION;
var pin = require('../lib/pin');
var serialport = require('../serialportstream');
var board = require('../boardstream');

var sp = serialport.datastream('COM6');
var board = board.layout(); 
//sp.pipe(board).pipe(sp);

sp.write(version);