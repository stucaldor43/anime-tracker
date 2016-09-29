require 'uri'
require 'net/http'
require 'json'

module Utilities
  def get_hummingbird_response(endpoint)
    base_api_url = 'http://hummingbird.me/api/v1' 
    uri = URI(base_api_url + endpoint)
    req = Net::HTTP::Get.new(uri)
    Net::HTTP.start(uri.hostname, uri.port) do |http|
      http.request(req)
    end
  end
  
  def get_response_body(res)
    JSON.parse("#{res.body}")
  end
  
  def decodeString(str)
    URI.decode(str)    
  end
end

helpers Utilities
