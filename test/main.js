var request = require('supertest');
var assert = require('chai').assert

request = request('http://localhost:8888');

describe('Simple Tests', function(){

	it('Application running', function (done){
		var req = request.get('/notes').expect(200);
		req.end(done);
	});

	it('Saves JSON', function (done){

		var response = {};

		var data = 'data={"noteBody":"test3 test3 test3"}';
		var req = request
			.post('/notes')
			.send(data)
   			.set('Accept', 'application/json')
			.expect(function(res) {
				assert.equal(res.body.success, true, 'success equal `true`');
				assert.typeOf(res.body.filename, 'string');
			})
			.end(done);
	});

	it('Load JSON', function (done){
		var req = request
			.get('/notes')
			.expect(function(res) {
				assert.typeOf(res.body[0].filename, 'string');
			})
			.end(done);
	});

	it('Delete JSON', function (done){
		var req = request
			.del('/notes?filename=test')
			.expect(function(res) {
				assert.equal(res.body.success, true, 'success equal `true`');
			})
			.end(done);
	});

	it('Empty Route', function (done){
		var req = request
			.get('/')
			.expect(404)
			.end(done);
	});

});