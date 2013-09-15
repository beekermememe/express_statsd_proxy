StatsdProxyServer
============

A HTTP proxy to Statsd, written in Node, extended from [this gist](). [Statsd](http://github.com/etsy/statsd) is awesome, but sometimes you don't have the option of opening a non-HTTP port on one service to connect to your metrics server. For example, on AppEngine, we're limited to using URLFetch - a wrapper around httplib - to hit external services.


This version leverages express to implement the gist mentioned above. Testing on a medium AWS instance served 27k requests per minutes. My test harness maxed out at thie request, so it may be able to handle more.

This sample has capistrano set up samples to manage deployment. I use node forever to keep the server running and the cap recipe is using this in the restart phase.


