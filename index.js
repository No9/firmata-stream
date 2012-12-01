Stream = require('stream').Stream;
/**
 * constants
 */
Buffer.prototype.toByteArray = function () {
  return Array.prototype.slice.call(this, 0)
}

var PIN_MODE = 0xF4,
    REPORT_DIGITAL = 0xD0,
    REPORT_ANALOG = 0xC0,
    DIGITAL_MESSAGE = 0x90,
    START_SYSEX = 0xF0,
    END_SYSEX = 0xF7,
    QUERY_FIRMWARE = 0x79,
    REPORT_VERSION = 0xF9,
    ANALOG_MESSAGE = 0xE0,
    CAPABILITY_QUERY = 0x6B,
    CAPABILITY_RESPONSE = 0x6C,
    PIN_STATE_QUERY = 0x6D,
    PIN_STATE_RESPONSE = 0x6E,
    ANALOG_MAPPING_QUERY = 0x69,
    ANALOG_MAPPING_RESPONSE = 0x6A,
    I2C_REQUEST = 0x76,
    I2C_REPLY = 0x77,
    I2C_CONFIG = 0x78,
    STRING_DATA = 0x71,
    SYSTEM_RESET = 0xFF;

    /**
     * MIDI_RESPONSE contains functions to be called when we receive a MIDI message from the arduino.
     * used as a switch object as seen here http://james.padolsey.com/javascript/how-to-avoid-switch-case-syndrome/
     * @private
     */

var MIDI_RESPONSE = {};

/**
 * Handles a REPORT_VERSION response and emits the reportversion event.  Also turns on all pins to start reporting
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

MIDI_RESPONSE[REPORT_VERSION] = function(board) {
    console.log("got response REPORT_VERSION");
    board.version.major = board.currentBuffer[1];
    board.version.minor = board.currentBuffer[2];
    console.log(board.version);
    board.emit('reportversion');
};

/**
 * Handles a ANALOG_MESSAGE response and emits 'analog-read' and 'analog-read-'+n events where n is the pin number.
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

MIDI_RESPONSE[ANALOG_MESSAGE] = function(board) {
    console.log("got response analog");
	var value = board.currentBuffer[1] | (board.currentBuffer[2] << 7);
    var port = board.currentBuffer[0] & 0x0F;
    if (board.pins[board.analogPins[port]]) {
        board.pins[board.analogPins[port]].value = value;
    }
    board.emit('analog-read-' + port, value);
    board.emit('analog-read', {
        pin: port,
        value: value
    });
};

/**
 * Handles a DIGITAL_MESSAGE response and emits a 'digital-read' and 'digital-read-'+n events where n is the pin number.
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

MIDI_RESPONSE[DIGITAL_MESSAGE] = function(board) {
    console.log("got response digital");
    var port = (board.currentBuffer[0] & 0x0F);
    var portValue = board.currentBuffer[1] | (board.currentBuffer[2] << 7);
    for (var i = 0; i < 8; i++) {
        var pinNumber = 8 * port + i;
        var pin = board.pins[pinNumber];
        if (pin && (pin.mode == board.MODES.INPUT)) {
            pin.value = (portValue >> (i & 0x07)) & 0x01;
            board.emit('digital-read-' + pinNumber, pin.value);
            board.emit('digital-read', {
                pin: pinNumber,
                value: pin.value
            });
        }
    }
};

/**
 * SYSEX_RESPONSE contains functions to be called when we receive a SYSEX message from the arduino.
 * used as a switch object as seen here http://james.padolsey.com/javascript/how-to-avoid-switch-case-syndrome/
 * @private
 */

var SYSEX_RESPONSE = {};

/**
 * Handles a QUERY_FIRMWARE response and emits the 'queryfirmware' event
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

SYSEX_RESPONSE[QUERY_FIRMWARE] = function(board) {
    console.log("got response QUERY_FIRMWARE");
    var firmwareBuf = [];
    board.firmware.version = {};
    board.firmware.version.major = board.currentBuffer[2];
    board.firmware.version.minor = board.currentBuffer[3];
    for (var i = 4, length = board.currentBuffer.length - 2; i < length; i += 2) {
        firmwareBuf.push((board.currentBuffer[i] & 0x7F) | ((board.currentBuffer[i + 1] & 0x7F) << 7));

    }
	
    board.firmware.name = new Buffer(firmwareBuf).toString('utf8', 0, firmwareBuf.length);
	board.emit('ready');
};

/**
 * Handles a CAPABILITY_RESPONSE response and emits the 'capability-query' event
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

SYSEX_RESPONSE[CAPABILITY_RESPONSE] = function(board) {
    console.log("got response CAPABILITY_RESPONSE");
	var supportedModes = 0;
    var modesArray;
    for (var i = 2, n = 0; i < board.currentBuffer.length - 1; i++) {
        if (board.currentBuffer[i] == 127) {
            modesArray = [];
            Object.keys(board.MODES).forEach(function(mode) {
                if (supportedModes & (1 << board.MODES[mode])) {
                    modesArray.push(board.MODES[mode]);
                }
            });
            board.pins.push({
                supportedModes: modesArray,
                mode: board.MODES.OUTPUT,
                value : 0
            });
            supportedModes = 0;
            n = 0;
            continue;
        }
        if (n === 0) {
            supportedModes |= (1 << board.currentBuffer[i]);
        }
        n ^= 1;
    }
    board.emit('capability-query');
};

/**
 * Handles a PIN_STATE response and emits the 'pin-state-'+n event where n is the pin number
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

SYSEX_RESPONSE[PIN_STATE_RESPONSE] = function(board) {
    console.log("got response PIN_STATE_RESPONSE");
	var pin = board.currentBuffer[2];
    board.pins[pin].mode = board.currentBuffer[3];
    board.pins[pin].value = board.currentBuffer[4];
    if (board.currentBuffer.length > 6) {
        board.pins[pin].value |= (board.currentBuffer[5] << 7);
    }
    if (board.currentBuffer.length > 7) {
        board.pins[pin].value |= (board.currentBuffer[6] << 14);
    }
    board.emit('pin-state-' + pin);
};

/**
 * Handles a ANALOG_MAPPING_RESPONSE response and emits the 'analog-mapping-query' event.
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

SYSEX_RESPONSE[ANALOG_MAPPING_RESPONSE] = function(board) {
    console.log("got response ANALOG_MAPPING_RESPONSE");
	
	var pin = 0;
    var currentValue;
    for (var i = 2; i < board.currentBuffer.length - 1; i++) {
        currentValue = board.currentBuffer[i];
        board.pins[pin].analogChannel = currentValue;
        if (currentValue != 127) {
            board.analogPins.push(pin);
        }
        pin++;
    }
    board.emit('analog-mapping-query');
};

/**
 * Handles a I2C_REPLY response and emits the 'I2C-reply-'+n event where n is the slave address of the I2C device.
 * The event is passed the buffer of data sent from the I2C Device
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

SYSEX_RESPONSE[I2C_REPLY] = function(board) {
    console.log("got response I2C_REPLY");
	var replyBuffer = [];
    var slaveAddress = (board.currentBuffer[2] & 0x7F) | ((board.currentBuffer[3] & 0x7F) << 7);
    var register = (board.currentBuffer[4] & 0x7F) | ((board.currentBuffer[5] & 0x7F) << 7);
    for (var i = 6, length = board.currentBuffer.length - 1; i < length; i += 2) {
        replyBuffer.push(board.currentBuffer[i] | (board.currentBuffer[i + 1] << 7));
    }
    board.emit('I2C-reply-' + slaveAddress, replyBuffer);
};

/**
 * Handles a STRING_DATA response and logs the string to the console.
 * @private
 * @param {Board} board the current arduino board we are working with.
 */

SYSEX_RESPONSE[STRING_DATA] = function(board) {
    console.log("got response STRING_DATA");
	board.emit('string',new Buffer(board.currentBuffer.slice(2, -1)).toString('utf8'));
};



exports.layout = function(){
		var board = new Stream();
		
		board.MODES = {
            INPUT: 0x00,
            OUTPUT: 0x01,
            ANALOG: 0x02,
            PWM: 0x03,
            SERVO: 0x04
        };
		
        board.I2C_MODES = {
            WRITE: 0x00,
            READ: 1,
            CONTINUOUS_READ: 2,
            STOP_READING: 3
        };
        board.HIGH = 1;
        board.LOW = 0;
        board.pins = [];
        board.analogPins = [];
        board.version = {};
        board.firmware = {};
        board.currentBuffer = [];
        board.versionReceived = false;
		board.reading = true;
		
			board.readable = true;
			board.writable = true;
			
			board.write = function (data) {
			
				if(Buffer.isBuffer(data)){
					board.currentBuffer = board.currentBuffer.concat(data.toByteArray());
			    }
				
				console.log("data event : " + data);
			    console.log(data);
				
			if (!board.versionReceived && data[0] !== REPORT_VERSION) {
				console.log("!board.versionReceived && data[0] !== REPORT_VERSION");
                return;
            } else {
                board.versionReceived = true;
            }
			
			console.log("board.currentBuffer.length : " + board.currentBuffer.length);
			
			if(!Buffer.isBuffer(data)){
            //we dont want to push 0 as the first byte on our buffer
				if ((board.currentBuffer.length === 0 && data[0] !== 0 || board.currentBuffer.length)) {
					board.currentBuffer.push(data[0]);
				}
			}
			console.log("board.currentBuffer.length : " + board.currentBuffer.length);
            //a MIDI or SYSEX command function we are going to call
            var cmdFunc;
            var cmd;
            //if the first byte is START_SYSEX and last byte is END_SYSEX we have a SYSEX command.
            if (board.currentBuffer[0] == START_SYSEX && board.currentBuffer[board.currentBuffer.length - 1] == END_SYSEX) {
			    console.log("We have a sysex");
                cmdFunc = SYSEX_RESPONSE[board.currentBuffer[1]];
				//if the first byte is not a START_SYSEX and we have 3 bytes we might have a MIDI Command
            } else if (board.currentBuffer.length == 3 && board.currentBuffer[0] != START_SYSEX) {
                //commands under 0xF0 we have a multi byte command
				console.log("board.currentBuffer.length == 3");
                if (board.currentBuffer[0] < 240) {
					console.log("multi byte command");
                    cmd = board.currentBuffer[0] & 0xF0;
                } else {
				    console.log("byte command");
                    cmd = board.currentBuffer[0];
                }
                cmdFunc = MIDI_RESPONSE[cmd];
            }
            //if a function is found we will call it
				if (cmdFunc) {
					 console.log("calling command");
						
					//call function with board object
					cmdFunc(board);
					//reset currentBuffer so we can receive the next command
					console.log("Emptying Board");
					board.currentBuffer = [];
				}
			};
			
			board.end = function (buf) {
				if (arguments.length) board.write(buf);

				board.writable = false;
				console.log(bytes + ' bytes written');
			};

			board.destroy = function () {
				board.writable = false;
			};
		return board;
		}
			
