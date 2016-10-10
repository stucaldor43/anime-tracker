require 'sinatra'

class Cache
  attr_accessor :items
  
  def initialize
    @items = {}  
  end
  
  def getItem(key)
    items.fetch(key, nil)  
  end
  
  def addItem(key, value)
    items[key] = value  
  end
end

configure do
  set :cache, Cache.new
end