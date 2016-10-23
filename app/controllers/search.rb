get '/search/anime/:query' do
  endpoint = "/search/anime/?query=#{params['query']}"
  @search_results = get_response_body(get_hummingbird_response(endpoint))
  @header = erb :header
  @footer = erb :footer
  @title_search_partial = erb :anime_title_search_partial
  @genre_search_form_partial = erb :anime_genre_search_form_partial
  
  erb :search
end
