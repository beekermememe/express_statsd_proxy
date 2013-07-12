var express = require('express');
var myWebApp = express();

var STATSD_HOST = 'int-radish01-statsd02.dishonline.com';
var STATSD_PORT = 8125;

var SERVE_HOST = '127.0.0.1'
var SERVE_PORT = 8082

sdc = require('statsd-client'),
SDC = new sdc({
    host: STATSD_HOST, port: STATSD_PORT});

function dt(){
    d = new Date();
    return [d.getFullYear(),
            d.getMonth() + 1,
            d.getDate()].join('-') + ' ' + [
		d.getHours(),
		d.getMinutes()].join(':');
}

console.log(dt() + ' statsd-proxy starting; statsd is ' + STATSD_HOST + ':' + STATSD_PORT + '...');

myWebApp.enable('trust proxy')

myWebApp.use(express.methodOverride());
myWebApp.use(express.bodyParser()); 
// ## CORS middleware
// 
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS methodOverride
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
myWebApp.use(allowCrossDomain);


myWebApp.get('/health/all', function(request,response) {
  console.log("health request");
  response.setHeader('Content-Type', 'application/json');
  response.write('{"server":"green"}');
  response.end();
})

myWebApp.get('/', function(request,response) {
  console.log("root url request")
  response.writeHeader('200');
  response.write('<html>I am Alive</html>');
  response.end();
})

myWebApp.post('/log_stats',function(request,response) {
  var data = request.body
  console.log("bdy " + Object.getOwnPropertyNames(request.body));

  if(request.body !== null && request.body !== undefined) {
    console.log(request.body.stat_type + "Req body : " + request.body.stat_path + " : " + request.body.stat_value);
  } 

  if (data.stat_path === undefined || data.stat_type === undefined || data.stat_value === undefined) {
    console.info("Undefined data points : " + data.stat_path + " : " + + data.stat_type + ":" + data.stat_value + "|" + body_data);
    response.setHeader('Content-Type', 'application/json');
    response.writeHeader('Status','400');
    response.write('{"status":"Error - failed to pass all stats info to api"}')
    response.end();
    return;
  }
  
  console.info(dt() + ' statsd-proxy: ' + data.stat_path + ':' +
         data.stat_type + '|' + data.stat_value + ' (' + request.ip + ')');

  switch (data.stat_type) {
  case 'count':
            SDC.increment(data.stat_path, data.stat_value);
            break;
  case 'timer':
            SDC.timing(data.stat_path, data.stat_value);
            break;
  case 'gauge':
            SDC.gauge(data.stat_path, data.stat_value);
            break;
  }
  response.setHeader('Content-Type', 'application/json');
  response.writeHeader('Status','200');
  response.write('{"status":"success"}')
  response.end(); 
})

myWebApp.listen(8082);
