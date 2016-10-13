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
  
  def make_hummingbird_post_request(path, post_parameters)
     uri = URI("http://hummingbird.me/api/v1#{path}")
     req = Net::HTTP::Post.new(uri)
     req.set_form_data(post_parameters)
     
     res = Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|                                                         
       http.request(req)
     end
     
     if res.code.to_i == 200
        res
     else
        Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|                                                         
         http.request(req)
        end 
     end
  end
  
  def find_hummingbird_user_authentication_token(user, password)
    path = "/users/authenticate"
    post_parameters = {'username' => user, 'password' => password}
    res = make_hummingbird_post_request(path, post_parameters)
    (res.code.to_i == 201) ? res.body : nil
  end
end

helpers Utilities
