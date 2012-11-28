    var net = require("net"), 
	util = require('util'),
    events = require('events'), 
	Stream = require('stream').Stream;
	
	exports.datastream = function (port, ipaddress) {
			var stream = new Stream();
			stream.readable = true;
			stream.writable = true;
			
			var sp = net.connect( port, ipaddress);
			
			var queue = [];
 
			stream.write = function (buf) {
				   console.log("sending:" + buf)
				   var buffer = new Buffer(buf);
				   queue.push(buffer);
				   sp.write(buffer);
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
				console.log("recieving:" + data)
				queue.shift();
				
				if(queue.length > 0){
					console.log("SHIFTING");
					sp.write(queue.shift());
				}
			});
			
			return stream;		
	}
	
	