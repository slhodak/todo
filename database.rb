require 'mongo'

class Database
  attr_reader :client, :database, :collections

  HOST = '127.0.0.1'
  PORT = 27017

  def initialize
    opts = [ "#{HOST}:#{PORT}" ]
    @client = Mongo::Client.new(opts, :database => 'myNewDb')
    @database = @client.database
    @collections = @database.collections
  end

  def today
    file = File.open './data/sample_document.json'
    data = file.read
    file.close
    data
  end
end
