var express = require('express');
var myWebApp = express();
var config = require('yaml-config');

var settings = config.readConfig(__dirname + '/config/app.yaml');

sdc = require('statsd-client'),
SDC = new sdc({
    host: settings.server.statsd_host, port: settings.server.statsd_port});

function dt(){
    d = new Date();
    return [d.getFullYear(),
            d.getMonth() + 1,
            d.getDate()].join('-') + ' ' + [
		d.getHours(),
		d.getMinutes()].join(':');
}

console.log(dt() + ' statsd-proxy starting; statsd is ' + settings.server.statsd_host + ':' + settings.server.statsd_port + '...');

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

  if (data.stat_path === undefined || data.stat_type === undefined || data.stat_value === undefined) {
    response.send(400,{"status": "error","description" : "failed to pass all stats info to api"});
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
  response.send(200,{"status": "success","description" : "successfully sent on stat to statsd server"});
})

for(i=0;i<settings.server.server_ports;i++){
  console.log("Listen on port " + (settings.server.server_port_start+i));
  myWebApp.listen(settings.server.server_port_start+i);
}
