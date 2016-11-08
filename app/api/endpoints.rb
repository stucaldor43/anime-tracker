require 'json'
require 'net/http'

get '/api/partials/anime-title-search-partial' do
  erb :anime_title_search_partial
end

get '/api/partials/anime-genre-search-form-partial' do
  erb :anime_genre_search_form_partial
end

get '/api/search/anime/genres' do
  url = "/browse/anime?genres=#{ params['genre'].join(',')}&page=#{params['page']}"
  res = settings.anilist_communicator.make_get_request(url)
  
  if !(Net::HTTPSuccess === res)
    return 400
  end
  
  @search_results = get_response_body(res)
  Array === @search_results && @search_results.length >= 1 ? erb(:genre_search_results_partial) : 500
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

get '/api/library/:id' do
  show_id = params['id'].to_i
  legal_statuses = ['currently-watching', 'plan-to-watch', 'completed', 'on-hold', 'dropped' ]
  
  return 400 if !legal_statuses.index(params['status']) 
  
  request_parameters = {
    'auth_token' => session['auth_token'],
    'status' => params['status']
  }
  res = make_hummingbird_post_request("/libraries/#{show_id}", request_parameters)
  
  case res
  when Net::HTTPSuccess
    200
  else
    500
  end
end

