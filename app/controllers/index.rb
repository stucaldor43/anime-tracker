get '/' do
  halt 404 if (!params['page'].nil? && !(params['page'].codepoints.all? {|codepoint| ((48..57) === codepoint) }))
  
  url = "/browse/anime?sort=score&page=#{ params['page'] || 1 }&genres_exclude=Hentai"
  res = settings.anilist_communicator.make_get_request(url)
  halt 500 if !res.kind_of? Net::HTTPSuccess
  
  @search_results = get_response_body(res)
  
  if @search_results.empty?
    halt 404
  else
    pagination_test_url = "/browse/anime?sort=score&page=#{ (params['page']) ? params['page'].to_i + 1 : 2 }&genres_exclude=Hentai"
    test_result = get_response_body(settings.anilist_communicator.make_get_request(pagination_test_url))
    @is_previous_button_visible = (params['page'].nil? || params['page'].to_i == 1) ? false : true
    @is_next_button_visible = (Array === test_result && !test_result.empty?) ? true : false  
  end
  
  @pageNumber = (params['page']) ? params['page'].to_i : 1
  @title_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  erb :index 
end