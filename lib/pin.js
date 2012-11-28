var PIN_MODE = 0xF4;
var DIGITAL_MESSAGE = 0x90; 
var ANALOG_MESSAGE = 0xE0;

exports.pinMode = function(pin, mode) {
    return [PIN_MODE, pin, mode];
};

exports.digitalWrite = function(board, pin, value) {
    var port = Math.floor(pin / 8);
    var portValue = 0;
    board.pins[pin].value = value;
    for (var i = 0; i < 8; i++) {
        if (board.pins[8 * port + i].value) portValue |= (1 << i);
    }
	return [DIGITAL_MESSAGE | port, portValue & 0x7F, (portValue >> 7) & 0x7F];
};

exports.analogWrite = function(board, pin, value) {
    board.pins[pin].value = value;
    return [ANALOG_MESSAGE | pin, value & 0x7F, (value >> 7) & 0x7F];
};