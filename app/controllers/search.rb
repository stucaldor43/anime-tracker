get '/search/anime/:query' do
  halt 404 if params['query'] == "genres"
  
  endpoint = "/anime/search/#{encode_string(params['query'])}"
  res = settings.anilist_communicator.make_get_request(endpoint)
  halt 500 if !res.kind_of? Net::HTTPSuccess
  
  @search_results = get_response_body(res).select {|entry| !entry['genres'].nil? && entry['genres'].none? {|genre| genre == "Hentai"} }
  
  @search_phrase = params['query']
  @header = erb :header
  @footer = erb :footer
  @title_search_partial = erb :anime_title_search_partial
  @genre_search_form_partial = erb :anime_genre_search_form_partial
  
  erb :search
end
