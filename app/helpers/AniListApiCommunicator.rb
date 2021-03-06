require 'uri'
require 'net/http'
require 'json'

class AniListApiCommunicator
   attr_accessor :access_token
   
   def initialize
     update_token
   end
   
   def update_token
     post_params = {'grant_type' => 'client_credentials', 
                        'client_id' => ENV['CLIENT_ID'], 
                        'client_secret' => ENV['CLIENT_SECRET']}
                        
     uri = URI("https://anilist.co/api/auth/access_token")
     req = Net::HTTP::Post.new(uri)
     req.set_form_data(post_params)
     
     res = Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|                                                         
       http.request(req)
     end
     
     if res.code.to_i == 200
       @access_token = JSON.parse("#{res.body}")['access_token']
     end
   end
   
   def make_get_request(path)
     if path.index('?')
        path_with_token = "#{path}&access_token=#{access_token}"
     else
        path_with_token = "#{path}?access_token=#{access_token}"
     end
     
     uri = URI("https://anilist.co/api#{path_with_token}")
     req = Net::HTTP::Get.new(uri)
     
     res = Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|                                                         
       http.request(req)
     end
     
     if res.code.to_i == 200
        res
     else
        update_token
        path_with_token = (path.index('?')) ? "#{path}&access_token=#{access_token}" : "#{path}?access_token=#{access_token}"
        uri = URI("https://anilist.co/api#{path_with_token}")
        req = Net::HTTP::Get.new(uri)
        Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|                                                         
         http.request(req)
        end 
     end
   end
end

configure do 
  set :anilist_communicator, AniListApiCommunicator.new
end
