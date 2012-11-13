var PIN_MODE = 0xF4;
var DIGITAL_MESSAGE = 0x90; 

exports.pinMode = function(pin, mode) {
    return [PIN_MODE, pin, mode];
};

exports.digitalWrite = function(pin, value) {
    var pins = [];
	
    var port = Math.floor(pin / 8);
    var portValue = 0;
   /* pins[pin].value = value;
    for (var i = 0; i < 8; i++) {
        if (pins[8 * port + i].value) portValue |= (1 << i);
    }*/
	var retval = [DIGITAL_MESSAGE | port, portValue & 0x7F, (portValue >> 7) & 0x7F];
	console.log(retval);
	
    return [DIGITAL_MESSAGE | port, portValue & 0x7F, (portValue >> 7) & 0x7F];
};