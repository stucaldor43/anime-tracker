get '/search/anime/genres' do
  url = "/browse/anime?genres=#{ params['genre'].join(',') }"
  res = settings.anilist_communicator.make_get_request(url)
  @search_results = get_response_body(res)
  @title_search_partial = erb :anime_title_search_partial
  @genre_search_form_partial = erb :anime_genre_search_form_partial
  @header = erb :header
  @footer = erb :footer
  
  erb :genre_search
end
