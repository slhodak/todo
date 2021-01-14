require_relative './server'

use Rack::Reloader, 0
use Rack::ContentLength
use Rack::Static, :urls => { 
  '/' => 'index.html',
  '/bundle.js' => 'bundle.js'
}, :root => 'public'
use Rack::ShowExceptions
use Rack::Lint

run Server.new
