get '/search/anime/genres' do
  url = "/browse/anime?genres=#{ params['genre'].join(',') }"
  res = settings.anilist_communicator.make_get_request(url)
  @search_results = get_response_body(res)
  @header = erb :header
  @footer = erb :footer
  
  erb :genre_search
end
