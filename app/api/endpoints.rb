require 'json'
require 'net/http'
require 'uri'

get '/api/partials/anime-title-search-partial' do
  erb :anime_title_search_partial
end

get '/api/partials/anime-genre-search-form-partial' do
  erb :anime_genre_search_form_partial
end

get '/api/feed/:username' do
  res = settings.anilist_communicator.make_get_request("/user/#{params['username']}/activity")
  
  JSON.generate({
      "status": "success", 
      "data": JSON.parse(res.body)
  })
end

get '/logout' do
  session.each {|key,value| session[key] = nil}
  redirect to("/")
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
  res = settings.anilist_communicator.make_get_request("/user/#{params['username']}/animelist")
  
  case res
  when Net::HTTPSuccess
    JSON.generate({
      "status": "success", 
      "data": JSON.parse(res.body)
    })
  else
    JSON.generate({  
      "status": "fail",   
      "data": [{status: "Unable to retrieve the animelist of #{params['username']}"}]
    })
  end
end

before '/api/library/*' do
  halt 401 unless session['access_token']
end

post '/api/library/:id/positive-rating' do
  show_id = params['id'].to_i
  animelist_entry = get_animelist_entry_for_show(show_id)
  updated_data = {
    'score' => 9
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

post '/api/library/:id/neutral-rating' do
  show_id = params['id'].to_i
  animelist_entry = get_animelist_entry_for_show(show_id)
  updated_data = {
    'score' => 7
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

post '/api/library/:id/negative-rating' do
  show_id = params['id'].to_i
  animelist_entry = get_animelist_entry_for_show(show_id)
  updated_data = {
    'score' => 6
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

post '/api/library/:id/increment-episodes' do
  show_id = params['id'].to_i
  animelist_entry = get_animelist_entry_for_show(show_id)
  episodes_watched = animelist_entry['episodes_watched']
  max_episode_count = animelist_entry['anime']['total_episodes'] 
  updated_data = {
    'episodes_watched' => ((episodes_watched + 1) <= max_episode_count) ? episodes_watched + 1 : max_episode_count
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

post '/api/library/:id/decrement-episodes' do
  show_id = params['id'].to_i
  animelist_entry = get_animelist_entry_for_show(show_id)
  episodes_watched = animelist_entry['episodes_watched']
  max_episode_count = animelist_entry['anime']['total_episodes'] 
  updated_data = {
    'episodes_watched' => ((episodes_watched - 1) >= 0 && (episodes_watched - 1) < max_episode_count) ? episodes_watched - 1 : episodes_watched
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

post '/api/library/:id/remove' do
  show_id = params['id'].to_i
  res = make_anilist_delete_request("/animelist/#{show_id}")
  
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
