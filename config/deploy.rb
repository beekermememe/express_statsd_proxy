require 'capistrano/ext/multistage'

set :stages, ["int", "production"]
set :default_stage, "int"
