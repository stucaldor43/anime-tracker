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
  
  def login(code)
    form_data = {
      "grant_type" => "authorization_code",
      "client_id" => ENV['CLIENT_ID'],
      "client_secret" => ENV['CLIENT_SECRET'],
      "redirect_uri" => "http://ruby-sirius49.c9users.io:8081/login",
      "code" => code,
    }
    res = make_anilist_post_request('/auth/access_token', form_data)
    return if !((200..299) === res.code.to_i)
    
    credentials = JSON.parse(res.body)
    session['access_token'] = credentials['access_token']
    session['refresh_token'] = credentials['refresh_token']
    session['token_type'] = credentials['token_type']
    session['username'] = JSON.parse(make_anilist_get_request('/user').body)['display_name']
  end
  
  def make_anilist_post_request(path, post_data)
    uri = URI.parse("https://anilist.co/api#{path}")
    request = Net::HTTP::Post.new(uri)
    request.set_form_data(post_data)
    if session['access_token']
      request['Authorization'] = "#{session['token_type'].capitalize} #{session['access_token']}"
    end
    req_options = {
      use_ssl: uri.scheme == "https",
    }
    
    response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      res = http.request(request)
      if res.code.to_i > 199 && res.code.to_i < 300
        res
      else
        refresh_anilist_access_token
        http.request(request)
      end
    end
  end
  
  def make_anilist_get_request(endpoint)
    base_url = 'https://anilist.co/api' 
    uri = URI("#{base_url}#{endpoint}")
    request = Net::HTTP::Get.new(uri)
    if session['access_token']
      request['Authorization'] = "#{session['token_type'].capitalize} #{session['access_token']}"
    end
    req_options = {
      use_ssl: uri.scheme == "https",
    }
    
    Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      res = http.request(request)
      if res.code.to_i > 199 && res.code.to_i < 300
        res
      else
        refresh_anilist_access_token
        http.request(request)
      end
    end  
  end
  
  def make_anilist_put_request(endpoint, data)
    uri = URI.parse("https://anilist.co/api#{endpoint}")
    request = Net::HTTP::Put.new(uri)
    if session['access_token']
      request['Authorization'] = "#{session['token_type'].capitalize} #{session['access_token']}"
    end
    request.set_form_data(data)
    req_options = {
      use_ssl: uri.scheme == 'https'
    }
    
    Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      res = http.request(request)
      if res.code.to_i > 199 && res.code.to_i < 300
        res
      else
        refresh_anilist_access_token
        http.request(request)
      end
    end  
  end
  
  def refresh_anilist_access_token
    form_data = {
      "grant_type" => 'refresh_token',
      "client_id" => ENV['CLIENT_ID'],
      "client_secret" => ENV['CLIENT_SECRET'],
      "refresh_token" => session['refresh_token']
    }
    res = make_anilist_post_request('/auth/access_token', form_data)
    return if !((200..299) === res.code.to_i)
    
    credentials = JSON.parse(res.body)
    session['access_token'] = credentials['access_token']
  end
  
  def create_animelist_put_data(original_hash, new_hash)
    form_fields = ['list_status', 'score', 'score_raw', 'episodes_watched', 'rewatched',
    'notes', 'advanced_rating_scores', 'custom_lists', 'hidden_default']
    post_merge_hash = {}
    post_merge_hash['id'] = original_hash['series_id']
    form_fields.each do |field|
      post_merge_hash[field] = new_hash[field] || original_hash[field]
    end
    post_merge_hash
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
  
  def get_animelist_entry_for_show(show_id)
    animelist = JSON.parse(make_anilist_get_request("/user/#{session['username']}/animelist").body)
    anime_records = []
    ['completed', 'on_hold', 'dropped', 'plan_to_watch', 'watching'].each do |status|
      anime_records += animelist['lists'][status] if Array === animelist['lists'][status] && !animelist['lists'][status].empty?
    end
    
    anime_records.find {|record| record['anime']['id'] == show_id}  
  end
  
  def show_is_in_user_library?(show_id)
    animelist = JSON.parse(make_anilist_get_request("/user/#{session['username']}/animelist").body)
    anime_records = []
    ['completed', 'on_hold', 'dropped', 'plan_to_watch', 'watching'].each do |status|
      anime_records += animelist['lists'][status] if Array === animelist['lists'][status] && !animelist['lists'][status].empty?
    end
    
    anime_records.find {|record| record['anime']['id'] == show_id}
  end
end

helpers Utilities
