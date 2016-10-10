require 'sinatra'

class Cache
  attr_accessor :items, :capacity
  
  def initialize
    @items = {}
    @capacity = 500
  end
  
  def getItem(key)
    items.fetch(key, nil)  
  end
  
  def addItem(key, value)
    if items.length >= capacity
       key_to_delete = items.keys[0]
       items.delete(key_to_delete)
    end
    
    items[key] = value  
  end
end

configure do
  set :cache, Cache.new
end