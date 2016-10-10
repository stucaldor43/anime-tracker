require 'sinatra'

class Cache
  attr_accessor :items, :item_limit
  
  def initialize
    @items = {}
    @item_limit = 500
  end
  
  def getItem(key)
    items.fetch(key, nil)  
  end
  
  def addItem(key, value)
    if items.length >= item_limit
       key_to_delete = items.keys[0]
       items.delete(key_to_delete)
    end
    
    items[key] = value  
  end
end

configure do
  set :cache, Cache.new
end