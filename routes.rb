require 'json'

ROUTES = {
  'default' => ->(req, res) do
    res.status = 400
    res.set_header('Content-Type', 'text/plain')
    res.body = [ 'Bad Request' ]
    res.finish
  end,
  '/data' => ->(req, res) do
    data = {
      a: 1,
      b: 2,
      c: 3
    }
    res.status = 200
    res.set_header('Content-Type', 'text/plain')
    res.body = [ data.to_json ]
    res.finish
  end,
  '/name' => ->(req, res) do
    res.status = 200
    res.set_header('Content-Type', 'text/plain')
    res.body = [ 'Sam' ]
    res.finish
  end
}
