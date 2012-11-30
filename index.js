    var net = require("net"); 
	var util = require('util');
    var events = require('events'); 
	var Stream = require('stream').Stream;
	var SerialPort = require('serialport').SerialPort;
	
	exports.datastream = function (port, ipaddress) {
			
			var sp;
			var isLocal = false;
			if(args.length == 1){
				sp = new SerialPort(port, {
                baudrate: 57600,
                buffersize: 1
				});
				isLocal = true;
			}
			if(args.length == 2){
				sp = net.connect( port, ipaddress);
			}
			
			var stream = new Stream();
			stream.readable = true;
			stream.writable = true;
			
			
			var queue = [];
 
			stream.write = function (buf) {
		           if(isLocal){
						queue.push(buf);
						sp.write(buf);
					}else{
						var buffer = new Buffer(buf);
						queue.push(buffer);
						sp.write(buffer);
				   }
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
				stream.emit('data', data);
				queue.shift();
				
				if(queue.length > 0){
					sp.write(queue.shift());
				}
			});
			
			return stream;		
	}