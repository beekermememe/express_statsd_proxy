set :application, "proxy_server"
set :repository,  "git@github.com/beekermememe/express_statsd_proxy.git"
set :user, "deploy"
set :scm, :git
set :deploy_to, "/srv/node/stats_d_proxy_server"

role :app, "my.proxyserver.com"
