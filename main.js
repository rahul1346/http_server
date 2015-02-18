// require http server
var http = require("http");

// require url helper
var url = require("url");

// require url helper
var qs = require("querystring");

// require filesystem helper
var fs = require('fs');

// require async helper
var async = require('async');

// require uuid helper
var uuid = require('node-uuid');

// Turn an arrayybuffer into a string
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
};


/**
 * Notes Route
 */
var notes = {
	
	/**
	 * Create A Note
	 */
	create: function(request, response) {

		var buffer = '';

		request.on('data', function(chunk) {
			var body = qs.parse(chunk.toString());
			buffer = body.data;
			console.log("Received body data:");
			console.log(buffer);
		});

		request.on('end', function() {

			var filename = uuid.v4();

			fs.writeFile('./data/notes/' + filename + '.json', buffer, function (err) {
				console.log('Created: ' + './data/notes/' + filename + '.json');
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write('{"success":true, "filename": "'+filename+'"}');
				response.end();
			});

		});

	},

	/**
	 * List All Notes
	 */
	read: function(request, response) {

		var data = [];

		fs.readdir('./data/notes', function(err, files) {
			async.eachSeries(
				files,
				function(filename, callback) {
					fs.readFile('./data/notes/' + filename, function(err, buffer) {
						data.push({
							filename: filename,
							data: JSON.parse(ab2str(buffer))
						});
						callback();
					});
				},
				function(err) {
					response.writeHead(200, {"Content-Type": "application/json"});
					response.write(JSON.stringify(data));
					response.end();
				}
			);
		});

	},

	/**
	 * Delete A Note
	 */
	del: function(request, response) {

		var path = url.parse(request.url).query;
		var filename = qs.parse(path).filename;

		fs.unlink('./data/notes/' + filename + '.json', function (err) {
			console.log('Deleted: ' + './data/notes/' + filename + '.json');
			response.writeHead(200, {"Content-Type": "application/json"});
			response.write('{"success":true}');
			response.end();
		});

	}

};



/**
 * URL Router
 */
var route = function(request, response) {

	var action = '';

	switch(request.method) {
		case 'POST':
			action = 'create';
		break;
		case 'GET':
			action = 'read';
		break;
		case 'DELETE':
			action = 'del';
		break;
	}

	switch(url.parse(request.url).pathname) {
		case '/notes':
			notes[action](request, response);
		break;
		default:
			response.writeHead(404, {"Content-Type": "application/json"});
		    response.write('{"success":false,"message":"No route for URL"}');
		    response.end();
	}

}



/**
 * Handle HTTP Requests
 */
function onRequest(request, response) {

	route(request, response);

}



/**
 * Start Our Server
 */
http.createServer(onRequest).listen(8888);
console.log("Server has started.");
