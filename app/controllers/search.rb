get '/search/anime/:query' do
  pass if params['query'] == "genres"
  endpoint = "/anime/search/#{encode_string(params['query'])}"
  @search_results = get_response_body(settings.anilist_communicator.make_get_request(endpoint))
  @search_phrase = params['query']
  @header = erb :header
  @footer = erb :footer
  @title_search_partial = erb :anime_title_search_partial
  @genre_search_form_partial = erb :anime_genre_search_form_partial
  
  erb :search
end
