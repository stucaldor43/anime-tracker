get '/show/:id' do
  endpoint = "/anime/#{params['id']}"
  @anime = get_response_body(get_hummingbird_response(endpoint))
  @header = erb :header
  @footer = erb :footer
  
  erb :show
end