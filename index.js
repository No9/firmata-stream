var SerialPort = require('serialport').SerialPort,
    util = require('util'),
    events = require('events'), 
	Stream = require('stream').Stream;
	
	exports.datastream = function (port) {
			var stream = new Stream();
			stream.readable = true;
			stream.writable = true;
			
			var sp = new SerialPort(port, {
                baudrate: 57600,
                buffersize: 1
            });
			
			stream.write = function (buf) {
			    console.log("Writing to serial Port : " + buf);
			    sp.write(buf);
			};
			
			stream.end = function (buf) {
				if (arguments.length) stream.write(buf);

				stream.writable = false;
				console.log(bytes + ' bytes written I AM N0T LISTENING TO YOU ANY MORE');
			};

			stream.destroy = function () {
				stream.writable = false;
			};
			
			
			sp.on('data', function(data) {
				console.log("Reading from serial Port");
				stream.emit('data', data);
			});
			
			return stream;		
	}
	
	