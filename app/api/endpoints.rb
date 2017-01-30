require 'json'
require 'net/http'
require 'uri'

get '/api/partials/anime-title-search-partial' do
  erb :anime_title_search_partial
end

get '/api/partials/anime-genre-search-form-partial' do
  erb :anime_genre_search_form_partial
end

get '/api/authorized/:name' do
  params['name'] == session['username'] ? 200 : 401
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

get '/api/user/:username/library' do
  legal_statuses = ['currently-watching', 'plan-to-watch', 'completed', 'on-hold', 'dropped' ]
  if !params['status'].nil? && !legal_statuses.index(params['status'])
    return JSON.generate({
      "status": "fail", 
      "data": [{status: "#{params['status']} is not a legal parameter value"}]
    })
  end
  res = get_hummingbird_response("/users/#{params['username']}/library?status=#{params['status']}")
  JSON.generate({
    "status": "success", 
    "data": get_response_body(res)
  })
end

before '/api/library/*' do
  halt 401 unless session['access_token']
end

post '/api/library/:id/positive-rating' do
  show_id = params['id'].to_i
  request_parameters = {
    'auth_token' => session['auth_token'],
    'sane_rating_update' => 5
  }
  res = make_hummingbird_post_request("/libraries/#{show_id}", request_parameters)
  
  case res
  when Net::HTTPSuccess
    200
  else
    500
  end
end

post '/api/library/:id/neutral-rating' do
  show_id = params['id'].to_i
  request_parameters = {
    'auth_token' => session['auth_token'],
    'sane_rating_update' => 3
  }
  res = make_hummingbird_post_request("/libraries/#{show_id}", request_parameters)
  
  case res
  when Net::HTTPSuccess
    200
  else
    500
  end
end

post '/api/library/:id/negative-rating' do
  show_id = params['id'].to_i
  request_parameters = {
    'auth_token' => session['auth_token'],
    'sane_rating_update' => 1
  }
  res = make_hummingbird_post_request("/libraries/#{show_id}", request_parameters)
  
  case res
  when Net::HTTPSuccess
    200
  else
    500
  end
end

post '/api/library/:id/increment-episodes' do
  show_id = params['id'].to_i
  request_parameters = {
    'auth_token' => session['auth_token'],
    'increment_episodes' => true
  }
  res = make_hummingbird_post_request("/libraries/#{show_id}", request_parameters)
  
  case res
  when Net::HTTPSuccess
    200
  else
    500
  end
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
  legal_statuses = ['watching', 'plan to watch', 'completed', 'on-hold', 'dropped' ]
  return 400 if !legal_statuses.index(URI::decode(params['status'])) 
  
  animelist_entry = get_animelist_entry_for_show(show_id)
  updated_data = {
    'list_status' => params['status']
  }
  request_data = create_animelist_put_data(animelist_entry, updated_data)
  
  res = make_anilist_put_request('/animelist', request_data)
  
  case res
  when Net::HTTPSuccess
    200
  else
    500
  end
end

get '/api/feed/:username' do
  res = get_hummingbird_response("/users/#{params['username']}/feed")
  JSON.generate({
    "status": "success", 
    "data": get_response_body(res)
  })
end

