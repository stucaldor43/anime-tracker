get '/search/anime/:query' do
  endpoint = "/search/anime/?query=#{params['query']}"
  @search_results = get_response_body(get_hummingbird_response(endpoint))
  @header = erb :header
  @footer = erb :footer
  
  erb :search
end