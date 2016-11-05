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
  
  def decode_string(str)
    URI.decode(str)    
  end
  
  def encode_string(str)
    URI.encode(str)
  end
  
  def make_hummingbird_post_request(path, post_parameters)
     uri = URI("http://hummingbird.me/api/v1#{path}")
     req = Net::HTTP::Post.new(uri)
     req.set_form_data(post_parameters) if post_parameters
     
     res = Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|                                                         
       http.request(req)
     end
  end
  
  def find_hummingbird_user_authentication_token(user, password)
    path = "/users/authenticate"
    post_parameters = {'username' => user, 'password' => password}
    res = make_hummingbird_post_request(path, post_parameters)
    (res.code.to_i == 201) ? res.body.gsub(/"/, "") : nil
  end
  
  def get_hummingbird_anime_object(anilist_id)
    url = "/anime/#{anilist_id}"
    series_model = get_response_body(settings.anilist_communicator.make_get_request(url))
    show_type = get_hummingbird_show_type_equivalent(series_model['type'])
    anilist_english_title = series_model['title_english']
    anilist_romaji_title = series_model['title_romaji']
    res = get_hummingbird_response("/search/anime?query=#{encode_string(anilist_english_title)}")
    
    return nil if res.code.to_i != 200
    anime_objects = get_response_body(res)
    anime_objects.find do |item| 
      item['title'].downcase == anilist_english_title.downcase || 
      item['title'].downcase == anilist_romaji_title.downcase
    end
  end
  
  def get_hummingbird_show_type_equivalent(id)
    hummingbird_show_types = {
      0 => "TV",
      1 => "TV",
      2 => "Movie",
      3 => "Special",
      4 => "OVA",
      5 => "ONA",
      6 => "Music"
    }
    hummingbird_show_types[id]
  end
  
  def show_is_in_user_library?(show_id)
    library_entries = get_response_body(get_hummingbird_response("/users/#{session['username']}/library"))
    sorted_library_entries = library_entries.sort {|x, y| x['anime']['id'] <=> y['anime']['id']}
    sorted_library_entries.index {|entry| entry['anime']['id'] == show_id} ? true : false
  end
end

helpers Utilities
