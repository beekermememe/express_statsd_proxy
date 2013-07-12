StatsdProxyServer
============

A HTTP proxy to Statsd, written in Node, extended from [this gist](). [Statsd](http://github.com/etsy/statsd) is awesome, but sometimes you don't have the option of opening a non-HTTP port on one service to connect to your metrics server. For example, on AppEngine, we're limited to using URLFetch - a wrapper around httplib - to hit external services.

**statsd-proxy** is an HTTP proxy that takes a POST request and forwards a proper UDP request to Statsd. Some examples:

    import requests
    r = requests.post('http://mymetrics.example.net', {
    	'stat_path': 'some.metric'
    	'stat_type': 'timer', # type, counter, timer, guage
    	'stat_value': n # value
    	})
