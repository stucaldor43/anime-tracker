require 'json'
require 'net/http'

get '/api/partials/anime-title-search-partial' do
  resource_contents = erb :anime_title_search_partial
  JSON.generate({"status" => 200, "contents" => resource_contents})
end

get '/api/partials/anime-genre-search-form-partial' do
  resource_contents = erb :anime_genre_search_form_partial
  JSON.generate({"status" => 200, "contents" => resource_contents}) 
end

get '/api/search/anime/genres' do
  url = "/browse/anime?genres=#{ params['genre'].join(',')}&page=#{params['page']}"
  res = settings.anilist_communicator.make_get_request(url)
  @search_results = get_response_body(res)
  resource_contents = erb :genre_search_results_partial
  
  if @search_results.length <= 0
    return 400
  end
  
  JSON.generate({"status" => 200, "contents" => resource_contents})
end

before '/api/library/*' do
  halt 401 unless session['auth_token']
end

post '/api/library/:id/remove' do
  show_id = params['id'].to_i
  if !show_is_in_user_library?(show_id)
    return 200
  end
  request_parameters = {
    'auth_token' => session['auth_token'],
  }
  res = make_hummingbird_post_request("/libraries/#{show_id}/remove", request_parameters)
  
  case res
  when Net::HTTPSuccess
    200
  else
    500
  end
end

post '/api/library/:id' do
  show_id = params['id'].to_i
  if show_is_in_user_library?(show_id)
    return 200
  end
  request_parameters = {
    'auth_token' => session['auth_token'],
    'status' => 'currently-watching'
  }
  res = make_hummingbird_post_request("/libraries/#{show_id}", request_parameters)
  
  case res
  when Net::HTTPSuccess
    200
  else
    500
  end
end

