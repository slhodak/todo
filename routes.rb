require 'json'
require_relative './database'

db = Database.new

ROUTES = {
  'GET' => {
    'default' => ->(req, res) do
      res.status = 400
      res.set_header('Content-Type', 'text/plain')
      res.body = [ 'Bad Request' ]
      res.finish
    end,
    '/all' => ->(req, res) do
      res.status = 200
      res.set_header('Content-Type', 'text/plain')
      collection = db.client[:myCollection]
      view_all = collection.find.to_a
      res.body = [ view_all.to_json ]
      res.finish
    end,
    '/today' => ->(req, res) do
      # return today's todo list
      res.status = 200
      res.set_header('Content-Type', 'text/plain')
      res.body = [ db.today ]
      res.finish
    end
  },
  'POST' => {
    '/today' => ->(req, res) do
      # create or update today's todo list
      res.status = 200
      res.set_header('Content-Type', 'text/plain')
      res.body = [ 'Sam' ]
      res.finish
    end
  }
}
