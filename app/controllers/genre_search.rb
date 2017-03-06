get '/search/anime/genres' do
  pass if (params['page'] != nil && !(params['page'].codepoints.all? {|codepoint| ((48..57) === codepoint) }))
  
  url = "/browse/anime?genres=#{ params['genre'].join(',') }&page=#{ params['page'] || 1 }&genres_exclude=Hentai"
  res = settings.anilist_communicator.make_get_request(url)
  pass if !res.kind_of? Net::HTTPSuccess
  
  @search_results = get_response_body(res)
  
  if !@search_results.empty?
    pagination_test_url = "/browse/anime?genres=#{ params['genre'].join(',') }&page=#{ (params['page']) ? params['page'].to_i + 1 : 1 + 1 }&genres_exclude=Hentai"
    test_result = get_response_body(settings.anilist_communicator.make_get_request(pagination_test_url))
    @is_previous_button_visible = (params['page'].nil? || params['page'].to_i == 1) ? false : true
    @is_next_button_visible = (Array === test_result && !test_result.empty?) ? true : false
  else
    pass
  end
  
  @title_search_partial = erb :anime_title_search_partial
  @genre_search_form_partial = erb :anime_genre_search_form_partial
  @search_phrase = params['genre'].join(", ")
  @header = erb :header
  @footer = erb :footer
  @pageNumber = (params['page']) ? params['page'].to_i : 1
  
  erb :search
end
