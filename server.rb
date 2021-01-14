require_relative './routes'

class Server
  def call(env)
    req = Rack::Request.new env
    res = Rack::Response.new
    ROUTES[req.path].call(req, res)
  end
end
