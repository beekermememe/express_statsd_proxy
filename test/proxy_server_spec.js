var assert = require("assert");
var sinon = require('sinon-mocha');
var http = require('http');
var needle = require('needle');

var proxyserver = require('../proxy_server');

describe('proxy_server',function() {
    before(function(){
      
    });

	after(function(){

    });

	it("should return an error",function(){
      assert.equal(1,1);
      options = {
      	hostname: "127.0.0.1",
      	port: 8082,
      	path: '/log_stats',
      	method: 'POST'
      };
      var returned_data = "";
      var returned_status = 0;
      var req = http.request(options, function(resp){
        returned_status = resp.statusCode;
        resp.on('data',function(chunk){
          returned_data += chunk;
        });
        resp.on('end', function(){
          assert.equal(returned_status,400);
          assert.equal(JSON.parse(returned_data).status,'error');
        });        
      });
      req.write(JSON.stringify({ stat_path: 'test.test.test', stat_type: 'timer', stat_value: '1'}));

      req.end();
      req.on('error',function(err){
         console.log("Got Error " + err.message);
      });
    });

	it("should not return an error",function(){
      assert.equal(1,1);
      options = {
      	hostname: "127.0.0.1",
      	port: 8082,
      	path: '/log_stats',
      	method: 'POST'
      };
      var returned_data = "";
      var returned_status = 0;
      needle.post("http://127.0.0.1:8082/log_stats",{ stat_path: 'test.test.test', stat_type: 'timer', stat_value: '1'}, function(err, resp, body){
        assert.equal(resp.statusCode,200);
        assert.equal(body.status,'success');
      });
    });
});
