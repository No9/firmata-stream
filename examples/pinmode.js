var PIN_MODE = 0xF4;

exports.pinMode = function(pin, mode) {
    return [PIN_MODE, pin, mode];
};