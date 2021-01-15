require_relative './routes'

class Server
  def call(env)
    req = Rack::Request.new env
    res = Rack::Response.new
    if ROUTES[req.request_method][req.path]
      ROUTES[req.request_method][req.path].call(req, res)
    else
      ROUTES['default'].call(req, res)
    end
  end
end
