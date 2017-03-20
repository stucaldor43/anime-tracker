require 'json'

get '/show/:id' do
  endpoint = "/anime/#{params['id']}"
  res = settings.anilist_communicator.make_get_request(endpoint)
  halt 404 unless res.kind_of? Net::HTTPSuccess
  
  @anime = JSON.parse(res.body)
  @show_is_in_library = @authorized && show_is_in_user_library?(params['id'].to_i)
  @title_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  erb :show
end